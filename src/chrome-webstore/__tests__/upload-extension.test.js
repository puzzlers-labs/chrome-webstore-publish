/**
 * This file contains tests for the uploadExtension utility.
 * It verifies correct uploading of extension packages and error handling for all edge cases.
 * The tests cover successful upload, upload failures, request errors, and input validation.
 */

import { Buffer } from 'buffer';
import fs from 'fs';
import axios from 'axios';
import uploadExtension from '#src/chrome-webstore/upload-extension.js';

jest.mock('axios');
jest.mock('fs');

/**
 * Test suite for uploadExtension
 * Sets up mocks for axios and file system, then tests upload and error handling
 */
describe('uploadExtension', () => {
  const extensionId = 'id';
  const accessToken = 'token';
  const packageFilePath = 'path/to/zip';

  // Clears all mocks and sets up default mock before each test
  beforeEach(() => {
    jest.clearAllMocks();
    fs.readFileSync.mockReturnValue(Buffer.from('test data'));
  });

  // Uploads extension successfully
  it('uploads extension successfully', async () => {
    axios.put.mockResolvedValue({ data: { uploadState: 'SUCCESS', foo: 'bar' } });
    const result = await uploadExtension(extensionId, accessToken, packageFilePath);
    expect(result).toEqual({ uploadState: 'SUCCESS', foo: 'bar' });
    expect(fs.readFileSync).toHaveBeenCalledWith(packageFilePath);
    expect(axios.put).toHaveBeenCalled();
  });

  // Throws error if uploadState is not SUCCESS
  it('throws error if uploadState is not SUCCESS', async () => {
    axios.put.mockResolvedValue({ data: { uploadState: 'FAIL' } });
    await expect(uploadExtension(extensionId, accessToken, packageFilePath)).rejects.toThrow(
      'Upload failed'
    );
  });

  // Throws error on request failure with error
  it('throws error on request failure with error', async () => {
    axios.put.mockRejectedValue({ response: { data: { error: 'fail' } } });
    await expect(uploadExtension(extensionId, accessToken, packageFilePath)).rejects.toThrow(
      'fail'
    );
  });

  // Throws error on request failure with message
  it('throws error on request failure with message', async () => {
    axios.put.mockRejectedValue(new Error('network down'));
    await expect(uploadExtension(extensionId, accessToken, packageFilePath)).rejects.toThrow(
      'network down'
    );
  });

  // Throws error if extensionId is missing or invalid
  it('throws error if extensionId is missing or invalid', async () => {
    await expect(uploadExtension(undefined, accessToken, packageFilePath)).rejects.toThrow(
      'extensionId is required'
    );
    await expect(uploadExtension('', accessToken, packageFilePath)).rejects.toThrow(
      'extensionId is required'
    );
    await expect(uploadExtension(123, accessToken, packageFilePath)).rejects.toThrow(
      'extensionId is required'
    );
  });

  // Throws error if packageFilePath is missing or invalid
  it('throws error if packageFilePath is missing or invalid', async () => {
    await expect(uploadExtension(extensionId, accessToken, undefined)).rejects.toThrow(
      'packageFilePath is required'
    );
    await expect(uploadExtension(extensionId, accessToken, '')).rejects.toThrow(
      'packageFilePath is required'
    );
    await expect(uploadExtension(extensionId, accessToken, 123)).rejects.toThrow(
      'packageFilePath is required'
    );
  });

  // Throws error if accessToken is missing or invalid
  it('throws error if accessToken is missing or invalid', async () => {
    await expect(uploadExtension(extensionId, undefined, packageFilePath)).rejects.toThrow(
      'accessToken is required'
    );
    await expect(uploadExtension(extensionId, '', packageFilePath)).rejects.toThrow(
      'accessToken is required'
    );
    await expect(uploadExtension(extensionId, 123, packageFilePath)).rejects.toThrow(
      'accessToken is required'
    );
  });
});
