// This file contains Jest tests for the uploadExtension function, which handles uploading a Chrome extension package to the Chrome Web Store.
// The tests cover successful uploads, error handling for failed uploads, and request failures.

import fs from 'fs';
import axios from 'axios';
import uploadExtension from '#src/chrome-webstore/upload-extension.js';

jest.mock('axios');
jest.mock('fs');

describe('uploadExtension', () => {
  const params = {
    extensionId: 'id',
    packageFilePath: 'path/to/zip',
    accessToken: 'token',
  };

  // Reset mocks and set up a dummy stream before each test.
  beforeEach(() => {
    jest.clearAllMocks();
    fs.createReadStream.mockReturnValue({});
  });

  // Should resolve with response data when upload is successful.
  it('uploads extension successfully', async () => {
    axios.put.mockResolvedValue({ data: { uploadState: 'SUCCESS', foo: 'bar' } });
    const result = await uploadExtension(params);
    expect(result).toEqual({ uploadState: 'SUCCESS', foo: 'bar' });
    expect(fs.createReadStream).toHaveBeenCalledWith('path/to/zip');
    expect(axios.put).toHaveBeenCalled();
  });

  // Should throw if uploadState is not SUCCESS in the response.
  it('throws error if uploadState is not SUCCESS', async () => {
    axios.put.mockResolvedValue({ data: { uploadState: 'FAIL' } });
    await expect(uploadExtension(params)).rejects.toThrow('Upload failed');
  });

  // Should throw with error message if axios request fails.
  it('throws error on request failure', async () => {
    axios.put.mockRejectedValue({ response: { data: { error: 'fail' } } });
    await expect(uploadExtension(params)).rejects.toThrow('fail');
  });

  // Should throw with error message if axios request fails with no response property.
  it('throws error on request failure with no response', async () => {
    axios.put.mockRejectedValue(new Error('network down'));
    await expect(
      uploadExtension({ extensionId: 'id', packageFilePath: 'path/to/zip', accessToken: 'token' })
    ).rejects.toThrow('network down');
  });

  // Tests that an error is thrown if extensionId is missing or invalid
  it('throws error if extensionId is missing or invalid', async () => {
    await expect(
      uploadExtension({ packageFilePath: 'path/to/zip', accessToken: 'token' })
    ).rejects.toThrow('extensionId is required');
    await expect(
      uploadExtension({ extensionId: '', packageFilePath: 'path/to/zip', accessToken: 'token' })
    ).rejects.toThrow('extensionId is required');
    await expect(
      uploadExtension({ extensionId: 123, packageFilePath: 'path/to/zip', accessToken: 'token' })
    ).rejects.toThrow('extensionId is required');
  });

  // Tests that an error is thrown if packageFilePath is missing or invalid
  it('throws error if packageFilePath is missing or invalid', async () => {
    await expect(uploadExtension({ extensionId: 'id', accessToken: 'token' })).rejects.toThrow(
      'packageFilePath is required'
    );
    await expect(
      uploadExtension({ extensionId: 'id', packageFilePath: '', accessToken: 'token' })
    ).rejects.toThrow('packageFilePath is required');
    await expect(
      uploadExtension({ extensionId: 'id', packageFilePath: 123, accessToken: 'token' })
    ).rejects.toThrow('packageFilePath is required');
  });

  // Tests that an error is thrown if accessToken is missing or invalid
  it('throws error if accessToken is missing or invalid', async () => {
    await expect(
      uploadExtension({ extensionId: 'id', packageFilePath: 'path/to/zip' })
    ).rejects.toThrow('accessToken is required');
    await expect(
      uploadExtension({ extensionId: 'id', packageFilePath: 'path/to/zip', accessToken: '' })
    ).rejects.toThrow('accessToken is required');
    await expect(
      uploadExtension({ extensionId: 'id', packageFilePath: 'path/to/zip', accessToken: 123 })
    ).rejects.toThrow('accessToken is required');
  });
});
