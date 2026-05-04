import postgres from 'postgres'

let sql: ReturnType<typeof postgres> | null = null

export function getDb() {
  if (sql) {
    return sql
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Please configure your Supabase PostgreSQL connection string in your environment variables.'
    )
  }

  // Create connection pool with Supabase
  sql = postgres(databaseUrl, {
    max: 20, // Connection pool size
    idle_timeout: 30, // 30 seconds idle timeout
    connect_timeout: 10, // 10 second connect timeout
    prepare: true, // Use prepared statements
  })

  return sql
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

// Close the database connection (for graceful shutdown)
export async function closeDatabase() {
  if (sql) {
    await sql.end()
    sql = null
  }
}

