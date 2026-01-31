import AppError from '../utils/appError.js';
import User from '../models/userModel.js';

export const isAdmin = async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user || user.role !== 'admin') {
    return next(new AppError('User cannot create problems', 403));
  } else {
    next();
  }
};
