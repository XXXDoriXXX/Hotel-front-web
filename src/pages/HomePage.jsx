import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { motion } from 'framer-motion';
import { FaHotel, FaRegSmileBeam, FaShieldAlt } from 'react-icons/fa';
import { MdSpeed } from 'react-icons/md';

const HomePage = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-white text-gray-800">
            <header className="flex justify-between items-center px-6 py-4 bg-white shadow-md fixed w-full z-50">
                <Link to="/" className="text-2xl font-bold text-blue-600">HotelHub</Link>
                <nav className="flex gap-4 items-center">
                    {!user ? (
                        <>
                            <Link to="/login" className="text-gray-700 hover:text-blue-600 transition">Увійти</Link>
                            <Link to="/register" className="bg-blue-600 !text-white px-4 py-2 rounded-full hover:bg-blue-700 transition">
                                Зареєструватись
                            </Link>
                        </>
                    ) : (
                        <Link to="/dashboard" className="bg-green-600 !text-white px-4 py-2 rounded-full hover:bg-green-700 transition">
                            Кабінет
                        </Link>
                    )}
                </nav>
            </header>

            <section className="pt-32 pb-20 px-6 bg-gradient-to-r from-blue-100 to-blue-300">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl font-extrabold text-blue-800 mb-6 leading-tight">
                            Платформа для керування готелем
                        </h1>
                        <p className="text-lg text-gray-700 mb-8">
                            Створено для власників готелів. Повний контроль над номерами, бронюванням і аналітикою.
                        </p>
                        {!user ? (
                            <Link
                                to="/register"
                                className="inline-block bg-gradient-to-r from-blue-600 to-blue-800 !text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
                            >
                                🚀 Почати безкоштовно
                            </Link>
                        ) : (
                            <Link
                                to="/dashboard"
                                className="inline-block bg-green-600 !text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition"
                            >
                                Перейти до кабінету
                            </Link>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative"
                    >
                        <img
                            src="https://hotelimmagesolution.s3.eu-north-1.amazonaws.com/HOTEL/Dashboard.png"
                            alt="Hotel preview"
                            className="rounded-2xl shadow-xl"
                        />
                    </motion.div>
                </div>
            </section>

            <section className="max-w-5xl mx-auto py-14 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="overflow-hidden rounded-3xl shadow-xl"
                >
                    <Carousel autoPlay infiniteLoop showThumbs={false} showStatus={false}>
                        <div>
                            <img src="https://hotelimmagesolution.s3.eu-north-1.amazonaws.com/HOTEL/HotelCreate.png" alt="Управління готелем" />
                            <p className="legend">Інтуїтивна панель управління</p>
                        </div>
                        <div>
                            <img src="https://hotelimmagesolution.s3.eu-north-1.amazonaws.com/HOTEL/HotelStatistic.png" alt="Перегляд статистики" />
                            <p className="legend">Гнучке налаштування номерів</p>
                        </div>
                        <div>
                            <img src="https://hotelimmagesolution.s3.eu-north-1.amazonaws.com/HOTEL/HotelBookings.png" alt="Список бронювать" />
                            <p className="legend">Бронювання без зайвих кроків</p>
                        </div>
                    </Carousel>
                </motion.div>
            </section>

            <section className="py-16 bg-gray-100">
                <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8">
                    {[
                        { title: 'Керування готелями', desc: 'Додавайте, редагуйте готелі, завантажуйте фото.', icon: <FaHotel className="text-blue-500 text-3xl mb-3" /> },
                        { title: 'Швидке бронювання', desc: 'Все працює як треба. І швидко.', icon: <MdSpeed className="text-blue-500 text-3xl mb-3" /> },
                        { title: 'Захист даних', desc: 'Ваші дані в безпеці — ми не спимо 😎', icon: <FaShieldAlt className="text-blue-500 text-3xl mb-3" /> },
                        { title: 'Звіти та аналітика', desc: 'Доходи, популярність, завантаження — все на виду.', icon: <FaRegSmileBeam className="text-blue-500 text-3xl mb-3" /> },
                    ].map((f, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.03 }}
                            className="bg-white p-8 rounded-2xl shadow-md text-center"
                        >
                            {f.icon}
                            <h3 className="text-xl font-bold text-blue-700 mb-2">{f.title}</h3>
                            <p className="text-gray-600">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="py-20 bg-blue-700 !text-white text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl font-bold mb-4"
                >
                    Готові автоматизувати свій готель?
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6 text-lg"
                >
                    Реєстрація безкоштовна і займає менше хвилини.
                </motion.p>
                {!user ? (
                    <Link to="/register" className="bg-white text-blue-600 font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition">
                         Почати зараз
                    </Link>
                ) : (
                    <Link to="/dashboard" className="bg-white text-blue-600 font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition">
                         До кабінету
                    </Link>
                )}
            </section>
            <footer className="py-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-center text-sm">
                <p>&copy; {new Date().getFullYear()} HotelHub. Зроблено з ❤️ для готельєрів.</p>
            </footer>
        </div>
    );
};

export default HomePage;
