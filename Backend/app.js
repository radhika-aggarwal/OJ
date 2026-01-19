const express = require('express');
const { connectDB } = require('./services/db.js');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const user = require('./routes/user');

const app = express();
app.use(express.json());

app.use('/user', user);

connectDB();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log('server is running at :', port);
});
