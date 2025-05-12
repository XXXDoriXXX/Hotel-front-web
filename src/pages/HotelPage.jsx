import React, {useState, useEffect, useRef} from 'react';
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
import EmployeesPage from './EmployeesPage';
import RoomEditModal from "./RoomEditPage.jsx";
import { motion } from 'framer-motion';
import { ImSpinner2 } from 'react-icons/im';
import { useNotification } from "../components/NotificationContext";


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

import LoadingSpinner from "../components/LoadingSpinner.jsx";
import BookingList from "../components/BookingList.jsx";
import Modal from "../components/Modal.jsx";

const HotelPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [stats, setStats] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [hasMoreBookings, setHasMoreBookings] = useState(true);
    const [bookingsPage, setBookingsPage] = useState(0);
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [editingRoomId, setEditingRoomId] = useState(null);
    const [roomModalKey, setRoomModalKey] = useState(0);
    const { addNotification } = useNotification();
    const [activeTab, setActiveTab] = useState('overview');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [deletingImageId, setDeletingImageId] = useState(null);
    const inputRef = useRef();
    const [refundBooking, setRefundBooking] = useState(null);
    const [refundAmount, setRefundAmount] = useState('');
    const [isRefunding, setIsRefunding] = useState(false);

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
    const fetchMoreBookings = async (overrideSkip = null) => {
        try {
            const skip = overrideSkip !== null ? overrideSkip : bookingsPage;
            const res = await api.get(`/hotels/${id}/bookings?skip=${skip}&limit=25`);
            const newBookings = res.data;

            if (newBookings.length < 25) setHasMoreBookings(false);
            setBookings(prev => [...prev, ...newBookings]);
            setBookingsPage(prev => skip + 25);
        } catch (err) {
            console.error('Error loading bookings:', err);
            setHasMoreBookings(false);
        }
    };

    const handleRefresh = async () => {
        if (isRefreshing) return;
        setIsRefreshing(true);

        setBookings([]);
        setBookingsPage(0);
        setHasMoreBookings(true);

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

            const filteredAmenities = allAmenities.filter((a) =>
                hotelAmenities.some((ha) => ha.amenity_id === a.id)
            );

            setHotel({ ...hotelData, amenities: filteredAmenities });
            setRooms(roomsRes.data);
            setStats(statsRes.data);
            await fetchMoreBookings(0);

            addNotification('success', 'Дані оновлено');
        } catch (err) {
            console.error('Помилка оновлення:', err);
            addNotification('error', 'Не вдалося оновити дані');
        } finally {
            setTimeout(() => setIsRefreshing(false), 3000);
        }
    };



    const fetchRooms = async () => {
        try {
            const roomsRes = await api.get(`/rooms/?hotel_id=${id}`);
            setRooms(roomsRes.data);
        } catch (err) {
            console.error('Error fetching rooms:', err);
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
    const handleManualRefund = async () => {
        const amount = parseFloat(refundAmount);
        if (!amount || amount <= 0 || amount > refundBooking.amount) {
            addNotification('error', 'Сума недійсна або перевищує суму бронювання');
            return;
        }

        setIsRefunding(true);
        try {
            await api.post(`/bookings/${refundBooking.booking_id}/refund-manual`, { amount });
            addNotification('success', `Повернено ${amount} $ клієнту`);
            setRefundBooking(null);
            setRefundAmount('');
            setBookings([]);
            setBookingsPage(0);
            setHasMoreBookings(true);
            await fetchMoreBookings(0);
        } catch (err) {
            console.error('Помилка повернення:', err);
            addNotification('error', 'Не вдалося виконати повернення');
        } finally {
            setIsRefunding(false);
        }
    };


    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setIsUploading(true);
        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);
                await api.post(`/hotels/${id}/images`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            const res = await api.get(`/hotels/${id}`);
            setHotel(prev => ({ ...prev, images: res.data.hotel.images }));
        } catch (err) {
            console.error('Помилка завантаження зображень:', err);
        } finally {
            setIsUploading(false);
        }
    };

    const deleteImage = async (imageId) => {
        setDeletingImageId(imageId);
        try {
            await api.delete(`/hotels/images/${imageId}`);
            setHotel(prev => ({
                ...prev,
                images: prev.images.filter(img => img.id !== imageId),
            }));
        } catch (err) {
            console.error('Помилка видалення:', err);
        } finally {
            setDeletingImageId(null);
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
                        className="!bg-white text-blue-600 hover:text-blue-800 p-2 rounded-full shadow-md transition-all flex-wrap gap-2 justify-between"
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
                        className="!bg-white !text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-all flex-wrap gap-2 justify-between"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => navigate('/profile')}
                        className="w-12 h-12 sm:w-16 sm:h-16 !rounded-full !bg-white text-blue-700 hover:text-blue-900 flex items-center justify-center shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-300 flex-wrap gap-2 justify-between"
                    >
                        <FaUserCircle className="text-2xl sm:text-3xl" />
                    </button>
                </div>
            </header>


            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mb-8 disabled:opacity-50"
                >
                    {isRefreshing ? 'Оновлення...' : '🔄 Оновити дані'}
                </button>

                <div className="flex overflow-x-auto whitespace-nowrap border-b !border-gray-200 mb-6 scrollbar-hide">
                    {['overview', 'rooms', 'stats', 'bookings', 'employees'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 font-medium shrink-0 transition-colors ${
                                activeTab === tab
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab === 'overview' && 'Огляд'}
                            {tab === 'rooms' && 'Кімнати'}
                            {tab === 'stats' && 'Статистика'}
                            {tab === 'bookings' && 'Бронювання'}
                            {tab === 'employees' && 'Працівники'}
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
                            <div className="grid grid-cols-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                {hotel.images?.map((img) => (
                                    <div key={img.id} className="relative group">
                                        <img
                                            src={img.image_url}
                                            alt="Hotel"
                                            loading="lazy"
                                            className="w-full h-48 object-cover rounded-lg"
                                        />

                                        {deletingImageId === img.id && (
                                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg z-10">
                                                <ImSpinner2 className="animate-spin text-xl text-red-600" />
                                            </div>
                                        )}

                                        <button
                                            onClick={() => deleteImage(img.id)}
                                            disabled={deletingImageId === img.id}
                                            className="absolute top-2 right-2 !bg-red-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition z-20"
                                        >
                                            <FaTrash className="text-xs" />
                                        </button>
                                    </div>


                                ))}
                            </div>

                            <div className="w-full bg-blue-100 rounded-lg p-4 space-y-4">
                                <div className="text-blue-700 font-semibold flex items-center gap-2">
                                    <FaPlus className="text-sm" />
                                    Додати фото
                                </div>

                                <div
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        handleImageUpload({ target: { files: e.dataTransfer.files } });
                                    }}
                                    onDragOver={(e) => e.preventDefault()}
                                    onClick={() => !isUploading && inputRef.current.click()}
                                    className={`w-full border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                                        isUploading ? 'bg-gray-100 text-gray-400' : 'hover:bg-blue-50 border-blue-300 text-blue-600'
                                    }`}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={inputRef}
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        disabled={isUploading}
                                    />
                                    <p className="text-sm">
                                        {isUploading ? 'Завантаження...' : 'Перетягніть або натисніть для вибору зображення'}
                                    </p>
                                </div>
                            </div>

                        </motion.div>
                    )}
                    {activeTab === 'rooms' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold">Кімнати готелю</h3>
                                <button
                                    onClick={() => {
                                        setRoomModalKey(prev => prev + 1);
                                        setShowRoomModal(true);
                                    }}
                                    className="!bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                >
                                    <FaPlus /> Додати кімнату
                                </button>
                            </div>

                            {showRoomModal && (
                                <Modal open={showRoomModal} onClose={() => setShowRoomModal(false)} title="Нова кімната">
                                    <RoomEditModal hotelId={id} onClose={() => setShowRoomModal(false)} onSuccess={fetchRooms} />
                                </Modal>
                            )}


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
                                                    {room.price_per_night} $/ніч
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-sm mt-2">{room.description}</p>

                                            <div className="flex justify-end gap-2 mt-4">
                                                <button
                                                    onClick={() => {
                                                        setEditingRoomId(room.id);
                                                        setShowRoomModal(true);
                                                    }}
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
                                    {showRoomModal && (
                                        <Modal
                                            open={showRoomModal}
                                            onClose={() => {
                                                setShowRoomModal(false);
                                                setEditingRoomId(null);
                                            }}
                                            title={editingRoomId ? 'Редагування кімнати' : 'Нова кімната'}
                                        >
                                            <RoomEditModal
                                                hotelId={id}
                                                roomId={editingRoomId}
                                                onClose={() => {
                                                    setShowRoomModal(false);
                                                    setEditingRoomId(null);
                                                }}
                                                onSuccess={() => {
                                                    fetchRooms();
                                                    setShowRoomModal(false);
                                                    setEditingRoomId(null);
                                                }}
                                            />
                                        </Modal>
                                    )}
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
                    {activeTab === 'employees' && <EmployeesPage hotelId={id} />}

                    {activeTab === 'bookings' && (
                        <BookingList
                            bookings={bookings}
                            fetchMore={fetchMoreBookings}
                            hasMore={hasMoreBookings}
                            confirmCash={confirmCash}
                            cancelCash={cancelCash}
                            onRefund={(booking) => setRefundBooking(booking)}
                        />

                    )}
                    <Modal open={!!refundBooking} onClose={() => { setRefundBooking(null); setRefundAmount(''); }} title="Повернення коштів">
                        <p className="text-sm text-gray-700 mb-2">
                            Повернення для <strong>{refundBooking?.client_name}</strong> на суму до <strong>{refundBooking?.amount} $</strong>.
                        </p>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(e.target.value)}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg mb-4"
                            placeholder="Введіть суму повернення"
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setRefundBooking(null)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                                Скасувати
                            </button>
                            <button
                                onClick={handleManualRefund}
                                disabled={isRefunding}
                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                            >
                                {isRefunding ? 'Повернення...' : 'Підтвердити'}
                            </button>
                        </div>
                    </Modal>

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