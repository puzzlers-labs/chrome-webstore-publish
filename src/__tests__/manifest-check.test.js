// This test suite verifies that the main process correctly checks for the presence of manifest.json in the extension ZIP file and handles various error scenarios.
// It mocks file system and unzipper operations to simulate different conditions, and ensures process exits or continues as expected based on input validity.

import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';

jest.mock('fs');
jest.mock('unzipper');

// Save the original environment and declare a spy for process.exit
const originalEnv = process.env;
let exitSpy;

// Reset mocks and environment before each test to ensure isolation
beforeEach(() => {
  jest.clearAllMocks();
  process.env = { ...originalEnv };
  exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
});
// Restore process.exit after each test
afterEach(() => {
  exitSpy.mockRestore();
});
// Restore the original environment after all tests
afterAll(() => {
  process.env = originalEnv;
});

// Group tests related to manifest.json presence and error handling
describe('manifest.json presence check', () => {
  // Test: Should exit with error if manifest.json is missing from the ZIP
  it('throws error if manifest.json is missing from the ZIP', async () => {
    fs.mkdtempSync.mockReturnValue('/tmp/manifest-check-123');
    fs.createReadStream.mockReturnValue({ pipe: () => ({ promise: () => Promise.resolve() }) });
    fs.existsSync.mockImplementation(
      (filePath) => filePath !== path.join('/tmp/manifest-check-123', 'manifest.json')
    );

    process.env.INPUT_EXTENSION_ID = 'id';
    process.env.INPUT_ZIP_FILE_PATH = 'file.zip';
    process.env.INPUT_CLIENT_ID = 'cid';
    process.env.INPUT_CLIENT_SECRET = 'csecret';
    process.env.INPUT_REFRESH_TOKEN = 'rtoken';

    // Import main file and expect process.exit(1) due to missing manifest.json
    await jest.isolateModulesAsync(async () => {
      await import('../index.js');
      await Promise.resolve();
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  // Test: Should not exit if manifest.json is present in the ZIP
  it('does not throw if manifest.json is present in the ZIP', async () => {
    fs.mkdtempSync.mockReturnValue('/tmp/manifest-check-456');
    fs.createReadStream.mockReturnValue({ pipe: () => ({ promise: () => Promise.resolve() }) });
    fs.existsSync.mockImplementation(
      (filePath) => filePath === path.join('/tmp/manifest-check-456', 'manifest.json')
    );

    process.env.INPUT_EXTENSION_ID = 'id';
    process.env.INPUT_ZIP_FILE_PATH = 'file.zip';
    process.env.INPUT_CLIENT_ID = 'cid';
    process.env.INPUT_CLIENT_SECRET = 'csecret';
    process.env.INPUT_REFRESH_TOKEN = 'rtoken';

    // Import main file and expect process.exit not to be called
    jest.isolateModules(async () => {
      await import('../index.js');
      expect(process.exit).not.toHaveBeenCalled();
    });
  });

  // Test: Should exit with error if required environment variables are missing
  it('throws error if required environment variables are missing', async () => {
    fs.mkdtempSync.mockReturnValue('/tmp/manifest-check-missing-env');
    fs.createReadStream.mockReturnValue({ pipe: () => ({ promise: () => Promise.resolve() }) });
    fs.existsSync.mockReturnValue(true);
    process.env.INPUT_EXTENSION_ID = '';
    process.env.INPUT_ZIP_FILE_PATH = '';
    process.env.INPUT_CLIENT_ID = '';
    process.env.INPUT_CLIENT_SECRET = '';
    process.env.INPUT_REFRESH_TOKEN = '';
    // Import main file and expect process.exit(1) due to missing env vars
    await jest.isolateModulesAsync(async () => {
      await import('../index.js');
      await Promise.resolve();
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  // Test: Should exit with error if both crx_private_key and crx_private_key_path are set
  it('throws error if both crx_private_key and crx_private_key_path are set', async () => {
    fs.mkdtempSync.mockReturnValue('/tmp/manifest-check-both-keys');
    fs.createReadStream.mockReturnValue({ pipe: () => ({ promise: () => Promise.resolve() }) });
    fs.existsSync.mockReturnValue(true);
    process.env.INPUT_EXTENSION_ID = 'id';
    process.env.INPUT_ZIP_FILE_PATH = 'file.zip';
    process.env.INPUT_CLIENT_ID = 'cid';
    process.env.INPUT_CLIENT_SECRET = 'csecret';
    process.env.INPUT_REFRESH_TOKEN = 'rtoken';
    process.env.INPUT_CRX_PRIVATE_KEY = 'key';
    process.env.INPUT_CRX_PRIVATE_KEY_PATH = 'keypath';
    // Import main file and expect process.exit(1) due to both keys being set
    await jest.isolateModulesAsync(async () => {
      await import('../index.js');
      await Promise.resolve();
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  // Test: Should log error and exit if an unexpected error occurs in the main logic
  it('logs error and exits process on unexpected error', async () => {
    fs.mkdtempSync.mockImplementation(() => {
      throw new Error('unexpected');
    });
    process.env.INPUT_EXTENSION_ID = 'id';
    process.env.INPUT_ZIP_FILE_PATH = 'file.zip';
    process.env.INPUT_CLIENT_ID = 'cid';
    process.env.INPUT_CLIENT_SECRET = 'csecret';
    process.env.INPUT_REFRESH_TOKEN = 'rtoken';
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // Import main file and expect process.exit(1) and error log
    await jest.isolateModulesAsync(async () => {
      await import('../index.js');
      await Promise.resolve();
      expect(process.exit).toHaveBeenCalledWith(1);
      expect(console.error).toHaveBeenCalled();
    });
    console.error.mockRestore();
  });
});
