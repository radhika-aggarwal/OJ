import AppError from '../utils/appError.js';
import { compilerService } from '../utils/compilerService.js';
export const submitCode = async (req, res, next) => {
  const { language, code, input } = req.body;
  if (code == undefined) {
    return next(new AppError('Please add the code.', 400));
  }
  try {
    const result = await compilerService(language, code, input);

    res.status(200).json(result);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};
