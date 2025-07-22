/**
 * This file provides a utility function to save a file as an artifact for GitHub Actions.
 * It copies the file to a designated directory, sets permissions, and writes the output path if needed.
 * Intended for use with signed packages or build artifacts.
 */

import fs from 'fs';
import path from 'path';

/**
 * Saves a file as an artifact in a specified directory and sets permissions.
 * Optionally writes the artifact path to a GitHub Actions environment file.
 * @param {string} sourceFilePath - Path to the file to save as an artifact.
 * @param {string} [outputEnv] - Path to the GitHub Actions environment file (optional).
 * @returns {string} - The destination path of the saved artifact.
 */
export default function saveArtifact(sourceFilePath, outputEnv) {
  // Validate required arguments
  if (!sourceFilePath || typeof sourceFilePath !== 'string' || !sourceFilePath.trim()) {
    console.error('sourceFilePath is required and must be a non-empty string');
    throw new Error('sourceFilePath is required and must be a non-empty string');
  }

  const actionDirectory = 'chrome-webstore-publish-artifacts';
  const artifactDir = path.resolve(actionDirectory);

  // Creates the artifact directory if it doesn't exist.
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  // Prepares the destination path for the artifact and copy the file to it.
  const fileName = path.basename(sourceFilePath);
  const destPath = path.join(artifactDir, fileName);
  fs.copyFileSync(sourceFilePath, destPath);

  // Sets the file permissions to read/write for all users (not execute).
  fs.chmodSync(destPath, 0o666);

  // Writes the artifact path to the GitHub Actions environment file if provided.
  if (outputEnv) {
    fs.appendFileSync(outputEnv, `package-artifact-path=${actionDirectory}/${fileName}\n`);
  }

  return `${actionDirectory}/${fileName}`;
}
