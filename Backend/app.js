import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import { connectDB } from './database/db.js';
import user from './routes/user.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use('/user', user);

connectDB();

app.listen(port, () => {
  console.log('server is running at :', port);
});
