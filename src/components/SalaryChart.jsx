import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';

const SalaryChart = ({ salaryHistory }) => {
    const data = [...salaryHistory]
        .sort((a, b) => new Date(a.changed_at) - new Date(b.changed_at))
        .map(entry => ({
            date: dayjs(entry.changed_at).format('DD.MM.YYYY'),
            salary: entry.new_salary
        }));

    return (
        <div className="bg-white rounded-xl shadow p-6 mt-8">
            <h2 className="text-xl font-semibold mb-4">Динаміка змін зарплати</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid stroke="#eee" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(val) => `${val} $`} />
                    <Tooltip formatter={(value) => `${value} $`} />
                    <Line type="monotone" dataKey="salary" stroke="#3b82f6" strokeWidth={3} dot />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SalaryChart;
