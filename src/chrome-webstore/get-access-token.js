/**
 * Handles obtaining a new OAuth2 access token from Google using a refresh token.
 */
import axios from 'axios';
/**
 * Retrieves a new access token from Google OAuth2 using the provided refresh token and credentials.
 * Throws an error if the token cannot be obtained or if the response is invalid.
 * @param {Object} params - The parameters required to get the access token.
 * @param {string} params.clientId - The OAuth2 client ID from Google Cloud Console.
 * @param {string} params.clientSecret - The OAuth2 client secret from Google Cloud Console.
 * @param {string} params.refreshToken - The refresh token previously obtained for the user or service account.
 * @returns {Promise<string>} Resolves to the new access token string if successful, otherwise throws an error.
 */
async function getAccessToken({ clientId, clientSecret, refreshToken }) {
  const url = 'https://oauth2.googleapis.com/token';
  const data = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });
  try {
    const res = await axios.post(url, data.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    if (!res.data.access_token) {
      throw new Error('No access_token in response');
    }
    return res.data.access_token;
  } catch (err) {
    throw new Error(
      `Failed to get access token: ${err.response?.data?.error_description || err.message}`
    );
  }
}

export default getAccessToken;
