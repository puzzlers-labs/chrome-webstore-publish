// Main entry point for the chrome-webstore-publish GitHub Action
// This script parses inputs, uploads the extension ZIP, and publishes it using the Chrome Web Store API.

const core = require('@actions/core');
const path = require('path');
const { uploadExtension, publishExtension, getAccessToken } = require('./chrome-webstore');

async function run() {
  try {
    // Parse inputs
    const extensionId = core.getInput('extension_id', { required: true });
    const zipFile = core.getInput('zip_file', { required: true });
    const clientId = core.getInput('client_id', { required: true });
    const clientSecret = core.getInput('client_secret', { required: true });
    const refreshToken = core.getInput('refresh_token', { required: true });
    const publishTarget = core.getInput('publish_target') || 'default';
    const expeditedReview = core.getInput('expedited_review') === 'true';

    core.info('Refreshing access token...');
    const accessToken = await getAccessToken({ clientId, clientSecret, refreshToken });

    core.info('Uploading extension ZIP to Chrome Web Store...');
    await uploadExtension({ extensionId, zipFile, accessToken });

    core.info('Publishing extension...');
    await publishExtension({ extensionId, accessToken, publishTarget, expeditedReview, core });

    core.info('Extension uploaded and published successfully!');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run(); 