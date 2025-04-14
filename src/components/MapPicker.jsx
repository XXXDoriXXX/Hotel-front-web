import React, { useCallback, useState, useEffect } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = { width: '100%', height: '300px' };
const defaultCenter = { lat: 48.3794, lng: 31.1656 };

const libraries = ['places'];

const MapPicker = ({ onLocationSelect, initialPosition = defaultCenter, readonly = false }) => {
    const [marker, setMarker] = useState(initialPosition);

    useEffect(() => {
        setMarker(initialPosition);
    }, [initialPosition]);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: 'AIzaSyCWzyQ9QxTFJonvEXp-ZZ7qsyNN5YtiWbw',
        libraries,
    });

    const geocodeLatLng = async (lat, lng) => {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyCWzyQ9QxTFJonvEXp-ZZ7qsyNN5YtiWbw`
        );
        const data = await response.json();
        return data?.results?.[0]?.formatted_address || '';
    };

    const onMapClick = useCallback(async (e) => {
        if (readonly) return;

        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMarker({ lat, lng });

        const address = await geocodeLatLng(lat, lng);
        onLocationSelect({ lat, lng, address });
    }, [onLocationSelect, readonly]);

    return isLoaded ? (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={marker}
            zoom={12}
            onClick={onMapClick}
        >
            <Marker position={marker} />
        </GoogleMap>
    ) : <p>Завантаження мапи…</p>;
};

export default MapPicker;
