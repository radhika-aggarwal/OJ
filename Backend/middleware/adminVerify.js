import AppError from '../utils/appError.js';
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('User cannot create problems', 403));
  } else {
    next();
  }
};
