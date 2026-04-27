import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'components/ui/**', 'hooks/use-mobile.ts', 'hooks/use-toast.ts'],
  },
  ...nextVitals,
  ...nextTypescript,
  {
    files: ['components/repositories-list.tsx', 'components/repository-selector.tsx', 'components/analysis-detail.tsx'],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['lib/app-discovery.ts', 'lib/cross-platform-scanner.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['app/api/auth/connect-platform/route.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['app/dashboard/results/page.tsx'],
    rules: {
      'react-hooks/immutability': 'off',
    },
  },
]

export default config
