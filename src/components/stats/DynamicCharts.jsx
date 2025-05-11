import React from "react";
import {
    LineChart, Line,
    BarChart, Bar,
    XAxis, YAxis,
    CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, LabelList
} from "recharts";

const COLORS = ["#3b82f6", "#facc15", "#10b981"];

const formatCurrency = (val) => `${val.toLocaleString()} $`;

const paymentLabels = {
    card: 'Картка',
    cash: 'Готівка'
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div className="bg-white border shadow p-2 rounded text-sm">
                <p className="font-semibold">{label}</p>
                {payload.map((entry, idx) => (
                    <p key={idx} className="text-blue-700">
                        {entry.name || entry.dataKey}: {formatCurrency(entry.value)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export const DynamicCharts = ({ data }) => {
    const paymentData = Object.entries(data.payment_distribution).map(([type, value]) => ({
        name: paymentLabels[type] || type,
        value
    }));

    return (
        <div className="space-y-8">
            <ChartWrapper title="Дохід по днях">
                <LineChart data={data.daily_income}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ChartWrapper>

            <ChartWrapper title="Бронювання по тижнях">
                <BarChart data={data.weekly_bookings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#10b981">
                        <LabelList dataKey="count" position="top" />
                    </Bar>
                </BarChart>
            </ChartWrapper>

            <ChartWrapper title="Популярність типів номерів">
                <BarChart data={data.room_type_popularity}>
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#f59e0b">
                        <LabelList dataKey="count" position="top" />
                    </Bar>
                </BarChart>
            </ChartWrapper>

            <ChartWrapper title="Розподіл оплат">
                <PieChart>
                    <Pie
                        data={paymentData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                        {paymentData.map((entry, idx) => (
                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
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

export default DynamicCharts;
