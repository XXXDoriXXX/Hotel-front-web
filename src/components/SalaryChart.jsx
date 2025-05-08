import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';

const SalaryChart = ({ salaryHistory }) => {
    const data = salaryHistory.map(entry => ({
        month: entry.month,
        total: entry.total_salary
    }));

    return (
        <div className="bg-white rounded-xl shadow p-6 mt-8">
            <h2 className="text-xl font-semibold mb-4">Графік витрат на зарплати</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid stroke="#ccc" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(val) => `${val.toLocaleString()} ₴`} />
                    <Tooltip formatter={(value) => `${value.toLocaleString()} ₴`} />
                    <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SalaryChart;
