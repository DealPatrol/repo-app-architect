'use server'

import { getDb } from '@/lib/db'

export async function initializeDemoData() {
  try {
    const sql = getDb()
    
    // Create a demo organization if it doesn't exist
    const orgs = await sql`SELECT id FROM neon_auth.organization WHERE slug = 'demo'`
    
    let orgId = orgs[0]?.id
    if (!orgId) {
      const newOrg = await sql`INSERT INTO neon_auth.organization (name, slug) VALUES ('Demo Org', 'demo') RETURNING id`
      orgId = newOrg[0].id
    }
    
    // Create a demo project
    const projects = await sql`SELECT id FROM projects WHERE organization_id = ${orgId} AND name = 'Welcome Project'`
    
    if (projects.length === 0) {
      await sql`
        INSERT INTO projects (organization_id, name, description, slug, status, visibility, color, created_by)
        VALUES (${orgId}, 'Welcome Project', 'Your first project - start by creating tasks!', 'welcome-project', 'active', 'private', '#3b82f6', ${orgId})
      `
    }
    
    return { success: true, orgId }
  } catch (error) {
    console.error('[v0] Error initializing demo data:', error)
    return { success: false, error: String(error) }
  }
}
