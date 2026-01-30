import express from 'express';
import { protect } from '../middleware/userAuth.js';
import { isAdmin } from '../middleware/adminVerify.js';
import {
  createTestCase,
  getTestCasesByProblem,
  updateTestCase,
  deleteTestCase,
} from '../controllers/TestCaseController.js';

const router = express.Router();

router.post('/', protect, isAdmin, createTestCase);

router.get('/problem/:problemId', protect, isAdmin, getTestCasesByProblem);

router.patch('/:id', protect, isAdmin, updateTestCase);

router.delete('/:id', protect, isAdmin, deleteTestCase);

export default router;
