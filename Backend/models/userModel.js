import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

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
});

userSchema.pre('save', async function () {
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
    throw new Error('Current password do not match');
  }
  this.password = updatedValue.password;
  this.confirmPassword = updatedValue.confirmPassword;
  await this.save();
};

const User = mongoose.model('User', userSchema);
export default User;
