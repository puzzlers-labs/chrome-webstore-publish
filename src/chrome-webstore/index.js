// This file provides a unified interface for Chrome Web Store API helper functions.
// It imports and re-exports functions for OAuth2 token retrieval, extension upload, and publishing.
//
// Functions exported:
// - getAccessToken: Retrieves a fresh OAuth2 access token for API requests.
// - uploadExtension: Uploads a Chrome extension package to the Web Store.
// - publishExtension: Publishes the uploaded extension to the specified target (public or testers).

import getAccessToken from '@src/chrome-webstore/get-access-token.js';
import publishExtension from '@src/chrome-webstore/publish-extension.js';
import uploadExtension from '@src/chrome-webstore/upload-extension.js';

export { getAccessToken, uploadExtension, publishExtension };
