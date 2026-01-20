import React, { useState } from 'react';
import AuthContext from '../context/AuthContext';
import { signup } from '../services/api';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup({
      name,
      email,
      password,
      confirmPassword,
    });
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
          <button
            type="submit"
            className="bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Create an Account
          </button>
        </form>

        <div className="flex items-center my-6 text-gray-400 text-xs">
          <hr className="grow border-gray-300" />
          <span className="mx-3">or continue with</span>
          <hr className="grow border-gray-300" />
        </div>

        {/* Google button */}
        <button className="flex items-center justify-center gap-2 border rounded-lg py-2 w-full hover:bg-gray-50 transition-colors">
          <img
            src="src/assets/google-icon.png"
            alt="Google"
            className="w-5 h-5 object-contain"
          />
          <span className="text-sm font-medium">Continue with Google</span>
        </button>

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
