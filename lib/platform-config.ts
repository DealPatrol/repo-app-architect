export const PLATFORMS = {
  GITHUB: {
    id: 'github',
    name: 'GitHub',
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    apiUrl: 'https://api.github.com',
    scopes: 'read:user repo',
    color: 'foreground',
  },
  GITLAB: {
    id: 'gitlab',
    name: 'GitLab',
    authUrl: 'https://gitlab.com/oauth/authorize',
    tokenUrl: 'https://gitlab.com/oauth/token',
    apiUrl: 'https://gitlab.com/api/v4',
    scopes: 'read_user read_repository',
    color: 'orange-500',
  },
  BITBUCKET: {
    id: 'bitbucket',
    name: 'Bitbucket',
    authUrl: 'https://bitbucket.org/site/oauth2/authorize',
    tokenUrl: 'https://bitbucket.org/site/oauth2/access_token',
    apiUrl: 'https://api.bitbucket.org/2.0',
    scopes: 'repository account',
    color: 'blue-500',
  },
  VERCEL: {
    id: 'vercel',
    name: 'Vercel',
    authUrl: 'https://vercel.com/oauth/authorize',
    tokenUrl: 'https://api.vercel.com/oauth/token',
    apiUrl: 'https://api.vercel.com',
    scopes: 'deployments read projects',
    color: 'foreground',
  },
} as const

export type PlatformId = typeof PLATFORMS[keyof typeof PLATFORMS]['id']

export function getPlatformConfig(platformId: string) {
  return Object.values(PLATFORMS).find(p => p.id === platformId)
}
