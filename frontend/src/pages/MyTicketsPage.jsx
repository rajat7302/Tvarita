import React, { useEffect, useState } from 'react';
import { Calendar, Loader2, MapPin, Ticket } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import api from '../services/api';

const getQrUrl = (ticketCode) => `https://quickchart.io/qr?text=${encodeURIComponent(ticketCode)}&size=220`;

export default function MyTicketsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auth/bookings')
      .then((response) => setBookings(Array.isArray(response.data) ? response.data : []))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Could not load your tickets.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-gray-900">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Your bookings</p>
        <h1 className="mt-1 text-3xl font-extrabold">My Tickets</h1>
        <p className="mt-2 text-sm text-gray-500">Show your ticket QR code at the venue.</p>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-amber-800" /></div>
        ) : error ? (
          <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>
        ) : bookings.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-amber-100 bg-white p-10 text-center text-sm text-gray-500">No tickets booked yet.</div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {bookings.map((booking) => (
              <article key={booking._id} className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
                <div className="flex gap-4 p-5">
                  {booking.ticketCode && <img src={getQrUrl(booking.ticketCode)} alt={`QR for ticket ${booking.ticketCode}`} className="h-28 w-28 rounded-lg border border-amber-100 p-1" />}
                  <div className="min-w-0 flex-1">
                    <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${booking.ticketStatus === 'used' ? 'text-gray-500' : 'text-emerald-700'}`}><Ticket className="h-4 w-4" />{booking.ticketStatus || 'valid'}</div>
                    <h2 className="mt-2 truncate text-lg font-extrabold">{booking.showId?.title || 'Cultural Show'}</h2>
                    <p className="mt-2 flex items-center gap-1 text-xs text-gray-500"><MapPin className="h-3.5 w-3.5" />{booking.showId?.venue || 'Venue to be announced'}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-500"><Calendar className="h-3.5 w-3.5" />{booking.showId?.date ? new Date(booking.showId.date).toLocaleString() : 'Date to be announced'}</p>
                    <p className="mt-1 text-xs text-gray-500">{booking.ticketsBooked} ticket{booking.ticketsBooked === 1 ? '' : 's'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap justify-between gap-2 border-t border-amber-100 bg-amber-50/50 px-5 py-3 text-xs">
                  <span className="font-bold text-gray-600">{booking.ticketCode || 'Legacy booking'}</span>
                  <span className="font-bold text-emerald-700">₹{booking.totalPaid}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
