import path from 'path';

import { fileURLToPath } from 'url';
import { exec as execCb } from 'child_process';
import { promisify } from 'util';
const exec = promisify(execCb);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const executePy = async (filePath, inputPath) => {
  try {
    const { stdout, stderr } = await exec(
      `python3 "${filePath}" < "${inputPath}"`,
    );

    if (stderr) console.warn('Python runtime warning:', stderr);
    return stdout;
  } catch (err) {
    throw new Error(err.stderr || err.message);
  }
};
