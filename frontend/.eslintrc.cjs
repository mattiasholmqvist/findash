module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
  },
  plugins: ['react-refresh', 'filename-rules'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off', // Disable for now
    '@typescript-eslint/no-explicit-any': 'warn', // Warn instead of error
    '@typescript-eslint/strict-boolean-expressions': 'off', // Disable due to relaxed strictNullChecks
    'filename-rules/match': [
      'warn', // Warn instead of error
      {
        '.tsx': /^[a-z][a-z0-9]*(-[a-z0-9]+)*\.tsx$/,
        '.ts': /^[a-z][a-z0-9]*(-[a-z0-9]+)*\.ts$/,
      },
    ],
  },
}