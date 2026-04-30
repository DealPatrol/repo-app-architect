import { NextRequest } from 'next/server'
import { getCurrentAccessToken } from '@/lib/auth'
import {
  getGitHubRepositoryTree,
  getGitHubRepositoryTreeFromBranch,
  shouldSkipRepoPath,
} from '@/lib/github'
import {
  getAnalysisById,
  getRepositoriesForAnalysis,
  updateAnalysisStatus,
  createRepoFile,
  createBlueprint,
  deleteBlueprintsByAnalysis,
  getBlueprintsByAnalysis
} from '@/lib/queries'
import { runAIAnalysis, getAvailableProviders, type AIProvider } from '@/lib/ai-providers'

const CODE_EXTENSIONS = new Set([
  'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs',
  'py', 'go', 'rs', 'java', 'rb', 'php', 'vue', 'svelte',
  'css', 'scss', 'html', 'json', 'md', 'yml', 'yaml',
])

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Create a stream for progress updates
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const accessToken = await getCurrentAccessToken()
        if (!accessToken) {
          send({ error: 'Sign in with GitHub before running an analysis.' })
          controller.close()
          return
        }

        const url = new URL(request.url)
        const providersParam = url.searchParams.get('providers')
        const available = getAvailableProviders()

        if (available.length === 0) {
          send({ error: 'No AI providers configured. Set ANTHROPIC_API_KEY and/or OPENAI_API_KEY.' })
          controller.close()
          return
        }

        let requestedProviders: AIProvider[]
        if (providersParam) {
          requestedProviders = providersParam.split(',').filter((p): p is AIProvider =>
            (p === 'anthropic' || p === 'openai') && available.includes(p as AIProvider)
          )
        } else {
          requestedProviders = available.slice(0, 1)
        }

        if (requestedProviders.length === 0) {
          send({ error: `Requested providers not available. Configured: ${available.join(', ')}` })
          controller.close()
          return
        }

        // Get analysis and repositories
        const analysis = await getAnalysisById(id)
        if (!analysis) {
          send({ error: 'Analysis not found' })
          controller.close()
          return
        }
        if (analysis.status === 'scanning' || analysis.status === 'analyzing') {
          send({ error: 'Analysis is already running. Please wait for it to finish.' })
          controller.close()
          return
        }

        const repositories = await getRepositoriesForAnalysis(id)
        if (repositories.length === 0) {
          send({ error: 'No repositories linked to this analysis' })
          controller.close()
          return
        }

        // Update status to scanning
        await updateAnalysisStatus(id, 'scanning')
        await deleteBlueprintsByAnalysis(id)
        send({ status: 'scanning', progress: 10 })

        // Fetch file trees from GitHub for each repository
        const allFiles: { repo: string; path: string; type: string }[] = []

        for (const repo of repositories) {
          try {
            let treeData: Awaited<ReturnType<typeof getGitHubRepositoryTreeFromBranch>>
            try {
              treeData = await getGitHubRepositoryTreeFromBranch(
                repo.full_name,
                repo.default_branch,
                accessToken,
              )
            } catch {
              treeData = await getGitHubRepositoryTree(repo.full_name, repo.default_branch, accessToken)
            }

            if (treeData.truncated) {
              console.warn(`[analysis] Git tree truncated for ${repo.full_name}; sampling first matching files only`)
            }

            const files = treeData.tree
              ?.filter((item) => item.type === 'blob')
              ?.filter((item) => !shouldSkipRepoPath(item.path))
              ?.filter((item) => {
                const ext = item.path.split('.').pop()?.toLowerCase()
                return ext ? CODE_EXTENSIONS.has(ext) : false
              })
              ?.slice(0, 200) || []

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
          } catch (e) {
            console.error(`Error fetching tree for ${repo.full_name}:`, e)
          }
        }

        if (allFiles.length === 0) {
          const msg =
            'No source files found to analyze (after skipping dependencies/build folders). Add repos with application code or widen file types.'
          send({ status: 'failed', error: msg })
          await updateAnalysisStatus(id, 'failed', { error_message: msg })
          controller.close()
          return
        }

        send({ status: 'scanning', progress: 40 })

        await updateAnalysisStatus(id, 'analyzing', { total_files: allFiles.length })
        send({ status: 'analyzing', progress: 50 })

        const fileSummary = allFiles.map(f => `- ${f.repo}: ${f.path}`).join('\n')
        const isMultiProvider = requestedProviders.length > 1
        let anySucceeded = false

        for (let pi = 0; pi < requestedProviders.length; pi++) {
          const provider = requestedProviders[pi]
          const progressBase = 50 + Math.round((pi / requestedProviders.length) * 40)

          send({
            status: 'analyzing',
            progress: progressBase,
            provider_status: { provider, state: 'running' },
          })

          try {
            await deleteBlueprintsByAnalysis(id, provider)

            const blueprintResults = await runAIAnalysis(fileSummary, provider)

            if (blueprintResults.length === 0) {
              send({ provider_status: { provider, state: 'empty' } })
              continue
            }

            const rankedBlueprints = blueprintResults
              .map((bp) => normalizeBlueprint(bp))
              .sort((a, b) => getOpportunityScore(b) - getOpportunityScore(a))

            for (const bp of rankedBlueprints) {
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
                ai_provider: provider,
              })
            }

            anySucceeded = true
            send({ provider_status: { provider, state: 'complete', count: rankedBlueprints.length } })
          } catch (providerError) {
            console.error(`[analysis] ${provider} failed:`, providerError)
            send({
              provider_status: {
                provider,
                state: 'failed',
                error: providerError instanceof Error ? providerError.message : 'Provider failed',
              },
            })
            if (!isMultiProvider) {
              const msg = providerError instanceof Error ? providerError.message : 'AI analysis failed'
              send({ status: 'failed', error: msg })
              await updateAnalysisStatus(id, 'failed', { error_message: msg })
              controller.close()
              return
            }
          }
        }

        if (!anySucceeded) {
          const msg = 'All AI providers failed to produce blueprints.'
          send({ status: 'failed', error: msg })
          await updateAnalysisStatus(id, 'failed', { error_message: msg })
          controller.close()
          return
        }

        await updateAnalysisStatus(id, 'complete', { analyzed_files: allFiles.length })
        const finalBlueprints = await getBlueprintsByAnalysis(id)

        send({
          status: 'complete',
          progress: 100,
          blueprints: finalBlueprints,
          providers_used: requestedProviders,
        })
        controller.close()

      } catch (error) {
        console.error('Analysis error:', error)
        await updateAnalysisStatus(id, 'failed', {
          error_message: error instanceof Error ? error.message : 'Unknown error'
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

function getOpportunityScore(bp: {
  reuse_percentage: number
  missing_files: { name: string; purpose: string }[]
  complexity: 'simple' | 'moderate' | 'complex'
}): number {
  const missing = bp.missing_files.length
  const complexityPenalty = bp.complexity === 'simple' ? 0 : bp.complexity === 'moderate' ? 8 : 16
  return bp.reuse_percentage - (missing * 6) - complexityPenalty
}

function normalizeBlueprint(bp: {
  name: string
  description: string
  app_type: string
  complexity: 'simple' | 'moderate' | 'complex'
  reuse_percentage: number
  existing_files: { path: string; purpose: string }[]
  missing_files: { name: string; purpose: string }[]
  technologies: string[]
  explanation: string
}) {
  return {
    ...bp,
    reuse_percentage: Math.max(5, Math.min(95, Math.round(bp.reuse_percentage))),
    existing_files: bp.existing_files.slice(0, 8),
    missing_files: bp.missing_files.slice(0, 8),
    technologies: bp.technologies.slice(0, 8),
  }
}
