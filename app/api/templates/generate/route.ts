import { NextRequest, NextResponse } from 'next/server'
import { createTemplate, getBlueprintsByAnalysis, getMissingGapsByBlueprint } from '@/lib/queries'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      blueprintIds,
      techStack,
      tier = 'standard',
    } = body

    if (!name || !blueprintIds || !Array.isArray(blueprintIds) || blueprintIds.length < 2) {
      return NextResponse.json(
        { error: 'Template must combine at least 2 blueprints' },
        { status: 400 }
      )
    }

    // Calculate aggregate metrics from blueprints
    let totalFiles = 0
    let totalMissingFiles = 0
    let totalEstimatedHours = 0
    let totalReuse = 0

    for (const blueprintId of blueprintIds) {
      const gaps = await getMissingGapsByBlueprint(blueprintId)
      totalMissingFiles += gaps.length
      totalEstimatedHours += gaps.reduce((sum, g) => sum + g.estimated_hours, 0)
      
      // Estimate reuse (would be pulled from blueprint in real system)
      totalReuse += 60 // placeholder
    }

    const reusePercentage = (totalReuse / blueprintIds.length)
    const totalAllFiles = totalFiles + totalMissingFiles

    const template = await createTemplate({
      name,
      description: description || null,
      blueprint_ids: blueprintIds,
      tech_stack: techStack || [],
      estimated_hours: Math.round(totalEstimatedHours),
      reuse_percentage: Math.round(reusePercentage),
      total_files: totalAllFiles,
      missing_files: totalMissingFiles,
      tier: tier as 'quick_start' | 'standard' | 'comprehensive',
      featured: false,
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error('[v0] Error generating template:', error)
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    )
  }
}
