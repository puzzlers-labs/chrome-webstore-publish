// This file is the main entry point for publishing a Chrome extension to the Chrome Web Store inside a Docker environment.
// It reads configuration from environment variables, handles packaging (ZIP or CRX), uploads the extension, and triggers publishing using the Chrome Web Store API.
// The process includes optional CRX packaging if a private key is provided, and supports both public and trusted tester publishing targets.
// All errors are logged and cause the process to exit with a failure code.
// The script is designed to be run as a standalone process.

import fs from 'fs';
import os from 'os';
import path from 'path';
import unzipper from 'unzipper';
import { getAccessToken, publishExtension, uploadExtension } from '#src/chrome-webstore/index.js';
import packCrxWithChrome from '#src/pack-crx-with-chrome.js';

// Main function to orchestrate the Chrome Web Store publishing process.
// Handles input parsing, optional CRX packaging, authentication, upload, and publishing.
async function run() {
  try {
    console.log('Starting Chrome Web Store publish process...');

    // Parse inputs from environment variables
    const extensionId = process.env.INPUT_EXTENSION_ID;
    const zipFilePath = process.env.INPUT_ZIP_FILE_PATH;
    const clientId = process.env.INPUT_CLIENT_ID;
    const clientSecret = process.env.INPUT_CLIENT_SECRET;
    const refreshToken = process.env.INPUT_REFRESH_TOKEN;
    const publishTargetInput = process.env.INPUT_PUBLISH_TARGET || 'public';
    const publishTarget = publishTargetInput === 'testers' ? 'trustedTesters' : undefined;
    const expeditedReview = process.env.INPUT_EXPEDITED_REVIEW === 'true';
    const crxPrivateKey = process.env.INPUT_CRX_PRIVATE_KEY;
    const crxPrivateKeyPath = process.env.INPUT_CRX_PRIVATE_KEY_PATH;
    const savePackageArtifact = process.env.INPUT_SAVE_PACKAGE_ARTIFACT === 'true';

    if (!extensionId || !zipFilePath || !clientId || !clientSecret || !refreshToken) {
      throw new Error('Missing one or more required environment variables.');
    }

    if (crxPrivateKey && crxPrivateKeyPath) {
      throw new Error('Provide only one of crx_private_key or crx_private_key_path, not both.');
    }

    // Normalize zip file path to ensure it works inside Docker
    let resolvedZipFilePath = zipFilePath;
    if (!path.isAbsolute(zipFilePath)) {
      resolvedZipFilePath = path.resolve(zipFilePath);
    }

    let resolvedCrxPrivateKeyPath = crxPrivateKeyPath;
    if (crxPrivateKeyPath && !path.isAbsolute(crxPrivateKeyPath)) {
      resolvedCrxPrivateKeyPath = path.resolve(crxPrivateKeyPath);
    }

    let packageFilePath = resolvedZipFilePath;
    if (crxPrivateKey || resolvedCrxPrivateKeyPath) {
      // Unpacks the ZIP file to a temporary directory and prepares a CRX package if a private key is provided.
      // Handles both direct private key string and private key file path.
      console.log('Unpacking ZIP and preparing CRX...');
      const tmpDir = fs.mkdtempSync(`${os.tmpdir()}/unpacked-`);
      await fs
        .createReadStream(resolvedZipFilePath)
        .pipe(unzipper.Extract({ path: tmpDir }))
        .promise();

      // Determine the private key path
      let privateKeyPath = resolvedCrxPrivateKeyPath;
      if (crxPrivateKey) {
        // Writes the provided private key string to a temporary file for CRX packaging.
        const tmpKeyPath = path.join(os.tmpdir(), `crx-key-${Date.now()}.pem`);
        fs.writeFileSync(tmpKeyPath, crxPrivateKey, { encoding: 'utf-8', mode: 0o600 });
        privateKeyPath = tmpKeyPath;
      }

      // Pack CRX
      packageFilePath = await packCrxWithChrome(tmpDir, privateKeyPath);
      console.log('CRX package created:', packageFilePath);
    }

    // Save the signed package as an artifact if requested
    let savedArtifactPath = null;
    if (savePackageArtifact) {
      const actionDirectory = 'chrome-webstore-publish-artifacts';
      const artifactDir = path.resolve(actionDirectory);
      if (!fs.existsSync(artifactDir)) {
        fs.mkdirSync(artifactDir, { recursive: true });
      }
      const fileName = path.basename(packageFilePath);
      const destPath = path.join(artifactDir, fileName);
      fs.copyFileSync(packageFilePath, destPath);
      // Set file permissions to read/write for all users (not execute)
      fs.chmodSync(destPath, 0o666);
      savedArtifactPath = destPath;
      // Use environment file to set output (GitHub Actions best practice)
      const outputEnv = process.env.GITHUB_OUTPUT;
      if (outputEnv) {
        fs.appendFileSync(outputEnv, `package-artifact-path=${destPath}\n`);
      }
      console.log(`Package artifact saved at: ${destPath}`);
    }

    // Unpack ZIP to a temp directory and check for manifest.json before any upload or CRX packaging.
    const manifestCheckTmpDir = fs.mkdtempSync(`${os.tmpdir()}/manifest-check-`);
    await fs
      .createReadStream(resolvedZipFilePath)
      .pipe(unzipper.Extract({ path: manifestCheckTmpDir }))
      .promise();
    const manifestPath = path.join(manifestCheckTmpDir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      // Throws an error if manifest.json is not found at the root of the extracted ZIP.
      throw new Error(
        'Invalid extension ZIP: manifest.json not found at the root. Please check the ZIP file.'
      );
    }

    // Requests an OAuth2 access token using the provided credentials.
    console.log('Requesting access token...');
    const accessToken = await getAccessToken({
      clientId,
      clientSecret,
      refreshToken,
    });
    console.log('Access token obtained.');

    // Uploads the extension package (ZIP or CRX) to the Chrome Web Store.
    console.log('About to upload file:', packageFilePath);
    console.log('File extension for upload:', path.extname(packageFilePath));
    console.log('Uploading extension...');
    await uploadExtension({ extensionId, packageFilePath, accessToken });
    console.log('Extension uploaded.');

    // Publishes the uploaded extension to the specified target (public or trusted testers).
    console.log('Publishing extension...');
    await publishExtension({
      extensionId,
      accessToken,
      publishTarget,
      expeditedReview,
    });
    console.log('Extension published successfully.');
  } catch (err) {
    // Logs any error and exits the process with a failure code.
    console.error('Error during publish process:', err);
    process.exit(1);
  }
}

// Invokes the main publishing process.
run();
