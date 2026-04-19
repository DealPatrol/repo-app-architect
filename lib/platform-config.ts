export const PLATFORMS = {
  GITHUB: {
    id: 'github',
    name: 'GitHub',
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    apiUrl: 'https://api.github.com',
    scopes: 'repo',
  },
  VERCEL: {
    id: 'vercel',
    name: 'Vercel',
    authUrl: 'https://vercel.com/oauth/authorize',
    tokenUrl: 'https://api.vercel.com/oauth/token',
    apiUrl: 'https://api.vercel.com',
    scopes: 'deployments read projects',
  },
  GITLAB: {
    id: 'gitlab',
    name: 'GitLab',
    authUrl: 'https://gitlab.com/oauth/authorize',
    tokenUrl: 'https://gitlab.com/oauth/token',
    apiUrl: 'https://gitlab.com/api/v4',
    scopes: 'read_repository',
  },
  REPLIT: {
    id: 'replit',
    name: 'Replit',
    authUrl: 'https://replit.com/oauth/authorize',
    tokenUrl: 'https://replit.com/oauth/token',
    apiUrl: 'https://api.replit.com',
    scopes: 'read:repos',
  },
  NETLIFY: {
    id: 'netlify',
    name: 'Netlify',
    authUrl: 'https://app.netlify.com/authorize',
    tokenUrl: 'https://api.netlify.com/oauth/token',
    apiUrl: 'https://api.netlify.com',
    scopes: 'netlify:read',
  },
} as const

export type PlatformId = typeof PLATFORMS[keyof typeof PLATFORMS]['id']

export function getPlatformConfig(platformId: string) {
  return Object.values(PLATFORMS).find(p => p.id === platformId)
}
