# Fixing Vercel Environment Variables Issue

## The Problem

Next.js `NEXT_PUBLIC_*` environment variables are **embedded at BUILD time**, not runtime. This means:

1. If you add env vars AFTER deploying → they won't be available
2. If you "redeploy" with cache enabled → it uses old build without new vars
3. Environment variables must be set for ALL environments you want to use

## The Proper Fix

### Step 1: Verify Environment Variables in Vercel

1. Go to https://vercel.com
2. Select your **NvjmiOS** project
3. Go to **Settings** → **Environment Variables**
4. Check if these exist:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 2: Add/Update Environment Variables

If missing or incorrect:

1. Click **Add New**
2. Enter:
   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://ertbhjawoxfsolmezdkn.supabase.co
   ```
3. Select ALL environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. Click **Save**

5. Repeat for the second variable:
   ```
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVydGJoamF3b3hmc29sbWV6ZGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTE4MDIsImV4cCI6MjA3Njk4NzgwMn0.uIACtzJ8eIj9HE4rTmO94nLGghJ5NOp9FB-FMgcvPu4
   ```

### Step 3: Trigger a FRESH Build (CRITICAL!)

This is the most important step:

1. Go to **Deployments** tab
2. Find your latest deployment
3. Click the **⋯** (three dots) menu
4. Click **Redeploy**
5. ⚠️ **IMPORTANT**: **UNCHECK** "Use existing Build Cache"
6. Click **Redeploy**

The build cache is the issue - it will use the old build that doesn't have your env vars!

### Step 4: Wait for Build to Complete

- Watch the build logs
- Should complete in 2-3 minutes
- Once it says "Deployment Ready", click the URL

### Step 5: Test

1. Open the deployed app
2. Open Browser DevTools Console (F12)
3. Try to login
4. You should see in console:
   ```
   🔍 Checking environment variables...
   All env vars: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']
   NEXT_PUBLIC_SUPABASE_URL: ✅ SET (https://ertbhjawoxfsolmezdkn...)
   NEXT_PUBLIC_SUPABASE_ANON_KEY: ✅ SET (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX...)
   ✅ Environment variables validated successfully
   ```

## Quick Test Option (If Above Doesn't Work)

If you want to test authentication RIGHT NOW without fixing env vars:

1. Rename `lib/supabase/client.ts` to `client.ts.backup`
2. Rename `lib/supabase/client.hardcoded.ts` to `client.ts`
3. Commit and push
4. Test login - it should work
5. After confirming it works, reverse the rename and fix env vars properly

## Why This Happens

Next.js replaces `process.env.NEXT_PUBLIC_*` with actual values during **build** (webpack bundling). The values are **hardcoded** into the JavaScript bundle.

This is why:
- Adding env vars after build = not available
- Redeploying with cache = uses old bundle
- Need fresh build = creates new bundle with new values

## Troubleshooting

### Still not working after fresh build?

Check build logs in Vercel:

1. Go to deployment
2. Click "View Build Logs"
3. Search for "NEXT_PUBLIC_SUPABASE"
4. You should see the values being embedded

### Variables show in Vercel but not in app?

Make sure you selected ALL environments when adding the variables:
- Production ✅
- Preview ✅
- Development ✅

### Changed variables but app still uses old values?

Clear browser cache or open in incognito mode.

## Summary

1. ✅ Add env vars to Vercel (ALL environments)
2. ✅ Redeploy WITHOUT cache
3. ✅ Wait for fresh build
4. ✅ Test

That's it!
