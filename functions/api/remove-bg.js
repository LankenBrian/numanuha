// Cloudflare Pages Function - Remove Background API
// This file will be served at /api/remove-bg

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const formData = await request.formData();
    const imageFile = formData.get('image');
    const platform = formData.get('platform') || 'original';
    const background = formData.get('background') || 'transparent';
    const shadow = formData.get('shadow') || 'none';

    if (!imageFile) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file type
    if (!imageFile.type || !imageFile.type.startsWith('image/')) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Please upload an image.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check file size (10MB limit)
    if (imageFile.size > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 10MB.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convert file to base64 for original preview
    const arrayBuffer = await imageFile.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const originalBase64 = `data:${imageFile.type};base64,${btoa(binary)}`;

    // Prepare form data for Remove.bg API
    const removeBgFormData = new FormData();
    removeBgFormData.append('image_file', imageFile);
    removeBgFormData.append('size', 'auto');
    
    // Handle background color
    if (background !== 'transparent') {
      const bgColors = {
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

    const REMOVE_BG_API_KEY = env.REMOVE_BG_API_KEY;
    
    if (!REMOVE_BG_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: 'API key not configured.',
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
    const resultBytes = new Uint8Array(resultBuffer);
    let resultBinary = '';
    for (let i = 0; i < resultBytes.byteLength; i++) {
      resultBinary += String.fromCharCode(resultBytes[i]);
    }
    const processedBase64 = `data:image/png;base64,${btoa(resultBinary)}`;

    return new Response(
      JSON.stringify({
        original: originalBase64,
        processed: processedBase64,
        platform: platform,
        background: background,
        shadow: shadow,
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
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}