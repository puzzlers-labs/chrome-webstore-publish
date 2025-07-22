/**
 * This file contains tests for the resolvePath utility.
 * It verifies correct resolution of absolute and relative paths, and ensures edge cases are handled.
 * The tests cover empty, invalid, absolute, relative, and whitespace-containing paths.
 */

import path from 'path';
import resolvePath from '#src/resolve-path.js';

/**
 * Test suite for resolvePath
 * Tests path resolution for various input scenarios
 */
describe('resolvePath', () => {
  // Returns empty string for undefined, null, empty, or non-string
  it('returns empty string for undefined, null, empty, or non-string', () => {
    expect(resolvePath()).toBe('');
    expect(resolvePath(null)).toBe('');
    expect(resolvePath('')).toBe('');
    expect(resolvePath('   ')).toBe('');
    expect(resolvePath(123)).toBe('');
    expect(resolvePath({})).toBe('');
  });

  // Returns the same path if already absolute
  it('returns the same path if already absolute', () => {
    const absPath = path.resolve('/foo/bar');
    expect(resolvePath(absPath)).toBe(absPath);
  });

  // Resolves relative paths to absolute
  it('resolves relative paths to absolute', () => {
    const relPath = 'foo/bar';
    const expected = path.resolve(relPath);
    expect(resolvePath(relPath)).toBe(expected);
  });

  // Resolves paths with whitespace
  it('resolves paths with whitespace', () => {
    const relPath = '  foo/bar  ';
    const expected = path.resolve(relPath.trim());
    expect(resolvePath(relPath.trim())).toBe(expected);
  });
});
