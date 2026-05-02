import { NextRequest, NextResponse } from 'next/server'
import { markGapAsComplete, getCompletedGapCount, getBlueprintsByAnalysis } from '@/lib/queries'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gapId, blueprintId } = body

    if (!gapId || !blueprintId) {
      return NextResponse.json(
        { error: 'Missing gapId or blueprintId' },
        { status: 400 }
      )
    }

    const completedGap = await markGapAsComplete(gapId, blueprintId)
    const completedCount = await getCompletedGapCount(blueprintId)

    return NextResponse.json(
      { 
        success: true,
        completedGap,
        completedCount,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Error marking gap as complete:', error)
    return NextResponse.json(
      { error: 'Failed to mark gap as complete' },
      { status: 500 }
    )
  }
}
