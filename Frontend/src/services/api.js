import axios from 'axios';

const API_URI = 'http://localhost:3000';

export const signup = async (data) => {
  try {
    const response = await axios.post(`${API_URI}/user/signup`, data);
    return response.data;
  } catch (error) {
    console.log('Error while calling the API ', error.message);
    throw error;
  }
};

export const login = async (data) => {
  try {
    const response = await axios.post(`${API_URI}/user/login`, data);
    return response.data;
  } catch (error) {
    console.log('Error while calling the API ', error.message);
    throw error;
  }
};
