import { exec as execCb } from 'child_process';
import path from 'path';
import { promisify } from 'util';
const exec = promisify(execCb);

export const executeJs = async (filePath, inputPath, timeLimit) => {
  try {
    const { stdout, stderr } = await exec(
      `node "${filePath}" < "${inputPath}"`,
      {
        timeout: timeLimit, //  5 seconds
        maxBuffer: 1024 * 1024, // 1MB output limit
      },
    );

    if (stderr) console.warn('JS runtime warning:', stderr);
    return stdout;
  } catch (err) {
    if (err.killed && err.signal === 'SIGTERM') {
      throw new Error('Execution timed out (possible infinite loop)');
    }
    const msg = (err.stderr || err.message || '').replace(
      /\/[\w\-\/\.]+?\.(js|cjs|py|cpp)/g,
      (m) => path.basename(m),
    );
    throw new Error(msg);
  }
};
