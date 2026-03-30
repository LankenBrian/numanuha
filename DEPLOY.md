# Quick Deploy Guide

## Prerequisites
- Node.js 18+
- Cloudflare account
- Remove.bg API key

## Step 1: Install Dependencies
```bash
cd image-bg-remover
npm install
```

## Step 2: Set Environment Variables
```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local and add your API key
REMOVE_BG_API_KEY=your_api_key_here
```

## Step 3: Local Development
```bash
npm run dev
```
Visit http://localhost:3000

## Step 4: Deploy to Cloudflare

### Install Wrangler (if not already installed)
```bash
npm install -g wrangler
```

### Login to Cloudflare
```bash
wrangler login
```

### Set Secrets
```bash
wrangler secret put REMOVE_BG_API_KEY
# Enter your API key when prompted
```

### Build and Deploy
```bash
npm run pages:build
npm run pages:deploy
```

## Troubleshooting

### Build Errors
If you see errors about Next.js version:
```bash
rm -rf node_modules package-lock.json
npm install
```

### API Key Issues
Make sure your Remove.bg API key is valid at:
https://www.remove.bg/dashboard#api-key

### Function Errors
Check logs with:
```bash
wrangler tail
```

## Next Steps

1. **Add AI Background Generation**
   - Sign up for Fal.ai or Replicate
   - Add API key to secrets
   - Uncomment AI generation code in `functions/api/remove-bg.ts`

2. **Enable Shadow Effects**
   - Shadow effects are implemented client-side in `src/lib/shadow-effects.ts`
   - They're automatically applied when downloading images

3. **Customize**
   - Edit `src/app/page.tsx` to change UI
   - Edit `tailwind.config.js` to change colors
   - Add more platform presets in `src/app/page.tsx`