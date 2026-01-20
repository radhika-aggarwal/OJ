import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log('Database connection successful');
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};
