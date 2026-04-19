import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const username = cookieStore.get('github_username')
    const userId = cookieStore.get('github_user_id')
    const token = cookieStore.get('github_access_token')

    if (!token || !username) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      username: username.value,
      userId: userId?.value ?? null,
    })
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
