[![Chrome Webstore Push Banner](.github/images/hero.png)](https://github.com/marketplace/actions/chrome-webstore-publish)

[![Test Status](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/puzzlers-labs/chrome-webstore-publish/refs/heads/main/.github/test-status-badge.json)](https://github.com/puzzlers-labs/chrome-webstore-publish/actions/workflows/lint-and-test-on-pull-request.yml) [![Docker Build](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/puzzlers-labs/chrome-webstore-publish/refs/heads/main/.github/docker-build-badge.json)](https://github.com/puzzlers-labs/chrome-webstore-publish/actions/workflows/lint-and-test-on-pull-request.yml) [![Code Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/puzzlers-labs/chrome-webstore-publish/refs/heads/main/.github/coverage-badge.json)](https://github.com/puzzlers-labs/chrome-webstore-publish/actions/workflows/lint-and-test-on-pull-request.yml) [![Action Runs](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/puzzlers-labs/chrome-webstore-publish/refs/heads/main/.github/action-runs-badge.json)](https://github.com/puzzlers-labs/chrome-webstore-publish/pkgs/container/chrome-webstore-publish) [![Docker Pulls](https://img.shields.io/docker/pulls/puzzlers/chrome-webstore-publish?label=Docker%20Pulls)](https://hub.docker.com/r/puzzlers/chrome-webstore-publish)

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

| Name                   | Description                                                                                                      | Required                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `mode`                 | Mode of operation: `sign` or `publish`                                                                           | No (default: `publish`) |
| `extension_id`         | The Chrome Web Store extension ID                                                                                | Yes                     |
| `zip_file_path`        | Path to the extension ZIP file                                                                                   | Yes                     |
| `client_id`            | Google Cloud OAuth2 client ID                                                                                    | Yes                     |
| `client_secret`        | Google Cloud OAuth2 client secret                                                                                | Yes                     |
| `refresh_token`        | OAuth2 refresh token of the user that has access to webstore api scope.                                          | Yes                     |
| `publish_target`       | Publish target: `public` or `testers`                                                                            | No (default: `public`)  |
| `expedited_review`     | Request expedited review if eligible (true/false). Falls back to regular review if not eligible.                 | No (default: `false`)   |
| `crx_private_key`      | CRX signing private key (PEM string). If provided, the extension will be signed and uploaded as a CRX.           | No                      |
| `crx_private_key_path` | Path to the CRX signing private key (PEM file). If provided, the extension will be signed and uploaded as a CRX. | No                      |

> **Note:** Only one of `crx_private_key` or `crx_private_key_path` should be provided. If neither is provided, the extension is uploaded as a ZIP.

## Outputs

| Name                    | Description                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `package-artifact-path` | Path to the saved package (CRX or ZIP) that can be used in later steps. (e.g. `steps.<step-id>.outputs.package-artifact-path`) |

> **Note:** The `<step_id>` is the ID of the publish chrome extension step. This needs to be configured in the workflow file.

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
        id: publish-chrome-extension
        uses: puzzlers-labs/chrome-webstore-publish@v1
        with:
          mode: publish # Or `sign` to sign the extension and publish at a later step (manually).
          extension_id: ${{ vars.CHROME_EXTENSION_ID }}
          zip_file_path: ./dist/extension.zip
          client_id: ${{ secrets.GOOGLE_CLIENT_ID }}
          client_secret: ${{ secrets.GOOGLE_CLIENT_SECRET }}
          refresh_token: ${{ secrets.GOOGLE_REFRESH_TOKEN }}
          publish_target: public # Or `testers` for internal publishing target to TrustedTesters.
          expedited_review: true # This does not guarantee an expedited Review process. But it makes an attempt.
          # Only one of the following should be provided:
          # crx_private_key: ${{ secrets.CRX_PRIVATE_KEY }}
          # crx_private_key_path: ./path/to/key.pem

      # Example: Use the output path in a later step
      - name: Use package artifact path
        run: echo "Package artifact path: ${{ steps.publish-chrome-extension.outputs.package-artifact-path }}"
```

## Error Handling & Logs

- The action logs progress and errors to the console.
- The workflow fails if required inputs are missing or invalid.
- All API errors and upload/publish failures are reported in the logs.

## Contributions

Refer to [CONTRIBUTING.MD](CONTRIBUTING.MD)

## License

[Apache-2.0](LICENSE)
