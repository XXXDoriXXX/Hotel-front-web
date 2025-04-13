import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import { FaArrowLeft, FaSave, FaBed, FaPlus, FaTrash } from 'react-icons/fa';

const RoomEditPage = () => {
    const { id, roomId } = useParams();
    const navigate = useNavigate();
    const [roomData, setRoomData] = useState({
        room_number: '',
        room_type: 'standard',
        places: 1,
        price_per_night: 0,
        hotel_id: parseInt(id),
        description: '',
        amenities: []
    });
    const [images, setImages] = useState([]);
    const [availableAmenities, setAvailableAmenities] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const amenitiesRes = await api.get('/amenities/room');
                setAvailableAmenities(amenitiesRes.data);

                if (roomId) {
                    const roomRes = await api.get(`/rooms/${roomId}`);
                    setRoomData({
                        ...roomRes.data,
                        amenities: roomRes.data.amenities?.map(a => a.amenity_id) || []
                    });

                    const imagesRes = await api.get(`/rooms/${roomId}/images`);
                    setImages(imagesRes.data);
                }
            } catch (err) {
                console.error('Error loading data:', err);
                navigate(`/hotels/${id}/rooms`);
            }
        };
        fetchInitialData();
    }, [id, roomId, navigate]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setRoomData(prev => ({
            ...prev,
            [name]: name === 'places' || name === 'price_per_night' ?
                parseFloat(value) || 0 : value
        }));
    };

    const handleAmenityChange = (amenityId) => {
        setRoomData(prev => {
            const newAmenities = prev.amenities.includes(amenityId)
                ? prev.amenities.filter(id => id !== amenityId)
                : [...prev.amenities, amenityId];
            return { ...prev, amenities: newAmenities };
        });
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setIsUploading(true);
        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);

                const res = await api.post(
                    `/rooms/${roomId || roomData.id}/images`,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
                setImages(prev => [...prev, res.data]);
            }
        } catch (err) {
            console.error('Помилка завантаження:', err);
        } finally {
            setIsUploading(false);
        }
    };

    const deleteImage = async (imageId) => {
        try {
            await api.delete(`/rooms/images/${imageId}`);
            setImages(prev => prev.filter(img => img.id !== imageId));
        } catch (err) {
            console.error('Помилка видалення:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        try {
            const payload = {
                room_data: {
                    room_number: roomData.room_number,
                    room_type: roomData.room_type,
                    places: roomData.places,
                    price_per_night: roomData.price_per_night,
                    hotel_id: roomData.hotel_id,
                    description: roomData.description
                },
                amenity_ids: roomData.amenities
            };

            if (roomId) {
                await api.put(`/rooms/${roomId}`, payload);
            } else {
                const res = await api.post('/rooms', payload);
                setRoomData(prev => ({ ...prev, id: res.data.id }));
            }

            navigate(`/hotels/${id}/`);
        } catch (err) {
            if (err.response?.data?.detail) {
                setErrors(err.response.data.detail);
            }
            console.error('Помилка збереження:', err);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate(`/hotels/${id}/rooms`)}
                        className="!bg-white text-blue-600 hover:text-blue-800"
                    >
                        <FaArrowLeft className="text-xl" />
                    </button>
                    <h1 className="text-xl font-bold text-blue-700">
                        {roomId ? 'Редагування кімнати' : 'Створення нової кімнати'}
                    </h1>
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Номер кімнати *
                                </label>
                                <input
                                    type="text"
                                    name="room_number"
                                    value={roomData.room_number}
                                    onChange={handleChange}
                                    className={`w-full p-2 border rounded-lg ${errors.room_number ? 'border-red-500' : 'border-gray-300'}`}
                                    required
                                />
                                {errors.room_number && (
                                    <p className="mt-1 text-sm !text-red-600">{errors.room_number}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Тип кімнати *
                                </label>
                                <select
                                    name="room_type"
                                    value={roomData.room_type}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    required
                                >
                                    <option value="standard">Стандарт</option>
                                    <option value="deluxe">Делюкс</option>
                                    <option value="suite">Люкс</option>
                                    <option value="family">Сімейний</option>
                                </select>
                            </div>

                            {/* Кількість місць */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Кількість місць *
                                </label>
                                <input
                                    type="number"
                                    name="places"
                                    min="1"
                                    max="10"
                                    value={roomData.places}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    required
                                />
                            </div>

                            {/* Ціна за ніч */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ціна за ніч (₴) *
                                </label>
                                <input
                                    type="number"
                                    name="price_per_night"
                                    min="0"
                                    step="0.01"
                                    value={roomData.price_per_night}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Опис
                            </label>
                            <textarea
                                name="description"
                                value={roomData.description}
                                onChange={handleChange}
                                rows="3"
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        {/* Зручності */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Зручності
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {availableAmenities.map(amenity => {
                                    console.log('Rendering amenity:', amenity.id, roomData.amenities.includes(amenity.id));
                                    return (
                                        <div key={amenity.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`amenity-${amenity.id}`}
                                                checked={roomData.amenities.includes(amenity.id)}
                                                onChange={() => handleAmenityChange(amenity.id)}
                                                className="h-4 w-4 text-blue-600 rounded"
                                            />
                                            <label htmlFor={`amenity-${amenity.id}`} className="ml-2 text-sm text-gray-700">
                                                {amenity.name}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Зображення */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Зображення
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                {images.map(img => (
                                    <div key={img.id} className="relative group">
                                        <img
                                            src={img.image_url}
                                            alt="Room"
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => deleteImage(img.id)}
                                            className="absolute top-2 right-2 !bg-red-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <FaTrash className="text-xs" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <label className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-200 transition">
                                <FaPlus className="inline mr-2" />
                                {isUploading ? 'Завантаження...' : 'Додати зображення'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    multiple
                                    disabled={isUploading}
                                />
                            </label>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isLoading || isUploading}
                                className="!bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:bg-blue-400"
                            >
                                <FaSave />
                                {isLoading ? 'Збереження...' : 'Зберегти'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoomEditPage;