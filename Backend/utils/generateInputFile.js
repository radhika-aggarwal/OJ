import path from 'path';
import fs from 'fs/promises';
import { v4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dirInputs = path.join(__dirname, '../inputs');

export const generateInputFile = async (input) => {
  // Ensure directory exists
  await fs.mkdir(dirInputs, { recursive: true });

  const jobId = v4();
  const inputFileName = `${jobId}.txt`;
  const inputFilePath = path.join(dirInputs, inputFileName);

  const content = input ? input.toString() : '';
  await fs.writeFile(inputFilePath, content);

  return inputFilePath;
};
