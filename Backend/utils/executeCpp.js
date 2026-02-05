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

  return new Promise((resolve, reject) => {
    const compile = `g++ "${filePath}" -o "${outPath}"`;
    const run = `cd "${dirOut}" && ./"${outputFileName}" < "${inputPath}"`;
    const command = `${compile} && ${run}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('EXEC ERROR:', error.message);
        reject(new Error(stderr || error.message));
        return;
      }
      if (stderr) {
        console.warn('STDERR:', stderr);
      }

      resolve(stdout);
    });
  });
};
