import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getOrCreateUserCredits, getCreditUsageSummary } from '@/lib/credits'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Sign in with GitHub to view credits.' },
        { status: 401 }
      )
    }

    // Get credits and usage summary
    const [credits, summary] = await Promise.all([
      getOrCreateUserCredits(user.id),
      getCreditUsageSummary(user.id),
    ])

    return NextResponse.json({
      credits,
      summary,
    })
  } catch (error) {
    console.error('[v0] Failed to fetch credits summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credits' },
      { status: 500 }
    )
  }
}
