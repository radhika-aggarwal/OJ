import { generateFile } from './generateFile.js';
import { generateInputFile } from './generateInputFile.js';
import { executeCpp } from './executeCpp.js';
import { executeJs } from './executeJs.js';
import { executePy } from './executePy.js';

export const compilerService = async (language, code, input = '') => {
  try {
    const filePath = await generateFile(language, code);
    const inputFilePath = await generateInputFile(input);

    let output;

    if (language === 'cpp') {
      output = await executeCpp(filePath, inputFilePath);
    } else if (language === 'python') {
      output = await executePy(filePath, inputFilePath);
    } else if (language === 'javascript' || language === 'js') {
      output = await executeJs(filePath, inputFilePath);
    } else {
      throw new Error('Unsupported language');
    }

    return {
      output: output.trim(),
      error: null,
    };
  } catch (err) {
    return {
      output: '',
      error: err.message,
    };
  }
};
