import path from 'path';
import fs from 'fs';

import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirOut = path.join(__dirname, '../outputs');

if (!fs.existsSync(dirOut)) {
  fs.mkdirSync(dirOut, { recursive: true });
}

export const executeCpp = async (filePath, inputPath) => {
  const jobId = path.basename(filePath).split('.')[0];
  const outputFileName = `${jobId}.out`;
  const outPath = path.join(dirOut, outputFileName);

  // 1. Compile step
  await new Promise((resolve, reject) => {
    exec(
      `g++ "${filePath}" -o "${outPath}"`,
      { timeout: 3000 }, // compile timeout
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || 'Compilation failed'));
          return;
        }
        resolve();
      },
    );
  });
  // 2. Run step
  return new Promise((resolve, reject) => {
    exec(
      `cd "${dirOut}" && ./"${outputFileName}" < "${inputPath}"`,
      {
        timeout: 5000, // runtime timeout
        maxBuffer: 1024 * 1024, // output limit
      },
      (error, stdout, stderr) => {
        if (error) {
          // Time limit exceeded
          if (error.killed && error.signal === 'SIGTERM') {
            reject(new Error('Execution timed out (possible infinite loop)'));
            return;
          }

          reject(new Error(stderr || error.message));
          return;
        }

        if (stderr) console.warn('Runtime warning:', stderr);
        resolve(stdout);
      },
    );
  });
};
