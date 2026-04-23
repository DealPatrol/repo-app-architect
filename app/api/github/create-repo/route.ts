import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

interface TemplateApp {
  app_name: string
  app_type: string
  description: string
  technologies: string[]
  difficulty_level: string
  ai_explanation: string
  missing_files: string[]
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { app, repoName } = (await request.json()) as {
      app: TemplateApp
      repoName: string
    }

    if (!repoName || repoName.trim().length === 0) {
      return NextResponse.json({ error: 'Repository name required' }, { status: 400 })
    }

    const accessToken = user.access_token
    const githubUsername = user.github_username

    // Create repository on GitHub
    const createRepoRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github+json',
      },
      body: JSON.stringify({
        name: repoName,
        description: app.description,
        private: false,
        auto_init: true,
        gitignore_template: app.app_type === 'React App' ? 'Node' : 'Node',
      }),
    })

    if (!createRepoRes.ok) {
      const error = await createRepoRes.json()
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const newRepo = await createRepoRes.json()

    // Generate initial code template
    const templateFiles = generateTemplateFiles(app)

    // Create files in the new repository
    for (const [fileName, content] of Object.entries(templateFiles)) {
      await createFileInRepo(
        githubUsername,
        repoName,
        fileName,
        content as string,
        accessToken
      )
    }

    return NextResponse.json({
      success: true,
      repository: {
        name: newRepo.name,
        url: newRepo.html_url,
        clone_url: newRepo.clone_url,
      },
    })
  } catch (error) {
    console.error('Error creating repository:', error)
    return NextResponse.json({ error: 'Failed to create repository' }, { status: 500 })
  }
}

async function createFileInRepo(
  owner: string,
  repo: string,
  path: string,
  content: string,
  accessToken: string
): Promise<void> {
  const encodedContent = Buffer.from(content).toString('base64')

  await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github+json',
      },
      body: JSON.stringify({
        message: `Add ${path}`,
        content: encodedContent,
      }),
    }
  )
}

function generateTemplateFiles(app: TemplateApp): Record<string, string> {
  return {
    'README.md': `# ${app.app_name}

${app.description}

## Technologies
${app.technologies.map((t: string) => `- ${t}`).join('\n')}

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Difficulty Level
${app.difficulty_level}

## Notes
${app.ai_explanation}

${app.missing_files.length > 0 ? `
## Missing Files to Add
${app.missing_files.map((f: string) => `- [ ] ${f}`).join('\n')}
` : ''}
`,
    'package.json': JSON.stringify(
      {
        name: app.app_name.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        description: app.description,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
        },
        dependencies: {
          react: '^18.0.0',
          'next': '^14.0.0',
        },
      },
      null,
      2
    ),
    '.gitignore': `node_modules/
.env
.env.local
.env.*.local
.next/
dist/
build/
*.log
.DS_Store
`,
  }
}
