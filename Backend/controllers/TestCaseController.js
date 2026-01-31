// controllers/TestCaseController.js
import AppError from '../utils/appError.js';
import TestCase from '../models/testCaseModel.js';
import Problem from '../models/problemModel.js';

export const createTestCases = async (req, res, next) => {
  try {
    const { problemId, testCases } = req.body;

    if (!problemId || !Array.isArray(testCases) || testCases.length === 0) {
      return next(
        new AppError(
          'problemId and non-empty testCases array are required',
          400,
        ),
      );
    }

    const problem = await Problem.findById(problemId);
    if (!problem) return next(new AppError('Problem not found', 404));

    const lastTestCase = await TestCase.findOne({ problemId })
      .sort({ executionNum: -1 })
      .select('executionNum');

    let startExecutionNum = lastTestCase ? lastTestCase.executionNum + 1 : 1;

    const formattedTestCases = testCases.map((tc, index) => {
      if (!tc.stdin || !tc.stdout) {
        throw new Error('Each test case must have stdin and stdout');
      }

      return {
        problemId,
        stdin: tc.stdin,
        stdout: tc.stdout,
        visibility: tc.visibility ?? false,
        executionNum: startExecutionNum + index,
      };
    });

    const createdTestCases = await TestCase.insertMany(formattedTestCases);

    res.status(201).json({
      status: 'success',
      results: createdTestCases.length,
      data: createdTestCases,
    });
  } catch (err) {
    next(new AppError(err.message, 400));
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
