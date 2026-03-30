// Shadow effect utilities for product images
// Uses Canvas API to generate realistic shadows

export interface ShadowConfig {
  type: 'none' | 'soft' | 'natural' | 'hard' | 'floating';
  blur: number;
  opacity: number;
  offsetX: number;
  offsetY: number;
  color: string;
}

export const SHADOW_PRESETS: Record<string, ShadowConfig> = {
  none: {
    type: 'none',
    blur: 0,
    opacity: 0,
    offsetX: 0,
    offsetY: 0,
    color: 'rgba(0,0,0,0)'
  },
  soft: {
    type: 'soft',
    blur: 20,
    opacity: 0.3,
    offsetX: 0,
    offsetY: 10,
    color: 'rgba(0,0,0,0.3)'
  },
  natural: {
    type: 'natural',
    blur: 15,
    opacity: 0.4,
    offsetX: 5,
    offsetY: 15,
    color: 'rgba(0,0,0,0.4)'
  },
  hard: {
    type: 'hard',
    blur: 5,
    opacity: 0.5,
    offsetX: 3,
    offsetY: 8,
    color: 'rgba(0,0,0,0.5)'
  },
  floating: {
    type: 'floating',
    blur: 30,
    opacity: 0.2,
    offsetX: 0,
    offsetY: 25,
    color: 'rgba(0,0,0,0.2)'
  }
};

/**
 * Apply shadow effect to a transparent PNG image
 * This is a client-side implementation using Canvas API
 */
export async function applyShadow(
  imageUrl: string,
  shadowType: string
): Promise<string> {
  const config = SHADOW_PRESETS[shadowType] || SHADOW_PRESETS.soft;
  
  if (config.type === 'none') {
    return imageUrl;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Add padding for shadow
      const padding = config.blur + Math.abs(config.offsetY) + 20;
      canvas.width = img.width + padding * 2;
      canvas.height = img.height + padding * 2;

      // Draw shadow first (behind the image)
      ctx.save();
      ctx.shadowColor = config.color;
      ctx.shadowBlur = config.blur;
      ctx.shadowOffsetX = config.offsetX;
      ctx.shadowOffsetY = config.offsetY;
      
      // Draw the image with shadow
      ctx.drawImage(img, padding, padding);
      ctx.restore();

      // Draw the image again on top (without shadow) to ensure crisp edges
      ctx.drawImage(img, padding, padding);

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
}

/**
 * Composite product image onto a background
 */
export async function compositeImage(
  productImageUrl: string,
  backgroundUrl: string,
  shadowType: string = 'soft'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const productImg = new Image();
    const bgImg = new Image();
    
    productImg.crossOrigin = 'anonymous';
    bgImg.crossOrigin = 'anonymous';
    
    let loadedCount = 0;
    const onLoad = () => {
      loadedCount++;
      if (loadedCount < 2) return;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Use background dimensions or product dimensions, whichever is larger
      canvas.width = Math.max(bgImg.width, productImg.width);
      canvas.height = Math.max(bgImg.height, productImg.height);

      // Draw background
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      // Calculate center position for product
      const x = (canvas.width - productImg.width) / 2;
      const y = (canvas.height - productImg.height) / 2;

      // Apply shadow if needed
      const config = SHADOW_PRESETS[shadowType] || SHADOW_PRESETS.soft;
      if (config.type !== 'none') {
        ctx.save();
        ctx.shadowColor = config.color;
        ctx.shadowBlur = config.blur;
        ctx.shadowOffsetX = config.offsetX;
        ctx.shadowOffsetY = config.offsetY;
        ctx.drawImage(productImg, x, y);
        ctx.restore();
      }

      // Draw product
      ctx.drawImage(productImg, x, y);

      resolve(canvas.toDataURL('image/png'));
    };

    productImg.onload = onLoad;
    bgImg.onload = onLoad;
    
    productImg.onerror = () => reject(new Error('Failed to load product image'));
    bgImg.onerror = () => reject(new Error('Failed to load background image'));

    productImg.src = productImageUrl;
    bgImg.src = backgroundUrl;
  });
}