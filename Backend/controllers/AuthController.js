import AppError from '../utils/appError.js';
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/email.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '90d',
  });
};

const createWebToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const isProduction = process.env.NODE_ENV?.trim() === 'production';
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  };

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  return res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

export const signup = async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword)
    return next(new AppError('Email and password are required', 400));
  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return next(new AppError('User already exists', 409));
    const newUser = await User.create({
      name,
      email,
      password,
      confirmPassword,
    });

    return createWebToken(newUser, 201, res);
  } catch (err) {
    return next(new AppError('Something went wrong', 500));
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError('Fields are empty', 400));
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password',
    );
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    return createWebToken(user, 200, res);
  } catch (err) {
    return next(new AppError('Something went wrong', 500));
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });
    return res
      .status(200)
      .json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    return next(new AppError('Something went wrong', 500));
  }
};

export const sendVerifyOTP = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) return next(new AppError('User not found', 404));

    if (user.isAccountVerified)
      return res.status(400).json({
        success: false,
        message: 'Account already Verified',
      });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.verifyotp = otp;
    user.verifyotpExpireAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      to: user.email,
      subject: 'Verify Your Account',
      text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
    });
    res.status(200).json({
      status: 'success',
      message: 'OTP sent to your email',
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

export const verifyEmail = async (req, res, next) => {
  const userId = req.userId;
  const { otp } = req.body;
  if (!userId || !otp) return next(new AppError('Missing Details', 400));

  try {
    const user = await User.findById(userId);
    if (!user) return next(new AppError('User not found', 404));

    if (
      user.verifyotp !== otp.toString() ||
      user.verifyotpExpireAt < Date.now()
    ) {
      return next(new AppError('Invalid or expired OTP', 400));
    }

    user.isAccountVerified = true;
    user.verifyotp = undefined;
    user.verifyotpExpireAt = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
      message: 'Account verified',
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};

export const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return next(new AppError('User not found', 404));

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.verifyotp = otp;
    user.verifyotpExpireAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      to: email,
      subject: 'Password reset OTP',
      text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
    });
    res.status(200).json({
      status: 'success',
      message: 'OTP sent to your email',
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

export const resetPassword = async (req, res, next) => {
  const { email, otp, password, confirmPassword } = req.body;
  if (!email || !otp || !password || !confirmPassword) {
    return next(new AppError('Missing Details', 400));
  }
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return next(new AppError('User not found', 404));
    await user.resetPassword({ email, otp, password, confirmPassword });
    res.status(200).json({
      status: 'success',
      message: 'Password has been reset successfully!',
    });
  } catch (err) {
    return next(new AppError(err.message || 'Password reset failed', 500));
  }
};

export const updatePassword = async (req, res, next) => {
  const userId = req.userId;
  const { password, confirmPassword, currentPassword } = req.body;
  if (!userId || !password || !confirmPassword || !currentPassword)
    return next(new AppError('Missing Details', 400));

  try {
    const user = await User.findById(userId).select('+password');
    if (!user) return next(new AppError('User not found', 404));

    await user.updatePassword({
      password,
      confirmPassword,
      currentPassword,
    });
    createWebToken(user, 200, res);
  } catch (err) {
    return next(new AppError(err.message || 'Password update failed', 500));
  }
};

export const isAuthenticated = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    return res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};
