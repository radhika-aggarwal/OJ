import axios from 'axios';
import ApiError from '../utils/apiError';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Keep this for cookie attempts (won't hurt)
});

// Request interceptor - Add Bearer token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    const statusCode = error.response?.status || 500;

    // If 401, clear token and redirect to login
    if (statusCode === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optionally redirect to login
      // window.location.href = '/login';
    }

    return Promise.reject(new ApiError(message, statusCode));
  },
);

export const signup = async (data) => {
  const response = await api.post('/auth/signup', data);

  // Store token after signup
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
  }

  return response.data;
};

export const login = async (data) => {
  const response = await api.post('/auth/login', data);

  // Store token after login
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
  }

  return response.data;
};

export const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } catch (error) {
    // Ignore logout errors
    console.log('Logout API error:', error.message);
  } finally {
    // Always clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const sendVerifyOTP = async () => {
  const response = await api.post('/auth/send-verify-otp');
  return response.data;
};

export const verifyOtp = async (data) => {
  const response = await api.post('/auth/verify-email', data);
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forget-password', { email });
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await api.patch('/auth/reset-password', data);
  return response.data;
};

export const updatePassword = async (data) => {
  const response = await api.patch('/auth/update-password', data);
  return response.data;
};

export const checkAuth = async () => {
  const response = await api.get('/auth/is-auth');
  return response.data;
};

export const getAllProblems = async () => {
  const response = await api.get('/problem');
  return response.data;
};

export const getProblemById = async (id) => {
  const response = await api.get(`/problem/${id}`);
  return response.data;
};

export const getTestCasesByProblemId = async (id) => {
  const response = await api.get(`/problem/testcases/${id}`);
  return response.data;
};

export const createProblem = async (data) => {
  const response = await api.post('/problem', data);
  return response.data;
};

export const createManyTestCases = async (data) => {
  const response = await api.post('/testcase', data);
  return response.data;
};

export const updateProblem = async (id, data) => {
  const response = await api.patch(`/problem/${id}`, data);
  return response.data;
};

export const updateTestCase = async (id, data) => {
  const response = await api.patch(`/testcase/${id}`, data);
  return response.data;
};

export const deleteTestCase = async (id) => {
  const response = await api.delete(`/testcase/${id}`);
  return response.data;
};

export const deleteProblem = async (id) => {
  const response = await api.delete(`problem/${id}`);
  return response.data;
};

export const submitCode = async (data) => {
  const response = await api.post('submission/submit', data);
  return response.data;
};

export const runCode = async (data) => {
  const response = await api.post('submission/run', data);
  return response.data;
};

export const compiler = async (data) => {
  const response = await api.post('compiler/submit', data);
  return response.data;
};

export const aiReview = async (data) => {
  const response = await api.post('submission/ai-review', data);
  return response.data;
};
