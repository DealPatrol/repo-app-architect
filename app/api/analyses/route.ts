import { NextRequest, NextResponse } from 'next/server'
import { createAnalysis, linkAnalysisToRepository, getAllAnalyses } from '@/lib/queries'

export async function GET() {
  try {
    const analyses = await getAllAnalyses()
    return NextResponse.json(analyses)
  } catch (error) {
    console.error('Error fetching analyses:', error)
    return NextResponse.json({ error: 'Failed to fetch analyses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, repositoryIds } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Analysis name is required' }, { status: 400 })
    }

    if (!repositoryIds || repositoryIds.length === 0) {
      return NextResponse.json({ error: 'At least one repository is required' }, { status: 400 })
    }

    // Create the analysis
    const analysis = await createAnalysis(name.trim())

    // Link repositories to the analysis
    for (const repoId of repositoryIds) {
      await linkAnalysisToRepository(analysis.id, repoId)
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error creating analysis:', error)
    return NextResponse.json({ error: 'Failed to create analysis' }, { status: 500 })
  }
}
