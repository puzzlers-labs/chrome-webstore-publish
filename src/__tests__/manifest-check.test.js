/**
 * This file contains tests for the checkManifestInZip function.
 * It verifies that manifest.json is correctly detected in a ZIP file and ensures all error and edge cases are handled.
 * The tests cover presence, absence, invalid input, and extraction errors for manifest.json.
 */

import fs from 'fs';
import path from 'path';
import checkManifestInZip from '#src/manifest-check.js';

jest.mock('fs');
jest.mock('unzipper');

/**
 * Test suite for checkManifestInZip
 * Sets up mocks for file system and unzipper, then tests manifest detection and error handling
 */
describe('checkManifestInZip', () => {
  const zipFilePath = '/tmp/test.zip';
  const tmpDir = '/tmp/manifest-check-123';
  const manifestPath = path.join(tmpDir, 'manifest.json');

  // Sets up default mock return values before each test
  beforeEach(() => {
    jest.clearAllMocks();
    fs.mkdtempSync.mockReturnValue(tmpDir);
    fs.createReadStream.mockReturnValue({ pipe: () => ({ promise: () => Promise.resolve() }) });
  });

  // Resolves if manifest.json is present in the extracted directory
  it('resolves if manifest.json is present', async () => {
    fs.existsSync.mockImplementation((filePath) => filePath === manifestPath);
    await expect(checkManifestInZip(zipFilePath)).resolves.toBeUndefined();
  });

  // Throws if manifest.json is missing
  it('throws if manifest.json is missing', async () => {
    fs.existsSync.mockReturnValue(false);
    await expect(checkManifestInZip(zipFilePath)).rejects.toThrow(
      'manifest.json not found at the root'
    );
  });

  // Throws for missing or invalid zipFilePath arguments
  it('throws if zipFilePath is missing or invalid', async () => {
    await expect(checkManifestInZip()).rejects.toThrow('zipFilePath must be a non-empty string');
    await expect(checkManifestInZip('')).rejects.toThrow('zipFilePath must be a non-empty string');
    await expect(checkManifestInZip(123)).rejects.toThrow('zipFilePath must be a non-empty string');
  });

  // Throws if extraction fails
  it('throws if extraction fails', async () => {
    fs.createReadStream.mockReturnValue({
      pipe: () => ({ promise: () => Promise.reject(new Error('extract fail')) }),
    });
    await expect(checkManifestInZip(zipFilePath)).rejects.toThrow('extract fail');
  });
});
