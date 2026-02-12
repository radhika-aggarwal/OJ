import { exec as execCb } from 'child_process';

import { promisify } from 'util';
const exec = promisify(execCb);

export const executeJs = async (filePath, inputPath) => {
  try {
    const { stdout, stderr } = await exec(
      `node "${filePath}" < "${inputPath}"`,
      {
        timeout: 5000, //  5 seconds
        maxBuffer: 1024 * 1024, // 1MB output limit
      },
    );

    if (stderr) console.warn('JS runtime warning:', stderr);
    return stdout;
  } catch (err) {
    if (err.killed && err.signal === 'SIGTERM') {
      throw new Error('Execution timed out (possible infinite loop)');
    }
    throw new Error(err.stderr || err.message);
  }
};
