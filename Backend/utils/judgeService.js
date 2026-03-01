import { generateFile } from './generateFile.js';
import { generateInputFile } from './generateInputFile.js';
import { executeCpp } from './executeCpp.js';
import { executeJs } from './executeJs.js';
import { executePy } from './executePy.js';
import { promises as fs } from 'fs';
import path from 'path';

const executeByLanguage = async (
  language,
  filePath,
  inputFilePath,
  timeLimit,
) => {
  const lang = language.toLowerCase();
  if (lang === 'cpp' || lang === 'c++') {
    return await executeCpp(filePath, inputFilePath, timeLimit);
  } else if (lang === 'python' || lang === 'py') {
    return await executePy(filePath, inputFilePath, timeLimit);
  } else if (lang === 'javascript' || lang === 'js') {
    return await executeJs(filePath, inputFilePath, timeLimit);
  }
};

export const judgeService = async ({
  language,
  code,
  testCases = [],
  customInput = '',
  problem,
  mode,
  timeLimit,
}) => {
  const sanitizeError = (msg) => {
    if (typeof msg !== 'string') return msg;
    return msg.replace(/\/[\w\-\/\.]+?\.(cpp|py|cjs|js)/g, (m) =>
      path.basename(m),
    );
  };

  const detectLanguageMismatch = (lang, src) => {
    if (lang === 'cpp' || lang === 'c++') {
      if (/\bdef\b/.test(src) || /\bimport\s+/.test(src)) {
        throw new Error(
          'Code does not appear to be valid C++ for the selected language.',
        );
      }
    } else if (lang === 'python' || lang === 'py') {
      if (
        /\b#include\b/.test(src) ||
        /std::/.test(src) ||
        /int\s+main\s*\(/.test(src)
      ) {
        throw new Error(
          'Code does not appear to be valid Python for the selected language.',
        );
      }
    } else if (lang === 'javascript' || lang === 'js') {
      if (/\b#include\b/.test(src) || /std::/.test(src) || /def\b/.test(src)) {
        throw new Error(
          'Code does not appear to be valid JavaScript for the selected language.',
        );
      }
    }
  };

  let userFilePath;
  const filesToCleanup = [];

  try {
    detectLanguageMismatch(language, code);
    userFilePath = await generateFile(language, code);
    filesToCleanup.push(userFilePath);

    // CUSTOM INPUT MODE
    if (mode === 'run' && customInput.trim() !== '') {
      const processedCustomInput = customInput.replace(/\\n/g, '\n');

      // Always use C++ reference solution for expected output
      const refSolution = problem?.referenceSolutions?.find(
        (sol) => sol.language.toLowerCase() === 'cpp',
      );

      // If no reference solution exists, just run user code without comparison
      if (!refSolution) {
        let userOut = '';
        let userError = null;
        try {
          const inPath = await generateInputFile(processedCustomInput);
          filesToCleanup.push(inPath);
          userOut = await executeByLanguage(
            language,
            userFilePath,
            inPath,
            timeLimit,
          );
        } catch (e) {
          userError = e.message || String(e);
        }
        return {
          verdict: userError ? 'Runtime Error' : 'Executed',
          results: [
            {
              input: processedCustomInput,
              output: (userOut || '').trim(),
              expected: null,
              error: userError,
              status: userError ? 'Runtime Error' : 'Executed',
              note: 'No C++ reference solution available for this problem.',
            },
          ],
        };
      }

      // Run both reference (C++) and user code
      const runBoth = async (inputStr) => {
        const inPath = await generateInputFile(inputStr);
        filesToCleanup.push(inPath);
        let refOut = '';
        let userOut = '';
        let refError = null;
        let userError = null;

        // ALWAYS run reference solution as C++
        try {
          const refPath = await generateFile('cpp', refSolution.code);
          filesToCleanup.push(refPath);
          refOut = await executeByLanguage('cpp', refPath, inPath, timeLimit);
        } catch (e) {
          refError = e.message || String(e);
          console.warn('judgeService: reference run failed:', refError);
        }

        // Run user code in their selected language
        try {
          userOut = await executeByLanguage(
            language,
            userFilePath,
            inPath,
            timeLimit,
          );
        } catch (e) {
          userError = e.message || String(e);
          console.warn('judgeService: user run failed:', userError);
        }

        return { rawUser: userOut, rawRef: refOut, userError, refError };
      };

      try {
        let { rawUser, rawRef, userError, refError } =
          await runBoth(processedCustomInput);

        let cleanUserOutput = (rawUser || '').trim().replace(/\r\n/g, '\n');
        let cleanRefOutput = (rawRef || '').trim().replace(/\r\n/g, '\n');

        // If user code had a runtime error
        if (userError) {
          return {
            verdict: 'Runtime Error',
            results: [
              {
                input: processedCustomInput,
                output: cleanUserOutput || null,
                expected: cleanRefOutput || null,
                error: userError,
                status: 'Runtime Error',
                refError: refError || null,
              },
            ],
          };
        }

        // If reference failed or produced no output, we cannot verify
        if (refError || cleanRefOutput === '') {
          return {
            verdict: 'Unverified',
            results: [
              {
                input: processedCustomInput,
                output: cleanUserOutput,
                expected: null,
                status: 'Unverified',
                refError:
                  refError ||
                  'Reference solution produced no output for this input.',
                note: 'Could not generate expected output. Your code ran successfully but correctness cannot be verified. The input format may not match what the reference solution expects.',
              },
            ],
          };
        }

        // Both ran successfully - compare outputs
        const inputCompact = processedCustomInput.replace(/\s+/g, ' ').trim();
        const userCompact = cleanUserOutput.replace(/\s+/g, ' ').trim();
        const echoedInputHint = userCompact === inputCompact;

        let status;
        if (cleanUserOutput === cleanRefOutput) {
          status = 'Accepted';
        } else {
          status = 'Wrong Answer';
        }

        return {
          verdict: status,
          results: [
            {
              input: processedCustomInput,
              output: cleanUserOutput,
              expected: cleanRefOutput,
              status,
              hint: echoedInputHint
                ? 'Your program appears to echo the input. Check your algorithm.'
                : undefined,
            },
          ],
        };
      } catch (err) {
        return {
          verdict: 'Runtime Error',
          results: [
            {
              input: processedCustomInput,
              error: sanitizeError(err.message),
              status: 'Runtime Error',
            },
          ],
        };
      }
    }

    // SUBMIT MODE (run against DB test cases)
    const results = [];
    let hasRuntimeError = false;
    let hasWrongAnswer = false;

    for (const tc of testCases) {
      const input = tc.stdin || tc.input || '';
      const expectedOutput = tc.stdout || tc.expected || '';
      const processedInput = input.replace(/\\n/g, '\n');

      const tcInputFilePath = await generateInputFile(processedInput);
      filesToCleanup.push(tcInputFilePath);

      try {
        const output = await executeByLanguage(
          language,
          userFilePath,
          tcInputFilePath,
          timeLimit,
        );

        const cleanOutput = output ? output.trim() : '';
        const cleanExpected = expectedOutput
          ? expectedOutput.trim().replace(/\\n/g, '\n')
          : '';

        let status = 'Accepted';
        if (cleanOutput !== cleanExpected) {
          status = 'Wrong Answer';
          hasWrongAnswer = true;
        }

        results.push({
          status,
          input: processedInput,
          output: cleanOutput,
          expected: cleanExpected,
        });
      } catch (err) {
        hasRuntimeError = true;
        results.push({
          status: 'Runtime Error',
          input: processedInput,
          error: sanitizeError(err.message),
        });
      }
    }

    let finalVerdict = 'Accepted';
    if (hasRuntimeError) {
      finalVerdict = 'Runtime Error';
    } else if (hasWrongAnswer) {
      finalVerdict = 'Wrong Answer';
    }

    return { verdict: finalVerdict, results };
  } catch (err) {
    console.warn('judgeService failed:', err.message);
    return {
      verdict: 'Error',
      results: [{ error: sanitizeError(err.message) }],
    };
  } finally {
    for (const file of filesToCleanup) {
      if (file) await fs.unlink(file).catch(() => {});
    }
  }
};
