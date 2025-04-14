import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import MapPicker from '../components/MapPicker';
import { FaArrowLeft, FaSave, FaPlus, FaTrash } from 'react-icons/fa';

const GOOGLE_MAPS_API = 'AIzaSyCWzyQ9QxTFJonvEXp-ZZ7qsyNN5YtiWbw';

const HotelEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [hotelData, setHotelData] = useState({
        name: '',
        description: '',
        address: {
            street: '',
            city: '',
            state: '',
            country: '',
            postal_code: '',
            latitude: 0,
            longitude: 0,
        },
        amenities: [],
    });

    const [availableAmenities, setAvailableAmenities] = useState([]);
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const amenitiesRes = await api.get('/amenities/hotel');
                setAvailableAmenities(amenitiesRes.data);

                const hotelRes = await api.get(`/hotels/${id}`);
                setHotelData({
                    ...hotelRes.data,
                    amenities: hotelRes.data.amenities?.map(a => a.amenity_id) || [],
                });

                setImages(hotelRes.data.images || []);
            } catch (err) {
                console.error('Error loading data:', err);
                navigate('/dashboard');
            }
        };
        fetchInitialData();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setHotelData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAmenityChange = (amenityId) => {
        setHotelData(prev => {
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
                    `/hotels/${id}/images`,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
                setImages(prev => [...prev, res.data]);
            }
        } catch (err) {
            console.error('Error uploading image:', err);
        } finally {
            setIsUploading(false);
        }
    };

    const deleteImage = async (imageId) => {
        try {
            await api.delete(`/hotels/images/${imageId}`);
            setImages(prev => prev.filter(img => img.id !== imageId));
        } catch (err) {
            console.error('Error deleting image:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const confirm = window.confirm("Ви впевнені, що хочете зберегти зміни?");
        if (!confirm) return;

        setIsLoading(true);
        setErrors({});

        try {
            const payload = {
                hotel_data: {
                    name: hotelData.name,
                    description: hotelData.description,
                    address: hotelData.address,
                },
                amenity_ids: hotelData.amenities,
            };

            await api.put(`/hotels/${id}`, payload);
            navigate(`/hotels/${id}`);
        } catch (err) {
            if (err.response?.data?.detail) {
                setErrors(err.response.data.detail);
            }
            console.error('Error saving hotel:', err);
        } finally {
            setIsLoading(false);
        }
    };


    const handleLocationSelect = async (pos) => {
        const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${pos.lat},${pos.lng}&key=${GOOGLE_MAPS_API}`);
        const data = await res.json();
        const comp = data.results[0]?.address_components || [];

        const get = (type) => comp.find((c) => c.types.includes(type))?.long_name || '';

        setHotelData((prev) => ({
            ...prev,
            address: {
                street: `${get('route')} ${get('street_number')}`.trim(),
                city: get('locality'),
                state: get('administrative_area_level_1'),
                country: get('country'),
                postal_code: get('postal_code'),
                latitude: pos.lat,
                longitude: pos.lng,
            },
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate(`/hotels/${id}`)} className="!bg-white text-blue-600 hover:text-blue-800">
                        <FaArrowLeft className="text-xl" />
                    </button>
                    <h1 className="text-xl font-bold text-blue-700">Редагування готелю</h1>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Назва готелю *</label>
                        <input
                            type="text"
                            name="name"
                            value={hotelData.name}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                            required
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Опис</label>
                        <textarea
                            name="description"
                            value={hotelData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Зручності</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {availableAmenities.map(amenity => (
                                <div key={amenity.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`amenity-${amenity.id}`}
                                        checked={hotelData.amenities.includes(amenity.id)}
                                        onChange={() => handleAmenityChange(amenity.id)}
                                        className="h-4 w-4 text-blue-600 rounded"
                                    />
                                    <label htmlFor={`amenity-${amenity.id}`} className="ml-2 text-sm text-gray-700">
                                        {amenity.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Локація</label>
                        <MapPicker onLocationSelect={handleLocationSelect} />
                        <p className="text-sm text-gray-500 mt-2">
                            Обрана адреса: {hotelData.address.street}, {hotelData.address.city}, {hotelData.address.state}, {hotelData.address.country}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Зображення</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                            {images.map(img => (
                                <div key={img.id} className="relative group">
                                    <img src={img.image_url} alt="Hotel" className="w-full h-32 object-cover rounded-lg" />
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
                        <input type="file" multiple onChange={handleImageUpload} disabled={isUploading} />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="!bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:bg-blue-400"
                            disabled={isLoading}
                        >
                            <FaSave />
                            {isLoading ? 'Збереження...' : 'Зберегти зміни'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HotelEditPage;
