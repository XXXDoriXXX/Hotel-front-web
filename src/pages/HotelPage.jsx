import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MapPicker from "../components/MapPicker.jsx";
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
    FaTrash
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const HotelPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [hotelRes, roomsRes, statsRes, amenitiesRes] = await Promise.all([
                    api.get(`/hotels/${id}`),
                    api.get(`/rooms?hotel_id=${id}`),
                    api.get(`/hotels/${id}/stats`),
                    api.get(`/amenities/hotel`)
                ]);

                const hotelData = hotelRes.data.hotel;
                const rating = hotelRes.data.rating;
                const views = hotelRes.data.views;

                const hotelAmenities = hotelData.amenities || [];
                const allAmenities = amenitiesRes.data;

                const filteredAmenities = allAmenities.filter((amenity) =>
                    hotelAmenities.some((ha) => ha.amenity_id === amenity.id)
                );

                setHotel({ ...hotelData, amenities: filteredAmenities });
                setRooms(roomsRes.data);
                setStats(statsRes.data);
            } catch (err) {
                console.error('Error loading data:', err);
                navigate('/dashboard');
            }
        };

        fetchData();
    }, [id, navigate]);

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

    if (!hotel || !stats) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="!bg-gradient-to-r from-blue-500 to-blue-700 shadow-lg px-4 sm:px-6 py-4 flex flex-wrap justify-between items-center sticky top-0 z-50">

                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="!bg-white text-blue-600 hover:text-blue-800 p-2 rounded-full shadow-md transition-all"
                    >
                        <FaArrowLeft className="text-xl" />
                    </button>
                    <h1
                        className="text-2xl font-bold text-white cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        HotelHub
                    </h1>
                </div>

                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                    <button
                        onClick={() => navigate(`/hotels/${id}/edit`)}
                        className="!bg-white !text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-all"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => navigate('/profile')}
                        className="w-12 h-12 sm:w-16 sm:h-16 !rounded-full !bg-white text-blue-700 hover:text-blue-900 flex items-center justify-center shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        <FaUserCircle className="text-2xl sm:text-3xl" />
                    </button>
                </div>
            </header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">


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

                <div className="bg-white rounded-xl shadow p-6">
                    {activeTab === 'overview' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                            <h2 className="text-2xl font-bold mb-2">{hotel.name}</h2>

                            <p className="text-gray-700 mb-4">{hotel.description || 'Опис відсутній'}</p>

                            <div className="mb-4 text-sm text-gray-600 space-y-1">
                                <p><strong>Адреса:</strong> {hotel.address?.street}, {hotel.address?.city}, {hotel.address?.state}, {hotel.address?.country}, {hotel.address?.postal_code}</p>
                                <p><strong>Координати:</strong> {hotel.address?.latitude}, {hotel.address?.longitude}</p>
                            </div>

                            {hotel.amenities?.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="font-semibold mb-2">Зручності:</h3>
                                    <div className="p-4 border rounded-lg bg-gray-50">
                                    <ul className="list-none space-y-4">
                                        {hotel.amenities.map((a, index) => (
                                            <li key={index} className="flex items-start gap-4">
                                                <div>
                                                    <p className="font-bold text-gray-800">{a.name}</p>
                                                    {a.description && (
                                                        <p className="text-gray-600 text-sm">{a.description}</p>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    </div>
                                </div>
                            )}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">Мапа розташування</h3>
                                <MapPicker
                                    onLocationSelect={() => {}}
                                    initialPosition={{
                                        lat: hotel.address?.latitude || 0,
                                        lng: hotel.address?.longitude || 0,
                                    }}
                                    readonly={true}
                                />
                            </div>

                            <h3 className="text-lg font-semibold mb-4">Галерея</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                {hotel.images?.map((img) => (
                                    <div key={img.id} className="relative group">
                                        <img src={img.image_url} alt="Hotel" className="w-full h-48 object-cover rounded-lg" />
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
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
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
                                                    className="!bg-white text-blue-600 hover:text-blue-800"
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