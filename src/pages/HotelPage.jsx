import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MapPicker from "../components/MapPicker.jsx";
import InfiniteScroll from 'react-infinite-scroll-component';
import { HotelStatsChart } from '../components/HotelStatsChart.jsx';
import { GeneralStats } from "../components/stats/GeneralStats.jsx";
import { FinancialOverview } from "../components/stats/FinancialOverview.jsx";
import { DynamicCharts } from "../components/stats/DynamicCharts.jsx";
import { ClientStats } from "../components/stats/ClientStats.jsx";
import { EngagementStats } from "../components/stats/EngagementStats.jsx";
import { FaCheck, FaTimes } from 'react-icons/fa';
import dayjs from 'dayjs';


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
    FaEye,
    FaHeart,
    FaRegSmileBeam
} from 'react-icons/fa';

import { motion } from 'framer-motion';
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const HotelPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [stats, setStats] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [hasMoreBookings, setHasMoreBookings] = useState(true);
    const [bookingsPage, setBookingsPage] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [hotelRes, roomsRes, statsRes, amenitiesRes] = await Promise.all([
                    api.get(`/hotels/${id}`),
                    api.get(`/rooms/?hotel_id=${id}`),
                    api.get(`/hotels/${id}/stats/full`),
                    api.get(`/amenities/hotel`)
                ]);

                const hotelData = hotelRes.data.hotel;

                const hotelAmenities = hotelData.amenities || [];
                const allAmenities = amenitiesRes.data;

                const filteredAmenities = allAmenities.filter((amenity) =>
                    hotelAmenities.some((ha) => ha.amenity_id === amenity.id)
                );

                setHotel({ ...hotelData, amenities: filteredAmenities });
                setRooms(roomsRes.data);
                setStats(statsRes.data);
                console.log('Stats:', statsRes.data);

            } catch (err) {
                console.error('Error loading data:', err);
                navigate('/dashboard');
            }
        };

        fetchData();
    }, [id, navigate]);
    const fetchMoreBookings = async () => {
        try {
            const res = await api.get(`/hotels/${id}/bookings?skip=${bookingsPage}&limit=25`);
            const newBookings = res.data;

            if (newBookings.length < 25) setHasMoreBookings(false);
            setBookings(prev => [...prev, ...newBookings]);
            setBookingsPage(prev => prev + 25);
        } catch (err) {
            console.error('Error loading bookings:', err);
            setHasMoreBookings(false);
        }
    };
    const getStatusStyle = (status) => {
        switch (status) {
            case 'confirmed': return 'text-green-600 bg-green-100';
            case 'cancelled': return 'text-red-600 bg-red-100';
            case 'awaiting_confirmation': return 'text-yellow-700 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const confirmCash = async (bookingId) => {
        try {
            await api.post(`/bookings/${bookingId}/confirm-cash`);
            setBookings(prev =>
                prev.map(b => b.booking_id === bookingId ? { ...b, status: 'confirmed' } : b)
            );
        } catch (err) {
            console.error("Помилка підтвердження:", err);
        }
    };

    const cancelCash = async (bookingId) => {
        try {
            await api.post(`/bookings/${bookingId}/cancel-cash`);
            setBookings(prev =>
                prev.map(b => b.booking_id === bookingId ? { ...b, status: 'cancelled' } : b)
            );
        } catch (err) {
            console.error("Помилка відхилення:", err);
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
    useEffect(() => {
        if (activeTab === 'bookings' && bookings.length === 0) {
            fetchMoreBookings();
        }
    }, [activeTab]);

    if (!hotel || !stats || !stats.general) return <LoadingSpinner />;

    const { general, financials, dynamics, clients, engagement } = stats;

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
                    {['overview', 'rooms', 'stats', 'bookings'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 font-medium !bg-white ${activeTab === tab ? '!text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {tab === 'overview' && 'Огляд'}
                            {tab === 'rooms' && 'Кімнати'}
                            {tab === 'stats' && 'Статистика'}
                            {tab === 'bookings' && 'Бронювання'}
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
                        <div className="space-y-10">
                            <section>
                                <h3 className="text-xl font-bold mb-4">📌 Загальна інформація</h3>
                                <GeneralStats data={general} />
                            </section>

                            <section>
                                <h3 className="text-xl font-bold mb-4">💰 Фінанси</h3>
                                <FinancialOverview data={financials} />
                            </section>

                            <section>
                                <h3 className="text-xl font-bold mb-4">📈 Динаміка</h3>
                                <DynamicCharts data={dynamics} />
                            </section>

                            <section>
                                <h3 className="text-xl font-bold mb-4">👤 Клієнти</h3>
                                <ClientStats data={clients} />
                            </section>

                            <section>
                                <h3 className="text-xl font-bold mb-4">🏨 Інтерактивність</h3>
                                <EngagementStats data={engagement} />
                            </section>
                        </div>

                    )}
                    {activeTab === 'bookings' && (
                        <div>
                            <h3 className="text-xl font-semibold mb-4">Бронювання</h3>
                            <InfiniteScroll
                                dataLength={bookings.length}
                                next={fetchMoreBookings}
                                hasMore={hasMoreBookings}
                                loader={<LoadingSpinner />}
                                endMessage={<p className="text-gray-500 text-center mt-4">Усі бронювання завантажено.</p>}
                            >
                                <ul className="divide-y">
                                    {bookings.map((b, idx ) => (
                                        <li key={idx} className="py-4 space-y-2 border-b">
                                            <p><strong>Кімната:</strong> #{b.room_number}</p>
                                            <p><strong>Клієнт:</strong> {b.client_name}</p>
                                            <p><strong>Email:</strong> {b.email}</p>
                                            <p><strong>Телефон:</strong> {b.phone || 'Невідомо'}</p>
                                            <p><strong>Тип оплати:</strong> {b.is_card ? 'Картка' : 'Готівка'}</p>
                                            <p><strong>Сума:</strong> {b.amount} ₴</p>
                                            <p>
                                                <strong>Період:</strong>{' '}
                                                {dayjs(b.period_start).format("DD.MM.YYYY")} – {dayjs(b.period_end).format("DD.MM.YYYY")}
                                            </p>
                                            <p>
                                                <strong>Статус:</strong>{' '}
                                                <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${getStatusStyle(b.status)}`}>
          {b.status}
        </span>
                                            </p>

                                            {!b.is_card && b.status === 'awaiting_confirmation' && (
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() => confirmCash(b.booking_id)}
                                                        className="px-3 py-1 rounded bg-green-600 text-white flex items-center gap-1 hover:bg-green-700"
                                                    >
                                                        <FaCheck /> Підтвердити
                                                    </button>
                                                    <button
                                                        onClick={() => cancelCash(b.booking_id)}
                                                        className="px-3 py-1 rounded bg-red-600 text-white flex items-center gap-1 hover:bg-red-700"
                                                    >
                                                        <FaTimes /> Відхилити
                                                    </button>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>


                            </InfiniteScroll>
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