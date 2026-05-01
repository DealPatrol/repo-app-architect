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
    const { name } = body
    const repositoryIds = Array.isArray(body.repositoryIds)
      ? body.repositoryIds
      : Array.isArray(body.repo_ids)
        ? body.repo_ids
        : []

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Analysis name is required' }, { status: 400 })
    }

    if (!repositoryIds || repositoryIds.length === 0) {
      return NextResponse.json({ error: 'At least one repository is required' }, { status: 400 })
    }

    const analysis = await createAnalysis(name.trim())

    const linked: string[] = []
    for (const repoId of repositoryIds) {
      try {
        await linkAnalysisToRepository(analysis.id, repoId)
        linked.push(repoId as string)
      } catch (e) {
        console.error(`Failed to link repository ${repoId} to analysis ${analysis.id}:`, e)
      }
    }

    if (linked.length === 0) {
      return NextResponse.json(
        { error: 'Failed to link any repositories to the analysis. Verify repository IDs are valid.' },
        { status: 400 },
      )
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error creating analysis:', error)
    return NextResponse.json({ error: 'Failed to create analysis' }, { status: 500 })
  }
}
