/**
 * Handles uploading a new version package (ZIP or CRX) of a Chrome extension to the Chrome Web Store.
 */
import fs from 'fs';
import axios from 'axios';
/**
 * Uploads a package file (ZIP or CRX) containing the extension to the Chrome Web Store.
 * Uses a PUT request with the extension's ID and access token for authentication.
 * Throws an error if the upload fails or the API does not return SUCCESS.
 *
 * @param {Object} params - The parameters for uploading the extension.
 * @param {string} params.extensionId - The unique ID of the Chrome extension.
 * @param {string} params.packageFilePath - Path to the ZIP or CRX file to upload.
 * @param {string} params.accessToken - OAuth2 access token for authentication.
 */
async function uploadExtensionPackage({ extensionId, packageFilePath, accessToken }) {
  // Validate required parameters
  if (!extensionId || typeof extensionId !== 'string') {
    throw new Error('extensionId is required and must be a non-empty string');
  }
  if (!packageFilePath || typeof packageFilePath !== 'string') {
    throw new Error('packageFilePath is required and must be a non-empty string');
  }
  if (!accessToken || typeof accessToken !== 'string') {
    throw new Error('accessToken is required and must be a non-empty string');
  }

  const url = `https://www.googleapis.com/upload/chromewebstore/v1.1/items/${extensionId}`;
  const fileStream = fs.createReadStream(packageFilePath);
  // Determine Content-Type based on file extension
  const contentType = packageFilePath.endsWith('.crx')
    ? 'application/x-chrome-extension'
    : 'application/zip';
  try {
    const res = await axios.put(url, fileStream, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-goog-api-version': '2',
        'Content-Type': contentType,
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

export default uploadExtensionPackage;
