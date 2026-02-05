import path from 'path';
import fs from 'fs';
import { v4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dirInputs = path.join(__dirname, '../inputs');

if (!fs.existsSync(dirInputs)) {
  fs.mkdirSync(dirInputs, { recursive: true });
}

export const generateInputFile = async (input) => {
  const jobId = v4();
  const inputFileName = `${jobId}.txt`;
  const inputFilePath = path.join(dirInputs, inputFileName);

  const content = input ? input.toString() : '';
  await fs.writeFileSync(inputFilePath, content);

  return inputFilePath;
};
