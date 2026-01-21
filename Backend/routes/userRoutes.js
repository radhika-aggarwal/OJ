import express from 'express';
import { protect } from '../middleware/userAuth.js';
import { getUserData } from '../controllers/UserController.js';

const userRouter = express.Router();

userRouter.get('/data', protect, getUserData);

export default userRouter;
