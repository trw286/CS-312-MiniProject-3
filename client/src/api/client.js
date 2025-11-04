// variables and file setup
import axios from 'axios';

// create axios instance
const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',
    withCredentials: true,
});

// export apiClient for use in other files
export default apiClient;