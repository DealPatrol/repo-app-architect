import { neon } from '@neondatabase/serverless'

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Please configure your Supabase database connection string in your environment variables.'
    )
  }
  // Use Neon's HTTP driver which is browser-safe and works with Supabase PostgreSQL
  return neon(databaseUrl, { fetchOptions: { cache: 'no-store' } })
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

