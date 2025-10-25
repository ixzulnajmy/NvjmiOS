# Supabase Setup Guide for NvjmiOS

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Name**: NvjmiOS
   - **Database Password**: (Choose a strong password and save it)
   - **Region**: Southeast Asia (Singapore) - closest to Malaysia
   - **Pricing Plan**: Free tier is fine for now

## Step 2: Get Your API Keys

1. Once project is created, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://[your-project-ref].supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)
3. Create `.env.local` file in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key...
```

## Step 3: Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click **Run** or press `Ctrl+Enter`
5. You should see "Success. No rows returned"

## Step 4: Enable Row Level Security (RLS)

The schema already includes RLS policies, but verify:

1. Go to **Authentication** → **Policies**
2. You should see policies for each table
3. All policies should be enabled

## Step 5: Test Connection

1. In your local project, run: `npm run dev`
2. Try to sign up with a test account
3. Check **Authentication** → **Users** in Supabase Dashboard
4. You should see your user

## Step 6: Update Next.js Config (Optional)

Update `next.config.mjs` line 5 with your actual Supabase URL:

```javascript
domains: ['your-project-ref.supabase.co'],
```

## Troubleshooting

### Can't connect to Supabase?
- Check `.env.local` is in root directory
- Check you copied the correct URL and anon key
- Restart dev server: `npm run dev`

### RLS errors?
- Make sure you're logged in
- Check policies are enabled
- Verify user_id matches in policies

### Need to reset?
- Go to **SQL Editor**
- Run: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
- Then re-run the schema.sql

## Next Steps

Once setup is complete:
1. Update your environment variables in Vercel when deploying
2. Enable email confirmations in **Authentication** → **Settings** (optional)
3. Configure OAuth providers if needed (Google, etc.)

---

Your database is now ready! Start using the app.
