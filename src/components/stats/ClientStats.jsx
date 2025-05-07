import React from "react";

export const ClientStats = ({ data }) => (
    <div className="bg-white rounded-lg shadow p-4">
        <h4 className="text-lg font-semibold mb-4">Клієнти</h4>
        <p className="mb-2">Унікальних клієнтів: <strong>{data.unique}</strong></p>
        <table className="min-w-full text-sm">
            <thead>
            <tr className="border-b">
                <th className="py-2 text-left">ID</th>
                <th className="py-2 text-left">Ім’я</th>
                <th className="py-2 text-left">Витрати (₴)</th>
            </tr>
            </thead>
            <tbody>
            {data.top.map(client => (
                <tr key={client.id} className="border-b">
                    <td className="py-2">{client.id}</td>
                    <td className="py-2">{client.name}</td>
                    <td className="py-2">{client.total_spent.toFixed(2)}</td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
);
