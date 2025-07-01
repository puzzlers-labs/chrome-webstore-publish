// chrome-webstore.js
// Helper functions for Chrome Web Store API interactions
// Handles OAuth2 token refresh, extension upload, and publishing

const axios = require('axios');
const fs = require('fs');

/**
 * Get a new access token using a refresh token
 * @param {Object} params
 * @param {string} params.clientId
 * @param {string} params.clientSecret
 * @param {string} params.refreshToken
 * @returns {Promise<string>} accessToken
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
    throw new Error(`Failed to get access token: ${err.response?.data?.error_description || err.message}`);
  }
}

/**
 * Upload a new version of the extension ZIP file
 * @param {Object} params
 * @param {string} params.extensionId
 * @param {string} params.zipFile
 * @param {string} params.accessToken
 */
async function uploadExtension({ extensionId, zipFile, accessToken }) {
  const url = `https://www.googleapis.com/upload/chromewebstore/v1.1/items/${extensionId}`;
  const zipStream = fs.createReadStream(zipFile);
  try {
    const res = await axios.put(url, zipStream, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'x-goog-api-version': '2',
        'Content-Type': 'application/zip',
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    if (res.data.uploadState !== 'SUCCESS') {
      throw new Error(`Upload failed: ${JSON.stringify(res.data)}`);
    }
    return res.data;
  } catch (err) {
    throw new Error(`Failed to upload extension: ${err.response?.data?.error || err.message}`);
  }
}

/**
 * Publish the extension to the public or trusted testers, with optional expedited review.
 * If expedited review fails, falls back to regular review and logs the error.
 * @param {Object} params
 * @param {string} params.extensionId
 * @param {string} params.accessToken
 * @param {string} params.publishTarget
 * @param {boolean} params.expeditedReview
 * @param {object} params.core - @actions/core for logging
 */
async function publishExtension({ extensionId, accessToken, publishTarget, expeditedReview, core }) {
  const url = `https://www.googleapis.com/chromewebstore/v1.1/items/${extensionId}/publish${publishTarget === 'trustedTesters' ? '?publishTarget=trustedTesters' : ''}`;
  // Try expedited review if requested
  if (expeditedReview) {
    try {
      const res = await axios.post(url, { reviewExemption: true }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'x-goog-api-version': '2',
          'Content-Type': 'application/json',
        },
      });
      if (!res.data.status || !res.data.status.includes('OK')) {
        throw new Error(`Publish (expedited) failed: ${JSON.stringify(res.data)}`);
      }
      return res.data;
    } catch (err) {
      core?.warning?.(`Expedited review failed: ${err.response?.data?.error || err.message}. Falling back to regular review.`);
    }
  }
  // Fallback to regular review (no body)
  try {
    const res = await axios.post(url, null, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'x-goog-api-version': '2',
        'Content-Length': 0,
      },
    });
    if (!res.data.status || !res.data.status.includes('OK')) {
      throw new Error(`Publish failed: ${JSON.stringify(res.data)}`);
    }
    return res.data;
  } catch (err) {
    throw new Error(`Failed to publish extension: ${err.response?.data?.error || err.message}`);
  }
}

module.exports = {
  getAccessToken,
  uploadExtension,
  publishExtension,
}; 