import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { exec as execCb } from 'child_process';
import { promisify } from 'util';
const exec = promisify(execCb);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirOut = path.join(__dirname, '../outputs');
if (!fs.existsSync(dirOut)) fs.mkdirSync(dirOut, { recursive: true });

export const executePy = async (filePath) => {
  const jobId = path.basename(filePath).split('.')[0];
  const outputFileName = `${jobId}.out`;
  const outPath = path.join(dirOut, outputFileName);

  try {
    const { stdout, stderr } = await exec(`python3 "${filePath}"`);

    if (stderr) console.warn('Python runtime warning:', stderr);

    fs.writeFileSync(outPath, stdout);

    return stdout;
  } catch (err) {
    throw new Error(err.stderr || err.message);
  }
};
