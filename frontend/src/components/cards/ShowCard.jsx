import React from 'react';
import { Calendar, Clock, MapPin, Ticket } from 'lucide-react';

export default function ShowCard({ show, onBook }) {
  const formattedDate = new Date(show.date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-3 text-xs text-amber-900 font-medium">
          <span className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            <Calendar className="w-3.5 h-3.5 text-[#E65100]" /> {formattedDate}
          </span>
          <span className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-[#E65100]" /> {show.time}
          </span>
        </div>

        <h4 className="text-lg font-bold text-gray-900">{show.title}</h4>

        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <MapPin className="w-3.5 h-3.5 text-amber-700" />
          <span>{show.venue}, {show.city}</span>
        </div>
      </div>

      <div className="flex items-center justify-between md:flex-col md:items-end gap-3 border-t md:border-t-0 border-amber-100 pt-3 md:pt-0">
        <div className="text-right">
          <span className="text-xs text-gray-500 block">Entry / Ticket</span>
          <span className="text-lg font-extrabold text-gray-900">
            {show.ticketPrice ? `₹${show.ticketPrice}` : 'Free'}
          </span>
        </div>

        <button
          onClick={() => onBook(show)}
          className="flex items-center gap-1.5 bg-[#E65100] text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-[#D84315] transition shadow-sm"
        >
          <Ticket className="w-4 h-4" /> Book Tickets
        </button>
      </div>
    </div>
  );
}