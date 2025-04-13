import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import {
    FaArrowLeft,
    FaUserCircle,
    FaEdit,
    FaPlus,
    FaBed,
    FaChartLine,
    FaMoneyBillWave,
    FaClipboardList,
    FaTrash,
    FaSave
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const HotelPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [hotelRes, roomsRes, statsRes] = await Promise.all([
                    api.get(`/hotels/${id}`),
                    api.get(`/rooms?hotel_id=${id}`),
                    api.get(`/hotels/${id}/stats`)
                ]);
                setHotel(hotelRes.data);
                setRooms(roomsRes.data);
                setStats(statsRes.data);
                setEditData(hotelRes.data);
            } catch (err) {
                console.error('Помилка завантаження:', err);
                navigate('/dashboard');
            }
        };
        fetchData();
    }, [id, navigate]);

    const handleSave = async () => {
        try {
            await api.put(`/hotels/${id}`, {
                name: editData.name,
                description: editData.description
            });
            setHotel(prev => ({...prev, ...editData}));
            setIsEditing(false);
        } catch (err) {
            console.error('Помилка оновлення:', err);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('file', file);

            await api.post(`/hotels/${id}/images`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const res = await api.get(`/hotels/${id}`);
            setHotel(res.data);
        } catch (err) {
            console.error('Помилка завантаження:', err);
        }
    };

    const deleteImage = async (imageId) => {
        try {
            await api.delete(`/hotels/images/${imageId}`);
            setHotel(prev => ({
                ...prev,
                images: prev.images.filter(img => img.id !== imageId)
            }));
        } catch (err) {
            console.error('Помилка видалення:', err);
        }
    };

    const deleteRoom = async (roomId) => {
        try {
            await api.delete(`/rooms/${roomId}`);
            setRooms(prev => prev.filter(room => room.id !== roomId));
        } catch (err) {
            console.error('Помилка видалення:', err);
        }
    };

    if (!hotel || !stats) return <div className="p-6">Завантаження...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="!bg-white shadow px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="!bg-white text-blue-600 hover:text-blue-800"
                    >
                        <FaArrowLeft className="text-xl" />
                    </button>
                    <h1
                        className="text-xl font-bold text-blue-700 cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        HotelHub
                    </h1>
                </div>
                <button
                    onClick={() => navigate('/profile')}
                    className="
    w-16 h-16
    !rounded-full
   !bg-white
    text-blue-700
    hover:text-blue-900
    flex items-center justify-center
    shadow-sm
    hover:shadow-md
    transition-all
    focus:outline-none focus:ring-2 focus:ring-blue-300
  ">
                    <FaUserCircle className="text-3xl" />
                </button>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editData.name}
                                onChange={(e) => setEditData({...editData, name: e.target.value})}
                                className="text-2xl font-bold border-b border-blue-500 mb-2 w-full"
                            />
                        ) : (
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">{hotel.name}</h2>
                        )}
                        <p className="text-gray-600">
                            {hotel.address?.street}, {hotel.address?.city}, {hotel.address?.country}
                        </p>
                    </div>
                    <button
                        onClick={isEditing ? handleSave : () => setIsEditing(true)}
                        className="!bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        {isEditing ? <FaSave /> : <FaEdit />}
                        {isEditing ? 'Зберегти' : 'Редагувати'}
                    </button>
                </div>

                {/* Таби */}
                <div className="flex border-b !border-gray-200 mb-6">
                    {['overview', 'rooms', 'stats'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 font-medium !bg-white ${activeTab === tab ? '!text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {tab === 'overview' && 'Огляд'}
                            {tab === 'rooms' && 'Кімнати'}
                            {tab === 'stats' && 'Статистика'}
                        </button>
                    ))}
                </div>

                {/* Вміст табів */}
                <div className="bg-white rounded-xl shadow p-6">
                    {activeTab === 'overview' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            {isEditing ? (
                                <textarea
                                    value={editData.description || ''}
                                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                                    rows="5"
                                    placeholder="Опис готелю"
                                />
                            ) : (
                                <p className="text-gray-700 mb-6">
                                    {hotel.description || 'Опис відсутній'}
                                </p>
                            )}

                            <h3 className="text-lg font-semibold mb-4">Галерея</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                {hotel.images?.map((img) => (
                                    <div key={img.id} className="relative group">
                                        <img
                                            src={img.image_url}
                                            alt="Hotel"
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                        <button
                                            onClick={() => deleteImage(img.id)}
                                            className="absolute top-2 right-2 !bg-red-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="!bg-blue-100 text-blue-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-200 transition">
                                    <FaPlus className="inline mr-2" />
                                    Додати фото
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'rooms' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold">Кімнати готелю</h3>
                                <button
                                    onClick={() => navigate(`/hotels/${id}/rooms/new`)}
                                    className="!bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                >
                                    <FaPlus /> Додати кімнату
                                </button>
                            </div>

                            {rooms.length === 0 ? (
                                <p className="text-gray-500">Немає доступних кімнат</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {rooms.map((room) => (
                                        <div
                                            key={room.id}
                                            className="border rounded-lg p-4 hover:shadow-md transition relative"
                                        >
                                            <div className="flex justify-between">
                                                <h4 className="font-bold">{room.room_number}</h4>
                                                <span className="!bg-blue-100 !text-blue-800 px-2 py-1 rounded text-sm">
                          {room.price_per_night} ₴/ніч
                        </span>
                                            </div>
                                            <p className="text-gray-600 text-sm mt-2">{room.description}</p>

                                            <div className="flex justify-end gap-2 mt-4">
                                                <button
                                                    onClick={() => navigate(`/hotels/${id}/rooms/${room.id}`)}
                                                    className="!bg-white  text-blue-600 hover:text-blue-800"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => deleteRoom(room.id)}
                                                    className="!bg-white text-red-600 hover:text-red-800"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'stats' && (
                        <div>
                            <h3 className="text-xl font-semibold mb-6">Статистика готелю</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StatCard
                                    icon={<FaBed className="text-2xl" />}
                                    title="Кімнат"
                                    value={stats.rooms}
                                />
                                <StatCard
                                    icon={<FaChartLine className="text-2xl" />}
                                    title="Завантаженість"
                                    value={`${Math.round(stats.occupancy * 100)}%`}
                                />
                                <StatCard
                                    icon={<FaClipboardList className="text-2xl" />}
                                    title="Бронювань"
                                    value={stats.bookings}
                                />
                                <StatCard
                                    icon={<FaMoneyBillWave className="text-2xl" />}
                                    title="Дохід"
                                    value={`${stats.income} ₴`}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Компонент картки статистики
const StatCard = ({ icon, title, value }) => (
    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm">{title}</p>
                <p className="text-xl font-bold">{value}</p>
            </div>
            <div className="text-blue-600">{icon}</div>
        </div>
    </div>
);

export default HotelPage;