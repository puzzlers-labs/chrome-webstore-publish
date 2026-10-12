/**
 * Tests that extractZip writes every entry of a multi-file archive.
 * The fixture is larger than the archive size at which streaming Extract
 * starts dropping files.
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import extractZip from '#src/extract-zip.js';

describe('extractZip', () => {
  let sourceDir;
  let zipPath;

  beforeAll(() => {
    sourceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'extract-src-'));
    fs.writeFileSync(path.join(sourceDir, 'manifest.json'), '{"manifest_version":3}\n');
    for (let index = 0; index < 40; index += 1) {
      const folder = path.join(sourceDir, `dir-${index % 5}`);
      fs.mkdirSync(folder, { recursive: true });
      fs.writeFileSync(path.join(folder, `file-${index}.js`), `console.log(${index});\n`);
    }
    zipPath = `${sourceDir}.zip`;
    execFileSync('zip', ['-qr', zipPath, '.'], { cwd: sourceDir });
  });

  afterAll(() => {
    fs.rmSync(sourceDir, { recursive: true, force: true });
    fs.rmSync(zipPath, { force: true });
  });

  it('extracts every file from an archive large enough to break streaming extract', async () => {
    const destination = await extractZip(zipPath);
    expect(fs.readFileSync(path.join(destination, 'manifest.json'), 'utf8')).toBe(
      '{"manifest_version":3}\n'
    );
    for (let index = 0; index < 40; index += 1) {
      const filePath = path.join(destination, `dir-${index % 5}`, `file-${index}.js`);
      expect(fs.existsSync(filePath)).toBe(true);
    }
    fs.rmSync(destination, { recursive: true, force: true });
  });

  it('throws when the zip path is empty', async () => {
    await expect(extractZip('')).rejects.toThrow('zipFilePath must be a non-empty string');
  });
});
