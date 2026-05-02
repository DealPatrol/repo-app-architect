import { NextRequest, NextResponse } from 'next/server'
import { getAllMissingGaps, getMissingGapsByBlueprint, getGapSummary } from '@/lib/queries'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const blueprintId = searchParams.get('blueprintId')

    if (blueprintId) {
      // Get gaps for specific blueprint
      const gaps = await getMissingGapsByBlueprint(blueprintId)
      return NextResponse.json({ gaps }, { status: 200 })
    }

    // Get all gaps and summary
    const [gaps, summary] = await Promise.all([
      getAllMissingGaps(),
      getGapSummary(),
    ])

    return NextResponse.json({ gaps, summary }, { status: 200 })
  } catch (error) {
    console.error('[v0] Error fetching gaps:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gaps' },
      { status: 500 }
    )
  }
}
