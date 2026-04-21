import { NextRequest } from 'next/server'
import { generateText, Output } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import { 
  getAnalysisById, 
  getRepositoriesForAnalysis, 
  updateAnalysisStatus,
  createRepoFile,
  createBlueprint,
  getBlueprintsByAnalysis,
} from '@/lib/queries'

const anthropic = new Anthropic()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const cookieStore = await cookies()
        const accessToken = cookieStore.get('github_access_token')?.value

        const analysis = await getAnalysisById(id)
        if (!analysis) {
          send({ error: 'Analysis not found' })
          controller.close()
          return
        }

        const repositories = await getRepositoriesForAnalysis(id)
        if (repositories.length === 0) {
          send({ error: 'No repositories linked to this analysis' })
          controller.close()
          return
        }

        await updateAnalysisStatus(id, 'scanning')
        await deleteBlueprintsByAnalysis(id)
        send({ status: 'scanning', progress: 10 })

        const allFiles: { repo: string; path: string; type: string }[] = []

        for (const repo of repositories) {
          try {
            const headers: Record<string, string> = {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'CodeVault',
            }
            if (accessToken) {
              headers['Authorization'] = `Bearer ${accessToken}`
            }

            const treeRes = await fetch(
              `https://api.github.com/repos/${repo.full_name}/git/trees/${repo.default_branch}?recursive=1`,
              { headers }
            )

            if (treeRes.ok) {
              const treeData = await treeRes.json()
              const files = treeData.tree
                ?.filter((item: any) => item.type === 'blob')
                ?.filter((item: any) => {
                  const ext = item.path.split('.').pop()?.toLowerCase()
                  return ['ts', 'tsx', 'js', 'jsx', 'py', 'go', 'rs', 'java', 'rb', 'php', 'vue', 'svelte'].includes(ext)
                })
                ?.slice(0, 100) || []

              for (const file of files) {
                allFiles.push({
                  repo: repo.full_name,
                  path: file.path,
                  type: file.path.split('.').pop() || 'unknown',
                })

                await createRepoFile({
                  repository_id: repo.id,
                  path: file.path,
                  name: file.path.split('/').pop() || file.path,
                  extension: file.path.split('.').pop() || null,
                  size_bytes: file.size || null,
                  file_type: getFileType(file.path),
                })
              }
            }
          } catch (e) {
            console.error(`Error fetching tree for ${repo.full_name}:`, e)
          }
        }

        send({ status: 'scanning', progress: 40 })

        await updateAnalysisStatus(id, 'analyzing', { total_files: allFiles.length })
        send({ status: 'analyzing', progress: 50 })

        const fileSummary = allFiles.map(f => `- ${f.repo}: ${f.path}`).join('\n')

        // Use AI to analyze and discover app blueprints
        const { output } = await generateText({
          model: openai('gpt-4o-mini'),
          output: Output.object({ schema: AnalysisOutputSchema }),
          prompt: `You are an expert software architect. Analyze these files from GitHub repositories and discover what applications can be built by combining and reusing the existing code.

REPOSITORIES AND FILES:
${fileSummary}

Based on the file structure and naming patterns, identify 2-5 potential applications that could be built by:
1. Reusing existing files (components, utilities, hooks, etc.)
2. Adding just a few new files to complete the app

For each app blueprint, provide a clear name, description, type, complexity, reuse percentage, list of existing files to reuse, missing files needed, technologies, and explanation.`,
            },
          ],
        })

        send({ status: 'analyzing', progress: 80 })

        const toolUse = message.content.find(c => c.type === 'tool_use')
        const output = toolUse?.type === 'tool_use'
          ? (toolUse.input as { blueprints: any[] })
          : null

        if (output?.blueprints) {
          for (const bp of output.blueprints) {
            await createBlueprint({
              analysis_id: id,
              name: bp.name,
              description: bp.description,
              app_type: bp.app_type,
              complexity: bp.complexity,
              reuse_percentage: bp.reuse_percentage,
              existing_files: bp.existing_files,
              missing_files: bp.missing_files,
              estimated_effort: getEffortEstimate(bp.complexity, bp.missing_files.length),
              technologies: bp.technologies,
              ai_explanation: bp.explanation,
            })
          }
        }

        await updateAnalysisStatus(id, 'complete', { analyzed_files: allFiles.length })

        const finalBlueprints = await getBlueprintsByAnalysis(id)
        send({ status: 'complete', progress: 100, blueprints: finalBlueprints })
        controller.close()
      } catch (error) {
        console.error('Analysis error:', error)
        await updateAnalysisStatus(id, 'failed', {
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        send({ status: 'failed', error: 'Analysis failed' })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

function getFileType(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()
  const name = path.split('/').pop()?.toLowerCase() || ''

  if (name.includes('component') || path.includes('/components/')) return 'component'
  if (name.includes('hook') || name.startsWith('use')) return 'hook'
  if (name.includes('util') || path.includes('/utils/') || path.includes('/lib/')) return 'utility'
  if (name.includes('api') || path.includes('/api/')) return 'api'
  if (name.includes('page') || path.includes('/pages/') || path.includes('/app/')) return 'page'
  if (name.includes('layout')) return 'layout'
  if (name.includes('test') || name.includes('spec')) return 'test'
  if (name.includes('config')) return 'config'
  if (ext === 'css' || ext === 'scss') return 'style'

  return 'source'
}

function getEffortEstimate(complexity: string, missingFiles: number): string {
  if (complexity === 'simple' && missingFiles <= 2) return '1-2 hours'
  if (complexity === 'simple') return '2-4 hours'
  if (complexity === 'moderate' && missingFiles <= 5) return '1-2 days'
  if (complexity === 'moderate') return '2-3 days'
  if (complexity === 'complex' && missingFiles <= 10) return '3-5 days'
  return '1-2 weeks'
}
