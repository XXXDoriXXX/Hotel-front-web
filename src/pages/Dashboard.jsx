import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotel } from '../context/HotelContext';

import { motion, AnimatePresence } from 'framer-motion';
import {
    FaHotel,
    FaBed,
    FaMoneyBillWave,
    FaClipboardList,
    FaPlus,
    FaUserCircle, FaTrash,
} from 'react-icons/fa';
import MapPicker from "../components/MapPicker.jsx";
import {GOOGLE_MAPS_API} from "../api/api.js";
import {api} from '../api/api.js';
import {useNotification} from "../components/NotificationContext.jsx";
import Modal from "../components/Modal.jsx";

const Dashboard = () => {
    const { hotels, newHotel, setNewHotel, createHotel, fetchHotels } = useHotel();
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);
    const [hotelRooms, setHotelRooms] = useState({});
    const [hotelStats, setHotelStats] = useState({});
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleteStep, setDeleteStep] = useState(0);
    const { addNotification } = useNotification();
    const [summary, setSummary] = useState({ bookings: 0, income: 0 });

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await api.get('/hotels/my/summary');
                setSummary({
                    bookings: res.data.total_bookings ?? 0,
                    income: res.data.total_income ?? 0,
                });

            } catch (err) {
                console.error('Помилка при завантаженні summary:', err);
            }
        };
        fetchSummary();
    }, []);
    useEffect(() => {
        fetchHotels();
    }, []);
    const handleHotelDelete = async (hotelId) => {
        try {
            await api.delete(`/hotels/${hotelId}`);
            addNotification('success', 'Готель успішно видалено');
            fetchHotels();
            setDeleteConfirm(null);
            setDeleteStep(0);
        } catch (err) {
            console.error('Помилка при видаленні готелю:', err);
            addNotification('error', 'Не вдалося видалити готель');
        }
    };

    const fetchRooms = async (hotelId) => {
        try {
            const response = await api.get(`/rooms/?hotel_id=${hotelId}`);
            setHotelRooms((prev) => ({ ...prev, [hotelId]: response.data.length }));
        } catch (error) {
            console.error(`Failed to fetch rooms for hotel ${hotelId}:`, error);
        }
    };

    const fetchHotelStats = async (hotelId) => {
        try {
            const response = await api.get(`/hotels/${hotelId}/stats/full`);
            setHotelStats((prev) => ({ ...prev, [hotelId]: response.data }));
        } catch (error) {
            console.error(`Failed to fetch stats for hotel ${hotelId}:`, error);
        }
    };

    useEffect(() => {
        hotels.forEach((hotel) => {
            fetchRooms(hotel.id);
            fetchHotelStats(hotel.id);
        });
    }, [hotels]);

    const calculateRoomCount = () => {
        return Object.values(hotelRooms).reduce((total, count) => total + count, 0);
    };

    const stats = [
        { label: 'Готелів', value: hotels.length, icon: <FaHotel className="text-3xl text-blue-600" /> },
        { label: 'Номерів', value: calculateRoomCount(), icon: <FaBed className="text-3xl text-green-600" /> },
        { label: 'Бронювань', value: summary.bookings ?? 0, icon: <FaClipboardList className="text-3xl text-yellow-600" /> },
        { label: 'Дохід', value: `$${Number(summary.income ?? 0).toLocaleString()}`, icon: <FaMoneyBillWave className="text-3xl text-indigo-600" /> },
    ];


    return (
        <div className="min-h-screen !bg-gray-100 pb-10">
            <header className="!bg-white shadow px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <h1 className="text-2xl font-bold !text-blue-700 cursor-pointer" onClick={() => navigate('/')}>HotelHub</h1><button
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
                <FaUserCircle className="text-3xl" /> {/* Іконка з розміром */}
            </button>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center my-6">
                    <h2 className="text-2xl font-bold text-blue-800">Панель керування</h2>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="!bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 flex items-center gap-2 transition"
                    >
                        <FaPlus /> Додати готель
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {stats.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-6 rounded-2xl shadow flex items-center gap-4"
                        >
                            {s.icon}
                            <div>
                                <p className="text-sm text-gray-500">{s.label}</p>
                                <p className="text-xl font-semibold">{s.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid-cols-1 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hotels.map((hotel) => (
                        <motion.div
                            key={hotel.id}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer relative"
                            onClick={() => navigate(`/hotels/${hotel.id}`)}
                        >
                            <img src={hotel.images?.[0]?.image_url} className="rounded-t-xl h-48 sm:h-64 w-full object-cover" />
                            <div className="p-4">
                                <h4 className="text-lg font-bold text-blue-700 flex justify-between items-center">
                                    {hotel.name}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteConfirm(hotel);
                                            setDeleteStep(0);
                                        }}
                                        className="text-red-600 hover:text-red-800 text-sm ml-2"
                                    >
                                        <FaTrash />
                                    </button>
                                </h4>
                                <p className="text-sm text-gray-500">
                                    {hotel.address?.street}, {hotel.address?.city}, {hotel.address?.country}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">{hotel.description}</p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Кількість номерів: {hotelStats[hotel.id]?.rooms}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <Modal
                    open={!!deleteConfirm}
                    onClose={() => { setDeleteConfirm(null); setDeleteStep(0); }}
                    title="Підтвердження видалення готелю"
                >
                    <p className="mb-4 text-gray-700">
                        Ви дійсно хочете видалити готель <strong>{deleteConfirm?.name}</strong>?<br />
                        Це призведе до видалення всіх повʼязаних номерів, працівників, бронювань та зображень.
                    </p>

                    {deleteStep < 2 ? (
                        <button
                            onClick={() => setDeleteStep(deleteStep + 1)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            {`Підтвердити (${deleteStep + 1}/3)`}
                        </button>
                    ) : (
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                            >
                                Скасувати
                            </button>
                            <button
                                onClick={() => handleHotelDelete(deleteConfirm.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Видалити назавжди
                            </button>
                        </div>
                    )}
                </Modal>
            </div>
                <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            className="bg-white p-6 rounded-xl shadow-xl w-full w-full mx-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-bold mb-4 text-blue-700">Новий готель</h2>

                            <input
                                type="text"
                                placeholder="Назва"
                                value={newHotel.name}
                                onChange={(e) => setNewHotel({ ...newHotel, name: e.target.value })}
                                className={`mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                            />

                            <p className="text-sm text-gray-500 mt-3 mb-2">
                                Адреса: {
                                newHotel.street
                                    ? `${newHotel.street}, ${newHotel.city}, ${newHotel.country}`
                                    : 'Оберіть на мапі'
                            }
                            </p>

                            <MapPicker onLocationSelect={async (pos) => {
                                const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${pos.lat},${pos.lng}&key=${GOOGLE_MAPS_API}`);
                                const data = await res.json();
                                const comp = data.results[0]?.address_components || [];

                                const get = (type) => comp.find((c) => c.types.includes(type))?.long_name || '';

                                setNewHotel((prev) => ({
                                    ...prev,
                                    street: `${get('route')} ${get('street_number')}`.trim(),
                                    city: get('locality'),
                                    state: get('administrative_area_level_1'),
                                    country: get('country'),
                                    postal_code: get('postal_code'),
                                    latitude: pos.lat,
                                    longitude: pos.lng,
                                }));
                            }} />
                            <textarea
                                placeholder="Опис"
                                value={newHotel.description}
                                onChange={(e) => setNewHotel({ ...newHotel, description: e.target.value })}
                                className={`mt-3 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[100px]`}
                            />

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 !bg-gray-200 !text-gray-800 rounded-lg hover:bg-gray-300 transition-all"
                                >
                                    Скасувати
                                </button>
                                <button
                                    onClick={() => { createHotel(); fetchHotels(); setShowAddModal(false); }}
                                    className="px-4 py-2 !bg-blue-600 text-white rounded-lg !hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Додати
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Dashboard;

