import eslintPluginImportX from 'eslint-plugin-import-x'
import tsParser from '@typescript-eslint/parser'

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      'import-x': eslintPluginImportX,
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.json', './apps/*/tsconfig.json'],
        },
      },
    },
    rules: {
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
          ],
          pathGroups: [
            {
              pattern: '{react,react-dom,react/**}',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '{next,next/**}',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@tanstack/**',
              group: 'external',
              position: 'after',
            },
            {
              pattern: '@core/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@kit/**',
              group: 'internal',
            },
            {
              pattern: '@/**',
              group: 'internal',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          distinctGroup: true,
          warnOnUnassignedImports: false,
        },
      ],
      'import-x/newline-after-import': 'error',
    },
  },
]
