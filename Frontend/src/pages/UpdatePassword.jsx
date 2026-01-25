import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { updatePassword } from '../services/api';

export default function UpdatePassword() {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  const navigate = useNavigate();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword || !currentPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await updatePassword({ currentPassword, password, confirmPassword });
      toast.success('Password Updated successfully!');
      navigate('/');
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
          <h2 className="text-3xl font-bold mb-2">Update Your Password</h2>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleUpdatePassword}>
          <>
            <div>
              <label className="font-semibold text-sm">Current Password</label>
              <input
                type="password"
                placeholder="*****"
                className="mt-1 border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="font-semibold text-sm">New Password</label>
              <input
                type="password"
                placeholder="*****"
                className="mt-1 border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                disabled={loading}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold text-sm">Confirm Password</label>
              <input
                type="password"
                placeholder="*****"
                className="mt-1 border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={confirmPassword}
                disabled={loading}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </>

          <button
            disabled={loading}
            type="submit"
            className="bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            {loading ? 'Please wait...' : 'Update Password'}
          </button>
        </form>
        <p className="text-center text-gray-500 text-sm mt-6">
          <a href="/" className="text-blue-500 font-semibold hover:underline">
            ← Back to Home
          </a>
        </p>
      </div>
    </div>
  );
}
