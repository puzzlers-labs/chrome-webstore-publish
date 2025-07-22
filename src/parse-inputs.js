// This file exports a function to parse and validate all required environment variables for the Chrome Web Store publish process.
// The function returns an object with all parsed and validated inputs, applying defaults where appropriate, and throws errors for missing or mutually exclusive values.

// Parses and validates all required inputs and environment variables. Returns an object with all parsed values.
export default function parseInputs() {
  const extensionId = process.env.INPUT_EXTENSION_ID;
  const zipFilePath = process.env.INPUT_ZIP_FILE_PATH;
  const clientId = process.env.INPUT_CLIENT_ID;
  const clientSecret = process.env.INPUT_CLIENT_SECRET;
  const refreshToken = process.env.INPUT_REFRESH_TOKEN;
  const outputEnv = process.env.GITHUB_OUTPUT;
  const crxPrivateKey = process.env.INPUT_CRX_PRIVATE_KEY;
  const crxPrivateKeyPath = process.env.INPUT_CRX_PRIVATE_KEY_PATH;
  const publishTargetInput = process.env.INPUT_PUBLISH_TARGET || 'public';
  const expeditedReview = process.env.INPUT_EXPEDITED_REVIEW === 'true';
  const mode = process.env.INPUT_MODE || 'publish';

  const publishTarget = publishTargetInput === 'testers' ? 'trustedTesters' : undefined;

  if (!extensionId || !zipFilePath || !clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing one or more required environment variables.');
  }
  if (!outputEnv) {
    throw new Error(
      'Missing GITHUB_OUTPUT environment variable. Action must be executed in a GitHub Actions environment.'
    );
  }
  if (crxPrivateKey && crxPrivateKeyPath) {
    throw new Error('Provide only one of crx_private_key or crx_private_key_path, not both.');
  }

  return {
    extensionId,
    zipFilePath,
    clientId,
    clientSecret,
    refreshToken,
    outputEnv,
    crxPrivateKey,
    crxPrivateKeyPath,
    publishTargetInput,
    publishTarget,
    expeditedReview,
    mode,
  };
}
