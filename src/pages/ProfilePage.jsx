import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserEdit, FaSignOutAlt, FaClipboardList, FaPhone, FaEnvelope, FaCrown } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, logout, isLoading } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
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
                            <div className="w-32 h-32 rounded-full bg-white text-blue-600 flex items-center justify-center text-4xl font-bold shadow-lg border-4 border-white">
                                {getInitials(user.user?.first_name, user.user?.last_name)}
                            </div>
                            <div className="text-center sm:text-left">
                                <h1 className="text-3xl font-bold">{`${user.user?.first_name} ${user.user?.last_name}`}</h1>
                                {user.user?.is_owner && (
                                    <div className="inline-flex items-center mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                        <FaCrown className="mr-1" /> Власник
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Контактна інформація</h2>
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <FaEnvelope className="text-blue-500 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{user.user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <FaPhone className="text-blue-500 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Телефон</p>
                                        <p className="font-medium">{user.user?.phone || 'Не вказано'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Додаткова інформація</h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">ID користувача</p>
                                    <p className="font-medium">#{user.user?.id}</p>
                                </div>
                                {user?.is_owner && (
                                    <div>
                                        <p className="text-sm text-gray-500">ID власника</p>
                                        <p className="font-medium">#{user.user?.owner_id}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button
                            onClick={() => navigate('/profile/edit')}
                            className="!bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 shadow-md transition transform hover:-translate-y-1"
                        >
                            <FaUserEdit />
                            Редагувати профіль
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="!bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 shadow-md transition transform hover:-translate-y-1"
                        >
                            <FaClipboardList />
                            Перейти до кабінету
                        </button>
                        <button
                            onClick={handleLogout}
                            className="!bg-red-600 hover:bg-red-800 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 shadow-md transition transform hover:-translate-y-1"
                        >
                            <FaSignOutAlt />
                            Вийти
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;