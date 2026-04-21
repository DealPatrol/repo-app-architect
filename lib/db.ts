import { Pool } from 'pg';

const db = new Pool({ connectionString: process.env.DATABASE_URL || '' });

async function sql(query: string, params?: any[]): Promise<any[]> {
  const result = await db.query(query, params);
  return result.rows;
}

export { sql, db };
