import { protect } from '../middleware/userAuth.js';
import { isAdmin } from '../middleware/adminVerify.js';
import {
  getProblem,
  createProblem,
  updateProblem,
  deleteProblem,
  getAllProblems,
} from '../controllers/ProblemController.js';
import express from 'express';

const router = express.Router();

router.get('/problem/:id', protect, getProblem);

router.post('/problem', protect, isAdmin, createProblem);

router.patch('/problem/:id', protect, isAdmin, updateProblem);

router.delete('/problem/:id', protect, isAdmin, deleteProblem);

router.get('/problem', protect, getAllProblems);
export default router;
