import { createBrowserClient } from '@supabase/ssr'

/**
 * TEMPORARY HARDCODED VERSION - FOR TESTING ONLY!
 *
 * This file has hardcoded Supabase credentials for immediate testing.
 * To use this:
 * 1. Rename lib/supabase/client.ts to client.ts.backup
 * 2. Rename this file to client.ts
 * 3. Commit and push
 *
 * ⚠️ WARNING: Never commit actual credentials to public repos!
 * This is ONLY for debugging. Remove after fixing env vars.
 */

export function createClient() {
  console.log('🔧 Using HARDCODED Supabase credentials (TESTING ONLY)')

  const supabaseUrl = 'https://ertbhjawoxfsolmezdkn.supabase.co'
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVydGJoamF3b3hmc29sbWV6ZGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTE4MDIsImV4cCI6MjA3Njk4NzgwMn0.uIACtzJ8eIj9HE4rTmO94nLGghJ5NOp9FB-FMgcvPu4'

  console.log('✅ Hardcoded URL:', supabaseUrl)
  console.log('✅ Hardcoded Key:', supabaseAnonKey.substring(0, 30) + '...')

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
