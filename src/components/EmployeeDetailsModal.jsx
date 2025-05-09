import React, { useEffect, useState } from 'react';
import SalaryChart from './SalaryChart';
import {api} from '../api/api.js';

const EmployeeDetailsModal = ({ employee, onClose }) => {
    const [salaryHistory, setSalaryHistory] = useState([]);

    useEffect(() => {
        const fetchSalaryHistory = async () => {
            try {
                const res = await api.get(`/employees/${employee.id}/salary-history`);
                setSalaryHistory(res.data);
            } catch (err) {
                console.error('Помилка при завантаженні salary history:', err);
            }
        };

        if (employee) fetchSalaryHistory();
    }, [employee]);

    if (!employee) return null;

    return (
        <div className="p-1">
            <div className="bg-white p-6 rounded-xl shadow w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-2">
                    {employee.first_name} {employee.last_name}
                </h2>

                <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Посада:</strong> {employee.position}</p>
                    <p><strong>Зарплата:</strong> {employee.salary} $</p>
                </div>

                <div className="mt-6">
                    <h3 className="text-md font-semibold mb-2">Історія змін зарплати:</h3>
                    <SalaryChart salaryHistory={salaryHistory} />
                </div>

                <div className="text-right mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                    >
                        Закрити
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetailsModal;
