import { cookies } from 'next/headers'
import { getDb } from '@/lib/db'
import { getInstallationAccessToken } from '@/lib/github'

export interface AuthUser {
  id: string
  github_id: number
  github_username: string
  github_avatar_url: string | null
  access_token?: string // Optional for GitHub App model (use getInstallationAccessToken instead)
}

export interface UserWithInstallation extends AuthUser {
  installation_id: number
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const userIdCookie = cookieStore.get('github_user_id')?.value

  if (!userIdCookie) {
    return null
  }

  const githubId = Number.parseInt(userIdCookie, 10)
  if (Number.isNaN(githubId)) {
    return null
  }

  const sql = getDb()
  
  // Try GitHub App model first (user_accounts)
  const appUsers = await sql`
    SELECT id, github_id, github_username, github_avatar_url
    FROM user_accounts
    WHERE github_id = ${githubId}
    LIMIT 1
  `

  if (appUsers.length > 0) {
    return appUsers[0] as AuthUser
  }

  // Fallback to OAuth model for backward compatibility
  const oauthUsers = await sql`
    SELECT id, github_id, github_username, github_avatar_url, access_token
    FROM user_auth
    WHERE github_id = ${githubId}
    LIMIT 1
    LIMIT 1
  `

  return (oauthUsers[0] as AuthUser | undefined) ?? null
}

export async function getCurrentUserWithInstallation(): Promise<UserWithInstallation | null> {
  const user = await getCurrentUser()
  if (!user) {
    return null
  }

  const sql = getDb()
  const installations = await sql`
    SELECT installation_id
    FROM github_app_installations
    WHERE account_id = ${user.id} AND active = true
    ORDER BY installed_at DESC
    LIMIT 1
  `

  if (installations.length === 0) {
    return null
  }

  return {
    ...user,
    installation_id: (installations[0] as any).installation_id,
  }
}

export async function getCurrentAccessToken(): Promise<string | null> {
  const user = await getCurrentUserWithInstallation()
  if (!user) {
    return null
  }

  // Generate fresh installation token using GitHub App
  try {
    return await getInstallationAccessToken(user.installation_id)
  } catch (error) {
    console.error('[v0] Failed to get installation token:', error)
    return null
  }
}
