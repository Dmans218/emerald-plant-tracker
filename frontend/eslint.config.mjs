import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
  {
    ignores: ['dist', 'node_modules', 'build', '.git']
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.es2020,
        process: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: 'module',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      // Classic hooks rules only — React Compiler rules (set-state-in-effect, etc.) are too noisy for this codebase
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // React specific rules
      'react/jsx-no-target-blank': 'off',
      'react/prop-types': 'off', // Turn off if using TypeScript
      'react/jsx-uses-react': 'off', // Not needed in React 17+ with JSX transform
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+ with JSX transform
      'react/no-unescaped-entities': 'warn', // Allow but warn about unescaped entities
      'react/jsx-key': 'error', // Enforce keys in lists

      // General JavaScript rules
      'no-unused-vars': ['warn', {
        varsIgnorePattern: '^React$',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true
      }],
      'no-console': 'warn', // Warn but don't error on console statements
      'no-debugger': 'warn',

      // React Refresh rules
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  // Test files configuration
  {
    files: ['**/__tests__/**/*', '**/*.{test,spec}.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
];
