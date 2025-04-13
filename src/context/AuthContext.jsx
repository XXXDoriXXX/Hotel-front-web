import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const isAuthenticated = !!user;
    const isLoading = user === null && !!localStorage.getItem('token');

    const login = async ({ email, password }) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            console.log(res.data);
            localStorage.setItem('token', res.data.access_token);

            await getMe();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || 'Помилка входу' };
        }
    };

    const register = async (data) => {
        try {
            const res = await api.post('/auth/register/owner', data);
            localStorage.setItem('token', res.data.access_token);

            await getMe();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || 'Помилка реєстрації' };
        }
    };

    const getMe = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
        } catch {
            setUser(null);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    useEffect(() => {
        getMe(); // автоматично логінить, якщо є токен
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
