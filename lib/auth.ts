import { cookies } from 'next/headers'
import { getDb } from '@/lib/db'

export interface AuthUser {
  id: string
  github_id: number
  github_username: string
  github_avatar_url: string | null
  access_token: string
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
  const users = await sql`
    SELECT id, github_id, github_username, github_avatar_url, access_token
    FROM user_auth
    WHERE github_id = ${githubId}
    LIMIT 1
  `

  return (users[0] as AuthUser | undefined) ?? null
}

export async function getCurrentAccessToken(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.access_token ?? null
}
