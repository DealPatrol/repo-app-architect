#!/usr/bin/env node

import { promises as fs } from 'node:fs'
import path from 'node:path'
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

const DEFAULT_OUTPUT_PATH = '.env.local'
const MAX_FILE_SIZE_BYTES = 1024 * 1024 // 1MB

const EXCLUDED_DIRS = new Set([
  '.git',
  '.next',
  '.turbo',
  '.cursor',
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.vercel',
])

const SCAN_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.txt',
  '.yml',
  '.yaml',
  '.env',
  '.env.local',
  '.env.example',
  '.sh',
  '.sql',
])

const SECRET_HINTS = ['SECRET', 'TOKEN', 'KEY', 'PASSWORD', 'PRIVATE', 'DATABASE_URL']

const PROVIDER_HINTS = [
  {
    name: 'Neon',
    url: 'https://neon.tech/docs/connect/connect-from-any-app',
    matches: (key) => key === 'DATABASE_URL',
    note: 'Create a project and copy the connection string.',
  },
  {
    name: 'Vercel Blob',
    url: 'https://vercel.com/docs/storage/vercel-blob/quickstart',
    matches: (key) => key.includes('BLOB') || key.includes('VERCEL_BLOB'),
    note: 'Create a Blob store token with read/write access.',
  },
  {
    name: 'Stack Auth',
    url: 'https://docs.stack-auth.com',
    matches: (key) => key.startsWith('STACK_'),
    note: 'Create a Stack Auth project and copy project/public/secret keys.',
  },
  {
    name: 'OpenAI',
    url: 'https://platform.openai.com/api-keys',
    matches: (key) => key.startsWith('OPENAI_'),
    note: 'Create API key in the OpenAI dashboard.',
  },
  {
    name: 'Anthropic',
    url: 'https://console.anthropic.com/settings/keys',
    matches: (key) => key.startsWith('ANTHROPIC_'),
    note: 'Create API key in Anthropic Console.',
  },
  {
    name: 'GitHub',
    url: 'https://github.com/settings/tokens',
    matches: (key) => key.startsWith('GITHUB_'),
    note: 'Create a personal access token with required scopes.',
  },
]

const USAGE = `
Usage:
  node scripts/env-agent.mjs [options]

Options:
  --scan-only                 Discover vars and print report (no writing)
  --non-interactive           Do not prompt for missing values
  --overwrite                 Prompt for keys even if already present in output file
  --output <path>             Output env file path (default: .env.local)
  --template-only             Write template placeholders and exit
  --help                      Show this help

Examples:
  node scripts/env-agent.mjs --scan-only
  node scripts/env-agent.mjs --output .env.local
  node scripts/env-agent.mjs --template-only --output .env.example.generated
`

function parseArgs(argv) {
  const args = {
    scanOnly: false,
    nonInteractive: false,
    overwrite: false,
    outputPath: DEFAULT_OUTPUT_PATH,
    templateOnly: false,
    help: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]

    if (token === '--scan-only') {
      args.scanOnly = true
      continue
    }

    if (token === '--non-interactive') {
      args.nonInteractive = true
      continue
    }

    if (token === '--overwrite') {
      args.overwrite = true
      continue
    }

    if (token === '--template-only') {
      args.templateOnly = true
      continue
    }

    if (token === '--help' || token === '-h') {
      args.help = true
      continue
    }

    if (token === '--output') {
      const value = argv[index + 1]
      if (!value) {
        throw new Error('Missing value for --output')
      }
      args.outputPath = value
      index += 1
      continue
    }

    if (token.startsWith('--output=')) {
      args.outputPath = token.slice('--output='.length)
      continue
    }

    throw new Error(`Unknown option: ${token}`)
  }

  return args
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/')
}

function shouldScanFile(fileName, stat) {
  if (!stat.isFile()) {
    return false
  }

  if (stat.size > MAX_FILE_SIZE_BYTES) {
    return false
  }

  const ext = path.extname(fileName)
  if (SCAN_EXTENSIONS.has(ext)) {
    return true
  }

  return fileName.startsWith('.env')
}

