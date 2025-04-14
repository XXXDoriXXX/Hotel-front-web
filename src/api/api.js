import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL
export const GOOGLE_MAPS_API = import.meta.env.VITE_GOOGLE_MAPS_API
export const api = axios.create({
    baseURL: BASE_URL
});
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});