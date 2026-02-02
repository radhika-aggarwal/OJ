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

export const executeCpp = async (filePath) => {
  const jobId = path.basename(filePath).split('.')[0];
  const outputFileName = `${jobId}.out`;
  const outPath = path.join(dirOut, outputFileName);

  return new Promise((resolve, reject) => {
    exec(
      `g++ ${filePath} -o ${outPath} && cd ${dirOut} && ./${outputFileName}`,
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
          return;
        }
        if (stderr) {
          reject(new Error(stderr));
          return;
        }
        resolve(stdout);
      },
    );
  });
};
