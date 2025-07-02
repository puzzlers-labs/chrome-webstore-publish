// This file contains Jest tests for the getAccessToken function, which retrieves a Google OAuth2 access token using a refresh token.
// The tests cover successful token retrieval, missing token in response, and error handling for failed requests.
import { getAccessToken } from '@src/chrome-webstore';
import axios from 'axios';

jest.mock('axios');

describe('getAccessToken', () => {
  // Tests that a valid access token is returned when the request succeeds
  it('returns access token on success', async () => {
    axios.post.mockResolvedValue({ data: { access_token: 'mock_token' } });
    const token = await getAccessToken({
      clientId: 'id',
      clientSecret: 'secret',
      refreshToken: 'refresh',
    });
    expect(token).toBe('mock_token');
  });

  // Tests that an error is thrown if the response does not contain an access_token
  it('throws error if no access_token in response', async () => {
    axios.post.mockResolvedValue({ data: {} });
    await expect(
      getAccessToken({ clientId: 'id', clientSecret: 'secret', refreshToken: 'refresh' })
    ).rejects.toThrow('No access_token in response');
  });

  // Tests that an error is thrown if the request to Google OAuth2 fails
  it('throws error on request failure', async () => {
    axios.post.mockRejectedValue({ response: { data: { error_description: 'fail' } } });
    await expect(
      getAccessToken({ clientId: 'id', clientSecret: 'secret', refreshToken: 'refresh' })
    ).rejects.toThrow('fail');
  });
});
