/**
 * This file contains tests for the getAccessToken utility.
 * It verifies correct retrieval of access tokens and error handling for all edge cases.
 * The tests cover successful retrieval, missing fields, request failures, and input validation.
 */

import axios from 'axios';
import getAccessToken from '#src/chrome-webstore/get-access-token.js';

jest.mock('axios');

/**
 * Test suite for getAccessToken
 * Sets up mocks for axios, then tests token retrieval and error handling
 */
describe('getAccessToken', () => {
  // Returns access token on success
  it('returns access token on success', async () => {
    axios.post.mockResolvedValue({ data: { access_token: 'mock_token' } });
    const token = await getAccessToken('id', 'secret', 'refresh');
    expect(token).toBe('mock_token');
  });

  // Throws error if no access_token in response
  it('throws error if no access_token in response', async () => {
    axios.post.mockResolvedValue({ data: {} });
    await expect(getAccessToken('id', 'secret', 'refresh')).rejects.toThrow(
      'No access_token in response'
    );
  });

  // Throws error on request failure with error_description
  it('throws error on request failure with error_description', async () => {
    axios.post.mockRejectedValue({ response: { data: { error_description: 'fail' } } });
    await expect(getAccessToken('id', 'secret', 'refresh')).rejects.toThrow('fail');
  });

  // Throws error on request failure with message
  it('throws error on request failure with message', async () => {
    axios.post.mockRejectedValue(new Error('network down'));
    await expect(getAccessToken('id', 'secret', 'refresh')).rejects.toThrow('network down');
  });

  // Throws error if clientId is missing or invalid
  it('throws error if clientId is missing or invalid', async () => {
    await expect(getAccessToken(undefined, 'secret', 'refresh')).rejects.toThrow(
      'clientId is required'
    );
    await expect(getAccessToken('', 'secret', 'refresh')).rejects.toThrow('clientId is required');
    await expect(getAccessToken(123, 'secret', 'refresh')).rejects.toThrow('clientId is required');
  });

  // Throws error if clientSecret is missing or invalid
  it('throws error if clientSecret is missing or invalid', async () => {
    await expect(getAccessToken('id', undefined, 'refresh')).rejects.toThrow(
      'clientSecret is required'
    );
    await expect(getAccessToken('id', '', 'refresh')).rejects.toThrow('clientSecret is required');
    await expect(getAccessToken('id', 123, 'refresh')).rejects.toThrow('clientSecret is required');
  });

  // Throws error if refreshToken is missing or invalid
  it('throws error if refreshToken is missing or invalid', async () => {
    await expect(getAccessToken('id', 'secret', undefined)).rejects.toThrow(
      'refreshToken is required'
    );
    await expect(getAccessToken('id', 'secret', '')).rejects.toThrow('refreshToken is required');
    await expect(getAccessToken('id', 'secret', 123)).rejects.toThrow('refreshToken is required');
  });
});
