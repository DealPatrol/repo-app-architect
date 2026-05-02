import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUserCredits, getCreditUsageSummary } from '@/lib/credits'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get credits and usage summary
    const [credits, summary] = await Promise.all([
      getOrCreateUserCredits(userId),
      getCreditUsageSummary(userId),
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
