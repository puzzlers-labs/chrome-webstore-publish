/**
 * Handles uploading a new version package (ZIP or CRX) of a Chrome extension to the Chrome Web Store.
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';

/**
 * Uploads a package file (ZIP or CRX) containing the extension to the Chrome Web Store.
 * Uses a PUT request with the extension's ID and access token for authentication.
 * Throws an error if the upload fails or the API does not return SUCCESS.
 *
 * @param {string} extensionId - The unique ID of the Chrome extension.
 * @param {string} accessToken - OAuth2 access token for authentication.
 * @param {string} packageFilePath - Path to the ZIP or CRX file to upload.
 */
async function uploadExtensionPackage(extensionId, accessToken, packageFilePath) {
  // Validate required parameters
  if (!extensionId || typeof extensionId !== 'string' || !extensionId.trim()) {
    console.error('extensionId is required and must be a non-empty string');
    throw new Error('extensionId is required and must be a non-empty string');
  }
  if (!packageFilePath || typeof packageFilePath !== 'string' || !packageFilePath.trim()) {
    console.error('packageFilePath is required and must be a non-empty string');
    throw new Error('packageFilePath is required and must be a non-empty string');
  }
  if (!accessToken || typeof accessToken !== 'string' || !accessToken.trim()) {
    console.error('accessToken is required and must be a non-empty string');
    throw new Error('accessToken is required and must be a non-empty string');
  }

  console.log('[DEBUG] Package file path:', packageFilePath);

  // Prepare the upload URL and file stream for the upload request.
  const url = `https://www.googleapis.com/upload/chromewebstore/v1.1/items/${extensionId}?uploadType=media`;
  const fileStream = fs.createReadStream(packageFilePath);
  const isCrx = packageFilePath.endsWith('.crx');
  const contentType = isCrx ? 'application/x-chrome-extension' : 'application/zip';
  const fileName = path.basename(packageFilePath);

  console.log('[DEBUG] Content-Type:', contentType);

  try {
    console.log('Uploading extension package to Chrome Web Store...');
    const res = await axios.put(url, fileStream, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-goog-api-version': '2',
        'Content-Type': contentType,
        'X-Goog-Upload-Protocol': 'raw',
        'X-Goog-Upload-File-Name': fileName,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    if (res.data.uploadState !== 'SUCCESS') {
      console.error('Upload failed:', JSON.stringify(res.data));
      throw new Error(`Upload failed: ${JSON.stringify(res.data)}`);
    }

    console.log('Extension package uploaded successfully.');
    return res.data;
  } catch (err) {
    console.error('Failed to upload extension package:', err.response?.data?.error || err.message);
    throw new Error(`Failed to upload extension: ${err.response?.data?.error || err.message}`);
  }
}

export default uploadExtensionPackage;
