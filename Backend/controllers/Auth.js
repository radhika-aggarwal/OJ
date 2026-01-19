const AppError = require('../utils/appError');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const createWebToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '90d',
  });
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
    });

    const token = createWebToken(newUser);
    res.status(200).json({
      status: 'success',
      token,
      data: newUser,
      message: 'New user created',
    });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError('Fields are empty', 404));
    }
    const user = await User.findOne({ email: email }).select('+password');

    const match = await bcrypt.compare(password, user.password);

    if (!user || !match)
      return next(new AppError('Incorrect email or password', 401));

    const token = createWebToken(user);
    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.body._id).select('+password');
    const updatedValue = {
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      currentPassword: req.body.currentPassword,
    };
    if (!user) return next(new AppError('User not found', 404));

    await user.updatePassword(updatedValue);
    const token = createWebToken(user);
    res.status(200).json({
      token,
      message: 'Password updated successfully!',
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.protect = async (req, res, next) => {
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
    const user = User.findById(decoded.id);
    if (!user) return next(new AppError('User does not exists', 401));

    req.userId = decoded.id;
    next();
  } catch (err) {
    //verification failed send error else give access
    next(new AppError('Invalid or expired token', 401));
  }
};
