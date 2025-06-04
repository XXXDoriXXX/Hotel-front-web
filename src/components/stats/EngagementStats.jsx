import React from "react";
import { FaStar, FaEye, FaHeart } from "react-icons/fa";

export const EngagementStats = ({ data }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={<FaStar />} title="Рейтинг" value={data.average_rating.toFixed(1)} />
        <StatCard icon={<FaEye />} title="Перегляди" value={data.total_views} />
        <StatCard icon={<FaHeart />} title="Улюблене" value={data.favorites} />
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
