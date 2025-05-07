import React from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export const DynamicCharts = ({ data }) => {
    const COLORS = ["#3b82f6", "#facc15", "#10b981"];

    const paymentData = Object.entries(data.payment_distribution).map(([type, value]) => ({ name: type, value }));

    return (
        <div className="space-y-8">
            <ChartWrapper title="Дохід по днях">
                <LineChart data={data.daily_income}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
            </ChartWrapper>

            <ChartWrapper title="Бронювання по тижнях">
                <BarChart data={data.weekly_bookings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" />
                </BarChart>
            </ChartWrapper>

            <ChartWrapper title="Популярність типів номерів">
                <BarChart data={data.room_type_popularity}>
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f59e0b" />
                </BarChart>
            </ChartWrapper>

            <ChartWrapper title="Розподіл оплат">
                <PieChart>
                    <Pie data={paymentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                        {paymentData.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ChartWrapper>
        </div>
    );
};

const ChartWrapper = ({ title, children }) => (
    <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-lg font-semibold mb-2">{title}</h4>
        <ResponsiveContainer width="100%" height={300}>{children}</ResponsiveContainer>
    </div>
);

