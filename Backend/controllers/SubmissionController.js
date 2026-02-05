import AppError from '../utils/appError.js';
import TestCases from '../models/testCaseModel.js';
import { judgeService } from '../utils/judgeService.js';

export const submitCode = async (req, res, next) => {
  const { language, code, problemId } = req.body;
  if (code == undefined) {
    return next(new AppError('Please add the code.', 400));
  }
  try {
    const testCase = await TestCases.find({ problemId }).sort({
      executionNum: 1,
    });
    let result = await judgeService(language, code, testCase);
    res.status(200).json({
      verdict: result.verdict,
      testResults: result.results.map((r) => r.status),
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};
export const runCode = async (req, res, next) => {
  const { language, code, problemId } = req.body;
  if (code == undefined) {
    return next(new AppError('Please add the code.', 400));
  }
  try {
    const testCase = await TestCases.find({ visibility: true, problemId }).sort(
      { executionNum: 1 },
    );

    if (!testCase.length) {
      return next(new AppError('No sample test cases found.', 404));
    }
    let result = await judgeService(language, code, testCase);
    res.status(200).json({
      results: result.results,
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};
export const getSubmission = async (req, res, next) => {};
export const getUserSubmissions = async (req, res, next) => {};
export const getProblemSubmissions = async (req, res, next) => {};
