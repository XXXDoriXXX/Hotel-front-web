import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from "./pages/HomePage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import HotelPage from "./pages/HotelPage.jsx";
import RoomEditPage from "./pages/RoomEditPage.jsx";
import HotelEditPage from "./pages/HotelEditPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ProfileEditPage from "./pages/ProfileEditPage.jsx";
import { NotificationProvider } from './components/NotificationContext';
function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
                path="/dashboard"
                element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                }
            />
            <Route
                path="/hotels/:id"
                element={
                    <PrivateRoute>
                        <HotelPage  />
                    </PrivateRoute>
                }
            />
            <Route
                path="/hotels/:id/rooms/new"
                element={
                    <PrivateRoute>
                        <RoomEditPage   />
                    </PrivateRoute>
                }
            />
            <Route
                path="/hotels/:id/rooms/:roomId"
                element={
                    <PrivateRoute>
                        <RoomEditPage   />
                    </PrivateRoute>
                }
            />
            <Route
                path="/hotels/:id/edit"
                element={
                    <PrivateRoute>
                        <HotelEditPage  />
                    </PrivateRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <PrivateRoute>
                        <ProfilePage  />
                    </PrivateRoute>
                }
            />
            <Route
                path="/profile/edit"
                element={
                    <PrivateRoute>
                        <ProfileEditPage  />
                    </PrivateRoute>
                }
            />
        </Routes>

    )
}

export default App
