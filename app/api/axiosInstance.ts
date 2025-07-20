// api.tsx
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://192.168.1.4:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
