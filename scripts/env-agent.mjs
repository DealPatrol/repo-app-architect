#!/usr/bin/env node

import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execFile, spawn } from 'node:child_process'
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

const AGENT_HELPER_KEYS = new Set([
  'NEON_API_KEY',
  'NEON_PROJECT_ID',
  'NEON_BRANCH',
  'NEON_BRANCH_ID',
  'NEON_DATABASE_NAME',
  'NEON_ROLE_NAME',
  'NEON_ENDPOINT_ID',
  'NEON_IS_POOLED',
])

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
  --no-autofetch              Disable provider autofetch attempts
  --include-agent-keys        Include helper keys used only for autofetch
  --bootstrap-vercel          Auto-run Vercel login/link when needed (interactive)
  --scan-only                 Discover vars and print report (no writing)
  --non-interactive           Do not prompt for missing values
  --overwrite                 Prompt for keys even if already present in output file
  --output <path>             Output env file path (default: .env.local)
  --vercel-environment <env>  Vercel env to pull (default: development)
  --vercel-git-branch <name>  Pull branch-specific Vercel vars (optional)
  --template-only             Write template placeholders and exit
  --help                      Show this help

Examples:
  node scripts/env-agent.mjs --scan-only
  node scripts/env-agent.mjs --output .env.local
  node scripts/env-agent.mjs --bootstrap-vercel
  node scripts/env-agent.mjs --vercel-environment preview --vercel-git-branch main
  node scripts/env-agent.mjs --include-agent-keys
  node scripts/env-agent.mjs --template-only --output .env.example.generated
`

function parseArgs(argv) {
  const args = {
    autofetch: true,
    includeAgentKeys: false,
    bootstrapVercel: false,
    scanOnly: false,
    nonInteractive: false,
    overwrite: false,
    outputPath: DEFAULT_OUTPUT_PATH,
    vercelEnvironment: 'development',
    vercelGitBranch: '',
    templateOnly: false,
    help: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]

    if (token === '--scan-only') {
      args.scanOnly = true
      continue
    }

    if (token === '--no-autofetch') {
      args.autofetch = false
      continue
    }

    if (token === '--include-agent-keys') {
      args.includeAgentKeys = true
      continue
    }

    if (token === '--bootstrap-vercel') {
      args.bootstrapVercel = true
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

    if (token === '--vercel-environment') {
      const value = argv[index + 1]
      if (!value) {
        throw new Error('Missing value for --vercel-environment')
      }
      args.vercelEnvironment = value
      index += 1
      continue
    }

    if (token === '--vercel-git-branch') {
      const value = argv[index + 1]
      if (!value) {
        throw new Error('Missing value for --vercel-git-branch')
      }
      args.vercelGitBranch = value
      index += 1
      continue
    }

    if (token.startsWith('--output=')) {
      args.outputPath = token.slice('--output='.length)
      continue
    }

    if (token.startsWith('--vercel-environment=')) {
      args.vercelEnvironment = token.slice('--vercel-environment='.length)
      continue
    }

    if (token.startsWith('--vercel-git-branch=')) {
      args.vercelGitBranch = token.slice('--vercel-git-branch='.length)
      continue
    }

    throw new Error(`Unknown option: ${token}`)
  }

  return args
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve) => {
    execFile(
      command,
      args,
      {
        cwd: options.cwd || process.cwd(),
        env: options.env || process.env,
        encoding: 'utf8',
        timeout: options.timeout || 30000,
        maxBuffer: 2 * 1024 * 1024,
      },
      (error, stdout = '', stderr = '') => {
        if (error) {
          resolve({
            ok: false,
            errorCode: typeof error.code === 'string' ? error.code : '',
            errorMessage: error.message,
            stdout,
            stderr,
          })
          return
        }

        resolve({
          ok: true,
          errorCode: '',
          errorMessage: '',
          stdout,
          stderr,
        })
      }
    )
  })
}

function extractPostgresUriFromText(text) {
  if (!text) {
    return null
  }

  const match = text.match(/postgres(?:ql)?:\/\/[^\s'"`]+/i)
  if (!match) {
    return null
  }

  return match[0].replace(/[),.;]+$/, '')
}

function findPostgresUriInValue(value, depth = 0) {
  if (depth > 6 || value === null || value === undefined) {
    return null
  }

  if (typeof value === 'string') {
    return extractPostgresUriFromText(value)
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findPostgresUriInValue(item, depth + 1)
      if (found) {
        return found
      }
    }
    return null
  }

  if (typeof value === 'object') {
    for (const nested of Object.values(value)) {
      const found = findPostgresUriInValue(nested, depth + 1)
      if (found) {
        return found
      }
    }
  }

  return null
}

