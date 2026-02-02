import express from 'express';
import {
  submitCode,
  runCode,
  getSubmission,
  getUserSubmissions,
  getProblemSubmissions,
} from '../controllers/SubmissionController.js';
const router = express.Router();

router.post('/submit', submitCode);
router.post('/run', runCode);

export default router;
