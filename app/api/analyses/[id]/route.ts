import { NextRequest, NextResponse } from 'next/server'
import { getAnalysisById, getBlueprintsByAnalysis, getRepositoriesForAnalysis } from '@/lib/queries'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const analysis = await getAnalysisById(id)

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    }

    const [repositories, blueprints] = await Promise.all([
      getRepositoriesForAnalysis(id),
      getBlueprintsByAnalysis(id),
    ])

    return NextResponse.json({
      ...analysis,
      repositories,
      blueprints,
      // Backwards-compatible payload used by legacy results page.
      apps: blueprints,
    })
  } catch (error) {
    console.error('Error fetching analysis details:', error)
    return NextResponse.json({ error: 'Failed to fetch analysis details' }, { status: 500 })
  }
}