function collectFromProcessEnv(allowedKeys) {
  const values = new Map()

  for (const key of allowedKeys) {
    const value = process.env[key]
    if (typeof value === 'string' && value.trim() !== '') {
      values.set(key, value.trim())
    }
  }

  return values
}

function mergeValuesFromSource({
  targetValues,
  incomingValues,
  allowedKeys,
  overwrite,
  sourceName,
  keySources,
}) {
  let applied = 0

  for (const [key, rawValue] of incomingValues.entries()) {
    if (!allowedKeys.has(key)) {
      continue
    }

    const value = typeof rawValue === 'string' ? rawValue.trim() : ''
    if (!value) {
      continue
    }

    const hasExisting = targetValues.has(key) && targetValues.get(key) !== ''
    if (hasExisting && !overwrite) {
      continue
    }

    targetValues.set(key, value)
    keySources.set(key, sourceName)
    applied += 1
  }

  return applied
}

function removeCliOptionPair(args, optionName) {
  const copy = [...args]
  const index = copy.indexOf(optionName)
  if (index !== -1) {
    copy.splice(index, 2)
  }
  return copy
}

const VERCEL_RUNNER_CANDIDATES = [
  { label: 'vercel', command: 'vercel', prefix: [] },
  { label: 'npx vercel', command: 'npx', prefix: ['--yes', 'vercel'] },
  { label: 'pnpm dlx vercel', command: 'pnpm', prefix: ['dlx', 'vercel'] },
]

function formatRunnerCommand(runner, args = []) {
  return [runner.command, ...runner.prefix, ...args].join(' ')
}

function hasInteractiveTty() {
  return Boolean(input.isTTY && output.isTTY)
}

async function resolveVercelRunner() {
  const attempts = []

  for (const candidate of VERCEL_RUNNER_CANDIDATES) {
    const result = await runCommand(candidate.command, [...candidate.prefix, '--version'], { timeout: 120000 })
    attempts.push({ candidate, result })

    if (result.ok) {
      return {
        ok: true,
        runner: candidate,
        attempts,
      }
    }
  }

  return {
    ok: false,
    runner: null,
    attempts,
  }
}

async function runVercelCli(runner, args, timeout = 120000) {
  return runCommand(runner.command, [...runner.prefix, ...args], { timeout })
}

function runInteractiveCommand(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: options.cwd || process.cwd(),
      env: options.env || process.env,
      stdio: 'inherit',
      shell: false,
    })

    child.on('error', (error) => {
      resolve({
        ok: false,
        errorCode: typeof error.code === 'string' ? error.code : '',
        errorMessage: error.message,
      })
    })

    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve({
          ok: true,
          errorCode: '',
          errorMessage: '',
        })
        return
      }

      resolve({
        ok: false,
        errorCode: signal || String(code ?? ''),
        errorMessage: `Interactive command exited with code ${String(code ?? signal ?? 'unknown')}`,
      })
    })
  })
}

async function runVercelCliInteractive(runner, args) {
  return runInteractiveCommand(runner.command, [...runner.prefix, ...args])
}

function isVercelAuthFailure(diagnostics) {
  return /not logged in|login required|run vercel login|no existing credentials|auth/i.test(diagnostics)
}

function isVercelLinkFailure(diagnostics) {
  return /not linked|link this directory|run vercel link/i.test(diagnostics)
}

async function tryBootstrapVercel(runner, diagnostics) {
  const needsLogin = isVercelAuthFailure(diagnostics)
  const needsLink = isVercelLinkFailure(diagnostics)

  if (!needsLogin && !needsLink) {
    return { ok: false, message: '' }
  }

  if (needsLogin) {
    output.write(`Vercel auth required. Running: ${formatRunnerCommand(runner, ['login'])}\n`)
    const login = await runVercelCliInteractive(runner, ['login'])
    if (!login.ok) {
      return {
        ok: false,
        message: 'Vercel login did not complete successfully.',
      }
    }
  }

  if (needsLogin || needsLink) {
    output.write(`Vercel project link required. Running: ${formatRunnerCommand(runner, ['link'])}\n`)
    const link = await runVercelCliInteractive(runner, ['link'])
    if (!link.ok) {
      return {
        ok: false,
        message: 'Vercel project link did not complete successfully.',
      }
    }
  }

  return { ok: true, message: 'Bootstrapped Vercel authentication/linking.' }
}

