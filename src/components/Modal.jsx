// Modal.jsx (адаптив + плавна анімація)
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ open, onClose, title, children }) => {
    return (
        <AnimatePresence mode="wait" initial={false}>
            {open && (
                <motion.div
                    key="backdrop"
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } }}
                    exit={{ opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }}
                >
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, y: 60, scale: 0.95 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            transition: {
                                delay: 0.05,
                                duration: 0.35,
                                type: 'spring',
                                stiffness: 240,
                                damping: 22
                            }
                        }}
                        exit={{
                            opacity: 0,
                            y: 40,
                            scale: 0.96,
                            transition: { duration: 0.2, ease: 'easeInOut' }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto sm:rounded-xl"
                    >
                        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2">
                            <h2 className="text-xl font-bold text-blue-700">{title}</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 text-xl font-semibold"
                            >
                                &times;
                            </button>
                        </div>
                        <div>{children}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Modal;