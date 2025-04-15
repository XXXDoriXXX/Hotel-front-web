import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserEdit, FaSave, FaTimes, FaPhone, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import {api} from "../api/api.js";

const ProfileEditPage = () => {
    const navigate = useNavigate();
    const { user, isLoading, updateToken } = useAuth();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        if (user?.user) {
            setFormData(prev => ({
                ...prev,
                first_name: user.user.first_name || '',
                last_name: user.user.last_name || '',
                email: user.user.email || '',
                phone: user.user.phone || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.current_password) {
            setError('Будь ласка, введіть поточний пароль для підтвердження');
            return;
        }

        if (activeTab === 'password') {
            if (!formData.new_password || !formData.confirm_password) {
                setError('Будь ласка, заповніть всі поля для зміни пароля');
                return;
            }
            if (formData.new_password !== formData.confirm_password) {
                setError('Новий пароль та підтвердження пароля не співпадають');
                return;
            }
        }

        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            const payload = {
                ...(activeTab === 'profile' && {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    phone: formData.phone
                }),
                ...(activeTab === 'password' && {
                    new_password: formData.new_password
                }),
                current_password: formData.current_password
            };

            const response = await api.put('/profile/update/owner', payload);

            if (response.data.owner) {
                setSuccess(true);

                if (response.data.new_token) {
                    updateToken(response.data.new_token);
                }

                setFormData(prev => ({
                    ...prev,
                    current_password: '',
                    ...(activeTab === 'password' && {
                        new_password: '',
                        confirm_password: ''
                    })
                }));

                if (activeTab === 'password') {
                    window.location.reload();
                }
            }
        } catch (err) {
            if (err.response?.status === 400) {
                if (err.response?.data?.detail === "Incorrect current password") {
                    setError('Невірний поточний пароль');
                    setFormData(prev => ({
                        ...prev,
                        current_password: ''
                    }));
                } else {
                    setError(err.response?.data?.detail ||
                        err.response?.data?.message ||
                        'Невірні дані. Будь ласка, перевірте введену інформацію');
                }
            } else {
                setError(err.message || 'Сталася неочікувана помилка');
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 text-white">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="w-32 h-32 !rounded-full !bg-white text-blue-600 flex items-center justify-center text-4xl font-bold shadow-lg border-4 border-white">
                                {`${formData.first_name?.[0] || ''}${formData.last_name?.[0] || ''}`.toUpperCase()}
                            </div>
                            <div className="text-center sm:text-left">
                                <h1 className="text-3xl font-bold">Редагування профілю</h1>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                Особисті дані
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'password' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                Зміна паролю
                            </button>
                        </nav>
                    </div>

                    {/* Edit Form */}
                    <form onSubmit={handleSubmit} className="p-6">
                        {error && (
                            <div className="mb-6 p-4 !bg-red-100 border border-red-400 text-red-700 rounded">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-6 p-4 !bg-green-100 border border-green-400 text-green-700 rounded">
                                Зміни успішно збережено!
                            </div>
                        )}

                        {activeTab === 'profile' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* Personal Information */}
                                <div className="!bg-gray-50 p-4 rounded-lg">
                                    <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Особиста інформація</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                                                Ім'я
                                            </label>
                                            <input
                                                type="text"
                                                id="first_name"
                                                name="first_name"
                                                value={formData.first_name}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border !border-gray-300 !rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                                                Прізвище
                                            </label>
                                            <input
                                                type="text"
                                                id="last_name"
                                                name="last_name"
                                                value={formData.last_name}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="!bg-gray-50 p-4 rounded-lg">
                                    <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Контактна інформація</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                Email
                                            </label>
                                            <div className="flex items-center">
                                                <FaEnvelope className="text-blue-500 mr-3" />
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                                Телефон
                                            </label>
                                            <div className="flex items-center">
                                                <FaPhone className="text-blue-500 mr-3" />
                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-8">
                                <div className="!bg-gray-50 p-4 rounded-lg">
                                    <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Зміна паролю</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
                                                Новий пароль
                                            </label>
                                            <div className="relative">
                                                <div className="flex items-center">
                                                    <FaLock className="text-blue-500 mr-3" />
                                                    <input
                                                        type={showNewPassword ? "text" : "password"}
                                                        id="new_password"
                                                        name="new_password"
                                                        value={formData.new_password}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                        minLength="6"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                >
                                                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                                                Підтвердіть новий пароль
                                            </label>
                                            <div className="relative">
                                                <div className="flex items-center">
                                                    <FaLock className="text-blue-500 mr-3" />
                                                    <input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        id="confirm_password"
                                                        name="confirm_password"
                                                        value={formData.confirm_password}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                        minLength="6"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Current Password Field (required for both tabs) */}
                        <div className="mb-6 !bg-gray-50 p-4 rounded-lg">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Підтвердження особи</h2>
                            <div>
                                <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Поточний пароль
                                </label>
                                <div className="relative">
                                    <div className="flex items-center">
                                        <FaLock className="text-blue-500 mr-3" />
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            id="current_password"
                                            name="current_password"
                                            value={formData.current_password}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                className="px-4 py-3 !bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg flex items-center justify-center gap-2 shadow-md transition"
                            >
                                <FaTimes />
                                Скасувати
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-3 !bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
                            >
                                <FaSave />
                                {isSubmitting ? 'Збереження...' : 'Зберегти зміни'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileEditPage;