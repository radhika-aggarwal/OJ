import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import AppError from '../utils/appError.js';
import User from '../models/userModel.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in', 401));
  }
  try {
    //if it is there then verify it
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    //check if user exists
    const user = await User.findById(decoded.id);
    if (!user) return next(new AppError('User no longer exist', 401));

    if (
      user.passwordChangedAt &&
      decoded.iat * 1000 < user.passwordChangedAt.getTime()
    ) {
      return next(
        new AppError('Password changed recently. Please login again.', 401),
      );
    }
    req.userId = decoded.id;
    next();
  } catch (err) {
    //verification failed send error else give access
    next(new AppError('Invalid or expired token', 401));
  }
};
