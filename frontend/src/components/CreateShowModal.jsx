import React, { useState } from 'react';
import { createShow } from '../services/showService';
import { X } from 'lucide-react';

export default function CreateShowModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    artFormName: '',
    description: '',
    venue: '',
    date: '',
    ticketPrice: 0,
    totalTickets: 50
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createShow({
        ...formData,
        ticketPrice: Number(formData.ticketPrice),
        totalTickets: Number(formData.totalTickets)
      });

      setFormData({
        title: '',
        artFormName: '',
        description: '',
        venue: '',
        date: '',
        ticketPrice: 0,
        totalTickets: 50
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to create show:', err);
      setError(err.response?.data?.message || 'Failed to publish show. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-amber-950">Post Upcoming Show</h2>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Show Title</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Traditional Chhau Dance Live"
              className="w-full px-3 py-2 border border-amber-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Cultural Art Form / Category</label>
            <input
              type="text"
              name="artFormName"
              required
              value={formData.artFormName}
              onChange={handleChange}
              placeholder="e.g. Choliya, Kathak, Classical Music"
              className="w-full px-3 py-2 border border-amber-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Venue / City</label>
            <input
              type="text"
              name="venue"
              required
              value={formData.venue}
              onChange={handleChange}
              placeholder="e.g. Town Hall Auditorium, Srinagar"
              className="w-full px-3 py-2 border border-amber-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-amber-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Ticket Price (₹)</label>
              <input
                type="number"
                name="ticketPrice"
                min="0"
                value={formData.ticketPrice}
                onChange={handleChange}
                placeholder="0 for Free"
                className="w-full px-3 py-2 border border-amber-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Total Available Tickets</label>
            <input
              type="number"
              name="totalTickets"
              min="1"
              value={formData.totalTickets}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-amber-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief details about the performance..."
              className="w-full px-3 py-2 border border-amber-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition shadow disabled:opacity-50 mt-2"
          >
            {loading ? 'Publishing...' : 'Publish Show'}
          </button>
        </form>
      </div>
    </div>
  );
}