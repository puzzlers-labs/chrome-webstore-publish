/**
 * This file is the main entry point for publishing a Chrome extension to the Chrome Web Store inside a Docker environment.
 * It reads configuration from environment variables, handles packaging (ZIP or CRX), uploads the extension, and triggers publishing using the Chrome Web Store API.
 * The process includes optional CRX packaging if a private key is provided, and supports both public and trusted tester publishing targets.
 * All errors are logged and cause the process to exit with a failure code.
 * The script is designed to be run as a standalone process.
 * Uses a separate utility to check for manifest.json in the ZIP file before upload or packaging.
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import unzipper from 'unzipper';
import { getAccessToken, publishExtension, uploadExtension } from '#src/chrome-webstore/index.js';
import checkManifestInZip from '#src/manifest-check.js';
import packCrxWithChrome from '#src/pack-crx-with-chrome.js';
import parseInputs from '#src/parse-inputs.js';
import resolvePath from '#src/resolve-path.js';
import saveArtifact from '#src/save-artifact.js';

/**
 * Main function to orchestrate the Chrome Web Store publishing process.
 * Handles input parsing, optional CRX packaging, authentication, upload, and publishing.
 * Checks for manifest.json in the ZIP file using a utility before proceeding.
 *
 * @returns {Promise<void>}
 */
async function run() {
  try {
    console.log('Starting Chrome Web Store publish process...');

    // Parse and validate all required inputs and environment variables
    const {
      extensionId,
      zipFilePath,
      clientId,
      clientSecret,
      refreshToken,
      outputEnv,
      crxPrivateKey,
      crxPrivateKeyPath,
      publishTarget,
      expeditedReview,
      mode,
    } = parseInputs();

    // Resolve file paths to absolute paths
    const resolvedZipFilePath = resolvePath(zipFilePath);

    // Default package file path is the resolved ZIP file path.
    let packageFilePath = resolvedZipFilePath;

    // Check for manifest.json in the ZIP file before any upload or CRX packaging.
    // This will throw an error if the manifest.json is not found in the zip file.
    await checkManifestInZip(resolvedZipFilePath);

    let privateKeyPath;
    if (crxPrivateKey) {
      // Writes the provided private key string to a temporary file for CRX packaging.
      const tmpKeyPath = path.join(os.tmpdir(), `crx-key-${Date.now()}.pem`);
      fs.writeFileSync(tmpKeyPath, crxPrivateKey, { encoding: 'utf-8', mode: 0o600 });
      privateKeyPath = tmpKeyPath;
    } else if (crxPrivateKeyPath) {
      privateKeyPath = resolvePath(crxPrivateKeyPath);
    }

    if (privateKeyPath) {
      // Unpacks the ZIP file to a temporary directory and prepares a CRX package if a private key is provided.
      const tmpDir = fs.mkdtempSync(`${os.tmpdir()}/unpacked-`);
      await fs
        .createReadStream(resolvedZipFilePath)
        .pipe(unzipper.Extract({ path: tmpDir }))
        .promise();

      // Pack CRX and set the package file path to the CRX file.
      packageFilePath = await packCrxWithChrome(tmpDir, privateKeyPath);
      console.log('[DEBUG] CRX package created:', packageFilePath);
    }

    // Save the signed package as an artifact if requested using a utility function.
    saveArtifact(packageFilePath, outputEnv);
    console.log(
      'Artifact saved. To use it, use the data: `${{ steps.<step-id>.outputs.package-artifact-path }}`'
    );

    if (mode === 'sign') {
      console.log('Signed the package successfully.');
      return;
    } else if (mode === 'publish') {
      // Requests an OAuth2 access token using the provided credentials.
      console.log('Requesting access token...');
      const accessToken = await getAccessToken(clientId, clientSecret, refreshToken);
      console.log('Access token obtained.');

      // Uploads the extension package (ZIP or CRX) to the Chrome Web Store.
      console.log('[DEBUG] About to upload file:', packageFilePath);
      console.log('[DEBUG] File extension for upload:', path.extname(packageFilePath));
      console.log('Uploading extension...');
      await uploadExtension(extensionId, accessToken, packageFilePath);
      console.log('Extension uploaded.');

      // Publishes the uploaded extension to the specified target (public or trusted testers).
      console.log('Publishing extension...');
      await publishExtension(extensionId, accessToken, publishTarget, expeditedReview);
      console.log('Extension published successfully.');
    }
  } catch (err) {
    // Logs any error and exits the process with a failure code.
    console.error('Error during publish process:', err);
    process.exit(1);
  }
}

// Invokes the main publishing process.
run();
