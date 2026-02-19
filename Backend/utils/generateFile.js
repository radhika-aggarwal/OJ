import path from 'path';
import fs from 'fs/promises';
import { v4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dirCodes = path.join(__dirname, '../codes');

export const generateFile = async (language, code) => {
  // Ensure folder exists
  await fs.mkdir(dirCodes, { recursive: true });

  const jobId = v4();
  let extension;

  if (language === 'cpp') {
    extension = 'cpp';
  } else if (language === 'python') {
    extension = 'py';
  } else if (language === 'javascript' || language === 'js') {
    extension = 'cjs';
  } else {
    throw new Error(`Unsupported language: ${language}`);
  }

  const fileName = `${jobId}.${extension}`;
  const filePath = path.join(dirCodes, fileName);

  await fs.writeFile(filePath, code);
  return filePath;
};
