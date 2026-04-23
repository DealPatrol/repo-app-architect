import { neon } from '@neondatabase/serverless'

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Please configure your Neon database connection string in your environment variables.'
    )
  }
  return neon(databaseUrl)
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