function vercelRunnerInstallHelp() {
  return 'Install/access Vercel CLI with one of: `npm i -g vercel`, `pnpm dlx vercel`, or `npx vercel`.'
}

function summarizeRunnerAttempts(attempts) {
  if (!attempts || attempts.length === 0) {
    return ''
  }

  const parts = attempts.map(({ candidate, result }) => {
    if (result.ok) {
      return `${candidate.label}: ok`
    }
    const detail = result.errorMessage || result.errorCode || 'failed'
    return `${candidate.label}: ${detail}`
  })

  return parts.join(' | ')
}

async function attemptVercelAutofetch(args) {
  const result = {
    provider: 'vercel-env-pull',
    status: 'skipped',
    pulled: 0,
    applied: 0,
    values: new Map(),
    message: '',
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'env-agent-vercel-'))
  const tempEnvPath = path.join(tempDir, '.env.vercel.pull')

  try {
    const runnerResolution = await resolveVercelRunner()
    if (!runnerResolution.ok || !runnerResolution.runner) {
      result.status = 'skipped'
      result.message = `No Vercel CLI runner available. ${vercelRunnerInstallHelp()} (${summarizeRunnerAttempts(
        runnerResolution.attempts
      )})`
      return result
    }

    const runner = runnerResolution.runner
    const pullArgs = ['env', 'pull', tempEnvPath, '--yes']

    if (args.vercelEnvironment) {
      pullArgs.push('--environment', args.vercelEnvironment)
    }

    if (args.vercelGitBranch) {
      pullArgs.push('--git-branch', args.vercelGitBranch)
    }

    const runPull = async () => {
      let pull = await runVercelCli(runner, pullArgs, 180000)
      if (
        !pull.ok &&
        args.vercelGitBranch &&
        /unknown option|did you mean|unexpected argument/i.test(`${pull.stdout}\n${pull.stderr}`)
      ) {
        // Older CLI versions may not support branch-specific pulls.
        const fallbackArgs = removeCliOptionPair(pullArgs, '--git-branch')
        pull = await runVercelCli(runner, fallbackArgs, 180000)
      }
      return pull
    }

    let pullResult = await runPull()

    let bootstrapAttempted = false

    if (!pullResult.ok && args.bootstrapVercel && !args.nonInteractive && hasInteractiveTty()) {
      bootstrapAttempted = true
      const diagnostics = `${pullResult.stdout}\n${pullResult.stderr}`
      const bootstrapResult = await tryBootstrapVercel(runner, diagnostics)
      if (bootstrapResult.ok) {
        pullResult = await runPull()
      } else if (bootstrapResult.message) {
        result.status = 'skipped'
        result.message = bootstrapResult.message
        return result
      }
    }

    if (!pullResult.ok) {
      const diagnostics = `${pullResult.stdout}\n${pullResult.stderr}`

      if (isVercelAuthFailure(diagnostics)) {
        result.status = 'skipped'
        result.message =
          `Vercel CLI is not authenticated. Run \`${formatRunnerCommand(runner, [
            'login',
          ])}\` then re-run.` + (bootstrapAttempted ? ' (Auto-bootstrap attempted but did not complete.)' : '')
        return result
      }

      if (isVercelLinkFailure(diagnostics)) {
        result.status = 'skipped'
        result.message =
          `Project not linked to Vercel. Run \`${formatRunnerCommand(runner, [
            'link',
          ])}\` then re-run.` + (bootstrapAttempted ? ' (Auto-bootstrap attempted but did not complete.)' : '')
        return result
      }

      result.status = 'failed'
      result.message = `Vercel env pull failed: ${pullResult.errorMessage || diagnostics.trim() || 'unknown error'}`
      return result
    }

    const pulledContent = await fs.readFile(tempEnvPath, 'utf8')
    const pulledValues = parseEnv(pulledContent)

    result.values = pulledValues
    result.pulled = pulledValues.size
    result.status = pulledValues.size > 0 ? 'success' : 'skipped'
    result.message = pulledValues.size > 0 ? 'Pulled project vars from Vercel.' : 'No variables found in pull result.'

    return result
  } catch (error) {
    result.status = 'failed'
    result.message = `Vercel autofetch error: ${error.message}`
    return result
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true })
  }
}

function boolFromEnv(value) {
  if (!value) {
    return false
  }
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase())
}

