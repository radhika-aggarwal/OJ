import { generateFile } from './generateFile.js'; 
import { generateInputFile } from './generateInputFile.js'; 
import { executeCpp } from './executeCpp.js';
import { executeJs } from './executeJs.js';
import { executePy } from './executePy.js';

export const judgeService = async (language, code, testCases) => {
  try {
    const filePath = await generateFile(language, code);

    const results = [];
    let finalVerdict = 'Accepted';

    for (const tc of testCases) {
      const input = tc.stdin || tc.input || '';
      const expectedOutput = tc.stdout || tc.expected || '';

      const inputFilePath = await generateInputFile(input);

      let output;
      try {
        if (language === 'cpp') {
          output = await executeCpp(filePath, inputFilePath);
        } else if (language === 'python') {
          output = await executePy(filePath, inputFilePath);
        } else if (language === 'javascript' || language === 'js') {
          output = await executeJs(filePath, inputFilePath);
        }

        const cleanOutput = output ? output.trim() : '';
        const cleanExpected = expectedOutput ? expectedOutput.trim() : '';

        let status = 'Accepted';
        if (cleanOutput !== cleanExpected) {
          status = 'Wrong Answer';
          if (finalVerdict === 'Accepted') finalVerdict = 'Wrong Answer';
        }

        results.push({
          status,
          input,
          output: cleanOutput,
          expected: cleanExpected,
        });
      } catch (err) {
        finalVerdict = 'Runtime Error';
        results.push({
          status: 'Runtime Error',
          input,
          output: err.message,
          expected: expectedOutput,
        });
      }
    }

    return { verdict: finalVerdict, results };
  } catch (err) {
    throw err;
  }
};
