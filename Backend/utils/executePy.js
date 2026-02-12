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
      {
        timeout: 5000, //5 seconds
        maxBuffer: 1024 * 1024, // 1MB output limit
      },
    );

    if (stderr) console.warn('Python runtime warning:', stderr);
    return stdout;
  } catch (err) {
    if (err.killed && err.signal === 'SIGTERM') {
      throw new Error('Execution timed out (possible infinite loop)');
    }
    throw new Error(err.stderr || err.message);
  }
};
