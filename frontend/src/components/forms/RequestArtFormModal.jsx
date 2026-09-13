import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { requestArtForm } from '../../services/artFormService';

export default function RequestArtFormModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ name: '', category: 'Dance', state: '', region: '', description: '' });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await requestArtForm(formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-gray-900 mb-1">Propose Missing Art Form</h3>
        <p className="text-xs text-gray-500 mb-4">Request addition of an unlisted traditional Indian folk art.</p>

        {submitted ? (
          <div className="py-8 text-center bg-amber-50 rounded-xl text-amber-900 font-bold">
            ✓ Art form requested! Sent for Tvarita verification.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              required
              placeholder="Art Form Name (e.g., Pandav Nritya)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 border border-amber-200 rounded-xl text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 border border-amber-200 rounded-xl text-sm bg-white"
              >
                <option value="Dance">Dance</option>
                <option value="Music">Music</option>
                <option value="Theatre">Theatre</option>
                <option value="Painting">Painting</option>
                <option value="Craft">Craft</option>
              </select>
              <input
                type="text"
                required
                placeholder="State (e.g., Uttarakhand)"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3.5 py-2 border border-amber-200 rounded-xl text-sm"
              />
            </div>
            <textarea
              required
              rows="3"
              placeholder="Brief description and cultural background..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 border border-amber-200 rounded-xl text-sm"
            ></textarea>

            <button type="submit" className="w-full bg-[#E65100] text-white py-2.5 rounded-xl font-semibold text-sm">
              Submit Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}