async function attemptNeonApiAutofetch() {
  const result = {
    provider: 'neon-api',
    status: 'skipped',
    pulled: 0,
    applied: 0,
    values: new Map(),
    message: '',
  }

  const apiKey = process.env.NEON_API_KEY
  const projectId = process.env.NEON_PROJECT_ID

  if (!apiKey || !projectId) {
    result.message = 'Set NEON_API_KEY and NEON_PROJECT_ID to enable Neon API autofetch.'
    return result
  }

  try {
    const url = new URL(`https://console.neon.tech/api/v2/projects/${encodeURIComponent(projectId)}/connection_uri`)

    if (process.env.NEON_BRANCH_ID) {
      url.searchParams.set('branch_id', process.env.NEON_BRANCH_ID)
    }
    if (process.env.NEON_DATABASE_NAME) {
      url.searchParams.set('database_name', process.env.NEON_DATABASE_NAME)
    }
    if (process.env.NEON_ROLE_NAME) {
      url.searchParams.set('role_name', process.env.NEON_ROLE_NAME)
    }
    if (process.env.NEON_ENDPOINT_ID) {
      url.searchParams.set('endpoint_id', process.env.NEON_ENDPOINT_ID)
    }
    if (process.env.NEON_IS_POOLED) {
      url.searchParams.set('is_pooled', boolFromEnv(process.env.NEON_IS_POOLED) ? 'true' : 'false')
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      const body = await response.text()
      result.status = 'failed'
      result.message = `Neon API request failed (${response.status}): ${body.slice(0, 200)}`
      return result
    }

    const json = await response.json()
    const connectionString = findPostgresUriInValue(json)

    if (!connectionString) {
      result.status = 'failed'
      result.message = 'Neon API response did not include a PostgreSQL connection string.'
      return result
    }

    result.values.set('DATABASE_URL', connectionString)
    result.pulled = 1
    result.status = 'success'
    result.message = 'Retrieved DATABASE_URL from Neon API.'
    return result
  } catch (error) {
    result.status = 'failed'
    result.message = `Neon API autofetch error: ${error.message}`
    return result
  }
}

function supportsCliFlag(helpText, flagName) {
  return new RegExp(`--${flagName}(\\b|\\s|=)`).test(helpText)
}

async function attemptNeonCliAutofetch() {
  const result = {
    provider: 'neon-cli',
    status: 'skipped',
    pulled: 0,
    applied: 0,
    values: new Map(),
    message: '',
  }

  const version = await runCommand('neon', ['--version'], { timeout: 20000 })
  if (!version.ok) {
    if (version.errorCode === 'ENOENT') {
      result.message = 'Neon CLI not installed. Install it to enable DATABASE_URL autofetch.'
      return result
    }

    result.status = 'failed'
    result.message = `Neon CLI unavailable: ${version.errorMessage}`
    return result
  }

  const help = await runCommand('neon', ['connection-string', '--help'], { timeout: 30000 })
  const helpText = `${help.stdout}\n${help.stderr}`

  const connectionArgs = ['connection-string']
  if (process.env.NEON_BRANCH) {
    connectionArgs.push(process.env.NEON_BRANCH)
  }
  if (process.env.NEON_PROJECT_ID && supportsCliFlag(helpText, 'project-id')) {
    connectionArgs.push('--project-id', process.env.NEON_PROJECT_ID)
  }
  if (process.env.NEON_ROLE_NAME && supportsCliFlag(helpText, 'role-name')) {
    connectionArgs.push('--role-name', process.env.NEON_ROLE_NAME)
  }
  if (process.env.NEON_DATABASE_NAME && supportsCliFlag(helpText, 'database-name')) {
    connectionArgs.push('--database-name', process.env.NEON_DATABASE_NAME)
  }
  if (process.env.NEON_IS_POOLED && boolFromEnv(process.env.NEON_IS_POOLED) && supportsCliFlag(helpText, 'pooled')) {
    connectionArgs.push('--pooled')
  }

  const connectionResult = await runCommand('neon', connectionArgs, { timeout: 60000 })
  if (!connectionResult.ok) {
    const diagnostics = `${connectionResult.stdout}\n${connectionResult.stderr}`
    if (/login|authenticate|auth required/i.test(diagnostics)) {
      result.status = 'skipped'
      result.message = 'Neon CLI is not authenticated. Run `neon auth` and retry.'
      return result
    }

    result.status = 'failed'
    result.message = `Neon CLI connection-string failed: ${connectionResult.errorMessage || diagnostics.trim()}`
    return result
  }

  const connectionString = extractPostgresUriFromText(`${connectionResult.stdout}\n${connectionResult.stderr}`)
  if (!connectionString) {
    result.status = 'failed'
    result.message = 'Neon CLI output did not include a PostgreSQL connection string.'
    return result
  }

  result.values.set('DATABASE_URL', connectionString)
  result.pulled = 1
  result.status = 'success'
  result.message = 'Retrieved DATABASE_URL from Neon CLI.'
  return result
}

