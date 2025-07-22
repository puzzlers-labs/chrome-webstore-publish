/**
 * This file contains tests for the publishExtension utility.
 * It verifies correct publishing of extensions and error handling for all edge cases.
 * The tests cover expedited and regular review, publish failures, request errors, and input validation.
 */

import axios from 'axios';
import publishExtension from '#src/chrome-webstore/publish-extension.js';

jest.mock('axios');

/**
 * Test suite for publishExtension
 * Sets up mocks for axios, then tests publishing and error handling
 */
describe('publishExtension', () => {
  const extensionId = 'id';
  const accessToken = 'token';
  const publishTarget = 'default';

  // Clears all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Publishes with expedited review
  it('publishes with expedited review', async () => {
    axios.post.mockResolvedValueOnce({ data: { status: ['OK'] } });
    const result = await publishExtension(extensionId, accessToken, publishTarget, true);
    expect(result).toEqual({ status: ['OK'] });
  });

  // Falls back to regular review if expedited fails
  it('falls back to regular review if expedited fails', async () => {
    axios.post
      .mockRejectedValueOnce({ response: { data: { error: 'expedite fail' } } })
      .mockResolvedValueOnce({ data: { status: ['OK'] } });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await publishExtension(extensionId, accessToken, publishTarget, true);
    expect(warnSpy).toHaveBeenCalledWith(
      'Expedited review publish failed, falling back to regular review.',
      'expedite fail'
    );
    expect(result).toEqual({ status: ['OK'] });
    warnSpy.mockRestore();
  });

  // Throws error if publish fails
  it('throws error if publish fails', async () => {
    axios.post.mockResolvedValueOnce({ data: { status: ['FAIL'] } });
    await expect(publishExtension(extensionId, accessToken, publishTarget)).rejects.toThrow(
      'Publish failed'
    );
  });

  // Throws error if request fails with error
  it('throws error if request fails with error', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { error: 'fail' } } });
    await expect(publishExtension(extensionId, accessToken, publishTarget)).rejects.toThrow('fail');
  });

  // Throws error if extensionId is missing or invalid
  it('throws error if extensionId is missing or invalid', async () => {
    await expect(publishExtension(undefined, accessToken, publishTarget)).rejects.toThrow(
      'extensionId (string) is required'
    );
    await expect(publishExtension('', accessToken, publishTarget)).rejects.toThrow(
      'extensionId (string) is required'
    );
    await expect(publishExtension(123, accessToken, publishTarget)).rejects.toThrow(
      'extensionId (string) is required'
    );
  });

  // Throws error if accessToken is missing or invalid
  it('throws error if accessToken is missing or invalid', async () => {
    await expect(publishExtension(extensionId, undefined, publishTarget)).rejects.toThrow(
      'accessToken (string) is required'
    );
    await expect(publishExtension(extensionId, '', publishTarget)).rejects.toThrow(
      'accessToken (string) is required'
    );
    await expect(publishExtension(extensionId, 123, publishTarget)).rejects.toThrow(
      'accessToken (string) is required'
    );
  });

  // Throws error if publishTarget is invalid
  it('throws error if publishTarget is invalid', async () => {
    await expect(publishExtension(extensionId, accessToken, 'invalid')).rejects.toThrow(
      'publishTarget must be `trustedTesters` or `default`'
    );
  });

  // Throws error if regular publish request fails after expedited fails
  it('throws error if regular publish request fails after expedited fails', async () => {
    axios.post
      .mockRejectedValueOnce({ response: { data: { error: 'expedite fail' } } }) // expedited fails
      .mockRejectedValueOnce({ response: { data: { error: 'regular fail' } } }); // regular fails
    await expect(publishExtension(extensionId, accessToken, publishTarget, true)).rejects.toThrow(
      'regular fail'
    );
  });
});
