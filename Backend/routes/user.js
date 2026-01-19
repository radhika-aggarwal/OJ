const {
  signup,
  login,
  updatePassword,
  protect,
} = require('../controllers/Auth');
const express = require('express');
const router = express.Router();
router.post('/signup', signup);
router.post('/login', login);
router.patch('/updatePassword', protect, updatePassword);

module.exports = router;
