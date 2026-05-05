import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { trackBlueprintView } from '@/lib/queries'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { blueprintId } = await request.json()
    if (!blueprintId) {
      return NextResponse.json({ error: 'Blueprint ID required' }, { status: 400 })
    }

    await trackBlueprintView(user.id, blueprintId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error tracking blueprint view:', error)
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 })
  }
}
