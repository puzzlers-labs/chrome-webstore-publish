// This file provides a utility to pack a Chrome extension directory into a CRX file using Chromium inside a Docker container.
// It checks for Chromium at a known path, attempts to pack the extension, and returns the path to the generated CRX file.

import { execFileSync } from 'child_process';
import fs from 'fs';

/**
 * Packs a Chrome extension directory into a CRX file using Chromium in Docker.
 * Throws an error if packing fails or Chromium is not found at the expected path.
 *
 * @param {string} unpackedDir Path to the unpacked extension directory
 * @param {string} privateKeyPath Path to the PEM private key file
 * @param {string} chromePath Path to the Chromium executable (optional, defaults to '/usr/bin/chromium-browser' for Docker)
 * @returns {Promise<string>} Path to the generated CRX file
 */
async function packCrxWithChrome(
  unpackedDir,
  privateKeyPath,
  chromePath = '/usr/bin/chromium-browser'
) {
  // Validate that the extension directory and private key path are non-empty strings
  if (typeof unpackedDir !== 'string' || !unpackedDir.trim()) {
    throw new Error('Invalid input: unpackedDir must be a non-empty string.');
  }
  if (typeof privateKeyPath !== 'string' || !privateKeyPath.trim()) {
    throw new Error('Invalid input: privateKeyPath must be a non-empty string.');
  }

  // Check if Chromium exists at the specified path in the Docker container
  try {
    console.log('Checking for Chromium in Docker container...');
    execFileSync(chromePath, ['--version'], { stdio: 'ignore' });
  } catch (_err) {
    console.error('Chromium not found at expected path.');
    throw new Error('Chromium not found at ' + chromePath + ' in the Docker container.');
  }

  // Attempt to pack the extension directory into a CRX file using Chromium
  try {
    console.log('Packing extension directory into CRX...');
    execFileSync(chromePath, [
      '--headless',
      '--no-sandbox',
      '--disable-crash-reporter',
      '--no-crashpad',
      '--crash-dumps-dir=/tmp/crashes',
      `--pack-extension=${unpackedDir}`,
      `--pack-extension-key=${privateKeyPath}`,
    ]);
  } catch (e) {
    console.error('Failed to pack CRX with Chromium:', e);
    throw new Error(`Failed to pack CRX with Chromium: ${e.message}`);
  }

  // Verify that the CRX file was created successfully
  const crxFile = `${unpackedDir}.crx`;
  if (!fs.existsSync(crxFile)) {
    console.error('CRX file not found after packing.');
    throw new Error(`CRX file not found at expected location: ${crxFile}`);
  }
  console.log('CRX file created successfully:', crxFile);
  return crxFile;
}

export default packCrxWithChrome;
