import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { decrementCredits, logUsage } from '@/lib/user'

// AI Background Generation using Fal.ai
const AI_PRESETS: Record<string, string> = {
  // Studio
  'studio-white': 'professional white studio background, soft diffused lighting, clean minimal product photography, seamless white backdrop, high-end commercial photography style, 8k quality',
  'studio-gray': 'professional gray studio background, soft diffused lighting, clean minimal product photography, neutral gray backdrop, high-end commercial photography style, 8k quality',
  'studio-black': 'professional black studio background, dramatic lighting, clean minimal product photography, seamless black backdrop, high-end commercial photography style, 8k quality',
  'gradient-pink': 'soft pink gradient background, pastel colors, dreamy atmosphere, minimal clean product photography, soft lighting, 8k quality',
  'gradient-blue': 'soft blue gradient background, cool pastel colors, serene atmosphere, minimal clean product photography, soft lighting, 8k quality',
  
  // Lifestyle
  'street-urban': 'urban street background, city environment, natural daylight, concrete texture, modern city vibe, soft natural lighting, depth of field, photorealistic',
  'nature-outdoor': 'natural outdoor background, green plants, soft sunlight filtering through leaves, garden setting, fresh natural environment, bokeh effect, photorealistic',
  'beach-sunset': 'beach sunset background, golden hour lighting, ocean view, warm orange and pink sky, sand texture, tropical paradise vibe, photorealistic',
  'coffee-shop': 'cozy coffee shop interior, warm ambient lighting, wooden tables, soft bokeh lights in background, cafe atmosphere, photorealistic',
  'home-living': 'warm home living room, comfortable sofa, natural window light, cozy domestic setting, soft shadows, photorealistic',
  'office-desk': 'modern office desk setup, clean workspace, natural lighting from window, professional environment, minimal clutter, photorealistic',
  
  // Luxury
  'luxury-indoor': 'luxury indoor setting, elegant furniture, warm ambient lighting, premium interior design, marble or wood textures, sophisticated atmosphere, photorealistic',
  'marble-gold': 'elegant marble surface with gold accents, luxury texture, high-end product photography, soft studio lighting, premium aesthetic, 8k quality',
  'velvet-red': 'rich red velvet fabric background, luxurious texture, dramatic lighting, premium product photography, elegant atmosphere, 8k quality',
  'concrete-minimal': 'raw concrete texture background, industrial minimal aesthetic, soft diffused lighting, modern product photography, clean composition, 8k quality',
  
  // Seasonal
  'christmas-winter': 'christmas winter scene, snowflakes, festive decorations, warm cozy lighting, red and green accents, holiday atmosphere, photorealistic',
  'valentine-romance': 'romantic valentine theme, soft pink roses, heart decorations, warm candlelight, love atmosphere, photorealistic',
  'halloween-spooky': 'halloween theme, orange and black colors, spooky decorations, autumn leaves, mysterious lighting, photorealistic',
  'summer-tropical': 'tropical summer paradise, palm leaves, bright sunlight, beach vibes, vibrant colors, vacation atmosphere, photorealistic',
  
  // E-commerce
  'amazon-style': 'clean pure white background, professional product photography, soft shadow, e-commerce style, commercial quality, 8k',
  'lifestyle-flatlay': 'flat lay composition, top-down view, styled arrangement, minimal props, clean aesthetic, product photography, 8k quality',
  'wood-rustic': 'natural rustic wood texture, warm brown tones, organic feel, farmhouse style, natural lighting, photorealistic',
  'fabric-linen': 'soft linen fabric texture, natural beige color, gentle folds, textile background, warm lighting, photorealistic',
};

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

    // AI Background is Pro only
    if (user.plan !== 'pro') {
      return NextResponse.json(
        { 
          error: 'AI Background Generation is a Pro feature',
          upgrade: true,
          message: 'Upgrade to Pro to unlock AI background generation'
        },
        { status: 403 }
      )
    }

    const { image, preset, customPrompt } = await request.json();
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    const FAL_API_KEY = process.env.FAL_API_KEY;
    
    if (!FAL_API_KEY) {
      // Return mock response for demo purposes
      await logUsage(user.id, 'ai_background', 'success', { demo: true, preset })
      
      return NextResponse.json({ 
        error: 'AI background generation requires Fal.ai API key',
        message: 'Please add FAL_API_KEY to environment variables',
        demo: true,
        result: image,
      });
    }

    const prompt = customPrompt || AI_PRESETS[preset] || AI_PRESETS['studio-white'];
    
    // Call Fal.ai API for image generation
    const response = await fetch('https://api.fal.ai/v1/models/fal-ai/iclight-v2/requests', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: image,
        prompt: prompt,
        negative_prompt: 'blurry, low quality, distorted, deformed, ugly, bad anatomy',
        num_images: 1,
        seed: Math.floor(Math.random() * 1000000),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      await logUsage(user.id, 'ai_background', 'failed', { error, preset })
      
      return NextResponse.json(
        { 
          error: 'Fal.ai API failed', 
          details: error,
          status: response.status 
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    // Log successful usage
    await logUsage(user.id, 'ai_background', 'success', { preset })
    
    return NextResponse.json({
      result: data.images?.[0]?.url || data.image?.url,
      prompt: prompt,
    });

  } catch (error: any) {
    console.error('AI Background error:', error)
    return NextResponse.json(
      { 
        error: 'AI generation failed',
        message: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
