# AI Background Remover

A fast, AI-powered background removal and product photography tool built for e-commerce sellers. Deployed on Cloudflare Pages with Edge Functions.

## Features

### Core Features
- 🚀 **Lightning Fast** - Remove backgrounds in seconds
- 🎯 **High Quality** - State-of-the-art AI (Remove.bg API)
- 📱 **Platform Ready** - Optimized sizes for Amazon, Shopify, eBay, Etsy, Instagram
- 🎨 **Background Options** - Transparent, White, Black, Gray, Gradients
- 🔒 **Privacy First** - No image storage, processed in memory only
- 🌍 **Global CDN** - Powered by Cloudflare's edge network

### Advanced Features
- 🤖 **AI Background Generation** - Generate realistic scenes (street, nature, luxury, beach)
- 🎭 **Shadow Effects** - Soft, natural, hard, or floating shadows
- 📦 **Batch Processing** - Process up to 50 images at once
- ✨ **Custom Prompts** - Describe your own background scene

## Tech Stack

- **Frontend**: Next.js 15 + React + TypeScript + Tailwind CSS
- **Backend**: Cloudflare Pages Functions (Edge Runtime)
- **AI Services**:
  - Remove.bg API (background removal)
  - Fal.ai / Replicate (AI background generation)
- **Deployment**: Cloudflare Pages

## Quick Start

### 1. Clone and Install

```bash
git clone <repo-url>
cd image-bg-remover
npm install
```

### 2. Environment Variables

Create a `.env.local` file:

```env
# Required
REMOVE_BG_API_KEY=your_remove_bg_api_key

# Optional - for AI background generation
FAL_AI_API_KEY=your_fal_ai_key
# or
REPLICATE_API_TOKEN=your_replicate_token
```

Get your API keys:
- [Remove.bg](https://www.remove.bg/api)
- [Fal.ai](https://fal.ai)
- [Replicate](https://replicate.com)

### 3. Development

```bash
# Local development
npm run dev

# Build for Cloudflare
npm run pages:build

# Preview locally with Wrangler
npm run wrangler:dev
```

### 4. Deploy

```bash
# Set secrets
wrangler secret put REMOVE_BG_API_KEY
wrangler secret put FAL_AI_API_KEY

# Deploy
npm run pages:deploy
```

## API Usage

### POST /api/remove-bg

Remove background from an image.

**Request**: `multipart/form-data`
- `image` (File) - Image file (PNG, JPG, WebP, max 10MB)
- `platform` (string, optional) - Target platform
- `background` (string, optional) - Background type
- `shadow` (string, optional) - Shadow effect
- `aiBackground` (string, optional) - AI background preset
- `customPrompt` (string, optional) - Custom background description

**Response**: JSON
```json
{
  "original": "data:image/jpeg;base64,...",
  "processed": "data:image/png;base64,...",
  "platform": "amazon",
  "background": "transparent",
  "shadow": "soft",
  "aiBackground": null
}
```

## Platform Sizes

| Platform | Dimensions |
|----------|-----------|
| Amazon | 2000×2000 |
| Shopify | 2048×2048 |
| eBay | 1600×1600 |
| Etsy | 2000×2000 |
| Instagram | 1080×1080 |
| Instagram Story | 1080×1920 |

## Background Options

### Solid Colors
- Transparent (PNG)
- White
- Black
- Gray

### Gradients
- Blue Gradient
- Warm Gradient

### AI Generated
- Studio White
- Studio Gray
- Urban Street
- Nature Outdoor
- Luxury Indoor
- Beach Sunset

## Shadow Effects

| Effect | Description |
|--------|-------------|
| None | No shadow |
| Soft | Gentle, diffused shadow |
| Natural | Realistic directional shadow |
| Hard | Sharp, defined shadow |
| Floating | Elevated, diffused shadow |

## Pricing

### Remove.bg API
- 50 free previews/month (low resolution)
- $0.09 per HD image
- Volume discounts available

### Fal.ai / Replicate
- Pay-per-use pricing
- ~$0.02-0.05 per image generation

## Roadmap

- [x] Single image processing
- [x] Batch processing (up to 50 images)
- [x] Multiple background options
- [x] Shadow effects
- [x] Platform size presets
- [x] AI background generation (UI ready, API integration pending)
- [ ] User accounts & credits
- [ ] Payment integration (Stripe)
- [ ] API access for developers
- [ ] Template library

## License

MIT

## Credits

- Background removal powered by [Remove.bg](https://www.remove.bg)
- AI generation powered by [Fal.ai](https://fal.ai) / [Replicate](https://replicate.com)
- Deployed on [Cloudflare Pages](https://pages.cloudflare.com)