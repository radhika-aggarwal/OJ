import {
  signup,
  login,
  logout,
  updatePassword,
  forgetPassword,
  resetPassword,
  sendVerifyOTP,
  verifyEmail,
  isAuthenticated,
} from '../controllers/AuthController.js';

import { protect } from '../middleware/userAuth.js';
import express from 'express';

const router = express.Router();
router.post('/signup', signup);
router.post('/login', login);
router.patch('/update-password', protect, updatePassword);
router.post('/logout', protect, logout);
router.post('/send-verify-otp', protect, sendVerifyOTP);
router.post('/verify-email', protect, verifyEmail);
router.post('/forget-password', forgetPassword);
router.patch('/reset-password', resetPassword);
router.get('/is-auth', protect, isAuthenticated);
export default router;
