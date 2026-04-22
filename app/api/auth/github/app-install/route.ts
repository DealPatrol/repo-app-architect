import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getDb } from '@/lib/db'
import { getInstallationAccessToken, getUserProfileFromApp } from '@/lib/github'
import { getBaseUrl } from '@/lib/utils'

/**
 * GitHub App Installation Callback
 * Called when user installs the GitHub App
 * GitHub redirects to: /api/auth/github/app-install?installation_id=12345&setup_action=install
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const installationId = searchParams.get('installation_id')
    const setupAction = searchParams.get('setup_action')

    console.log('[v0] GitHub App installation callback', {
      installationId,
      setupAction,
      baseUrl: getBaseUrl(request),
    })

    if (!installationId) {
      return NextResponse.redirect(new URL('/?error=missing_installation_id', getBaseUrl(request)))
    }

    const appInstallationId = Number.parseInt(installationId, 10)
    if (Number.isNaN(appInstallationId)) {
      return NextResponse.redirect(new URL('/?error=invalid_installation_id', getBaseUrl(request)))
    }

    // Get installation token to call GitHub API
    const token = await getInstallationAccessToken(appInstallationId)

    // Get authenticated user profile
    const userProfile = await getUserProfileFromApp(appInstallationId)

    console.log('[v0] Got user profile from GitHub App', {
      login: userProfile.login,
      id: userProfile.id,
      type: userProfile.type,
    })

    const sql = getDb()

    // Create or update user_accounts record
    let userId: string
    const existingUsers = await sql`
      SELECT id FROM user_accounts WHERE github_id = ${userProfile.id} LIMIT 1
    `

    if (existingUsers.length > 0) {
      userId = (existingUsers[0] as any).id
      // Update existing user
      await sql`
        UPDATE user_accounts
        SET github_username = ${userProfile.login},
            github_avatar_url = ${userProfile.avatar_url},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
      `
    } else {
      // Create new user
      const newUsers = await sql`
        INSERT INTO user_accounts (github_id, github_username, github_avatar_url)
        VALUES (${userProfile.id}, ${userProfile.login}, ${userProfile.avatar_url})
        RETURNING id
      `
      userId = (newUsers[0] as any).id
    }

    // Create or update installation record
    const accountType = userProfile.type === 'Organization' ? 'organization' : 'personal'

    const existingInstallations = await sql`
      SELECT id FROM github_app_installations
      WHERE installation_id = ${appInstallationId}
      LIMIT 1
    `

    if (existingInstallations.length > 0) {
      // Update existing installation
      await sql`
        UPDATE github_app_installations
        SET account_id = ${userId},
            account_type = ${accountType},
            updated_at = CURRENT_TIMESTAMP,
            active = true
        WHERE installation_id = ${appInstallationId}
      `
    } else {
      // Create new installation
      await sql`
        INSERT INTO github_app_installations (installation_id, account_id, account_type)
        VALUES (${appInstallationId}, ${userId}, ${accountType})
      `
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set('github_user_id', String(userProfile.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    console.log('[v0] GitHub App installation successful', {
      userId,
      installationId: appInstallationId,
      accountType,
    })

    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', getBaseUrl(request)))
  } catch (error) {
    console.error('[v0] GitHub App installation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.redirect(
      new URL(`/?error=installation_failed&message=${encodeURIComponent(errorMessage)}`, getBaseUrl(request))
    )
  }
}
