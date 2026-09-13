import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { bookShow } from '../../services/artFormService';

export default function BookingModal({ show, isOpen, onClose }) {
  const [tickets, setTickets] = useState(1);
  const [success, setSuccess] = useState(null);

  if (!isOpen || !show) return null;

  const handleBook = async () => {
    const res = await bookShow({ showId: show._id, tickets });
    setSuccess(res);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h4 className="text-xl font-bold text-gray-900 mb-1">Booking Confirmed!</h4>
            <p className="text-xs text-gray-600 mb-3">{success.message}</p>
            <span className="inline-block bg-amber-100 text-amber-900 text-xs font-mono font-bold px-3 py-1 rounded-md">
              Pass ID: {success.bookingId}
            </span>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Reserve Passes</h3>
            <p className="text-sm font-semibold text-[#E65100] mb-4">{show.title}</p>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 mb-4 space-y-1 text-xs text-amber-900">
              <p><strong>Venue:</strong> {show.venue}, {show.city}</p>
              <p><strong>Time:</strong> {show.time}</p>
              <p><strong>Price per Pass:</strong> {show.ticketPrice ? `₹${show.ticketPrice}` : 'Free'}</p>
            </div>

            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-semibold text-gray-700">Number of Passes:</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setTickets(Math.max(1, tickets - 1))}
                  className="w-8 h-8 rounded-lg bg-gray-100 font-bold"
                >
                  -
                </button>
                <span className="font-bold text-gray-900">{tickets}</span>
                <button 
                  onClick={() => setTickets(tickets + 1)}
                  className="w-8 h-8 rounded-lg bg-gray-100 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleBook}
              className="w-full bg-[#E65100] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#D84315] transition"
            >
              Confirm Booking (₹{show.ticketPrice * tickets})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}