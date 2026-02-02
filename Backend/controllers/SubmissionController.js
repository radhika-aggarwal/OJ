import AppError from '../utils/appError.js';
import { generateFile } from '../utils/generateFile.js';
import { executeCpp } from '../utils/executeCpp.js';
import { executeJs } from '../utils/executeJs.js';
import { executePy } from '../utils/executePy.js';

export const submitCode = async (req, res, next) => {
  const { language, code } = req.body;
  if (code == undefined) {
    return next(new AppError('Please add the code.', 400));
  }
  try {
    const filePath = generateFile(language, code);
    let output;
    if (language === 'cpp') output = await executeCpp(filePath);
    else if (language === 'python') output = await executePy(filePath);
    else output = await executeJs(filePath);
    res.status(200).json({ output });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};
export const runCode = async (req, res, next) => {};
export const getSubmission = async (req, res, next) => {};
export const getUserSubmissions = async (req, res, next) => {};
export const getProblemSubmissions = async (req, res, next) => {};
