import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const HotelStatsChart = ({ data }) => {
    const months = ['Січ', 'Лют', 'Бер', 'Квіт', 'Трав', 'Черв', 'Лип', 'Серп', 'Вер', 'Жовт', 'Лист', 'Груд'];

    const incomeData = (data?.monthly_income || []).map(item => ({
        month: months[item.month - 1],
        income: item.total,
        bookings: item.bookings || 0
    }));

    return (
        <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div className="bg-white p-4 rounded-xl shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Дохід по місяцях</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={incomeData}>
                        <CartesianGrid stroke="#ccc" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={3} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Бронювання по місяцях</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={incomeData}>
                        <CartesianGrid stroke="#ccc" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="bookings" fill="#10b981" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
