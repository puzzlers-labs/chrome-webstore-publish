// This file provides a utility function to pack a Chrome extension directory into a CRX file using Chromium inside a Docker container.
// The function uses the known Chromium path in the container to pack the extension and returns the path to the generated CRX file.

import { execSync } from 'child_process';
import fs from 'fs';

/**
 * Packs a Chrome extension directory into a CRX file using Chromium in Docker.
 * Throws if packing fails or Chromium is not found at the expected path.
 * @param {string} unpackedDir - Path to the unpacked extension directory
 * @param {string} privateKeyPath - Path to the PEM private key file
 * @returns {Promise<string>} - Path to the generated CRX file
 */
async function packCrxWithChrome(unpackedDir, privateKeyPath) {
  // Validate input parameters
  if (typeof unpackedDir !== 'string' || !unpackedDir.trim()) {
    throw new Error('Invalid input: unpackedDir must be a non-empty string.');
  }
  if (typeof privateKeyPath !== 'string' || !privateKeyPath.trim()) {
    throw new Error('Invalid input: privateKeyPath must be a non-empty string.');
  }

  // Chromium is always installed at this path in the Docker container
  const chromePath = '/usr/bin/chromium-browser';
  try {
    console.log('Checking for Chromium in Docker container...');
    execSync(`${chromePath} --version`, { stdio: 'ignore' });
  } catch (_err) {
    console.error('Chromium not found at expected path.');
    throw new Error('Chromium not found at /usr/bin/chromium-browser in the Docker container.');
  }

  try {
    console.log('Packing extension directory into CRX...');
    execSync(
      `${chromePath} --headless --no-sandbox --pack-extension=${unpackedDir} --pack-extension-key=${privateKeyPath}`
    );
  } catch (e) {
    console.error('Failed to pack CRX with Chromium:', e);
    throw new Error(`Failed to pack CRX with Chromium: ${e.message}`);
  }

  // Check if the CRX file was created
  const crxFile = `${unpackedDir}.crx`;
  if (!fs.existsSync(crxFile)) {
    console.error('CRX file not found after packing.');
    throw new Error(`CRX file not found at expected location: ${crxFile}`);
  }
  console.log('CRX file created successfully:', crxFile);
  return crxFile;
}

export default packCrxWithChrome;
