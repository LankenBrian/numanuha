import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { decrementCredits, logUsage } from '@/lib/user'

// Helper function to convert array buffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Please sign in to use this feature' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check credits (pro users have -1 which means unlimited)
    if (user.credits !== -1 && user.credits <= 0) {
      return NextResponse.json(
        { 
          error: 'No credits remaining',
          upgrade: true,
          message: 'Please upgrade to Pro for unlimited access'
        },
        { status: 403 }
      )
    }

    // Parse form data
    let formData;
    try {
      formData = await request.formData();
    } catch (e: any) {
      return NextResponse.json(
        { error: 'Failed to parse form data', details: e?.message || String(e) },
        { status: 400 }
      );
    }
    
    const imageFile = formData.get('image') as File;
    const background = formData.get('background') as string || 'transparent';

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Check file size (10MB limit for free, 50MB for pro)
    const maxSize = user.plan === 'pro' ? 50 * 1024 * 1024 : 10 * 1024 * 1024
    if (imageFile.size > maxSize) {
      return NextResponse.json(
        { 
          error: `File too large. Max size: ${user.plan === 'pro' ? '50MB' : '10MB'}` 
        },
        { status: 400 }
      );
    }

    // Check API key
    const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY;
    
    if (!REMOVE_BG_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Convert file to array buffer
    let arrayBuffer;
    try {
      arrayBuffer = await imageFile.arrayBuffer();
    } catch (e: any) {
      return NextResponse.json(
        { error: 'Failed to read image file', details: e?.message || String(e) },
        { status: 400 }
      );
    }
    
    // Create blob
    const blob = new Blob([arrayBuffer], { type: imageFile.type });
    
    // Prepare form data for Remove.bg API
    const removeBgFormData = new FormData();
    removeBgFormData.append('image_file', blob, imageFile.name);
    removeBgFormData.append('size', 'auto');
    
    // Handle background color
    if (background !== 'transparent') {
      const bgColors: Record<string, string> = {
        'white': 'FFFFFF',
        'black': '000000',
        'gray': 'F3F4F6',
      };
      if (bgColors[background]) {
        removeBgFormData.append('bg_color', bgColors[background]);
      }
    }

    // Call Remove.bg API
    let removeBgResponse;
    try {
      removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': REMOVE_BG_API_KEY,
        },
        body: removeBgFormData,
      });
    } catch (e: any) {
      await logUsage(user.id, 'remove_bg', 'failed', { error: e?.message })
      return NextResponse.json(
        { 
          error: 'Failed to connect to Remove.bg API', 
          details: e?.message || String(e) 
        },
        { status: 500 }
      );
    }

    if (!removeBgResponse.ok) {
      let errorText;
      try {
        errorText = await removeBgResponse.text();
      } catch (e) {
        errorText = 'Could not read error response';
      }
      
      await logUsage(user.id, 'remove_bg', 'failed', { 
        status: removeBgResponse.status,
        error: errorText 
      })
      
      return NextResponse.json(
        { 
          error: 'Remove.bg API failed',
          status: removeBgResponse.status,
          statusText: removeBgResponse.statusText,
          details: errorText,
        },
        { status: 500 }
      );
    }

    // Get the result
    let resultBuffer;
    try {
      resultBuffer = await removeBgResponse.arrayBuffer();
    } catch (e: any) {
      await logUsage(user.id, 'remove_bg', 'failed', { error: e?.message })
      return NextResponse.json(
        { error: 'Failed to read response', details: e?.message || String(e) },
        { status: 500 }
      );
    }
    
    // Convert to base64
    let processedBase64;
    try {
      processedBase64 = `data:image/png;base64,${arrayBufferToBase64(resultBuffer)}`;
    } catch (e: any) {
      await logUsage(user.id, 'remove_bg', 'failed', { error: e?.message })
      return NextResponse.json(
        { error: 'Failed to encode image', details: e?.message || String(e) },
        { status: 500 }
      );
    }

    // Decrement credits and log usage
    await decrementCredits(user.id)
    await logUsage(user.id, 'remove_bg', 'success', {
      fileSize: imageFile.size,
      fileType: imageFile.type,
      background,
    })

    // Get updated user
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { credits: true },
    })

    return NextResponse.json({
      processed: processedBase64,
      background: background,
      creditsRemaining: updatedUser?.credits === -1 ? 'unlimited' : updatedUser?.credits,
    });

  } catch (error: any) {
    console.error('Remove BG error:', error)
    return NextResponse.json(
      { 
        error: 'Unexpected error',
        message: error?.message || 'Unknown error',
        name: error?.name,
      },
      { status: 500 }
    );
  }
}
