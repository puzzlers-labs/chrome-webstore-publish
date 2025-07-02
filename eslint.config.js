// ESLint configuration for Node.js using ECMAScript 2024.
// Sets up recommended rules and plugins for code quality, import management, and promises.
// Exports an array for use with ESLint's flat config system.
import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import node from 'eslint-plugin-n';
import promise from 'eslint-plugin-promise';

export default [
  js.configs.recommended, // Loads recommended ESLint rules for JavaScript.
  {
    files: ['**/*.js'], // Applies this config to all JavaScript files.
    languageOptions: {
      ecmaVersion: 2024, // Enables latest ECMAScript features.
      sourceType: 'module', // Allows use of ES module import/export syntax.
      globals: {
        ...node.configs.recommended.globals, // Includes Node.js global variables.
      },
    },
    plugins: {
      n: node, // Adds Node.js specific linting rules.
      import: importPlugin, // Adds rules for managing imports and exports.
      promise: promise, // Adds rules for working with Promises.
    },
    settings: {
      'import/resolver': {
        alias: {
          map: [['@src', './src']],
          extensions: ['.js'],
        },
      },
    },
    rules: {
      ...node.configs.recommended.rules, // Node.js recommended rules.
      ...importPlugin.configs.recommended.rules, // Import plugin recommended rules.
      ...promise.configs.recommended.rules, // Promise plugin recommended rules.
      semi: ['error', 'always'], // Enforces semicolons at the end of statements.
      quotes: ['error', 'single'], // Requires single quotes for strings.
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ], // Warns about variables that are declared but not used, but ignores those starting with _.
      'no-console': ['off'], // Allows use of console statements.
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          pathGroups: [
            {
              pattern: '@src/**',
              group: 'internal',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin', 'external'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          'newlines-between': 'never',
        },
      ], // Enforces order: package imports first (alphabetical), then internal @src imports.
    },
  },
  {
    files: ['eslint.config.js'], // Special config for this config file.
    rules: {
      'n/no-unpublished-import': 'off', // Disables unpublished import rule for config files.
    },
  },
];
