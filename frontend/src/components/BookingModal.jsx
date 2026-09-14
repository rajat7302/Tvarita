import React, { useState } from 'react';
import axios from 'axios';

export default function BookingModal({ show, user, isOpen, onClose, onBookingSuccess }) {
  const [tickets, setTickets] = useState(1);
  const [patronSupport, setPatronSupport] = useState(false);
  const [patronAmount, setPatronAmount] = useState(100);
  const [message, setMessage] = useState('');

  if (!isOpen || !show) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
        <div className="bg-amber-50 p-6 rounded-xl max-w-sm w-full border border-amber-200 text-center">
          <h3 className="text-lg font-bold text-amber-950 mb-2">Account Required</h3>
          <p className="text-sm text-amber-800 mb-4">Guest users cannot reserve passes. Please sign in to continue.</p>
          <button onClick={onClose} className="px-4 py-2 bg-amber-900 text-white rounded">Close</button>
        </div>
      </div>
    );
  }

  const basePrice = show.ticketPrice * tickets;
  const totalAmount = basePrice + (patronSupport ? Number(patronAmount) : 0);

  const handleBooking = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `http://localhost:5000/api/shows/${show._id}/book`,
        {
          ticketsBooked: tickets,
          patronContribution: patronSupport ? Number(patronAmount) : 0
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Pass reserved successfully!');
      setTimeout(() => {
        onBookingSuccess(res.data.show);
        onClose();
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Booking failed.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-amber-50 p-6 rounded-xl max-w-md w-full border border-amber-200">
        <h3 className="text-xl font-bold text-amber-950 mb-1">{show.title}</h3>
        <p className="text-sm text-amber-700 mb-4">{show.venue} • {new Date(show.date).toLocaleDateString()}</p>

        {show.isSoldOut || show.availableTickets === 0 ? (
          <div className="bg-red-100 text-red-800 p-3 rounded font-bold text-center">TICKETS SOLD OUT</div>
        ) : (
          <div className="space-y-4">
            {message && <div className="bg-amber-200 text-amber-900 p-2 rounded text-sm text-center">{message}</div>}

            <div className="flex justify-between items-center">
              <span className="text-sm text-amber-900">Available Passes: <strong>{show.availableTickets}</strong></span>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-amber-900">Quantity:</label>
                <input
                  type="number"
                  min="1"
                  max={show.availableTickets}
                  value={tickets}
                  onChange={(e) => setTickets(Math.max(1, Math.min(show.availableTickets, Number(e.target.value))))}
                  className="w-16 p-1 border rounded border-amber-300 text-center"
                />
              </div>
            </div>

            {/* Patron Preservation Fund Add-on */}
            <div className="p-3 bg-amber-100 rounded-lg border border-amber-200">
              <label className="flex items-center gap-2 text-sm font-semibold text-amber-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={patronSupport}
                  onChange={(e) => setPatronSupport(e.target.checked)}
                />
                Support Cultural Preservation Fund
              </label>
              {patronSupport && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-amber-800">Add Support (₹):</span>
                  <input
                    type="number"
                    value={patronAmount}
                    onChange={(e) => setPatronAmount(e.target.value)}
                    className="w-20 p-1 text-xs border rounded border-amber-300"
                  />
                </div>
              )}
            </div>

            <div className="border-t border-amber-200 pt-3 flex justify-between items-center text-amber-950 font-bold">
              <span>Total Payable:</span>
              <span>₹{totalAmount}</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={onClose} className="px-4 py-2 text-amber-900">Cancel</button>
              <button onClick={handleBooking} className="px-4 py-2 bg-amber-900 text-white rounded font-medium hover:bg-amber-800">
                Confirm & Reserve Pass
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}