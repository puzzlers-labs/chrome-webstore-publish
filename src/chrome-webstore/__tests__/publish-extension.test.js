// This file contains Jest tests for the publishExtension function, which publishes a Chrome extension to the Web Store.
// The tests cover expedited review, fallback to regular review, publish failures, and request errors.
import { publishExtension } from '@src/chrome-webstore';
import axios from 'axios';

jest.mock('axios');

describe('publishExtension', () => {
  const params = {
    extensionId: 'id',
    accessToken: 'token',
    publishTarget: undefined,
    expeditedReview: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Tests publishing with expedited review enabled
  it('publishes with expedited review', async () => {
    axios.post.mockResolvedValueOnce({ data: { status: ['OK'] } });
    const result = await publishExtension({ ...params, expeditedReview: true });
    expect(result).toEqual({ status: ['OK'] });
  });

  // Tests fallback to regular review if expedited review fails
  it('falls back to regular review if expedited fails', async () => {
    axios.post
      .mockRejectedValueOnce({ response: { data: { error: 'expedite fail' } } })
      .mockResolvedValueOnce({ data: { status: ['OK'] } });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await publishExtension({ ...params, expeditedReview: true });
    expect(warnSpy).toHaveBeenCalledWith(
      'Expedited review publish failed, falling back to regular review.'
    );
    expect(result).toEqual({ status: ['OK'] });
    warnSpy.mockRestore();
  });

  // Tests that an error is thrown if the publish API returns a failure status
  it('throws error if publish fails', async () => {
    axios.post.mockResolvedValueOnce({ data: { status: ['FAIL'] } });
    await expect(publishExtension(params)).rejects.toThrow('Publish failed');
  });

  // Tests that an error is thrown if the publish request itself fails
  it('throws error if request fails', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { error: 'fail' } } });
    await expect(publishExtension(params)).rejects.toThrow('fail');
  });

  // Tests that an error is thrown if extensionId is missing or invalid
  it('throws error if extensionId is missing or invalid', async () => {
    await expect(publishExtension({ accessToken: 'token' })).rejects.toThrow(
      'extensionId (string) is required'
    );
    await expect(publishExtension({ extensionId: '', accessToken: 'token' })).rejects.toThrow(
      'extensionId (string) is required'
    );
    await expect(publishExtension({ extensionId: 123, accessToken: 'token' })).rejects.toThrow(
      'extensionId (string) is required'
    );
  });

  // Tests that an error is thrown if accessToken is missing or invalid
  it('throws error if accessToken is missing or invalid', async () => {
    await expect(publishExtension({ extensionId: 'id' })).rejects.toThrow(
      'accessToken (string) is required'
    );
    await expect(publishExtension({ extensionId: 'id', accessToken: '' })).rejects.toThrow(
      'accessToken (string) is required'
    );
    await expect(publishExtension({ extensionId: 'id', accessToken: 123 })).rejects.toThrow(
      'accessToken (string) is required'
    );
  });

  // Tests that an error is thrown if publishTarget is invalid
  it('throws error if publishTarget is invalid', async () => {
    await expect(
      publishExtension({ extensionId: 'id', accessToken: 'token', publishTarget: 'invalid' })
    ).rejects.toThrow('publishTarget must be `trustedTesters` or `default`');
  });

  // Tests that an error is thrown if the regular publish request itself fails (fallback path)
  it('throws error if regular publish request fails after expedited fails', async () => {
    axios.post
      .mockRejectedValueOnce({ response: { data: { error: 'expedite fail' } } }) // expedited fails
      .mockRejectedValueOnce({ response: { data: { error: 'regular fail' } } }); // regular fails
    await expect(
      publishExtension({ extensionId: 'id', accessToken: 'token', expeditedReview: true })
    ).rejects.toThrow('regular fail');
  });
});
