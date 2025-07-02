/**
 * Handles publishing a Chrome extension to the Chrome Web Store.
 * The extension is already uploaded to the Chrome Web Store. This will only publish the extension.
 */
import axios from 'axios';
/**
 * Publishes an extension to the public or to trusted testers, with optional expedited review fallback.
 * Validates required parameters and constructs the correct API endpoint using the request body for publish options.
 * @param {Object} params - Parameters for publishing the extension.
 * @param {string} params.extensionId - The Chrome extension ID.
 * @param {string} params.accessToken - OAuth2 access token for authentication.
 * @param {('trustedTesters'|'default')} params.publishTarget - 'trustedTesters' or 'default' for public. Default is 'default'.
 * @param {boolean} params.expeditedReview - Whether to request expedited review first. Default is false.
 * @returns {Promise<Object>} - The response from the publish API.
 */
async function publishExtension({
  extensionId,
  accessToken,
  publishTarget = 'default',
  expeditedReview = false,
}) {
  // Validate required parameters
  if (!extensionId || typeof extensionId !== 'string') {
    throw new Error('extensionId (string) is required');
  }
  if (!accessToken || typeof accessToken !== 'string') {
    throw new Error('accessToken (string) is required');
  }
  if (publishTarget !== 'trustedTesters' && publishTarget !== 'default') {
    throw new Error("publishTarget must be 'trustedTesters' or 'default'");
  }

  const url = `https://www.googleapis.com/chromewebstore/v1.1/items/${extensionId}/publish`;
  // Prepare request body
  const baseBody = {
    target: publishTarget,
  };

  // Attempt expedited review if requested
  if (expeditedReview) {
    try {
      const res = await axios.post(
        url,
        { ...baseBody, reviewExemption: true },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'x-goog-api-version': '2',
            'Content-Type': 'application/json',
          },
        }
      );
      if (!res.data.status || !res.data.status.includes('OK')) {
        throw new Error(`Publish (expedited) failed: ${JSON.stringify(res.data)}`);
      }
      return res.data;
    } catch (err) {
      // Fall back to regular review if expedited fails
    }
  }

  // Fallback to regular review (no expedited reviewExemption)
  try {
    const res = await axios.post(url, baseBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-goog-api-version': '2',
        'Content-Type': 'application/json',
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

export default publishExtension;
