[![Chrome Webstore Push Banner](.github/images/hero.png)](https://github.com/marketplace/actions/chrome-webstore-publish)

# chrome-webstore-publish GitHub Action

A GitHub Action to upload and publish Chrome extension ZIP files to the Chrome Web Store using the official Chrome Web Store API.

## Features

- Uploads a new version of an existing Chrome extension (ZIP file)
- Publishes the extension to the public or trusted testers
- Handles OAuth2 token refresh automatically
- Provides clear logs and error messages

## Prerequisites

- The extension must already exist in the Chrome Web Store (first publish must be manual)
- You must have a Google Cloud project with the Chrome Web Store API enabled
- OAuth2 credentials (client ID, client secret, refresh token) with `https://www.googleapis.com/auth/chromewebstore` scope

## Inputs

| Name                   | Description                                                                                                                                               | Required               |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `extension_id`         | The Chrome Web Store extension ID                                                                                                                         | Yes                    |
| `zip_file`             | Path to the extension ZIP file                                                                                                                            | Yes                    |
| `client_id`            | Google Cloud OAuth2 client ID                                                                                                                             | Yes                    |
| `client_secret`        | Google Cloud OAuth2 client secret                                                                                                                         | Yes                    |
| `refresh_token`        | OAuth2 refresh token                                                                                                                                      | Yes                    |
| `publish_target`       | Publish target: `public` or `testers`                                                                                                                     | No (default: `public`) |
| `expedited_review`     | Request expedited review if eligible (true/false). Falls back to regular review if not eligible.                                                          | No (default: `false`)  |
| `crx_private_key`      | CRX signing private key (PEM string). If provided, the extension will be signed and uploaded as a CRX. Mutually exclusive with crx_private_key_path.      | No                     |
| `crx_private_key_path` | Path to the CRX signing private key (PEM file). If provided, the extension will be signed and uploaded as a CRX. Mutually exclusive with crx_private_key. | No                     |

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
        uses: your-org/chrome-webstore-publish@v1
        with:
          extension_id: ${{ secrets.CHROME_EXTENSION_ID }}
          zip_file: ./dist/extension.zip
          client_id: ${{ secrets.GOOGLE_CLIENT_ID }}
          client_secret: ${{ secrets.GOOGLE_CLIENT_SECRET }}
          refresh_token: ${{ secrets.GOOGLE_REFRESH_TOKEN }}
          publish_target: public
          expedited_review: false
          # Only one of the following should be provided:
          # crx_private_key: ${{ secrets.CRX_PRIVATE_KEY }}
          # crx_private_key_path: ./path/to/key.pem
```

## License

[Apache-2.0](LICENSE)

To download the browsers for testing - pnpm dlx puppeteer browsers install