async function walkFiles(rootDir) {
  const files = []

  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.name.startsWith('.') && entry.name !== '.env' && !entry.name.startsWith('.env.')) {
        if (entry.isDirectory()) {
          continue
        }
      }

      if (entry.isDirectory()) {
        if (EXCLUDED_DIRS.has(entry.name)) {
          continue
        }

        await walk(path.join(currentDir, entry.name))
        continue
      }

      const filePath = path.join(currentDir, entry.name)
      const stat = await fs.stat(filePath)
      if (shouldScanFile(entry.name, stat)) {
        files.push(filePath)
      }
    }
  }

  await walk(rootDir)
  return files
}

function addMatch(store, key, filePath, reason) {
  if (!/^[A-Z][A-Z0-9_]*$/.test(key)) {
    return
  }

  if (!store.has(key)) {
    store.set(key, {
      key,
      sources: new Set(),
      reasons: new Set(),
    })
  }

  const value = store.get(key)
  value.sources.add(filePath)
  value.reasons.add(reason)
}

function extractFromSource(content, filePath, store) {
  const patterns = [
    {
      regex: /process\.env(?:\?\.)?([A-Z][A-Z0-9_]*)/g,
      reason: 'process.env access',
    },
    {
      regex: /process\.env\[['"`]([A-Z][A-Z0-9_]*)['"`]\]/g,
      reason: 'process.env bracket access',
    },
    {
      regex: /import\.meta\.env\.([A-Z][A-Z0-9_]*)/g,
      reason: 'import.meta.env access',
    },
    {
      regex: /^\s*(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=/gm,
      reason: 'dotenv-style assignment',
    },
  ]

  for (const pattern of patterns) {
    let match = pattern.regex.exec(content)
    while (match) {
      addMatch(store, match[1], filePath, pattern.reason)
      match = pattern.regex.exec(content)
    }
  }

  if (filePath.endsWith('.md')) {
    const markdownCodeVarPattern = /`([A-Z][A-Z0-9_]*)`/g
    let match = markdownCodeVarPattern.exec(content)
    while (match) {
      if (match[1].includes('_')) {
        addMatch(store, match[1], filePath, 'markdown env docs')
      }
      match = markdownCodeVarPattern.exec(content)
    }
  }
}

function classifyKey(key) {
  const isPublic = key.startsWith('NEXT_PUBLIC_') || key.startsWith('PUBLIC_')
  const isSecret = !isPublic && SECRET_HINTS.some((hint) => key.includes(hint))

  if (isPublic) {
    return 'public'
  }
  if (isSecret) {
    return 'secret'
  }
  return 'unknown'
}

function providerForKey(key) {
  for (const provider of PROVIDER_HINTS) {
    if (provider.matches(key)) {
      return provider
    }
  }
  return null
}

function buildReport(discovered) {
  return discovered
    .map((entry) => {
      const type = classifyKey(entry.key)
      const provider = providerForKey(entry.key)

      return {
        ...entry,
        type,
        provider,
      }
    })
    .sort((a, b) => {
      if (a.type === b.type) {
        return a.key.localeCompare(b.key)
      }
      return a.type.localeCompare(b.type)
    })
}

function parseEnv(content) {
  const values = new Map()
  const lines = content.split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const equals = trimmed.indexOf('=')
    if (equals === -1) {
      continue
    }

    const key = trimmed.slice(0, equals).replace(/^export\s+/, '').trim()
    let value = trimmed.slice(equals + 1).trim()

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    values.set(key, value)
  }

  return values
}

function escapeEnvValue(value) {
  if (value === '') {
    return '""'
  }

  if (/^[A-Za-z0-9._:/@-]+$/.test(value)) {
    return value
  }

  return `"${value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/"/g, '\\"')}"`
}

function renderEnvFile(report, envValues, includeUndetected = true) {
  const lines = []
  lines.push('# Generated by scripts/env-agent.mjs')
  lines.push(`# Updated: ${new Date().toISOString()}`)
  lines.push('')

  const reportKeys = new Set(report.map((item) => item.key))

  for (const item of report) {
    const provider = item.provider ? `${item.provider.name} (${item.provider.url})` : 'Custom/unknown provider'
    lines.push(`# ${item.type.toUpperCase()} | ${provider}`)
    lines.push(`${item.key}=${escapeEnvValue(envValues.get(item.key) ?? '')}`)
    lines.push('')
  }

  if (includeUndetected) {
    const undetected = Array.from(envValues.keys())
      .filter((key) => !reportKeys.has(key))
      .sort((a, b) => a.localeCompare(b))

    if (undetected.length > 0) {
      lines.push('# Preserved keys not detected in current scan')
      for (const key of undetected) {
        lines.push(`${key}=${escapeEnvValue(envValues.get(key) ?? '')}`)
      }
      lines.push('')
    }
  }

  return lines.join('\n')
}

async function readExistingEnv(outputPath) {
  try {
    const content = await fs.readFile(outputPath, 'utf8')
    return parseEnv(content)
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return new Map()
    }
    throw error
  }
}

async function promptForValues(report, existingValues, shouldOverwrite) {
  const rl = readline.createInterface({ input, output })
  const values = new Map(existingValues)

  try {
    for (const item of report) {
      const alreadySet = values.has(item.key) && values.get(item.key) !== ''
      if (alreadySet && !shouldOverwrite) {
        continue
      }

      output.write(`\n${item.key}\n`)
      output.write(`  Type: ${item.type}\n`)

      if (item.provider) {
        output.write(`  Provider: ${item.provider.name}\n`)
        output.write(`  Docs: ${item.provider.url}\n`)
        output.write(`  Note: ${item.provider.note}\n`)
      } else {
        output.write('  Provider: Unknown (check project docs)\n')
      }

      if (alreadySet) {
        output.write('  Current value exists. Press enter to keep it.\n')
      } else {
        output.write('  Enter value (leave blank to skip for now).\n')
      }

      const prompt = alreadySet ? 'New value: ' : 'Value: '
      const response = await rl.question(prompt)

      if (!response.trim()) {
        continue
      }

      values.set(item.key, response.trim())
    }
  } finally {
    rl.close()
  }

  return values
}

function printReport(report) {
  if (report.length === 0) {
    output.write('No environment variables were detected.\n')
    return
  }

  output.write(`Detected ${report.length} environment variable(s):\n\n`)

  for (const item of report) {
    output.write(`- ${item.key} [${item.type}]\n`)
    output.write(`  Sources: ${Array.from(item.sources).slice(0, 4).join(', ')}\n`)
    output.write(`  Detection: ${Array.from(item.reasons).join(', ')}\n`)

    if (item.provider) {
      output.write(`  Provider: ${item.provider.name}\n`)
      output.write(`  Docs: ${item.provider.url}\n`)
    } else {
      output.write('  Provider: Unknown\n')
    }

    output.write('\n')
  }
}

async function run() {
  const args = parseArgs(process.argv.slice(2))

  if (args.help) {
    output.write(USAGE)
    return
  }

  output.write(
    'This agent discovers required env vars and helps write .env files. It does not create API keys or fetch secrets automatically.\n\n'
  )

  const rootDir = process.cwd()
  const files = await walkFiles(rootDir)
  const discoveredMap = new Map()

  for (const filePath of files) {
    const content = await fs.readFile(filePath, 'utf8')
    const relativePath = toPosixPath(path.relative(rootDir, filePath))
    extractFromSource(content, relativePath, discoveredMap)
  }

  const report = buildReport(Array.from(discoveredMap.values()))
  printReport(report)

  if (args.scanOnly) {
    return
  }

  const outputPath = path.resolve(rootDir, args.outputPath)
  let values = args.templateOnly ? new Map() : await readExistingEnv(outputPath)

  if (!args.nonInteractive && report.length > 0 && !args.templateOnly) {
    values = await promptForValues(report, values, args.overwrite)
  }

  const fileContent = renderEnvFile(report, values, !args.templateOnly)
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, fileContent, 'utf8')

  output.write(`\nWrote ${report.length} variable(s) to ${toPosixPath(path.relative(rootDir, outputPath))}\n`)
  output.write('Tip: review values and keep this file out of source control.\n')
}

run().catch((error) => {
  console.error(`env-agent failed: ${error.message}`)
  process.exitCode = 1
})
