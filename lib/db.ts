import { Pool, type QueryResult, type QueryResultRow } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  // Keep this as a runtime warning so builds still succeed in CI
  // where secrets may not be present.
  console.warn('DATABASE_URL is not set. Database queries will fail until it is configured.');
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
});

export const db = {
  query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]) {
    return pool.query<T>(text, params);
  },
};

export async function sql<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result: QueryResult<T> = await db.query<T>(text, params);
  return result.rows;
}
