import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUserCredits, getCreditUsageSummary } from '@/lib/credits'
import { getCurrentUser } from '@/lib/auth'

export async function GET(_request: NextRequest) {
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
