'use server'

import { getDb } from '@/lib/db'

export async function initializeDemoData() {
  try {
    const sql = getDb()

    // Insert a demo repository if none exist
    const existing = await sql`SELECT id FROM repositories LIMIT 1`

    if (existing.length === 0) {
      await sql`
        INSERT INTO repositories (github_id, name, full_name, description, url, default_branch, language, stars)
        VALUES (
          -1,
          'demo-repo',
          'demo-user/demo-repo',
          'A sample repository to demonstrate CodeVault analysis',
          'https://github.com/demo-user/demo-repo',
          'main',
          'TypeScript',
          42
        )
        ON CONFLICT (github_id) DO NOTHING
      `
    }

    return { success: true }
  } catch (error) {
    console.error('[CodeVault] Error initializing demo data:', error)
    return { success: false, error: String(error) }
  }
}
