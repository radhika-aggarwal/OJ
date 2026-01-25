import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { forgotPassword, resetPassword } from '../services/api';

export default function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success('OTP sent to your email!');
      setOtpSent(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error('Enter valid 6-digit OTP');
      return;
    }

    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email, otp, password, confirmPassword });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-urbanist">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Reset Your Password</h2>
          <p className="text-gray-500">
            {otpSent
              ? 'Enter OTP and new password'
              : 'Enter your email to receive OTP'}
          </p>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={otpSent ? handleResetPassword : handleSendOtp}
        >
          <div>
            <label className="font-semibold text-sm">Email</label>
            <input
              type="email"
              placeholder="johndoe@gmail.com"
              className="mt-1 border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              disabled={otpSent}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {otpSent && (
            <>
              <div>
                <label className="font-semibold text-sm">OTP</label>
                <input
                  type="text"
                  maxLength="6"
                  placeholder="Enter 6-digit OTP"
                  className="mt-1 border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>

              <div>
                <label className="font-semibold text-sm">New Password</label>
                <input
                  type="password"
                  placeholder="*****"
                  className="mt-1 border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="font-semibold text-sm">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="*****"
                  className="mt-1 border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </>
          )}

          <button
            disabled={loading}
            type="submit"
            className="bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            {loading
              ? 'Please wait...'
              : otpSent
                ? 'Reset Password'
                : 'Send OTP'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Remember your password?{' '}
          <a
            href="/login"
            className="text-blue-500 font-semibold hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
