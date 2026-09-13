import React, { useState } from 'react';
import { X, HeartHandshake } from 'lucide-react';
import { createExperience } from '../../services/artFormService';

export default function ReviewModal({ isOpen, onClose, artFormId, artistId, onReviewAdded }) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await createExperience({ artFormId, artistId, content });
    setContent('');
    setSubmitting(false);
    onReviewAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-[#E65100] mb-1">
          <HeartHandshake className="w-5 h-5" />
          <h3 className="text-xl font-bold text-gray-900">Post-Event Reflection</h3>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Describe your qualitative experience watching this art form (No star ratings or metrics).
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            required
            rows="4"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="How did the performance move you? Describe the music, energy, and storytelling..."
            className="w-full px-3.5 py-2.5 bg-amber-50/30 border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E65100]"
          ></textarea>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#E65100] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#D84315] transition"
          >
            {submitting ? 'Submitting...' : 'Share Experience'}
          </button>
        </form>
      </div>
    </div>
  );
}