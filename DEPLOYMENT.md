# GitHub Pages Deployment Guide

This guide explains how to deploy your New Zealand Legislation Drafter to GitHub Pages.

## What's Been Set Up

1. **Vite Configuration** (`vite.config.js`): Added `base: '/legislation-project/'` to ensure assets load correctly from the subdirectory
2. **Deploy Script** (`package.json`): Added `npm run deploy` command
3. **GitHub Actions Workflow** (`.github/workflows/deploy.yml`): Automated deployment on every push to main

## Deployment Options

You have two options for deploying to GitHub Pages:

### Option 1: Automatic Deployment with GitHub Actions (Recommended)

This is the easiest method - it automatically rebuilds and deploys whenever you push to GitHub.

**Steps:**

1. **Push your code to GitHub** (if you haven't already):
   ```bash
   git add .
   git commit -m "Setup GitHub Pages deployment"
   git push origin main
   ```

2. **Enable GitHub Pages in your repository settings**:
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Build and deployment":
     - Source: Select **GitHub Actions**
   - Click **Save**

3. **Wait for the workflow to run**:
   - Go to the **Actions** tab in your repository
   - You should see a workflow running
   - Once complete, your site will be live at: `https://yourusername.github.io/legislation-project/`

That's it! Every time you push to the `main` branch, your site will automatically rebuild and redeploy.

### Option 2: Manual Deployment to `docs` Folder

If you prefer manual control or can't use GitHub Actions:

1. **Modify `vite.config.js`** to output to `docs` instead of `dist`:
   ```javascript
   export default defineConfig({
     plugins: [
       react(),
       tailwindcss(),
     ],
     base: '/legislation-project/',
     build: {
       outDir: 'docs',
     },
   })
   ```

2. **Build your project**:
   ```bash
   npm run build
   ```

3. **Commit the docs folder**:
   ```bash
   git add docs
   git commit -m "Build for GitHub Pages"
   git push origin main
   ```

4. **Configure GitHub Pages**:
   - Go to **Settings** → **Pages**
   - Source: Select **Deploy from a branch**
   - Branch: Select `main` and `/docs`
   - Click **Save**

## Important Notes

- **Repository Name**: If your repository name is different from `legislation-project`, update the `base` value in `vite.config.js` to match your repo name
- **Branch Name**: If you use `master` instead of `main`, update the workflow file accordingly
- **.nojekyll File**: This file is automatically created to prevent GitHub Pages from ignoring files starting with underscore (which Vite sometimes generates)

## Testing Locally

Before deploying, you can test the production build locally:

```bash
npm run build
npm run preview
```

This will build and serve the production version at `http://localhost:4173`

## Troubleshooting

### Assets not loading (404 errors)
- Ensure the `base` path in `vite.config.js` matches your repository name
- Check that you've enabled GitHub Pages in repository settings

### Workflow fails
- Check the Actions tab for error messages
- Ensure you've enabled "Read and write permissions" in **Settings** → **Actions** → **General** → **Workflow permissions**

### Site shows 404
- Wait a few minutes after deployment
- Clear your browser cache
- Check that GitHub Pages is enabled and the deployment was successful

## Updating Your Deployment

With GitHub Actions, simply push your changes:

```bash
git add .
git commit -m "Update application"
git push origin main
```

The site will automatically rebuild and redeploy in a few minutes.
