import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export const FinancialOverview = ({ data }) => {
    const pieData = [
        { name: "Картка", value: data.income_card },
        { name: "Готівка", value: data.income_cash },
    ];
    const COLORS = ["#3b82f6", "#10b981"];

    const barData = [
        {
            name: "Суми",
            середня: data.avg_booking_price,
            мін: data.min_booking_price,
            макс: data.max_booking_price,
        },
    ];

    return (
        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="text-lg font-semibold mb-2">Розподіл оплат</h4>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="text-lg font-semibold mb-2">Суми бронювань</h4>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="середня" fill="#3b82f6" />
                        <Bar dataKey="мін" fill="#f59e0b" />
                        <Bar dataKey="макс" fill="#ef4444" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};