import React, { useState } from 'react';
import api from '../services/api';

export default function ProposeArtFormModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Dance',
    originState: 'Uttarakhand',
    description: '',
    isLesserKnown: true
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Sends to backend with default isApproved: false
      await api.post('/artforms', formData);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-stone-200 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-stone-900">Propose Missing Art Form</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 font-bold">✕</button>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl mb-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Art Form Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Pandav Nritya"
              className="w-full p-2.5 border border-stone-300 rounded-xl"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Category</label>
              <select
                className="w-full p-2.5 border border-stone-300 rounded-xl"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Dance">Dance</option>
                <option value="Music">Music</option>
                <option value="Theatre">Theatre</option>
                <option value="Craft">Craft</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">State of Origin</label>
              <input
                type="text"
                required
                placeholder="e.g. Uttarakhand"
                className="w-full p-2.5 border border-stone-300 rounded-xl"
                value={formData.originState}
                onChange={(e) => setFormData({ ...formData, originState: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Description & Cultural Context</label>
            <textarea
              rows="3"
              required
              placeholder="Explain the history and heritage behind this performance..."
              className="w-full p-2.5 border border-stone-300 rounded-xl"
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition shadow"
          >
            {submitting ? 'Submitting...' : 'Submit for Admin Approval'}
          </button>
        </form>
      </div>
    </div>
  );
}