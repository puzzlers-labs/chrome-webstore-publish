[![Chrome Webstore Push Banner](.github/images/hero.png)](https://github.com/marketplace/actions/chrome-webstore-publish)

[![Test Status](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/puzzlers-labs/chrome-webstore-publish/refs/heads/main/.github/test-status-badge.json)](https://github.com/puzzlers-labs/chrome-webstore-publish/actions/workflows/update-badges-after-merge.yml) [![Docker Build](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/puzzlers-labs/chrome-webstore-publish/refs/heads/main/.github/docker-build-badge.json)](https://github.com/puzzlers-labs/chrome-webstore-publish/actions/workflows/update-badges-after-merge.yml) [![Code Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/puzzlers-labs/chrome-webstore-publish/refs/heads/main/.github/coverage-badge.json)](https://github.com/puzzlers-labs/chrome-webstore-publish/actions/workflows/update-badges-after-merge.yml) [![Code Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/puzzlers-labs/chrome-webstore-publish/refs/heads/main/.github/action-runs-badge.json)](https://github.com/puzzlers-labs/chrome-webstore-publish/actions/workflows/update-action-runs-badge-on-cron.yml) [![Docker Pulls](https://img.shields.io/docker/pulls/puzzlers/chrome-webstore-publish?label=Docker%20Pulls)](https://hub.docker.com/r/puzzlers/chrome-webstore-publish)

# Chrome Webstore Publish GitHub Action

GitHub Action to upload and publish Chrome extension ZIP or CRX files to the Chrome Web Store using the official Chrome Web Store API. Supports publishing to public or trusted testers, CRX signing, and expedited review process.

## Features

- Uploads a new version of an existing Chrome extension.
- Optionally signs and uploads as CRX if a private key is provided
- Publishes the extension to the public or trusted testers
- Handles OAuth2 token refresh automatically
- Supports expedited review with fallback to regular review
- Provides clear logs and error messages
- Runs in a Docker container making it runner agnostic.

## Prerequisites

- The extension must already exist in the Chrome Web Store (**first publish must be manual**).
- You must have a Google Cloud project with the Chrome Web Store API enabled.
- OAuth2 credentials (client ID, client secret, refresh token) with `https://www.googleapis.com/auth/chromewebstore` scope.
- Follow this documentation to generate the client credentials and refresh token - [https://developer.chrome.com/docs/webstore/using-api](https://developer.chrome.com/docs/webstore/using-api).

## Inputs

| Name                    | Description                                                                                                                 | Required               |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `extension_id`          | The Chrome Web Store extension ID                                                                                           | Yes                    |
| `zip_file_path`         | Path to the extension ZIP file                                                                                              | Yes                    |
| `client_id`             | Google Cloud OAuth2 client ID                                                                                               | Yes                    |
| `client_secret`         | Google Cloud OAuth2 client secret                                                                                           | Yes                    |
| `refresh_token`         | OAuth2 refresh token of the user that has access to webstore api scope.                                                     | Yes                    |
| `publish_target`        | Publish target: `public` or `testers`                                                                                       | No (default: `public`) |
| `expedited_review`      | Request expedited review if eligible (true/false). Falls back to regular review if not eligible.                            | No (default: `false`)  |
| `crx_private_key`       | CRX signing private key (PEM string). If provided, the extension will be signed and uploaded as a CRX.                      | No                     |
| `crx_private_key_path`  | Path to the CRX signing private key (PEM file). If provided, the extension will be signed and uploaded as a CRX.            | No                     |
| `save_package_artifact` | If true, saves the package (CRX or ZIP) to chrome-webstore-publish-artifacts and outputs its path as package-artifact-path. | No (default: `false`)  |

> **Note:** Only one of `crx_private_key` or `crx_private_key_path` should be provided. If neither is provided, the extension is uploaded as a ZIP.

## Example Usage

```yaml
name: Publish Chrome Extension
on:
  push:
    branches: [main]
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Publish to Chrome Web Store
        uses: puzzlers-labs/chrome-webstore-publish@v1
        with:
          extension_id: ${{ vars.CHROME_EXTENSION_ID }}
          zip_file_path: ./dist/extension.zip
          client_id: ${{ secrets.GOOGLE_CLIENT_ID }}
          client_secret: ${{ secrets.GOOGLE_CLIENT_SECRET }}
          refresh_token: ${{ secrets.GOOGLE_REFRESH_TOKEN }}
          publish_target: public # Or `testers` for internal publishing target to TrustedTesters.
          expedited_review: true # This does not guarantee an expedited Review process. But it makes an attempt.
          save_package_artifact: true # Save the signed package (CRX or ZIP) as an artifact for later use
          # Only one of the following should be provided:
          # crx_private_key: ${{ secrets.CRX_PRIVATE_KEY }}
          # crx_private_key_path: ./path/to/key.pem

      # Example: Use the output path in a later step
      - name: Use package artifact path
        run: echo "Package artifact path: ${{ steps.<step_id>.outputs.package-artifact-path }}"
```

## Outputs

| Name                    | Description                                                               |
| ----------------------- | ------------------------------------------------------------------------- |
| `package-artifact-path` | Path to the saved package (CRX or ZIP) if `save_package_artifact` is true |

## Error Handling & Logs

- The action logs progress and errors to the console.
- The workflow fails if required inputs are missing or invalid.
- All API errors and upload/publish failures are reported in the logs.

## Contributions

Refer to [CONTRIBUTING.MD](CONTRIBUTING.MD)

## License

[Apache-2.0](LICENSE)
