import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import AppError from '../utils/appError';

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => validator.isEmail(v),
      message: 'Please enter a valid email address.',
    },
  },
  password: {
    type: String,
    minLength: 3,
    required: [true, 'A user must have a password.'],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please Confirm password.'],
    select: false,
    validate: {
      validator: function (value) {
        return value == this.password;
      },
      message: 'Passwords do not match',
    },
  },
  verifyotp: { type: String, default: '' },
  verifyotpExpireAt: { type: Number, default: 0 },
  isAccountVerified: { type: Boolean, default: false },
  resetotp: { type: String, default: '' },
  resetotpExpireAt: { type: Number, default: 0 },
  passwordChangedAt: { type: Date },
  isPasswordChanged: { type: Boolean, default: false },
});

userSchema.pre('save', async function () {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
});

userSchema.methods.updatePassword = async function (updatedValue) {
  const isSame = await bcrypt.compare(
    updatedValue.currentPassword,
    this.password,
  );
  if (!isSame) {
    throw new AppError('Current password does not match', 401);
  }
  this.password = updatedValue.password;
  this.confirmPassword = updatedValue.confirmPassword;
  this.passwordChangedAt = Date.now() - 1000;
  await this.save();
};

userSchema.methods.resetPassword = async function ({
  otp,
  password,
  confirmPassword,
}) {
  if (otp.toString() !== this.verifyotp) {
    throw new AppError('Invalid OTP', 400);
  }
  if (this.verifyotpExpireAt < Date.now()) {
    throw new AppError('OTP expired', 400);
  }

  this.passwordChangedAt = Date.now() - 1000;
  this.password = password;
  this.confirmPassword = confirmPassword;
  this.verifyotp = undefined;
  this.verifyotpExpireAt = undefined;
  await this.save();
};

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
