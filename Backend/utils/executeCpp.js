import path from 'path';
import { fileURLToPath } from 'url';
import { exec as execCb } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';

const exec = promisify(execCb);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dirOut = path.join(__dirname, '../outputs');

export const executeCpp = async (filePath, inputPath, timeLimit) => {
  // Ensure output directory exists
  await fs.mkdir(dirOut, { recursive: true });

  const jobId = path.basename(filePath).split('.')[0];
  const outputFileName = `${jobId}.out`;
  const outPath = path.join(dirOut, outputFileName);

  // Compile step
  try {
    await exec(`g++ "${filePath}" -o "${outPath}"`, {
      timeout: timeLimit,
    });
  } catch (error) {
    throw new Error(error.stderr || 'Compilation failed');
  }

  // Run step
  try {
    const result = await new Promise((resolve, reject) => {
      exec(
        `"${outPath}" < "${inputPath}"`,
        {
          timeout: timeLimit,
          maxBuffer: 1024 * 1024,
        },
        (error, stdout, stderr) => {
          if (error) {
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

    return result;
  } catch (err) {
    throw err;
  }
  // } finally {
  //   if (fs.existsSync(outPath)) {
  //     fs.unlinkSync(outPath);
  //   }
  // }
};
