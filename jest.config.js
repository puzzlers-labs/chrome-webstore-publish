// This file sets up Jest to work with ECMAScript Modules (ESM) and Node.js.
// It uses Babel for transforming JavaScript files and maps module paths for easier imports.
// The configuration ensures tests run smoothly with modern JavaScript features.
export default {
  testEnvironment: 'node',
  transform: {
    // Uses babel-jest to transform JavaScript files using the specified Babel config
    '^.+\\.js$': ['babel-jest', { configFile: './babel.config.js' }],
  },
  moduleNameMapper: {
    // Maps @src/ imports to the src directory for cleaner import statements
    '^@src/(.*)$': '<rootDir>/src/$1',
  },
};
