import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { FaCheck, FaTimes } from "react-icons/fa";
import dayjs from "dayjs";


const getStatusStyle = (status) => {
    switch (status) {
        case "confirmed": return "bg-green-100 text-green-700";
        case "completed": return "bg-blue-100 text-blue-700";
        case "cancelled": return "bg-red-100 text-red-700";
        case "awaiting_confirmation": return "bg-yellow-100 text-yellow-700";
        default: return "bg-gray-100 text-gray-700";
    }
};

const BookingList = ({ bookings, fetchMore, hasMore, confirmCash, cancelCash, onRefund }) => (
    <div>
        <h3 className="text-xl font-semibold mb-4">Бронювання</h3>
        <InfiniteScroll
            dataLength={bookings.length}
            next={fetchMore}
            hasMore={hasMore}
            loader={<p className="text-gray-500 text-center mt-4">Завантаження...</p>}
            endMessage={<p className="text-gray-500 text-center mt-4">Усі бронювання завантажено.</p>}
        >
            <ul className="divide-y">
                {bookings.map((b, idx) => (
                    <li key={idx} className="py-4 space-y-2 border-b">
                        <p><strong>Кімната:</strong> #{b.room_number}</p>
                        <p><strong>Клієнт:</strong> {b.client_name}</p>
                        <p><strong>Email:</strong> {b.email}</p>
                        <p><strong>Телефон:</strong> {b.phone || 'Невідомо'}</p>
                        <p><strong>Тип оплати:</strong> {b.is_card ? 'Картка' : 'Готівка'}</p>
                        <p><strong>Сума:</strong> {b.amount} $</p>
                        <p>
                            <strong>Період:</strong>{' '}
                            {dayjs(b.period_start).format("DD.MM.YYYY")} – {dayjs(b.period_end).format("DD.MM.YYYY")}
                        </p>
                        <p>
                            <strong>Статус:</strong>{' '}
                            <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${getStatusStyle(b.status)}`}>
                {b.status}
              </span>
                        </p>

                        {!b.is_card && b.status === 'awaiting_confirmation' && (
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => confirmCash(b.booking_id)}
                                    className="px-3 py-1 rounded bg-green-600 text-white flex items-center gap-1 hover:bg-green-700"
                                >
                                    <FaCheck /> Підтвердити
                                </button>
                                <button
                                    onClick={() => cancelCash(b.booking_id)}
                                    className="px-3 py-1 rounded bg-red-600 text-white flex items-center gap-1 hover:bg-red-700"
                                >
                                    <FaTimes /> Відхилити
                                </button>
                            </div>
                        )}
                        {b.status === 'confirmed' && b.is_card && (
                            <button
                                onClick={() => onRefund(b)}
                                className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600 mt-2"
                            >
                                Повернути гроші
                            </button>
                        )}
                    </li>
                ))}
            </ul>

        </InfiniteScroll>

    </div>
);

export default BookingList;
