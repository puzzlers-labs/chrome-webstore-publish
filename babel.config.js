// This file configures Babel to work with Jest and support ECMAScript Modules (ESM).
// It uses the @babel/preset-env preset to transpile code for the current Node.js version.
// This ensures compatibility for running tests and using modern JavaScript features.
export default {
  presets: [
    [
      '@babel/preset-env',
      {
        // Targets the current version of Node.js for transpilation
        targets: { node: 'current' },
      },
    ],
  ],
};
