import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const signup = async (data) => {
  try {
    const response = await api.post('/auth/signup', data);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Something went wrong';
    throw new Error(message);
  }
};

export const login = async (data) => {
  try {
    const response = await api.post('/auth/login', data);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Something went wrong';
    throw new Error(message);
  }
};

export const sendVerifyOTP = async () => {
  try {
    const response = await api.post('/auth/send-verify-otp');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Something went wrong';
    throw new Error(message);
  }
};

export const verifyOtp = async (data) => {
  try {
    const response = await api.post('/auth/verify-email', data);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Something went wrong';
    throw new Error(message);
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forget-password', { email });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Something went wrong';
    throw new Error(message);
  }
};

export const resetPassword = async (data) => {
  try {
    const response = await api.patch('/auth/reset-password', data);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Something went wrong';
    throw new Error(message);
  }
};
