import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'components/ui/**', 'hooks/use-mobile.ts', 'hooks/use-toast.ts'],
  },
  ...nextVitals,
  ...nextTypescript,
  {
    files: ['components/repositories-list.tsx', 'components/repository-selector.tsx'],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]

export default config
