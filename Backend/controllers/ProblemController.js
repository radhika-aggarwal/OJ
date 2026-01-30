import AppError from '../utils/appError.js';
import Problem from '../models/problemModel.js';

export const getProblem = async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return next(new AppError('Problem ID is required', 400));
  }
  try {
    const problem = await Problem.findById(id);
    if (!problem) {
      return next(new AppError('Problem not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        problem,
      },
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};

export const getAllProblems = async (req, res, next) => {
  try {
    const problems = await Problem.find();
    res.status(200).json({
      status: 'success',
      results: problems.length,
      data: problems,
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};

export const createProblem = async (req, res, next) => {
  try {
    const {
      title,
      statement,
      difficulty,
      constraints,
      sampleIO,
      timeLimit,
      memoryLimit,
    } = req.body;

    if (
      !title ||
      !statement ||
      !difficulty ||
      !constraints ||
      !sampleIO ||
      !timeLimit ||
      !memoryLimit
    ) {
      return next(new AppError('Missing fields', 400));
    }
    const existingProblem = await Problem.findOne({
      title: { $regex: new RegExp(`^${title}$`, 'i') },
    });
    if (existingProblem) return next(new AppError('Title already exists', 409));

    const newProblem = await Problem.create({
      title,
      statement,
      difficulty,
      constraints,
      sampleIO,
      timeLimit,
      memoryLimit,
    });

    res.status(201).json({
      status: 'success',
      data: newProblem,
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};

export const updateProblem = async (req, res, next) => {
  try {
    const problemId = req.params.id;
    if (!problemId) {
      return next(new AppError('Problem id is missing', 400));
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return next(new AppError('Problem not found', 404));
    }

    const allowedFields = [
      'title',
      'statement',
      'difficulty',
      'constraints',
      'sampleIO',
      'timeLimit',
      'memoryLimit',
      'tags',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedProblem = await Problem.findByIdAndUpdate(problemId, updates, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: updatedProblem,
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};

export const deleteProblem = async (req, res, next) => {
  try {
    const problemId = req.params.id;

    if (!problemId) {
      return next(new AppError('Problem ID is required', 400));
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return next(new AppError('Problem not found', 404));
    }

    await Problem.deleteOne({ _id: problemId });

    res.status(200).json({
      status: 'success',
      message: `Problem with ID ${problemId} has been deleted`,
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};
