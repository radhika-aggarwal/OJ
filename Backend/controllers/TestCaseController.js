// controllers/TestCaseController.js
import AppError from '../utils/appError.js';
import TestCase from '../models/testCaseModel.js';
import Problem from '../models/problemModel.js';

export const createTestCase = async (req, res, next) => {
  try {
    const { problemId, stdin, stdout, visibility, executionNum } = req.body;

    if (!problemId || !stdin || !stdout) {
      return next(
        new AppError('problemId, stdin, and stdout are required', 400),
      );
    }

    const problem = await Problem.findById(problemId);
    if (!problem) return next(new AppError('Problem not found', 404));

    let execNum = executionNum;
    if (!execNum) {
      const lastTestCase = await TestCase.find({ problemId })
        .sort({ executionNum: -1 })
        .limit(1);
      execNum = lastTestCase.length ? lastTestCase[0].executionNum + 1 : 1;
    }

    const newTestCase = await TestCase.create({
      problemId,
      stdin,
      stdout,
      visibility: visibility || false,
      executionNum: execNum,
    });

    res.status(201).json({
      status: 'success',
      data: newTestCase,
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};

export const getTestCasesByProblem = async (req, res, next) => {
  try {
    const { problemId } = req.params;

    if (!problemId) return next(new AppError('Problem ID is required', 400));

    const problem = await Problem.findById(problemId);
    if (!problem) return next(new AppError('Problem not found', 404));

    const testCases = await TestCase.find({ problemId }).sort({
      executionNum: 1,
    });

    res.status(200).json({
      status: 'success',
      results: testCases.length,
      data: testCases,
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};

export const updateTestCase = async (req, res, next) => {
  try {
    const testCaseId = req.params.id;

    if (!testCaseId) return next(new AppError('Test case ID is required', 400));

    const testCase = await TestCase.findById(testCaseId);
    if (!testCase) return next(new AppError('Test case not found', 404));

    const allowedFields = ['stdin', 'stdout', 'visibility', 'executionNum'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updatedTestCase = await TestCase.findByIdAndUpdate(
      testCaseId,
      updates,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      status: 'success',
      data: updatedTestCase,
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};

export const deleteTestCase = async (req, res, next) => {
  try {
    const testCaseId = req.params.id;

    if (!testCaseId) return next(new AppError('Test case ID is required', 400));

    const testCase = await TestCase.findById(testCaseId);
    if (!testCase) return next(new AppError('Test case not found', 404));

    await TestCase.deleteOne({ _id: testCaseId });

    res.status(200).json({
      status: 'success',
      message: `Test case with ID ${testCaseId} has been deleted`,
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};
