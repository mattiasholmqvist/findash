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
    '@typescript-eslint/no-unused-vars': 'off', // Disable temporarily for CI cleanup
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off', // Disable temporarily for CI cleanup
    '@typescript-eslint/strict-boolean-expressions': 'off',
    'react-refresh/only-export-components': 'off', // Disable temporarily for CI cleanup
    'filename-rules/match': 'off',
  },
}