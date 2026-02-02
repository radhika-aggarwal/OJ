import path from 'path';
import fs from 'fs';
import { v4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dirCodes = path.join(__dirname, '../codes');
if (!fs.existsSync(dirCodes)) {
  fs.mkdirSync(dirCodes, { recursive: true });
}

export const generateFile = (language, code) => {
  const jobId = v4();
  let extension;
  if (language === 'cpp') extension = 'cpp';
  else if (language === 'python') extension = 'py';
  else if (language === 'javascript') extension = 'js';
  else throw new Error('Unsupported language');
  const fileName = `${jobId}.${extension}`;
  const filePath = path.join(dirCodes, fileName);
  fs.writeFileSync(filePath, code);
  return filePath;
};
