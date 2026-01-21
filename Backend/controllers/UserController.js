import User from '../models/userModel.js';
import AppError from '../utils/appError.js';

export const getUserData = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = User.findById(userId);
    if (!user) return next(new AppError('User not found!', 400));

    res.status(200).json({
      status: 'success',
      data: {
        name: user.name,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch {}
};
