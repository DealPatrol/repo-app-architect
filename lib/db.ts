import { createClient } from '@supabase/supabase-js'

let supabaseClient: ReturnType<typeof createClient> | null = null

export function getDb() {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Supabase environment variables are not set. ' +
      'Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment variables.'
    )
  }

  supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  })

  return supabaseClient
}

// Export a validation function for startup checks
export function validateDatabaseConnection() {
  try {
    getDb()
    return { connected: true }
  } catch (error) {
    return { connected: false, error: String(error) }
  }
}

