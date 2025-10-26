import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing environment variables!\n\n' +
      'Please create a .env.local file with:\n' +
      'NEXT_PUBLIC_SUPABASE_URL=your-project-url\n' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n\n' +
      'See SUPABASE_SETUP.md for instructions.'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
