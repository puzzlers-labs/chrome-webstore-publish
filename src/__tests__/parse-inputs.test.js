/**
 * This file contains tests for the parseInputs utility.
 * It verifies correct parsing and validation of environment variables, and ensures all error cases are handled.
 * The tests cover required variable presence, GitHub Actions environment, and mutual exclusivity of key inputs.
 */

import parseInputs from '#src/parse-inputs.js';

/**
 * Test suite for parseInputs
 * Sets up and restores environment variables, then tests parsing and error handling
 */
describe('parseInputs', () => {
  const originalEnv = process.env;

  // Sets up a fresh environment before each test
  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  // Restores the original environment after all tests
  afterAll(() => {
    process.env = originalEnv;
  });

  // Returns parsed inputs when all required env vars are set
  it('returns parsed inputs when all required env vars are set', () => {
    process.env.INPUT_EXTENSION_ID = 'id';
    process.env.INPUT_ZIP_FILE_PATH = 'zip';
    process.env.INPUT_CLIENT_ID = 'cid';
    process.env.INPUT_CLIENT_SECRET = 'secret';
    process.env.INPUT_REFRESH_TOKEN = 'refresh';
    process.env.GITHUB_OUTPUT = '/tmp/output';
    process.env.INPUT_CRX_PRIVATE_KEY = '';
    process.env.INPUT_CRX_PRIVATE_KEY_PATH = '';
    process.env.INPUT_PUBLISH_TARGET = 'testers';
    process.env.INPUT_EXPEDITED_REVIEW = 'true';
    process.env.INPUT_MODE = 'sign';
    const result = parseInputs();
    expect(result).toMatchObject({
      extensionId: 'id',
      zipFilePath: 'zip',
      clientId: 'cid',
      clientSecret: 'secret',
      refreshToken: 'refresh',
      outputEnv: '/tmp/output',
      crxPrivateKey: '',
      crxPrivateKeyPath: '',
      publishTargetInput: 'testers',
      publishTarget: 'trustedTesters',
      expeditedReview: true,
      mode: 'sign',
    });
  });

  // Throws if any required env var is missing
  it('throws if any required env var is missing', () => {
    process.env.INPUT_EXTENSION_ID = '';
    process.env.INPUT_ZIP_FILE_PATH = '';
    process.env.INPUT_CLIENT_ID = '';
    process.env.INPUT_CLIENT_SECRET = '';
    process.env.INPUT_REFRESH_TOKEN = '';
    process.env.GITHUB_OUTPUT = '/tmp/output';
    expect(() => parseInputs()).toThrow('Missing one or more required environment variables.');
  });

  // Throws if GITHUB_OUTPUT is missing
  it('throws if GITHUB_OUTPUT is missing', () => {
    process.env.INPUT_EXTENSION_ID = 'id';
    process.env.INPUT_ZIP_FILE_PATH = 'zip';
    process.env.INPUT_CLIENT_ID = 'cid';
    process.env.INPUT_CLIENT_SECRET = 'secret';
    process.env.INPUT_REFRESH_TOKEN = 'refresh';
    delete process.env.GITHUB_OUTPUT;
    expect(() => parseInputs()).toThrow(
      'Missing GITHUB_OUTPUT environment variable. Action must be executed in a GitHub Actions environment.'
    );
  });

  // Throws if both crx_private_key and crx_private_key_path are set
  it('throws if both crx_private_key and crx_private_key_path are set', () => {
    process.env.INPUT_EXTENSION_ID = 'id';
    process.env.INPUT_ZIP_FILE_PATH = 'zip';
    process.env.INPUT_CLIENT_ID = 'cid';
    process.env.INPUT_CLIENT_SECRET = 'secret';
    process.env.INPUT_REFRESH_TOKEN = 'refresh';
    process.env.GITHUB_OUTPUT = '/tmp/output';
    process.env.INPUT_CRX_PRIVATE_KEY = 'key';
    process.env.INPUT_CRX_PRIVATE_KEY_PATH = 'keypath';
    expect(() => parseInputs()).toThrow(
      'Provide only one of crx_private_key or crx_private_key_path, not both.'
    );
  });
});
