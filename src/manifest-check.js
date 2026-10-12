/**
 * Checks that manifest.json is a file at the root of an extension zip.
 * Reads the central directory instead of unpacking, because streaming
 * Extract can omit files from a complete archive.
 */
import unzipper from 'unzipper';

/**
 * Resolves when manifest.json is a file at the zip root.
 * Throws when the path is unusable, the archive cannot be read, or the
 * manifest is missing or nested.
 * @param {string} zipFilePath Absolute path to the zip.
 * @returns {Promise<void>}
 */
export default async function checkManifestInZip(zipFilePath) {
  if (!zipFilePath || typeof zipFilePath !== 'string' || !zipFilePath.trim()) {
    console.error('Invalid input: zipFilePath must be a non-empty string.');
    throw new Error('Invalid input: zipFilePath must be a non-empty string.');
  }

  const archive = await unzipper.Open.file(zipFilePath);
  const hasRootManifest = archive.files.some(
    (entry) => entry.type === 'File' && entry.path === 'manifest.json'
  );
  if (!hasRootManifest) {
    console.error('Invalid extension ZIP: manifest.json not found at the root.');
    throw new Error(
      'Invalid extension ZIP: manifest.json not found at the root. Please check the ZIP file.'
    );
  }
}
