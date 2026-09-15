import React, { useState } from 'react';
import api from '../services/api';
import { X, Upload, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

export default function CreateShowModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [useUrlInput, setUseUrlInput] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    artFormName: '',
    venue: '',
    date: '',
    ticketPrice: 0,
    availableTickets: 100,
    description: '',
    imageUrl: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Compressed Image Upload Helper using HTML Canvas
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleFactor = MAX_WIDTH / img.width;
        
        if (img.width > MAX_WIDTH) {
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleFactor;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Compress image to standard JPEG format
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setFormData((prev) => ({ ...prev, imageUrl: compressedBase64 }));
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const ticketVal = Number(formData.availableTickets) || 100;

    const payload = {
      title: formData.title,
      artFormName: formData.artFormName,
      venue: formData.venue,
      date: formData.date,
      ticketPrice: Number(formData.ticketPrice) || 0,
      totalTickets: ticketVal,
      availableTickets: ticketVal,
      description: formData.description,
      imageUrl: formData.imageUrl,
      bannerUrl: formData.imageUrl
    };

    try {
      await api.post('/shows', payload);
      onSuccess();
      onClose();
      // Reset form on success
      setFormData({
        title: '',
        artFormName: '',
        venue: '',
        date: '',
        ticketPrice: 0,
        availableTickets: 100,
        description: '',
        imageUrl: ''
      });
    } catch (err) {
      console.error('Error posting show:', err?.response?.data || err);
      alert(err?.response?.data?.message || err?.response?.data?.error || 'Failed to post show');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-amber-50/50">
          <h3 className="font-extrabold text-amber-950 text-lg">Post Upcoming Show</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Show Title</label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g., Grand Choliya Cultural Night"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Cultural Art Form / Category</label>
            <input
              type="text"
              name="artFormName"
              required
              placeholder="e.g., Choliya, Garhwali Folk, Kathakali"
              value={formData.artFormName}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Venue / Location</label>
            <input
              type="text"
              name="venue"
              required
              placeholder="e.g., Town Hall, Dehradun"
              value={formData.venue}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
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
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Total Available Tickets</label>
            <input
              type="number"
              name="availableTickets"
              min="1"
              value={formData.availableTickets}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              rows="3"
              placeholder="Provide event details or scheduling information..."
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none"
            ></textarea>
          </div>

          {/* Banner Image Handling Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-gray-700">Banner Image (Optional)</label>
              <button
                type="button"
                onClick={() => setUseUrlInput(!useUrlInput)}
                className="text-[11px] font-bold text-amber-800 hover:underline flex items-center gap-1"
              >
                {useUrlInput ? <ImageIcon className="w-3 h-3" /> : <LinkIcon className="w-3 h-3" />}
                {useUrlInput ? 'Upload File Instead' : 'Use Image URL'}
              </button>
            </div>

            {formData.imageUrl && (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-amber-200 bg-amber-50">
                <img src={formData.imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {!formData.imageUrl && (
              useUrlInput ? (
                <input
                  type="url"
                  name="imageUrl"
                  placeholder="Paste image web URL (e.g., https://...)"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              ) : (
                <label className="flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition">
                  <Upload className="w-5 h-5 text-gray-500" />
                  <span className="text-xs text-gray-600 font-semibold">Click to upload banner image</span>
                  <span className="text-[10px] text-gray-400">PNG, JPG, WEBP accepted</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-800 text-white font-bold rounded-xl hover:bg-emerald-900 transition disabled:bg-gray-400 mt-2 shadow-sm"
          >
            {loading ? 'Publishing Event...' : 'Post Show'}
          </button>
        </form>
      </div>
    </div>
  );
}