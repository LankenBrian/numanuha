// AI Background Generation Service Configuration
// This module handles AI background generation using Fal.ai or Replicate

export interface AIBackgroundConfig {
  provider: 'fal' | 'replicate';
  apiKey: string;
}

export interface AIBackgroundRequest {
  productImage: string; // base64 encoded product image (transparent background)
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
}

export const AI_BACKGROUND_PRESETS = {
  'studio-white': {
    prompt: 'professional white studio background, soft diffused lighting, clean minimal product photography, seamless white backdrop, high-end commercial photography style',
    negativePrompt: 'busy background, cluttered, dark shadows, harsh lighting, low quality, blurry'
  },
  'studio-gray': {
    prompt: 'professional gray studio background, soft diffused lighting, clean minimal product photography, neutral gray backdrop, high-end commercial photography style',
    negativePrompt: 'busy background, cluttered, dark shadows, harsh lighting, low quality, blurry'
  },
  'street-urban': {
    prompt: 'urban street background, city environment, natural daylight, concrete texture, modern city vibe, soft natural lighting, depth of field',
    negativePrompt: 'indoor, studio, plain background, blurry, low quality, people, cars'
  },
  'nature-outdoor': {
    prompt: 'natural outdoor background, green plants, soft sunlight filtering through leaves, garden setting, fresh natural environment, bokeh effect',
    negativePrompt: 'indoor, studio, urban, concrete, people, animals, harsh shadows'
  },
  'luxury-indoor': {
    prompt: 'luxury indoor setting, elegant furniture, warm ambient lighting, premium interior design, marble or wood textures, sophisticated atmosphere',
    negativePrompt: 'outdoor, street, cheap, cluttered, harsh lighting, low quality'
  },
  'beach-sunset': {
    prompt: 'beach sunset background, golden hour lighting, ocean view, warm orange and pink sky, sand texture, tropical paradise vibe',
    negativePrompt: 'indoor, studio, urban, people, harsh shadows, overexposed'
  }
};

// Fal.ai API integration
export async function generateBackgroundWithFal(
  config: AIBackgroundConfig,
  request: AIBackgroundRequest
): Promise<string> {
  const response = await fetch('https://api.fal.ai/v1/image-generation', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'stable-diffusion-xl',
      prompt: request.prompt,
      negative_prompt: request.negativePrompt,
      image_size: {
        width: request.width || 1024,
        height: request.height || 1024,
      },
      // For product photography, we use img2img with the product
      init_image: request.productImage,
      strength: 0.7, // How much to preserve the original product
    }),
  });

  if (!response.ok) {
    throw new Error(`Fal.ai API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.images[0].url;
}

// Replicate API integration (alternative)
export async function generateBackgroundWithReplicate(
  config: AIBackgroundConfig,
  request: AIBackgroundRequest
): Promise<string> {
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b', // SDXL
      input: {
        prompt: request.prompt,
        negative_prompt: request.negativePrompt,
        width: request.width || 1024,
        height: request.height || 1024,
        image: request.productImage,
        prompt_strength: 0.7,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Replicate API error: ${response.statusText}`);
  }

  const prediction = await response.json();
  
  // Poll for result
  let result = prediction;
  while (result.status !== 'succeeded' && result.status !== 'failed') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const pollResponse = await fetch(result.urls.get, {
      headers: { 'Authorization': `Token ${config.apiKey}` },
    });
    result = await pollResponse.json();
  }

  if (result.status === 'failed') {
    throw new Error('Replicate prediction failed');
  }

  return result.output[0];
}

// Main function to generate AI background
export async function generateAIBackground(
  config: AIBackgroundConfig,
  presetId: string,
  customPrompt?: string,
  productImage?: string
): Promise<string> {
  const preset = AI_BACKGROUND_PRESETS[presetId as keyof typeof AI_BACKGROUND_PRESETS];
  
  if (!preset && !customPrompt) {
    throw new Error('Invalid preset or missing custom prompt');
  }

  const request: AIBackgroundRequest = {
    productImage: productImage || '',
    prompt: customPrompt || preset.prompt,
    negativePrompt: preset?.negativePrompt,
  };

  if (config.provider === 'fal') {
    return generateBackgroundWithFal(config, request);
  } else {
    return generateBackgroundWithReplicate(config, request);
  }
}