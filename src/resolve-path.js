/**
 * Provides a utility to convert a given file path to an absolute path.
 * If the path is already absolute, it returns the same path. Otherwise, it resolves the path relative to the current working directory.
 */

import path from 'path';

/**
 * Converts a file path to an absolute path if it is not already absolute.
 * Returns an empty string if the input is falsy.
 * @param {string} filePath - The file path to resolve. Can be absolute or relative.
 * @returns {string} The absolute file path, or an empty string if input is falsy.
 */
export default function resolvePath(filePath) {
  if (!filePath || typeof filePath !== 'string' || !filePath.trim()) {
    return '';
  }

  return path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
}
