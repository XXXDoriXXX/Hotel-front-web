
import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((type, message) => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { id, type, message }]);
        setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 4000);
    }, []);

    return (
        <NotificationContext.Provider value={{ addNotification }}>
            {children}
            <div className="fixed top-5 right-5 z-50 space-y-2">
                <AnimatePresence>
                    {notifications.map(({ id, type, message }) => (
                        <motion.div
                            key={id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`px-4 py-3 rounded-lg shadow-lg text-white ${
                                type === 'success'
                                    ? 'bg-green-500'
                                    : type === 'error'
                                        ? 'bg-red-500'
                                        : 'bg-blue-500'
                            }`}
                        >
                            {message}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};
