import React, { useState } from 'react';
import { X, HeartHandshake } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { createExperience } from '../../services/artFormService';

export default function ReviewModal({ isOpen, onClose, artFormId, artistId, onReviewAdded }) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('artFormId', artFormId);
      if (artistId) payload.append('artistId', artistId);
      payload.append('content', content);
      if (mediaFile) payload.append('media', mediaFile);
      await createExperience(payload);
      setContent('');
      setMediaFile(null);
      setMediaPreview('');
      onReviewAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save reflection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMediaChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      setError('Media must be smaller than 50 MB.');
      return;
    }
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
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

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            required
            rows="4"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="How did the performance move you? Describe the music, energy, and storytelling..."
            className="w-full px-3.5 py-2.5 bg-amber-50/30 border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E65100]"
          ></textarea>

          <label className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/30 px-3 py-3 text-xs font-semibold text-amber-900">
            Upload image, video, or audio (max 50 MB)
            <input type="file" accept="image/*,video/*,audio/*" onChange={handleMediaChange} className="hidden" />
          </label>

          {mediaPreview && (
            mediaFile?.type.startsWith('video/') ? <video src={mediaPreview} controls className="max-h-40 w-full rounded-xl" /> : mediaFile?.type.startsWith('audio/') ? <audio src={mediaPreview} controls className="w-full" /> : <img src={mediaPreview} alt="Media preview" className="max-h-40 w-full rounded-xl object-cover" />
          )}

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