import { generateFile } from './generateFile.js';
import { generateInputFile } from './generateInputFile.js';
import { executeCpp } from './executeCpp.js';
import { executeJs } from './executeJs.js';
import { executePy } from './executePy.js';

import path from 'path';

export const compilerService = async (language, code, input = '') => {
  const ALLOWED_LANGUAGES = ['cpp', 'python', 'javascript', 'js'];

  // helpers --------------------------------------------------------------
  const sanitizeError = (msg) => {
    if (typeof msg !== 'string') return msg;
    // strip any absolute paths to code files so we don't leak container details
    return msg.replace(/\/[\w\-\/\.]+?\.(cpp|py|cjs)/g, (match) => {
      return path.basename(match);
    });
  };

  const detectLanguageMismatch = (lang, src) => {
    // very lightweight heuristics to catch obvious mismatches
    if (lang === 'cpp') {
      // python-style definitions or imports are almost never valid C++
      if (/\bdef\b/.test(src) || /\bimport\s+/.test(src)) {
        throw new Error(
          'Code does not appear to be valid C++ for the selected language.',
        );
      }
    } else if (lang === 'python') {
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
  // ---------------------------------------------------------------------

  if (!ALLOWED_LANGUAGES.includes(language)) {
    throw new Error('Unsupported language');
  }

  if (typeof code !== 'string' || code.trim() === '') {
    throw new Error('Invalid code');
  }

  if (input !== undefined && typeof input !== 'string') {
    throw new Error('Invalid input');
  }

  // quick sanity check to avoid accidentally compiling python as cpp, etc.
  detectLanguageMismatch(language, code);

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
      error: sanitizeError(err.message),
    };
  }
};
