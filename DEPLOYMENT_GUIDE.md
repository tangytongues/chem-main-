# Deployment Guide

## GitHub Deployment Options

### Option 1: GitHub Pages (Static Frontend Only)

1. **Build the frontend:**

   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages:**
   - Go to your repository Settings → Pages
   - Select "Deploy from a branch"
   - Choose `main` branch and `/dist/public` folder
   - Your site will be available at `https://username.github.io/repository-name`

### Option 2: Vercel (Full-Stack)

1. **Connect your GitHub repository to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project" and import your GitHub repo

2. **Configure build settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`

3. **Environment Variables (if needed):**
   - Add any required environment variables in Vercel dashboard

### Option 3: Netlify (Full-Stack)

1. **Connect your GitHub repository to Netlify:**
   - Visit [netlify.com](https://netlify.com)
   - Click "New site from Git" and connect your repo

2. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist/public`

### Option 4: Railway/Render (Full Backend Support)

For full backend functionality with database:

1. **Railway:**
   - Connect your GitHub repo to Railway
   - Add environment variables for database
   - Deploy automatically on push

2. **Render:**
   - Connect your GitHub repo to Render
   - Choose "Web Service"
   - Build Command: `npm run build`
   - Start Command: `npm start`

## Pre-Deployment Checklist

✅ All TypeScript errors fixed
✅ Build process completes successfully
✅ Environment variables configured
✅ Database connection (if using backend features)
✅ CORS settings configured for production domain

## Local Testing

Before deploying, test the production build locally:

```bash
npm run build
npm start
```

Visit `http://localhost:5000` to test the production build.
