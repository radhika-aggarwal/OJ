import AppError from '../utils/appError.js';
import { compilerService } from '../utils/compilerService.js';
const ALLOWED_LANGUAGES = ['cpp', 'python', 'javascript', 'js'];
const MAX_CODE_SIZE = 50_000; // 50 KB
const MAX_INPUT_SIZE = 10_000;
export const submitCode = async (req, res, next) => {
  const { language, code, input } = req.body;
  if (!language || !ALLOWED_LANGUAGES.includes(language)) {
    return next(new AppError('Invalid or unsupported language.', 400));
  }
  if (typeof code !== 'string' || code.trim() === '') {
    return next(new AppError('Please add the code.', 400));
  }
  if (code == undefined || code.trim() === '') {
    return next(new AppError('Please add the code.', 400));
  }
  if (code.length > MAX_CODE_SIZE) {
    return next(new AppError('Code size exceeds limit.', 400));
  }

  if (input !== undefined && typeof input !== 'string') {
    return next(new AppError('Input must be a string.', 400));
  }

  if (input && input.length > MAX_INPUT_SIZE) {
    return next(new AppError('Input size exceeds limit.', 400));
  }
  try {
    const result = await compilerService(language, code, input);

    res.status(200).json(result);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};
