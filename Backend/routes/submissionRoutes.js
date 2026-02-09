import express from 'express';
import {
  submitCode,
  runCode,
  aiReview,
  getSubmission,
  getUserSubmissions,
  getProblemSubmissions,
} from '../controllers/SubmissionController.js';
const router = express.Router();

router.post('/submit', submitCode);
router.post('/run', runCode);
router.post('/ai-review', aiReview);

export default router;
