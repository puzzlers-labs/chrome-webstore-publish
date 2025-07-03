// This file contains an integration test for the packCrxWithChrome function.
// It creates a temporary Chrome extension, generates a key, and verifies that the extension is packed into a CRX file using a real Chrome/Chromium binary.
// The test ensures compatibility with the actual Chrome executable and checks for correct CRX output.

import { execFileSync } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import puppeteer from 'puppeteer';
import packCrxWithChrome from '#src/pack-crx-with-chrome.js';

// Integration test suite for packCrxWithChrome
// Sets up a temporary extension directory and key, then tests CRX packaging
// Cleans up all temporary files after tests

describe('packCrxWithChrome integration', () => {
  let tempDir;
  let keyPath;
  let crxPath;
  let chromePath;

  // Prepares a temporary extension directory, manifest, and key before all tests
  beforeAll(() => {
    chromePath = puppeteer.executablePath().trim();
    // Use /tmp for temp directory for better compatibility
    const tmpBase = '/tmp';
    tempDir = fs.mkdtempSync(path.join(tmpBase, 'crx-test-'));
    console.log('os.tmpdir():', os.tmpdir());
    console.log('tempDir:', tempDir);
    // Write a barebones manifest.json
    const manifestPath = path.join(tempDir, 'manifest.json');
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        manifest_version: 2,
        name: 'Test Extension',
        version: '1.0',
      })
    );
    console.log('manifestPath:', manifestPath);
    // Generate a key pair OUTSIDE the extension directory
    keyPath = path.join(tmpBase, `test-key-${Date.now()}.pem`);
    const { privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    fs.writeFileSync(keyPath, privateKey);
    crxPath = `${tempDir}.crx`;
    console.log('keyPath:', keyPath);
    console.log('crxPath:', crxPath);
  });

  // Cleans up the temporary extension directory and key after all tests
  afterAll(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    if (fs.existsSync(keyPath)) {
      fs.rmSync(keyPath, { force: true });
    }
  });

  // Tests that packCrxWithChrome successfully creates a CRX file from the extension directory
  it('packs a real extension directory into a CRX', async () => {
    // Ensure the directory and manifest exist
    console.log('Checking tempDir exists:', fs.existsSync(tempDir));
    console.log('Checking manifest exists:', fs.existsSync(path.join(tempDir, 'manifest.json')));
    // Fail the test if Chromium is not available
    let chromiumFound = true;
    let versionError = null;
    try {
      console.log('Running version check:', chromePath, '--version');
      execFileSync(chromePath, ['--version'], { stdio: 'inherit' });
    } catch (err) {
      chromiumFound = false;
      versionError = err;
    }
    if (!chromiumFound) {
      console.error('Chrome version check failed:', versionError);
      throw new Error(`Chromium is required at ${chromePath} for this test to run.`);
    }
    console.log('Running packCrxWithChrome with:', tempDir, keyPath, chromePath);
    const result = await packCrxWithChrome(tempDir, keyPath, chromePath);
    console.log('packCrxWithChrome result:', result);
    expect(result).toBe(crxPath);
    expect(fs.existsSync(crxPath)).toBe(true);
  });
});
