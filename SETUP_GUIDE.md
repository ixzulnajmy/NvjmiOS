# NvjmiOS Setup Guide

Complete step-by-step guide to get NvjmiOS running locally and deployed.

## Prerequisites

- Node.js 18+ installed
- WSL/Linux/macOS terminal
- Supabase account (free)
- Vercel account (free)

## Part 1: Local Setup (5-10 minutes)

### Step 1: Extract and Open Project

1. Extract the ZIP file to your WSL/local directory
2. Open in VSCode:
   ```bash
   cd nvjmios-clean
   code .
   ```

### Step 2: Install Dependencies

```bash
npm install
```

Wait for installation to complete (~1-2 minutes).

### Step 3: Create PNG Icons (CRITICAL for PWA)

The app needs PNG icons to work as a PWA on iOS. See `CREATE_ICONS.md` for detailed instructions.

**Quick Option:**
1. Go to: https://www.pwabuilder.com/imageGenerator
2. Upload any square image
3. Download generated icons
4. Copy `icon-192.png` and `icon-512.png` to `public/` folder
5. Rename to `icon-192x192.png` and `icon-512x512.png`

### Step 4: Set Up Supabase

#### 4.1: Create Supabase Project

1. Go to https://supabase.com
2. Sign in/Sign up
3. Click "New Project"
4. Fill in:
   - Name: `NvjmiOS`
   - Database Password: (create strong password - SAVE IT)
   - Region: Southeast Asia (Singapore)
   - Plan: Free
5. Wait 2-3 minutes for project creation

#### 4.2: Run Database Schema

1. In Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy ENTIRE contents of `supabase/schema.sql`
4. Paste into SQL Editor
5. Click "Run" or press Ctrl+Enter
6. Should see "Success. No rows returned"

#### 4.3: Get API Keys

1. Go to Settings → API
2. Copy:
   - **Project URL**: https://xxxxx.supabase.co
   - **anon public key**: eyJhbGciOi... (long string)

### Step 5: Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your actual values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   ```

### Step 6: Test Locally

```bash
npm run dev
```

Open http://localhost:3000

You should see:
- ✓ Login page loads
- ✓ Can click "Sign up"
- ✓ No console errors about missing env vars

Try creating an account and logging in!

### Step 7: Verify Build

Before deploying, make sure it builds:

```bash
npm run build
```

Should complete with ✓ success and no errors.

---

## Part 2: Deploy to Vercel (5 minutes)

### Step 1: Push to GitHub

1. Create new GitHub repo (can be private)
2. Push code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: NvjmiOS clean build"
   git branch -M main
   git remote add origin https://github.com/yourusername/nvjmios.git
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. **BEFORE CLICKING DEPLOY:**
   - Click "Environment Variables"
   - Add both:
     - `NEXT_PUBLIC_SUPABASE_URL` = your project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
   - Select all environments (Production, Preview, Development)
5. Click "Deploy"
6. Wait 2-3 minutes

### Step 3: Test Deployment

1. Click the deployment URL
2. Try signing up/logging in
3. Should work exactly like local!

---

## Part 3: iOS PWA Setup (2 minutes)

### Install on iPhone

1. Open Safari (must be Safari, not Chrome)
2. Visit your Vercel URL
3. Tap Share button (square with arrow)
4. Scroll down → "Add to Home Screen"
5. Tap "Add"

### Test PWA

1. Open app from home screen (not Safari)
2. Should open FULLSCREEN (no Safari UI)
3. Should look like native app
4. Bottom navigation should work

---

## Troubleshooting

### Build Fails with ESLint Errors

Check all `.tsx` files for apostrophes. They should be:
- `Don&apos;t` not `Don't`
- `Today&apos;s` not `Today's`

### "Missing environment variables" Error

1. Check `.env.local` exists in root directory
2. Check both variables are set correctly
3. Restart dev server: `npm run dev`

### PWA Still Shows Safari UI

1. Delete app from home screen
2. Clear Safari cache (Settings → Safari → Clear History)
3. Re-add to home screen
4. Make sure opening from HOME SCREEN icon, not Safari

### Icons Don't Show

You need to create PNG icons (see CREATE_ICONS.md).
SVG doesn't work for iOS PWA.

### Supabase Connection Errors

1. Verify URL and key are correct in `.env.local`
2. Check Supabase project is active (not paused)
3. Verify you ran the schema.sql in SQL Editor

---

## What's Next?

After everything works:

1. ✓ Authentication working
2. ✓ Dashboard shows
3. ✓ PWA opens fullscreen

Now start adding your data:
- Add your debts in Finance
- Track prayers in Ibadah
- Log expenses
- Set goals

Build features you need as you go!

---

## Need Help?

Check these files:
- `SUPABASE_SETUP.md` - Detailed Supabase setup
- `CREATE_ICONS.md` - How to create PWA icons
- `README.md` - Project overview

---

Built with discipline, for a purpose.
جَزَاكَ ٱللَّٰهُ خَيْرًا
