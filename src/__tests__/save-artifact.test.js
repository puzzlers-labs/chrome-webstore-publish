/**
 * This file contains tests for the saveArtifact utility.
 * It verifies correct saving of files as artifacts, permission setting, and error handling.
 * The tests cover directory creation, file copying, permission setting, and output writing.
 */

import fs from 'fs';
import path from 'path';
import saveArtifact from '#src/save-artifact.js';

jest.mock('fs');

/**
 * Test suite for saveArtifact
 * Sets up mocks for file system, then tests artifact saving and error handling
 */
describe('saveArtifact', () => {
  const sourceFilePath = '/tmp/source.txt';
  const outputEnv = '/tmp/github_output';
  const artifactDir = path.resolve('chrome-webstore-publish-artifacts');
  const fileName = path.basename(sourceFilePath);
  const destPath = path.join(artifactDir, fileName);

  // Clears all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Throws if sourceFilePath is missing or invalid
  it('throws if sourceFilePath is missing or invalid', () => {
    expect(() => saveArtifact()).toThrow(
      'sourceFilePath is required and must be a non-empty string'
    );
    expect(() => saveArtifact('')).toThrow(
      'sourceFilePath is required and must be a non-empty string'
    );
    expect(() => saveArtifact(123)).toThrow(
      'sourceFilePath is required and must be a non-empty string'
    );
  });

  // Creates artifact directory if it does not exist
  it('creates artifact directory if it does not exist', () => {
    fs.existsSync.mockReturnValueOnce(false);
    fs.copyFileSync.mockImplementation(() => {});
    fs.chmodSync.mockImplementation(() => {});
    fs.mkdirSync.mockImplementation(() => {});
    const result = saveArtifact(sourceFilePath);
    expect(fs.mkdirSync).toHaveBeenCalledWith(artifactDir, { recursive: true });
    expect(result).toBe(`chrome-webstore-publish-artifacts/${fileName}`);
  });

  // Does not create artifact directory if it exists
  it('does not create artifact directory if it exists', () => {
    fs.existsSync.mockReturnValue(true);
    fs.copyFileSync.mockImplementation(() => {});
    fs.chmodSync.mockImplementation(() => {});
    const result = saveArtifact(sourceFilePath);
    expect(fs.mkdirSync).not.toHaveBeenCalled();
    expect(result).toBe(`chrome-webstore-publish-artifacts/${fileName}`);
  });

  // Copies file and sets permissions
  it('copies file and sets permissions', () => {
    fs.existsSync.mockReturnValue(true);
    fs.copyFileSync.mockImplementation(() => {});
    fs.chmodSync.mockImplementation(() => {});
    saveArtifact(sourceFilePath);
    expect(fs.copyFileSync).toHaveBeenCalledWith(sourceFilePath, destPath);
    expect(fs.chmodSync).toHaveBeenCalledWith(destPath, 0o666);
  });

  // Writes artifact path to outputEnv if provided
  it('writes artifact path to outputEnv if provided', () => {
    fs.existsSync.mockReturnValue(true);
    fs.copyFileSync.mockImplementation(() => {});
    fs.chmodSync.mockImplementation(() => {});
    fs.appendFileSync.mockImplementation(() => {});
    saveArtifact(sourceFilePath, outputEnv);
    expect(fs.appendFileSync).toHaveBeenCalledWith(
      outputEnv,
      `package-artifact-path=chrome-webstore-publish-artifacts/${fileName}\n`
    );
  });
});
