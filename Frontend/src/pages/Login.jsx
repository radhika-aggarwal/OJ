import React, { useState } from 'react';
import { login as loginAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);

    try {
      const response = await loginAPI({ email, password });
      login(response.data.user, response.token);
      toast.success('Login successful!');

      if (!response.data.user.isAccountVerified) {
        navigate('/email-verify');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-urbanist">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome to NexJudge</h2>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="font-semibold text-sm">Email</label>
            <input
              type="email"
              placeholder="johndoe@gmail.com"
              className="mt-1 border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="flex justify-between font-semibold text-sm">
              <span>Password</span>
              <a
                href="/reset-password"
                className="text-blue-500 hover:underline text-xs"
              >
                Forgot Password?
              </a>
            </label>
            <input
              type="password"
              placeholder="*****"
              className="mt-1 border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Signup */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Don't have an account?
          <a
            href="/signup"
            className="text-blue-500 font-semibold hover:underline"
          >
            Create Account
          </a>
        </p>
      </div>
    </div>
  );
}
