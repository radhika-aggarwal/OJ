import axios from 'axios';

// Use /api prefix which Vite proxies to localhost:3000
const API_URI = '/api';

export const signup = async (data) => {
    try {
        const response = await axios.post(`${API_URI}/user/signup`, data);
        return response.data;
    } catch (error) {
        console.log('Error while calling the API ', error.message);
        throw error;
    }
}