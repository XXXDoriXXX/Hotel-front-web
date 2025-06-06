    import React, { useState, useEffect, useRef } from 'react';
    import { api } from '../api/api';
    import { FaPlus, FaTrash } from 'react-icons/fa';
    import { ImSpinner2 } from 'react-icons/im';
    
    const RoomEditModal = ({ hotelId, roomId = null, onClose, onSuccess }) => {
        const [roomData, setRoomData] = useState({
            room_number: '',
            room_type: 'standard',
            places: 1,
            price_per_night: 0,
            hotel_id: hotelId,
            description: '',
            amenities: []
        });
        const [images, setImages] = useState([]);
        const [availableAmenities, setAvailableAmenities] = useState([]);
        const [errors, setErrors] = useState({});
        const [isUploading, setIsUploading] = useState(false);
        const [deletingImageId, setDeletingImageId] = useState(null);
        const [isLoading, setIsLoading] = useState(false);
        const inputRef = useRef();
    
        useEffect(() => {
            const fetchData = async () => {
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
                    console.error('Load error:', err);
                    onClose();
                }
            };
            fetchData();
        }, [roomId, hotelId, onClose]);
    
        const handleChange = (e) => {
            const { name, value } = e.target;
            setRoomData(prev => ({
                ...prev,
                [name]: ['places', 'price_per_night'].includes(name) ? parseFloat(value) || 0 : value
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
    
        const handleFiles = async (files) => {
            setIsUploading(true);
            try {
                for (const file of files) {
                    const formData = new FormData();
                    formData.append('file', file);
                    const res = await api.post(`/rooms/${roomId || roomData.id}/images`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    setImages(prev => [...prev, res.data]);
                }
            } catch (err) {
                console.error('Upload error:', err);
            } finally {
                setIsUploading(false);
            }
        };
    
        const handleImageUpload = async (e) => {
            const files = Array.from(e.target.files);
            if (files.length) await handleFiles(files);
        };
    
        const handleDrop = async (e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files);
            if (files.length) await handleFiles(files);
        };
    
        const deleteImage = async (imageId) => {
            setDeletingImageId(imageId);
            try {
                await api.delete(`/rooms/images/${imageId}`);
                setImages(prev => prev.filter(img => img.id !== imageId));
            } catch (err) {
                console.error('Delete error:', err);
            } finally {
                setDeletingImageId(null);
            }
        };
    
        const handleSubmit = async (e) => {
            e.preventDefault();
            setIsLoading(true);
            setErrors({});
    
            try {
                const payload = {
                    ...roomData,
                    amenity_ids: roomData.amenities
                };
                if (roomId) {
                    await api.put(`/rooms/${roomId}`, payload);
                } else {
                    const res = await api.post('/rooms/', payload);
                    setRoomData(prev => ({ ...prev, id: res.data.id }));
                }
                onSuccess();
            } catch (err) {
                if (err.response?.data?.detail) {
                    setErrors(err.response.data.detail);
                }
                console.error('Save error:', err);
            } finally {
                setIsLoading(false);
            }
        };
    
        return (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium">Номер кімнати</label>
                        <input
                            name="room_number"
                            value={roomData.room_number}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Тип кімнати</label>
                        <select
                            name="room_type"
                            value={roomData.room_type}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                            <option value="standard">Стандарт</option>
                            <option value="deluxe">Делюкс</option>
                            <option value="suite">Люкс</option>
                            <option value="family">Сімейний</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Місць</label>
                        <input
                            name="places"
                            type="number"
                            min="1"
                            max="10"
                            value={roomData.places}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Ціна за ніч</label>
                        <input
                            name="price_per_night"
                            type="number"
                            value={roomData.price_per_night}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>
    
                <div>
                    <label className="text-sm font-medium">Опис</label>
                    <textarea
                        name="description"
                        value={roomData.description}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                </div>
    
                <div>
                    <label className="text-sm font-medium">Зручності</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {availableAmenities.map(amenity => (
                            <label key={amenity.id} className="flex items-center space-x-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={roomData.amenities.includes(amenity.id)}
                                    onChange={() => handleAmenityChange(amenity.id)}
                                />
                                <span>{amenity.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
    
                {roomData.id && (
                    <div>
                        <label className="text-sm font-medium">Зображення</label>
                        <div className="grid grid-cols-1 grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                            {images.map((img) => (
                                <div key={img.id} className="relative group">
                                    <img
                                        src={img.image_url}
                                        alt="Room"
                                        className={`w-full h-28 object-cover rounded-lg transition-opacity duration-300 ${
                                            deletingImageId === img.id ? 'opacity-30' : 'opacity-100'
                                        }`}
                                    />
                                    {deletingImageId === img.id && (
                                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg z-10">
                                            <ImSpinner2 className="animate-spin text-xl text-red-600" />
                                        </div>
                                    )}
                                    <button
                                        onClick={() => deleteImage(img.id)}
                                        disabled={deletingImageId === img.id}
                                        className="absolute top-2 right-2 text-white bg-red-600 p-1 rounded-full text-xs z-20"
                                        type="button"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>
    
                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            onClick={() => !isUploading && inputRef.current.click()}
                            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                                isUploading ? 'bg-gray-100 text-gray-400' : 'hover:bg-blue-50 border-blue-300 text-blue-600'
                            }`}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                ref={inputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={isUploading}
                            />
                            <p className="text-sm">
                                {isUploading ? 'Завантаження...' : ' Перетягніть або натисніть для вибору зображень'}
                            </p>
                        </div>
                    </div>
                )}
    
                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">
                        Скасувати
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Збереження...' : 'Зберегти'}
                    </button>
                </div>
            </form>
        );
    };
    
    export default RoomEditModal;