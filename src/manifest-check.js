// This file provides a utility function to check for the presence of manifest.json at the root of a ZIP file.
// It extracts the ZIP to a temporary directory and throws an error if manifest.json is missing.
// Designed to be used before uploading or packaging Chrome extensions.

import fs from 'fs';
import os from 'os';
import path from 'path';
import unzipper from 'unzipper';

/**
 * Checks if manifest.json exists at the root of the provided ZIP file.
 * Extracts the ZIP to a temporary directory and throws an error if manifest.json is missing.
 * @param {string} zipFilePath - Absolute path to the ZIP file to check.
 * @returns {Promise<void>} - Resolves if manifest.json is found, otherwise throws an error.
 */
export default async function checkManifestInZip(zipFilePath) {
  // Creates a temporary directory for extracting the ZIP file.
  const manifestCheckTmpDir = fs.mkdtempSync(`${os.tmpdir()}/manifest-check-`);

  await fs
    .createReadStream(zipFilePath)
    .pipe(unzipper.Extract({ path: manifestCheckTmpDir }))
    .promise();
  const manifestPath = path.join(manifestCheckTmpDir, 'manifest.json');

  // Throws an error if manifest.json is not found at the root of the extracted ZIP.
  if (!fs.existsSync(manifestPath)) {
    throw new Error(
      'Invalid extension ZIP: manifest.json not found at the root. Please check the ZIP file.'
    );
  }
}
