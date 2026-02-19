import AppError from '../utils/appError.js';
import TestCases from '../models/testCaseModel.js';
import { judgeService } from '../utils/judgeService.js';
import aiCodeReview from '../utils/aiCodeReview.js';
import Problems from '../models/problemModel.js';

export const submitCode = async (req, res, next) => {
  const { language, code, problemId } = req.body;
  if (code == undefined || code.trim() === '') {
    return next(new AppError('Please add the code.', 400));
  }
  try {
    const testCase = await TestCases.find({ problemId }).sort({
      executionNum: 1,
    });
    const problem = await Problems.findById(problemId);
    if (!problem) {
      return next(new AppError('Problem not found.', 404));
    }

    if (!testCase.length) {
      return next(new AppError('No test cases found for this problem.', 404));
    }

    let result = await judgeService({
      language,
      code,
      testCases: testCase,
      customInput: '',
      problem,
      mode: 'submit',
      timeLimit: problem.timeLimit,
    });

    res.status(200).json({
      verdict: result.verdict,
      results: result.results,
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};
export const runCode = async (req, res, next) => {
  const { language, code, problemId, customInput } = req.body;
  if (code == undefined || code.trim() === '') {
    return next(new AppError('Please add the code.', 400));
  }
  try {
    const problem = await Problems.findById(problemId);
    const testCase = await TestCases.find({ visibility: true, problemId }).sort(
      { executionNum: 1 },
    );

    if (!problem) {
      return next(new AppError('Problem not found.', 404));
    }

    // If there are no visible sample testcases, allow run only when custom input is provided.
    if (!testCase.length && (!customInput || customInput.trim() === '')) {
      return next(new AppError('No sample test cases found.', 404));
    }
    let result = await judgeService({
      language,
      code,
      testCases: testCase,
      customInput,
      problem,
      mode: 'run',
      timeLimit: problem.timeLimit,
    });

    res.status(200).json({
      verdict: result.verdict,
      results: result.results,
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

export const aiReview = async (req, res, next) => {
  const { code } = req.body;
  if (code == undefined || code.trim() === '') {
    return next(new AppError('Please add the code.', 400));
  }
  try {
    const review = await aiCodeReview(code);
    return res.status(200).json({
      success: true,
      review,
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};
export const getSubmission = async (req, res, next) => {};
export const getUserSubmissions = async (req, res, next) => {};
export const getProblemSubmissions = async (req, res, next) => {};
