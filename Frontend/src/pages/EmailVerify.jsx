import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyOtp, sendVerifyOTP } from '../services/api';
import toast from 'react-hot-toast';

export default function EmailVerify() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSendOtp = async () => {
    setSendingOtp(true);
    setError('');
    try {
      await sendVerifyOTP();
      toast.success('OTP sent to your email!');
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || 'Something went wrong';
      toast.error(msg);
      setError(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  useEffect(() => {
    const sendOtpOnMount = async () => {
      await handleSendOtp();
    };
    sendOtpOnMount();
  }, []);

  const handleOtpVerification = async () => {
    setError('');
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp({ otp });
      toast.success('Verification successful!');
      navigate('/');
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 font-urbanist">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Verify Your Email</h2>
          <p className="text-gray-500">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/, ''))} // only digits
            maxLength="6"
            className="h-12 w-2/3 text-center text-lg border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></input>
        </div>

        <button
          disabled={loading || otp.length !== 6}
          className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          onClick={handleOtpVerification}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>

        <button
          disabled={sendingOtp}
          className="w-full mt-4 text-blue-500 font-semibold hover:underline"
          onClick={handleSendOtp}
        >
          {sendingOtp ? 'Sending...' : 'Resend OTP'}
        </button>
      </div>
    </div>
  );
}
