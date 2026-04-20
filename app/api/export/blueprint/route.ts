import { NextRequest, NextResponse } from 'next/server'

interface ExportApp {
  app_name: string
  app_type: string
  description: string
  is_complete: boolean
  reuse_percentage: number
  missing_files_count: number
  missing_files: string[]
  technologies: string[]
  difficulty_level: string
  ai_explanation: string
  fast_cash_label?: string
}

export async function POST(request: NextRequest) {
  try {
    const { app } = (await request.json()) as { app: ExportApp }

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
      fileStructure: generateFileStructure(),
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

function generateFileStructure(): Record<string, unknown> {
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

function generateSetupInstructions(app: ExportApp): string[] {
  return [
    `Create new project: npx create-${app.app_type}-app ${app.app_name.toLowerCase().replace(/\s+/g, '-')}`,
    'Install dependencies from the reused repositories',
    'Copy the identified files into the new project structure',
    'Install missing dependencies',
    'Run tests to verify everything works',
    'Deploy to production',
  ]
}
