import { createContext, useContext, useState } from 'react';
import { api } from '../api/api';

const HotelContext = createContext();

export const useHotel = () => useContext(HotelContext);

export const HotelProvider = ({ children }) => {
    const [hotels, setHotels] = useState([]);
    const [newHotel, setNewHotel] = useState({
        name: '',
        description: '',
        street: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        latitude: null,
        longitude: null,
        imageFile: null,
    });

    const createHotel = async () => {
        try {
            if (!newHotel.name || !newHotel.street || !newHotel.city || !newHotel.country) {
                alert('Будь ласка, заповніть всі обовʼязкові поля: назва, адреса, місто, країна');
                return;
            }

            const payload = {
                name: newHotel.name,
                description: newHotel.description,
                address: {
                    street: newHotel.street,
                    city: newHotel.city,
                    state: newHotel.state,
                    country: newHotel.country,
                    postal_code: newHotel.postal_code,
                    latitude: newHotel.latitude,
                    longitude: newHotel.longitude,
                },
            };

            const res = await api.post('/hotels/', payload);
            const createdHotel = res.data;

            if (newHotel.imageFile) {
                const formData = new FormData();
                formData.append('file', newHotel.imageFile);

                await api.post(`/hotels/${createdHotel.id}/images`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                createdHotel.images = [{
                    id: 1,
                    hotel_id: createdHotel.id,
                    image_url: `https://example.com/your-image-url/${newHotel.imageFile.name}`,
                }];
            }

            setHotels((prev) => [...prev, createdHotel]);
            resetNewHotel();
        } catch (err) {
            console.error('createHotel error:', err);
            alert(err.response?.data?.detail || 'Помилка створення готелю');
        }
    };

    const resetNewHotel = () => {
        setNewHotel({
            name: '',
            description: '',
            street: '',
            city: '',
            state: '',
            imageFile: null,
            country: '',
            postal_code: '',
            latitude: null,
            longitude: null,
        });
    };

    const fetchHotels = async () => {
        try {
            const res = await api.get('/hotels/my');
            setHotels(res.data);
        } catch (err) {
            console.error('fetchHotels error:', err);
            alert('Не вдалося завантажити готелі. Можливо, ви не авторизовані.');
        }
    };

    return (
        <HotelContext.Provider value={{
            hotels,
            setHotels,
            newHotel,
            setNewHotel,
            createHotel,
            fetchHotels,
        }}>
            {children}
        </HotelContext.Provider>
    );
};
