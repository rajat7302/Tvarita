import React, { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import { createCommunityPost } from '../../services/artFormService';

export default function PostStoryModal({ isOpen, onClose, artFormId, onPostAdded }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await createCommunityPost({ artFormId, title, content, imageUrl });
      setTitle('');
      setContent('');
      setImageUrl('');
      onPostAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish story.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-gray-900 mb-1">Share Cultural Story</h3>
        <p className="text-xs text-gray-500 mb-4">Contribute insights or history to this art form page.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Traditional Rhythms & Costume Details"
              className="w-full px-3.5 py-2.5 bg-amber-50/30 border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E65100]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Story / Content</label>
            <textarea
              required
              rows="4"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write about the history, musical instruments, or community significance..."
              className="w-full px-3.5 py-2.5 bg-amber-50/30 border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E65100]"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Photo URL (Optional)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 bg-amber-50/30 border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E65100]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#E65100] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#D84315] transition flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> {submitting ? 'Verifying & Posting...' : 'Publish Story'}
          </button>
        </form>
      </div>
    </div>
  );
}