async function autofetchValues(report, currentValues, args) {
  const allowedKeys = new Set(report.map((entry) => entry.key))
  const values = new Map(currentValues)
  const keySources = new Map()
  const details = []

  const localEnvValues = collectFromProcessEnv(allowedKeys)
  const localApplied = mergeValuesFromSource({
    targetValues: values,
    incomingValues: localEnvValues,
    allowedKeys,
    overwrite: args.overwrite,
    sourceName: 'local process.env',
    keySources,
  })

  details.push({
    provider: 'local-process-env',
    status: localEnvValues.size > 0 ? 'success' : 'skipped',
    pulled: localEnvValues.size,
    applied: localApplied,
    message:
      localEnvValues.size > 0
        ? 'Read matching values from current shell environment.'
        : 'No matching keys were present in current shell environment.',
  })

  const vercel = await attemptVercelAutofetch(args)
  vercel.applied = mergeValuesFromSource({
    targetValues: values,
    incomingValues: vercel.values,
    allowedKeys,
    overwrite: args.overwrite,
    sourceName: 'vercel env pull',
    keySources,
  })
  details.push(vercel)

  if (allowedKeys.has('DATABASE_URL')) {
    const neonApi = await attemptNeonApiAutofetch()
    neonApi.applied = mergeValuesFromSource({
      targetValues: values,
      incomingValues: neonApi.values,
      allowedKeys,
      overwrite: args.overwrite,
      sourceName: 'neon api',
      keySources,
    })
    details.push(neonApi)

    const neonCli = await attemptNeonCliAutofetch()
    neonCli.applied = mergeValuesFromSource({
      targetValues: values,
      incomingValues: neonCli.values,
      allowedKeys,
      overwrite: args.overwrite,
      sourceName: 'neon cli',
      keySources,
    })
    details.push(neonCli)
  }

  return { values, details, keySources }
}

function printAutofetchSummary(autofetchResult) {
  output.write('\nAutofetch summary:\n')

  for (const detail of autofetchResult.details) {
    output.write(
      `- ${detail.provider}: ${detail.status} (pulled ${detail.pulled}, applied ${detail.applied})\n`
    )
    if (detail.message) {
      output.write(`  ${detail.message}\n`)
    }
  }

  if (autofetchResult.keySources.size > 0) {
    output.write('Applied key sources:\n')
    const keys = Array.from(autofetchResult.keySources.keys()).sort((a, b) => a.localeCompare(b))
    for (const key of keys) {
      output.write(`  ${key} <= ${autofetchResult.keySources.get(key)}\n`)
    }
  } else {
    output.write('No values were auto-applied.\n')
  }

  output.write('\n')
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
      regex: /process\.env(?:\?\.|\.)([A-Z][A-Z0-9_]*)/g,
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

function filterAgentHelperKeys(discovered, includeAgentKeys) {
  if (includeAgentKeys) {
    return discovered
  }

  return discovered.filter((entry) => !AGENT_HELPER_KEYS.has(entry.key))
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
    'This agent discovers required env vars, attempts provider autofetch from authenticated sessions, and writes .env files.\n'
  )
  output.write('It never bypasses authentication or creates secrets without provider access.\n\n')

  const rootDir = process.cwd()
  const files = await walkFiles(rootDir)
  const discoveredMap = new Map()

  for (const filePath of files) {
    const content = await fs.readFile(filePath, 'utf8')
    const relativePath = toPosixPath(path.relative(rootDir, filePath))
    extractFromSource(content, relativePath, discoveredMap)
  }

  const discovered = filterAgentHelperKeys(Array.from(discoveredMap.values()), args.includeAgentKeys)
  const report = buildReport(discovered)
  printReport(report)

  if (args.scanOnly) {
    return
  }

  const outputPath = path.resolve(rootDir, args.outputPath)
  let values = args.templateOnly ? new Map() : await readExistingEnv(outputPath)

  if (!args.templateOnly && report.length > 0) {
    if (args.autofetch) {
      const autofetchResult = await autofetchValues(report, values, args)
      values = autofetchResult.values
      printAutofetchSummary(autofetchResult)
    } else {
      output.write('Autofetch disabled. Use default mode (without --no-autofetch) to attempt provider pulls.\n\n')
    }
  }

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
