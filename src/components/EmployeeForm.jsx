import React, { useEffect, useState } from 'react';
import { api } from '../api/api';

const EmployeeForm = ({ hotelId, initialData = null, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        position: '',
        salary: '',
        hotel_id: hotelId
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                first_name: initialData.first_name,
                last_name: initialData.last_name,
                position: initialData.position,
                salary: initialData.salary,
                hotel_id: hotelId
            });
        }
    }, [initialData, hotelId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'salary' ? parseFloat(value) || '' : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (initialData) {
                await api.put(`/employees/${initialData.id}`, formData);
            } else {
                await api.post('/employees/', formData);
            }
            onSuccess();
        } catch (err) {
            console.error('Помилка при збереженні працівника:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
                <h2 className="text-xl font-bold mb-4">
                    {initialData ? 'Редагувати працівника' : 'Додати працівника'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Ім'я *</label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className="w-full border border-gray-300 focus:ring focus:ring-blue-200 focus:outline-none px-3 py-2 rounded-lg transition"

                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Прізвище *</label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className="w-full border border-gray-300 focus:ring focus:ring-blue-200 focus:outline-none px-3 py-2 rounded-lg transition"

                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Посада *</label>
                        <input
                            type="text"
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            className="w-full border border-gray-300 focus:ring focus:ring-blue-200 focus:outline-none px-3 py-2 rounded-lg transition"

                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Зарплата ($) *</label>
                        <input
                            type="number"
                            name="salary"
                            value={formData.salary}
                            onChange={handleChange}
                            className="w-full border border-gray-300 focus:ring focus:ring-blue-200 focus:outline-none px-3 py-2 rounded-lg transition"

                            min="0"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
                        >
                            Скасувати
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                        >
                            {isSubmitting ? 'Збереження...' : 'Зберегти'}
                        </button>
                    </div>
                </form>
            </div>
    );
};

export default EmployeeForm;
