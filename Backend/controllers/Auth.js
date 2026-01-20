import AppError from '../utils/appError.js';
import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '90d',
  });
};

const createWebToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export const signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
    });

    createWebToken(newUser, 201, res);
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError('Fields are empty', 404));
    }
    const user = await User.findOne({ email: email }).select('+password');

    const match = await bcrypt.compare(password, user.password);

    if (!user || !match)
      return next(new AppError('Incorrect email or password', 401));

    createWebToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.body._id).select('+password');
    const updatedValue = {
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      currentPassword: req.body.currentPassword,
    };
    if (!user) return next(new AppError('User not found', 404));

    await user.updatePassword(updatedValue);
    createWebToken(user, 200, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const protect = async (req, res, next) => {
  //check if jwt is there
  try {
    // Get token
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in', 401));
    }
    //if it is there then verify it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //check if user exists
    const user = await User.findById(decoded.id);
    if (!user) return next(new AppError('User does not exists', 401));

    req.userId = decoded.id;
    next();
  } catch (err) {
    //verification failed send error else give access
    next(new AppError('Invalid or expired token', 401));
  }
};
