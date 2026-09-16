import React, { useState } from 'react';
import api from '../services/api';
import { X, Upload, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

export default function CreateShowModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [useUrlInput, setUseUrlInput] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
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

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const saveFile = (selectedFile) => {
      setMediaFile(selectedFile);
      setMediaPreview(URL.createObjectURL(selectedFile));
      setFormData((prev) => ({ ...prev, imageUrl: '' }));
    };

    if (!file.type.startsWith('image/')) {
      saveFile(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const scaleFactor = Math.min(1, MAX_WIDTH / img.width);
        
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (!blob) return saveFile(file);
          saveFile(new File([blob], `${file.name.split('.')[0]}.jpg`, { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.75);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const showDate = new Date(formData.date);
    if (!formData.date || Number.isNaN(showDate.getTime()) || showDate <= new Date()) {
      setErrorMessage('Please choose a future date and time for the show.');
      return;
    }

    setLoading(true);

    const ticketVal = Number(formData.availableTickets) || 100;

    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('artFormName', formData.artFormName);
    payload.append('venue', formData.venue);
    payload.append('date', formData.date);
    payload.append('ticketPrice', String(Number(formData.ticketPrice) || 0));
    payload.append('totalTickets', String(ticketVal));
    payload.append('availableTickets', String(ticketVal));
    payload.append('description', formData.description);
    if (mediaFile) payload.append('media', mediaFile);
    else if (formData.imageUrl) payload.append('imageUrl', formData.imageUrl);

    try {
      await api.post('/shows', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
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
      setMediaFile(null);
      setMediaPreview('');
    } catch (err) {
      console.error('Error posting show:', err?.response?.data || err);
      setErrorMessage(err?.response?.data?.message || err?.response?.data?.error || 'Failed to post show');
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
          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

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
            <select
              name="artFormName"
              required
              value={formData.artFormName}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="" disabled>Select a cultural art form</option>
              <option value="Dance">Dance</option>
              <option value="Music">Music</option>
              <option value="Theatre">Theatre</option>
              <option value="Painting">Painting</option>
              <option value="Craft">Craft</option>
            </select>
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
                min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
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
              <label className="block text-xs font-bold text-gray-700">Media (Optional)</label>
              <button
                type="button"
                onClick={() => setUseUrlInput(!useUrlInput)}
                className="text-[11px] font-bold text-amber-800 hover:underline flex items-center gap-1"
              >
                {useUrlInput ? <ImageIcon className="w-3 h-3" /> : <LinkIcon className="w-3 h-3" />}
                {useUrlInput ? 'Upload File Instead' : 'Use Image URL'}
              </button>
            </div>

            {(formData.imageUrl || mediaPreview) && (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-amber-200 bg-amber-50">
                {mediaFile?.type.startsWith('video/') ? <video src={mediaPreview} controls className="w-full h-full object-cover" /> : mediaFile?.type.startsWith('audio/') ? <audio src={mediaPreview} controls className="w-full mt-12" /> : <img src={mediaPreview || formData.imageUrl} alt="Media Preview" className="w-full h-full object-cover" />}
                <button
                  type="button"
                  onClick={() => { setMediaFile(null); setMediaPreview(''); setFormData((prev) => ({ ...prev, imageUrl: '' })); }}
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
                  <span className="text-xs text-gray-600 font-semibold">Click to upload image, video, or audio</span>
                  <span className="text-[10px] text-gray-400">Maximum 50 MB</span>
                  <input type="file" accept="image/*,video/*,audio/*" onChange={handleMediaChange} className="hidden" />
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