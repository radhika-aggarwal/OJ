import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    statement: {
      type: String,
      required: true,
      trim: true,
    },

    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy',
    },

    constraints: {
      type: String,
      trim: true,
    },

    sampleIO: [
      {
        input: String,
        output: String,
      },
    ],

    timeLimit: {
      type: Number,
      default: 1000,
    },

    memoryLimit: {
      type: Number,
      default: 256,
    },
  },
  { timestamps: true },
);

const Problem = mongoose.model('Problem', problemSchema);
export default Problem;
