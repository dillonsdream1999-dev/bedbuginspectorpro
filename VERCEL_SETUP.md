# Vercel Deployment Setup

## Problem
Vercel is deploying source files instead of running the build command, resulting in a download prompt instead of the app.

## Solution: Configure in Vercel Dashboard

1. Go to your Vercel project: https://vercel.com/dashboard
2. Click on your project
3. Go to **Settings** → **General**
4. Scroll to **Build & Development Settings**
5. Configure the following:

   - **Framework Preset**: `Other` (or leave blank)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
   - **Node.js Version**: `20.x` (or latest LTS)

6. Click **Save**
7. Go to **Deployments** tab
8. Click **Redeploy** on the latest deployment (or push a new commit)

## What the build does

- `npm run build` → runs `npm run build:web`
- `npm run build:web` → runs `npx expo export --platform web`
- This exports the web app to the `dist` directory
- Vercel serves the `dist` directory as static files

## Alternative: Use Vercel CLI

If dashboard configuration doesn't work, you can also set it via CLI:

```bash
vercel --build-env BUILD_COMMAND="npm run build"
vercel --build-env OUTPUT_DIRECTORY="dist"
```

