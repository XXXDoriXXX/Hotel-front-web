import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from "../context/AuthContext.jsx";

const LoginPage = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState(null);
    const navigate = useNavigate();
    const validateForm = () => {
        const newErrors = {};
        if (!email) newErrors.email = 'Email обов\'язковий';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email невалідний';
        if (!password) newErrors.password = 'Пароль обов\'язковий';
        else if (password.length < 6) newErrors.password = 'Пароль повинен містити мінімум 6 символів';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        const result = await login({ email, password });
        if (!result.success) {
            setApiError(result.error);
            return;
        }
        navigate('/');
    };
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100"
        >
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md mx-4"
            >
                <h2 className="text-3xl font-bold text-center mb-6 text-blue-600">Авторизація</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`mt-1 block w-full p-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                            required
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>

                    <div className="mb-6">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Пароль
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`mt-1 block w-full p-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                            required
                        />
                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                    </div>
                    {apiError && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded"
                        >
                            <p>{apiError}</p>
                        </motion.div>
                    )}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full !bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg mb-4 transition-colors duration-300"
                    >
                        Увійти
                    </motion.button>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Немає аккаунту?{' '}
                            <Link
                                to="/register"
                                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                            >
                                Зареєструватися
                            </Link>
                        </p>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default LoginPage;