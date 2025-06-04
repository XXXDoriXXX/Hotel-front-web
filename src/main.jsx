import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {AuthProvider} from "./context/AuthContext.jsx";
import {BrowserRouter} from "react-router-dom";
import {HotelProvider} from "./context/HotelContext.jsx";
import { NotificationProvider } from './components/NotificationContext.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <HotelProvider>
                    <NotificationProvider>
                        <App />
                    </NotificationProvider>
                </HotelProvider>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);