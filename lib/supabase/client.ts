import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Debug: Log all available NEXT_PUBLIC_ env vars
  console.log('🔍 Checking environment variables...')
  console.log('All env vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')))

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? `✅ SET (${supabaseUrl.substring(0, 30)}...)` : '❌ MISSING')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? `✅ SET (${supabaseAnonKey.substring(0, 30)}...)` : '❌ MISSING')

  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMsg = `
❌ Missing Supabase Environment Variables!

Expected:
- NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'SET' : 'MISSING'}
- NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'SET' : 'MISSING'}

Troubleshooting:
1. In Vercel: Settings → Environment Variables
2. Make sure variables are set for ALL environments (Production, Preview, Development)
3. After adding/updating variables, you MUST redeploy (not just restart)
4. Go to Deployments → Click "Redeploy" → Check "Use existing Build Cache" is OFF

NEXT_PUBLIC_ variables are embedded at BUILD TIME in Next.js.
If you added them after deploying, you need to trigger a new build.
    `
    console.error(errorMsg)
    throw new Error('Missing Supabase environment variables. Check console for details.')
  }

  console.log('✅ Environment variables validated successfully')
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
