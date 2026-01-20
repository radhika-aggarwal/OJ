import React, { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {};
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-urbanist">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome to NexJudge</h2>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-4">
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
                href="/forgot-password"
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
            type="submit"
            className="bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            onClick={handleSubmit}
          >
            Login
          </button>
        </form>

        <div className="flex items-center my-6 text-gray-400 text-xs">
          <hr className="grow border-gray-300" />
          <span className="mx-3">or continue with</span>
          <hr className="grow border-gray-300" />
        </div>

        {/* Google Button */}
        <button className="flex items-center justify-center gap-2 border rounded-lg py-2 w-full hover:bg-gray-50 transition-colors">
          <img
            src="src/assets/google-icon.png"
            alt="Google"
            className="w-5 h-5 object-contain"
          />
          <span className="text-sm font-medium">Continue with Google</span>
        </button>

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
