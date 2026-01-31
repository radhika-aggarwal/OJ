import { protect } from '../middleware/userAuth.js';
import { isAdmin } from '../middleware/adminVerify.js';
import {
  getProblem,
  createProblem,
  updateProblem,
  deleteProblem,
  getAllProblems,
} from '../controllers/ProblemController.js';

import { getTestCasesByProblem } from '../controllers/TestCaseController.js';
import express from 'express';

const router = express.Router();

router.get('/', protect, getAllProblems);

router.get('/testcases/:problemId', protect, isAdmin, getTestCasesByProblem);

router.get('/:id', protect, getProblem);

router.post('/', protect, isAdmin, createProblem);

router.patch('/:id', protect, isAdmin, updateProblem);

router.delete('/:id', protect, isAdmin, deleteProblem);
export default router;
