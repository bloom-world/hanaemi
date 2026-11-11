export default [
  {
    settings: {
      // `#types/*` / `#utils/*` 等の subpath import は resolver で解決できず 'unknown'
      // (= sibling より後ろ) に分類されてしまい、下の pathGroups の「internal 扱い」が
      // 効かない。internal-regex で明示的に internal グループへ割り当てる。
      'import/internal-regex': '^#',
    },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always', // import "group"s の間 1行あける
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: { order: 'asc', caseInsensitive: true }, // 大文字小文字関係なくアルファベット順にしたい
          pathGroups: [
            { group: 'internal', pattern: '#ui/**', position: 'before' },
            { group: 'internal', pattern: '#tsx/**', position: 'before' },
            { group: 'internal', pattern: '#types/**', position: 'before' },
            { group: 'internal', pattern: '#**', position: 'before' },
            { group: 'internal', pattern: '@/**', position: 'before' },
          ],
        },
      ],
    },
  },
]
