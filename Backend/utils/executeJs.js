import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { exec as execCb } from 'child_process';
import { promisify } from 'util';
const exec = promisify(execCb);

export const executeJs = async (filePath, inputPath) => {
  try {
    const { stdout, stderr } = await exec(
      `node "${filePath}" < "${inputPath}"`,
    );

    if (stderr) console.warn('JS runtime warning:', stderr);
    return stdout;
  } catch (err) {
    throw new Error(err.stderr || err.message);
  }
};
