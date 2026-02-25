import { generateFile } from './generateFile.js';
import { generateInputFile } from './generateInputFile.js';
import { executeCpp } from './executeCpp.js';
import { executeJs } from './executeJs.js';
import { executePy } from './executePy.js';
import { promises as fs } from 'fs';

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
  let userFilePath;
  let inputFilePath;
  let refFilePath;
  const filesToCleanup = [];
  try {
    userFilePath = await generateFile(language, code);
    filesToCleanup.push(userFilePath);

    // CUSTOM INPUT MODE
    if (mode === 'run' && customInput.trim() !== '') {
      const processedCustomInput = customInput.replace(/\\n/g, '\n');

      // Normalize language for matching
      const normalizeLang = (lang) => {
        lang = lang.toLowerCase();
        if (lang === 'c++') return 'cpp';
        if (lang === 'py') return 'python';
        if (lang === 'js') return 'javascript';
        return lang;
      };
      const refSolution = problem.referenceSolutions?.find(
        (sol) => normalizeLang(sol.language) === normalizeLang(language),
      );

      // If no reference, still run user code and show output/error
      if (!refSolution) {
        let userOut = '',
          userError = null;
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
          verdict: userError ? 'Runtime Error' : 'Accepted',
          results: [
            {
              input: processedCustomInput,
              output: userOut,
              error: userError,
              status: userError ? 'Runtime Error' : 'Accepted',
            },
          ],
        };
      }

      // Helper to run reference first (so we always get expected), then user.
      // Returns raw outputs and any errors encountered.
      const runBoth = async (inputStr) => {
        const inPath = await generateInputFile(inputStr);
        filesToCleanup.push(inPath);
        let refOut = '';
        let userOut = '';
        let refError = null;
        let userError = null;

        try {
          const refPath = await generateFile(language, refSolution.code);
          filesToCleanup.push(refPath);
          refOut = await executeByLanguage(
            language,
            refPath,
            inPath,
            timeLimit,
          );
        } catch (e) {
          refError = e.message || String(e);
          console.warn('judgeService: reference run failed:', refError);
        }

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
        // First attempt: use the custom input as provided
        let { rawUser, rawRef, userError, refError } =
          await runBoth(processedCustomInput);

        let cleanUserOutput = (rawUser || '').trim().replace(/\r\n/g, '\n');
        let cleanRefOutput = (rawRef || '').trim().replace(/\r\n/g, '\n');

        // Output normalization: Only apply if problem requires (currently always on)
        // To disable, comment out this block
        const firstToken =
          (processedCustomInput.split('\n')[0] || '').trim().split(/\s+/)[0] ||
          '';
        let normalizedUserOutput = cleanUserOutput;
        if (
          /^\d+$/.test(firstToken) &&
          normalizedUserOutput.startsWith(firstToken)
        ) {
          normalizedUserOutput = normalizedUserOutput
            .replace(new RegExp('^' + firstToken + '\s*'), '')
            .trim();
        }

        // Detect if user output simply echoes input (helpful hint)
        const inputCompact = processedCustomInput.replace(/\s+/g, ' ').trim();
        const userCompact = cleanUserOutput.replace(/\s+/g, ' ').trim();
        const echoedInputHint = userCompact === inputCompact;

        // If reference produced no output but user did, try a common fallback:
        // convert a single-token string like "hiii" into "4 h i i i" (n followed by chars)
        const shouldTryCharArrayFallback =
          (!cleanRefOutput || cleanRefOutput === '') &&
          cleanUserOutput &&
          cleanUserOutput !== '';

        if (shouldTryCharArrayFallback) {
          const singleLine = processedCustomInput.split('\n')[0] || '';
          const isSingleToken =
            singleLine.trim().indexOf(' ') === -1 && singleLine.length > 0;
          if (isSingleToken) {
            const chars = singleLine.split('');
            const transformed = `${chars.length} ${chars.join(' ')}`;
            try {
              const retry = await runBoth(transformed);

              const retryUser = (retry.rawUser || '')
                .trim()
                .replace(/\r\n/g, '\n');
              const retryRef = (retry.rawRef || '')
                .trim()
                .replace(/\r\n/g, '\n');

              // If retry produced a reference output, use retry results
              if (retryRef && retryRef !== '') {
                rawUser = retry.rawUser;
                rawRef = retry.rawRef;
                cleanUserOutput = retryUser;
                cleanRefOutput = retryRef;
                return {
                  verdict:
                    cleanUserOutput === cleanRefOutput
                      ? 'Accepted'
                      : 'Wrong Answer',
                  results: [
                    {
                      input: transformed,
                      output: cleanUserOutput,
                      expected: cleanRefOutput,
                      rawUserOutput: rawUser,
                      rawRefOutput: rawRef,
                      status:
                        cleanUserOutput === cleanRefOutput
                          ? 'Accepted'
                          : 'Wrong Answer',
                    },
                  ],
                };
              }
            } catch (err) {
              console.warn('judgeService: fallback retry failed:', err.message);
            }
          }
        }

        let status = 'Accepted';

        if (normalizedUserOutput !== cleanRefOutput) {
          status = 'Wrong Answer';
        }

        return {
          verdict: status,
          results: [
            {
              input: processedCustomInput,
              output: cleanUserOutput,
              expected: cleanRefOutput,
              rawUserOutput: rawUser,
              rawRefOutput: rawRef,
              normalizedOutput: normalizedUserOutput,
              hint: echoedInputHint
                ? 'Your program appears to echo the input. Check your algorithm.'
                : undefined,
              status,
              userError,
              refError,
            },
          ],
        };
      } catch (err) {
        return {
          verdict: 'Runtime Error',
          results: [
            {
              input: processedCustomInput,
              error: err.message,
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

      // Handle escaped newlines in test case input
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

        // Normalize as above: if test input starts with a number, strip it from user output for comparison
        const firstTokenTc =
          (processedInput.split('\n')[0] || '').trim().split(/\s+/)[0] || '';
        let normalizedTcOutput = cleanOutput;
        if (
          /^\d+$/.test(firstTokenTc) &&
          normalizedTcOutput.startsWith(firstTokenTc) &&
          normalizedTcOutput !== firstTokenTc
        ) {
          normalizedTcOutput = normalizedTcOutput
            .replace(new RegExp('^' + firstTokenTc + '\\s*'), '')
            .trim();
        }

        const inputCompactTc = processedInput.replace(/\s+/g, ' ').trim();
        const userCompactTc = cleanOutput.replace(/\s+/g, ' ').trim();
        const echoedHintTc = userCompactTc === inputCompactTc;

        let status = 'Accepted';
        if (normalizedTcOutput !== cleanExpected) {
          status = 'Wrong Answer';
          hasWrongAnswer = true;
        }

        results.push({
          status,
          input: processedInput,
          output: cleanOutput,
          expected: cleanExpected,
          normalizedOutput: normalizedTcOutput,
          hint: echoedHintTc
            ? 'Your program appears to echo the input. Check your logic.'
            : undefined,
        });
      } catch (err) {
        hasRuntimeError = true;
        results.push({
          status: 'Runtime Error',
          input: processedInput,
          error: err.message,
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
    console.warn('failed:', err.message);
    return {
      verdict: 'Error',
      results: [],
    };
  } finally {
    try {
      for (const file of filesToCleanup) {
        if (file) await fs.unlink(file).catch(() => {});
      }
    } catch (err) {
      console.warn('Cleanup failed:', err.message);
    }
  }
};
