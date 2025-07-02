// ESLint configuration file for Node.js projects using ECMAScript 2024.
// This file sets up linting rules and plugins to enforce code quality, import order, and best practices.
// It exports an array of configuration objects for use with ESLint's flat config system.
// The configuration includes recommended rules for JavaScript, Node.js, import management, and promises.
// Special rules are applied for test files and this config file itself.
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
        process: 'readonly', // Allows read-only access to the process object.
        console: 'readonly', // Allows read-only access to the console object.
      },
    },
    plugins: {
      n: node, // Adds Node.js specific linting rules.
      import: importPlugin, // Adds rules for managing imports and exports.
      promise: promise, // Adds rules for working with Promises.
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
      ], // Warns about unused variables, but ignores those starting with _.
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
      ], // Enforces import order: package imports first (alphabetical), then internal @src imports.
      // Ignores unresolved import errors for @src alias paths due to lack of flat config support.
      'import/no-unresolved': [
        'error',
        {
          ignore: ['^@src/'],
        },
      ],
      'n/no-missing-import': 'off', // Disables missing import rule for Node.js. This is the alias issue.
      'n/no-process-exit': 'off', // Allows use of process.exit().
    },
  },
  {
    files: ['eslint.config.js'], // Special config for this config file.
    rules: {
      'n/no-unpublished-import': 'off', // Disables unpublished import rule for config files.
    },
  },
  {
    files: ['**/__tests__/*.js'], // Applies special rules for test files.
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
    rules: {
      'n/no-unpublished-import': 'off', // Disables unpublished import rule for test files.
    },
  },
];
