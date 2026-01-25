import React, { useState } from 'react';
import AuthContext from '../context/AuthContext';
import { signup } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await signup({
        name,
        email,
        password,
        confirmPassword,
      });
      toast.success('Account created! Please verify your email.');
      navigate('/email-verify');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-urbanist">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Create Your NexJudge Account
          </h2>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="font-semibold text-sm"> Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              className="mt-1 border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
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
            <label className="font-semibold text-sm"> Password </label>
            <input
              type="password"
              placeholder="*****"
              className="mt-1 border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="font-semibold text-sm"> Confirm Password </label>
            <input
              type="password"
              placeholder="*****"
              className="mt-1 border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {err && <p className="text-red-500 text-sm">{err}</p>}
          <button
            disabled={loading}
            type="submit"
            className="bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            {loading ? 'Creating...' : 'Create an Account'}
          </button>
        </form>

        {/* Login */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Already have account?
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
