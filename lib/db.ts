import postgres from 'postgres'

let sql: ReturnType<typeof postgres> | null = null

export function getDb() {
  if (sql) return sql

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Please configure your Supabase (or any PostgreSQL) connection string in your environment variables.'
    )
  }
  sql = postgres(databaseUrl)
  return sql
}

export function validateDatabaseConnection() {
  try {
    getDb()
    return { connected: true }
  } catch (error) {
    return { connected: false, error: String(error) }
  }
}

