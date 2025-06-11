const js = require('@eslint/js');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const reactRefresh = require('eslint-plugin-react-refresh');
const globals = require('globals');

module.exports = [
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
      ...reactHooks.configs.recommended.rules,
      
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
