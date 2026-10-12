/**
 * Extracts every entry of a zip into a new temporary directory.
 * Streaming Extract drops files once an archive has more than about twenty
 * entries, so this reads the central directory and writes each file before
 * returning.
 */
import fs from 'fs';
import os from 'os';
import unzipper from 'unzipper';

/**
 * Extracts zipFilePath and returns the directory that holds the files.
 * The caller owns that directory. Throws when the path is unusable or the
 * archive cannot be read.
 * @param {string} zipFilePath Absolute path to the zip.
 * @returns {Promise<string>}
 */
export default async function extractZip(zipFilePath) {
  if (!zipFilePath || typeof zipFilePath !== 'string' || !zipFilePath.trim()) {
    console.error('Invalid input: zipFilePath must be a non-empty string.');
    throw new Error('Invalid input: zipFilePath must be a non-empty string.');
  }

  const destination = fs.mkdtempSync(`${os.tmpdir()}/unpacked-`);
  const archive = await unzipper.Open.file(zipFilePath);
  await archive.extract({ path: destination });
  return destination;
}
