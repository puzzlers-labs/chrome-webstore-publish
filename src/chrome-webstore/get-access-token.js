/**
 * Handles obtaining a new OAuth2 access token from Google using a refresh token.
 */

import axios from 'axios';
import qs from 'qs';

/**
 * Retrieves a new access token from Google OAuth2 using the provided refresh token and credentials.
 * Throws an error if the token cannot be obtained or if the response is invalid.
 * @param {string} clientId - The OAuth2 client ID from Google Cloud Console.
 * @param {string} clientSecret - The OAuth2 client secret from Google Cloud Console.
 * @param {string} refreshToken - The refresh token previously obtained for the user or service account.
 * @returns {Promise<string>} Resolves to the new access token string if successful, otherwise throws an error.
 */
async function getAccessToken(clientId, clientSecret, refreshToken) {
  // Validate required arguments
  if (!clientId || typeof clientId !== 'string') {
    throw new Error('clientId is required and must be a non-empty string');
  }
  if (!clientSecret || typeof clientSecret !== 'string') {
    throw new Error('clientSecret is required and must be a non-empty string');
  }
  if (!refreshToken || typeof refreshToken !== 'string') {
    throw new Error('refreshToken is required and must be a non-empty string');
  }

  // Build the URL and data for the request
  const url = 'https://oauth2.googleapis.com/token';
  const data = qs.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  // Make the request to Google OAuth2
  try {
    console.log('Requesting new OAuth2 access token from Google...');
    const res = await axios.post(url, data, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    if (!res.data.access_token) {
      throw new Error('No access_token in response');
    }

    console.log('Access token successfully retrieved.');
    return res.data.access_token;
  } catch (err) {
    console.error('Failed to get access token:', err);
    throw new Error(
      `Failed to get access token: ${err.response?.data?.error_description || err.message}`
    );
  }
}

export default getAccessToken;
