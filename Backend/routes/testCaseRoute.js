import express from 'express';
import { protect } from '../middleware/userAuth.js';
import { isAdmin } from '../middleware/adminVerify.js';
import {
  createTestCases,
  updateTestCase,
  deleteTestCase,
} from '../controllers/TestCaseController.js';

const router = express.Router();

router.post('/', protect, isAdmin, createTestCases);

router.patch('/:id', protect, isAdmin, updateTestCase);

router.delete('/:id', protect, isAdmin, deleteTestCase);

export default router;
