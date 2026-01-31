import mongoose from 'mongoose';

const testCaseSchema = mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
  },
  stdin: {
    type: String,
    required: true,
  },

  stdout: {
    type: String,
    required: true,
  },

  visibility: {
    type: Boolean,
    default: false,
  },

  executionNum: {
    type: Number,
    required: true,
  },
});

const TestCases = mongoose.model('TestCase', testCaseSchema);
export default TestCases;
