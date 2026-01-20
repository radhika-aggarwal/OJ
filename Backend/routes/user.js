import {
  signup,
  login,
  updatePassword,
  protect,
} from '../controllers/Auth.js';
import express from 'express';

const router = express.Router();
router.post('/signup', signup);
router.post('/login', login);
router.patch('/updatePassword', protect, updatePassword);

export default router;
