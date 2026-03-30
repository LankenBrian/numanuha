export const runtime = 'edge';

interface RemoveBgResponse {
  data: {
    result_b64: string;
  };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const platform = formData.get('platform') as string || 'original';
    const background = formData.get('background') as string || 'transparent';
    const shadow = formData.get('shadow') as string || 'none';
    const aiBackground = formData.get('aiBackground') as string;
    const customPrompt = formData.get('customPrompt') as string;

    if (!imageFile) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!imageFile.type.startsWith('image/')) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Please upload an image.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (imageFile.size > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 10MB.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convert file to base64 for original preview
    const arrayBuffer = await imageFile.arrayBuffer();
    const originalBase64 = `data:${imageFile.type};base64,${btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    )}`;

    // Prepare form data for Remove.bg API
    const removeBgFormData = new FormData();
    removeBgFormData.append('image_file', imageFile);
    removeBgFormData.append('size', 'auto');
    
    // Handle background color for Remove.bg
    if (background !== 'transparent' && !aiBackground && !customPrompt) {
      const bgColors: Record<string, string> = {
        'white': 'FFFFFF',
        'black': '000000',
        'gray': 'F3F4F6',
        'gradient-blue': '3B82F6',
        'gradient-warm': 'F97316'
      };
      if (bgColors[background]) {
        removeBgFormData.append('bg_color', bgColors[background]);
      }
    }

    const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY;
    
    if (!REMOVE_BG_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: 'API key not configured. Please set REMOVE_BG_API_KEY.',
          original: originalBase64
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Call Remove.bg API
    const removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': REMOVE_BG_API_KEY,
      },
      body: removeBgFormData,
    });

    if (!removeBgResponse.ok) {
      const errorText = await removeBgResponse.text();
      console.error('Remove.bg API error:', errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to remove background. Please try again.',
          details: errorText
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the result
    const resultBuffer = await removeBgResponse.arrayBuffer();
    let processedBase64 = `data:image/png;base64,${btoa(
      String.fromCharCode(...new Uint8Array(resultBuffer))
    )}`;

    // TODO: Implement AI background generation using Fal.ai or Replicate
    // This would be called here if aiBackground or customPrompt is provided
    // For now, we return the Remove.bg result

    // TODO: Implement shadow effects using Canvas API
    // This would add shadow to the image based on the shadow parameter

    return new Response(
      JSON.stringify({
        original: originalBase64,
        processed: processedBase64,
        platform: platform,
        background: background,
        shadow: shadow,
        aiBackground: aiBackground || null,
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        } 
      }
    );

  } catch (error) {
    console.error('Error processing image:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}