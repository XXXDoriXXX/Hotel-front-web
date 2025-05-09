import React, { useEffect, useState } from 'react';
import { api } from '../api/api';
import EmployeeForm from '../components/EmployeeForm';
import EmployeeDetailsModal from '../components/EmployeeDetailsModal';
import Modal from '../components/Modal';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useNotification } from '../components/NotificationContext.jsx';

const EmployeesPage = ({ hotelId }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const { addNotification } = useNotification();

    const fetchEmployees = async () => {
        try {
            const res = await api.get(`/employees/hotel/${hotelId}`);
            setEmployees(res.data);
        } catch (err) {
            console.error('Помилка при завантаженні:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleDelete = async () => {
        if (!employeeToDelete) return;
        try {
            await api.delete(`/employees/${employeeToDelete.id}`);
            setEmployees(prev => prev.filter(e => e.id !== employeeToDelete.id));
            setEmployeeToDelete(null);
            addNotification('success', 'Працівника звільнено');
        } catch (err) {
            console.error('Помилка при звільнені:', err);
        }
    };

    const handleEdit = (employee) => {
        setEditingEmployee(employee);
        setShowForm(true);
    };

    const handleSuccess = () => {
        setShowForm(false);
        setEditingEmployee(null);
        fetchEmployees();
    };

    const openDetails = (employee) => {
        setSelectedEmployee(employee);
        setShowDetailModal(true);
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-blue-700">Управління працівниками</h1>
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={() => {
                        setEditingEmployee(null);
                        setShowForm(true);
                    }}
                >
                    <FaPlus className="inline mr-2" /> Додати працівника
                </button>
            </div>

            {loading ? (
                <p>Завантаження...</p>
            ) : employees.length === 0 ? (
                <p>Немає працівників.</p>
            ) : (
                <table className="w-full mt-4 border rounded-lg overflow-hidden text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                    <tr>
                        <th className="px-4 py-3 text-left">Ім'я</th>
                        <th className="px-4 py-3 text-left">Прізвище</th>
                        <th className="px-4 py-3 text-left">Посада</th>
                        <th className="px-4 py-3 text-left">Зарплата</th>
                        <th className="px-4 py-3 text-center">Дії</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y">
                    {employees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-blue-600 cursor-pointer hover:underline" onClick={() => openDetails(emp)}>{emp.first_name}</td>
                            <td className="px-4 py-2 text-blue-600 cursor-pointer hover:underline" onClick={() => openDetails(emp)}>{emp.last_name}</td>
                            <td className="px-4 py-2">{emp.position}</td>
                            <td className="px-4 py-2">{emp.salary} $</td>
                            <td className="px-4 py-2 text-center space-x-3">
                                <button onClick={() => handleEdit(emp)} className="text-blue-600 hover:text-blue-800">
                                    <FaEdit />
                                </button>
                                <button onClick={() => setEmployeeToDelete(emp)} className="text-red-600 hover:text-red-800">
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            <Modal open={showForm} onClose={() => setShowForm(false)} title={editingEmployee ? 'Редагування працівника' : 'Новий працівник'}>
                <EmployeeForm
                    hotelId={hotelId}
                    initialData={editingEmployee}
                    onSuccess={handleSuccess}
                    onCancel={() => setShowForm(false)}
                />
            </Modal>

            <Modal open={showDetailModal} onClose={() => setShowDetailModal(false)} title="Деталі працівника">
                {selectedEmployee && (
                    <EmployeeDetailsModal
                        employee={selectedEmployee}
                        onClose={() => setShowDetailModal(false)}
                    />
                )}
            </Modal>

            <Modal open={!!employeeToDelete} onClose={() => setEmployeeToDelete(null)} title="Підтвердження звільнення">
                <p className="mb-4">Ви впевнені, що хочете звільнити <strong>{employeeToDelete?.first_name} {employeeToDelete?.last_name}</strong>?</p>
                <div className="flex justify-end gap-4">
                    <button onClick={() => setEmployeeToDelete(null)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Скасувати</button>
                    <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Звільнити</button>
                </div>
            </Modal>
        </div>
    );
};

export default EmployeesPage;