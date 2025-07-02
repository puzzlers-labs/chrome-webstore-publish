// Tests for packCrxWithChrome, covering Chrome not found, packing failure, missing CRX file, and successful packing.
import { execFileSync } from 'child_process';
import fs from 'fs';
import packCrxWithChrome from '../pack-crx-with-chrome.js';

jest.mock('fs');
jest.mock('child_process');

describe('packCrxWithChrome', () => {
  const unpackedDir = '/fake/dir';
  const privateKeyPath = '/fake/key.pem';
  const crxFile = '/fake/dir.crx';
  const originalEnv = process.env;

  // Reset mocks and environment before each test.
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  // Restore environment after all tests.
  afterAll(() => {
    process.env = originalEnv;
  });

  // Throws if Chrome is not found in the environment or Docker container.
  it('throws if Chrome is not found', async () => {
    execFileSync.mockImplementation(() => {
      throw new Error('not found');
    });
    process.env.CHROME_PATH = undefined;
    await expect(packCrxWithChrome(unpackedDir, privateKeyPath)).rejects.toThrow(
      'Chromium not found at /usr/bin/chromium-browser in the Docker container.'
    );
  });

  // Throws if packing the extension fails.
  it('throws if packing fails', async () => {
    execFileSync
      .mockImplementationOnce(() => {}) // Chrome found
      .mockImplementationOnce(() => {
        throw new Error('pack fail');
      });
    fs.existsSync.mockReturnValue(true);
    await expect(packCrxWithChrome(unpackedDir, privateKeyPath)).rejects.toThrow(
      'Failed to pack CRX with Chromium: pack fail'
    );
  });

  // Throws if the CRX file is not found after packing.
  it('throws if CRX file is not found', async () => {
    execFileSync.mockImplementation(() => {}); // Chrome found and packing ok
    fs.existsSync.mockReturnValue(false);
    await expect(packCrxWithChrome(unpackedDir, privateKeyPath)).rejects.toThrow(
      'CRX file not found at expected location: /fake/dir.crx'
    );
  });

  // Returns the CRX file path on successful packing.
  it('returns crx file path on success', async () => {
    execFileSync.mockImplementation(() => {}); // Chrome found and packing ok
    fs.existsSync.mockReturnValue(true);
    const result = await packCrxWithChrome(unpackedDir, privateKeyPath);
    expect(result).toBe(crxFile);
  });

  // Tests that an error is thrown if unpackedDir is missing or invalid
  it('throws error if unpackedDir is missing or invalid', async () => {
    await expect(packCrxWithChrome(undefined, '/fake/key.pem')).rejects.toThrow(
      'unpackedDir must be a non-empty string'
    );
    await expect(packCrxWithChrome('', '/fake/key.pem')).rejects.toThrow(
      'unpackedDir must be a non-empty string'
    );
    await expect(packCrxWithChrome(123, '/fake/key.pem')).rejects.toThrow(
      'unpackedDir must be a non-empty string'
    );
  });

  // Tests that an error is thrown if privateKeyPath is missing or invalid
  it('throws error if privateKeyPath is missing or invalid', async () => {
    await expect(packCrxWithChrome('/fake/dir', undefined)).rejects.toThrow(
      'privateKeyPath must be a non-empty string'
    );
    await expect(packCrxWithChrome('/fake/dir', '')).rejects.toThrow(
      'privateKeyPath must be a non-empty string'
    );
    await expect(packCrxWithChrome('/fake/dir', 123)).rejects.toThrow(
      'privateKeyPath must be a non-empty string'
    );
  });
});
