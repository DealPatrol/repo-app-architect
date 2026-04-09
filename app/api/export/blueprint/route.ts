import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { app, analysisId } = await request.json()

    const blueprint = {
      id: `${app.app_name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      appName: app.app_name,
      appType: app.app_type,
      description: app.description,
      complete: app.is_complete,
      reusePercentage: app.reuse_percentage,
      missingFilesCount: app.missing_files_count,
      missingFiles: app.missing_files,
      technologies: app.technologies,
      difficultyLevel: app.difficulty_level,
      explanation: app.ai_explanation,
      fastCashLabel: app.fast_cash_label,
      createdAt: new Date().toISOString(),
      fileStructure: generateFileStructure(app),
      setupInstructions: generateSetupInstructions(app),
      dependencies: app.technologies.map((tech: string) => ({
        name: tech,
        version: 'latest',
      })),
    }

    return NextResponse.json(blueprint, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${app.app_name.toLowerCase().replace(/\s+/g, '-')}-blueprint.json"`,
      },
    })
  } catch (error) {
    console.error('Error generating blueprint:', error)
    return NextResponse.json({ error: 'Failed to generate blueprint' }, { status: 500 })
  }
}

function generateFileStructure(app: any): any {
  return {
    root: {
      'README.md': 'Project documentation',
      'package.json': 'Dependencies',
      'src/': {
        'index.ts': 'Entry point',
        'components/': 'Reusable components',
        'utils/': 'Helper utilities',
        'types/': 'TypeScript types',
      },
      'tests/': 'Test files',
      '.env.example': 'Environment variables',
    },
  }
}

function generateSetupInstructions(app: any): string[] {
  return [
    `Create new project: npx create-${app.app_type}-app ${app.app_name.toLowerCase().replace(/\s+/g, '-')}`,
    'Install dependencies from the reused repositories',
    'Copy the identified files into the new project structure',
    'Install missing dependencies',
    'Run tests to verify everything works',
    'Deploy to production',
  ]
}
