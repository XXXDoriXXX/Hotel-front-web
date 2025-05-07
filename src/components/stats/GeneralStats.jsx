import React from "react";
import { FaBed, FaClipboardList } from "react-icons/fa";

export const GeneralStats = ({ data }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={<FaBed />} title="Номерів" value={data.total_rooms} />
        <StatCard icon={<FaClipboardList />} title="Активні" value={data.active_bookings} />
        <StatCard icon={<FaClipboardList />} title="Завершені" value={data.completed_bookings} />
        <StatCard icon={<FaClipboardList />} title="Скасовані" value={data.cancelled_bookings} />
        <StatCard icon={<FaClipboardList />} title="Завантаженість" value={`${Math.round(data.occupancy * 100)}%`} />
    </div>
);

const StatCard = ({ icon, title, value }) => (
    <div className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="text-blue-500 text-3xl">{icon}</div>
    </div>
);