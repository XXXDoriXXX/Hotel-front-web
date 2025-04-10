import axios from 'axios';
const baseUrl = import.meta.env.VITE_API_URL
const api = axios.create({
    baseURL: baseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});
const handleApiError = (error) => {
    if (error.response) {
        return {
            message: error.response.data.detail,
            errors: error.response.data.errors,
            status: error.response.status
        };
    } else if (error.request) {
        return { message: 'Не вдалося отримати відповідь від сервера' };
    } else {
        return { message: 'Помилка при відправленні запиту' };
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await api.post('/auth/register/owner', userData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};