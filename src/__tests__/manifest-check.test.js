/**
 * Tests for checkManifestInZip.
 * Confirms a root manifest is accepted and that a missing, nested, or
 * unusable zip is rejected.
 */
import unzipper from 'unzipper';
import checkManifestInZip from '#src/manifest-check.js';

jest.mock('unzipper');

describe('checkManifestInZip', () => {
  const zipFilePath = '/tmp/test.zip';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves if manifest.json is a file at the root', async () => {
    unzipper.Open.file.mockResolvedValue({
      files: [{ type: 'File', path: 'manifest.json' }],
    });
    await expect(checkManifestInZip(zipFilePath)).resolves.toBeUndefined();
  });

  it('throws if manifest.json is missing', async () => {
    unzipper.Open.file.mockResolvedValue({
      files: [{ type: 'File', path: 'content/setup.js' }],
    });
    await expect(checkManifestInZip(zipFilePath)).rejects.toThrow(
      'manifest.json not found at the root'
    );
  });

  it('throws if manifest.json is nested', async () => {
    unzipper.Open.file.mockResolvedValue({
      files: [{ type: 'File', path: 'extension/manifest.json' }],
    });
    await expect(checkManifestInZip(zipFilePath)).rejects.toThrow(
      'manifest.json not found at the root'
    );
  });

  it('throws if zipFilePath is missing or invalid', async () => {
    await expect(checkManifestInZip()).rejects.toThrow('zipFilePath must be a non-empty string');
    await expect(checkManifestInZip('')).rejects.toThrow('zipFilePath must be a non-empty string');
    await expect(checkManifestInZip(123)).rejects.toThrow('zipFilePath must be a non-empty string');
  });

  it('throws if the archive cannot be read', async () => {
    unzipper.Open.file.mockRejectedValue(new Error('open fail'));
    await expect(checkManifestInZip(zipFilePath)).rejects.toThrow('open fail');
  });
});
