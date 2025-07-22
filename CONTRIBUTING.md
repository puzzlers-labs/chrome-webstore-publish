# Contributing Guide

Thank you for your interest in contributing! This project is an open-source GitHub Action for publishing Chrome extensions to the Chrome Web Store. Below you'll find all the information you need to get started as a contributor.

---

## Table of Contents

- [Development Setup](#development-setup)
- [Requirements](#requirements)
- [Code Structure](#code-structure)
- [Testing](#testing)
- [Coding Style](#coding-style)
- [Comments & Documentation](#comments--documentation)
- [Editor & Tooling](#editor--tooling)
- [How to Contribute](#how-to-contribute)

---

## Development Setup

1. **Clone the repository:**

   ```sh
   git clone https://github.com/puzzlers-labs/chrome-webstore-publish.git
   cd chrome-webstore-publish
   ```

2. **Install dependencies:**

   ```sh
   pnpm install
   ```

3. **Install browsers for Puppeteer (required for tests):**

   ```sh
   pnpm dlx puppeteer browsers install
   ```

4. **Run the linter:**

   ```sh
   pnpm lint
   ```

5. **Run the test suite:**

   ```sh
   pnpm test
   ```

6. **Format code:**
   ```sh
   pnpm format
   ```

---

## Requirements

- **Node.js:** v22.0.0 or higher (enforced via `package.json` and `.npmrc`)
- **pnpm:** Used for dependency management (see `.npmrc`)
- **Docker:** Required if you want to test the action in a containerized environment, otherwise optional.
- **Google Cloud Project:** For integration testing with the Chrome Web Store API (see [README](README.md) for API setup)

---

## Code Structure

```
chrome-webstore-publish/
├── src/
│   ├── index.js                 # Main entry point for the GitHub Action logic
│   ├── pack-crx-with-chrome.js  # Utility for packing CRX files using Chromium
│   ├── chrome-webstore/
│   │   ├── index.js             # Exports API helpers (getAccessToken, uploadExtension, publishExtension)
│   │   ├── get-access-token.js  # Handles OAuth2 token retrieval
│   │   ├── upload-extension.js  # Handles uploading ZIP/CRX to the Web Store
│   │   ├── publish-extension.js # Handles publishing to public/testers
│   │   └── __tests__/           # Unit tests for API helpers
│   └── __tests__/               # Integration and utility tests
├── .github/
│   └── workflows/               # CI/CD workflows for linting, testing, and publishing
├── .vscode/                     # Editor settings and recommended extensions
├── Dockerfile                   # Docker image for running the action
├── action.yml                   # GitHub Action metadata and input definitions
├── package.json                 # Project metadata, scripts, dependencies
├── eslint.config.js             # Linting rules and style guide
├── jest.config.js               # Test runner configuration
├── babel.config.js              # Babel config for ESM and Jest
└── README.md                    # Main documentation
```

---

## Testing

- **Test Runner:** [Jest](https://jestjs.io/) is used for all unit and integration tests.
- **Test Files:** Located in `src/__tests__/` and `src/chrome-webstore/__tests__/`.
- **Test Style:** Each test file uses descriptive `describe` and `it` blocks. Mocks are used for HTTP requests (e.g., `jest.mock('axios')`).
- **Coverage:** Run `pnpm test` to generate a coverage report.
- **Puppeteer:** Some tests require Chromium; install browsers with `pnpm dlx puppeteer browsers install`.

---

## Coding Style

- **Linting:** Enforced via ESLint (`eslint.config.js`), using ECMAScript 2024, Node.js, import, and promise plugins.
- **Formatting:** Prettier is recommended (see `.vscode/settings.json` and `.prettierrc`).
- **Key Rules:**
  - Use single quotes for strings.
  - Always use semicolons.
  - Alphabetical import order, with internal `#src` imports grouped after external.
  - Warn on unused variables (ignore those prefixed with `_`).
  - Console statements are allowed.
  - No unresolved import errors for `#src` alias.
- **EditorConfig:** 2 spaces per indent, LF line endings, auto-format on save.
- **Throwing Errors:** Always throw errors with a descriptive message and prepend a console.error statement.

---

## Comments & Documentation

- **File-level:** Every file starts with a high-level overview of its purpose and functionality.
- **Function-level:** Every function, class, or method has a concise comment above it explaining its role (2-5 lines).
- **Block-level:** Complex code blocks inside functions are commented for clarity.
- **DRY Principle:** Avoid repeating comments; do not comment obvious code (e.g., variable declarations).
- **Language:** All comments are in English and should be clear to a junior engineer.
- **No Section Dividers:** Do not use visual dividers (e.g., `-----`) in comments.

---

## Editor & Tooling

- **Recommended Editor:** VSCode
- **Recommended Extensions:** (see `.vscode/extensions.json`)
  - Prettier (`esbenp.prettier-vscode`)
  - Trailing Spaces (`shardulm94.trailing-spaces`)
  - GitHub Actions (`GitHub.vscode-github-actions`)
  - ESLint (`dbaeumer.vscode-eslint`)
  - Docker (`ms-azuretools.vscode-docker`)
- **Workspace Settings:** (see `.vscode/settings.json`)
  - 2-space indentation, format on save, trailing space trimming, auto-save on focus change.

---

## How to Contribute

1. Fork the repository and create a new branch for your feature or bugfix.
2. Make your changes, following the coding and comment style above.
3. Add or update tests as needed.
4. Run `pnpm lint` and `pnpm test` to ensure code quality and correctness.
5. Submit a pull request with a clear description of your changes.

---

If you have any questions, open an issue or join the discussion on GitHub!
