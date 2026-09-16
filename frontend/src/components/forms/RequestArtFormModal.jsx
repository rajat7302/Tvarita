import React, { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { requestArtForm } from '../../services/artFormService';

export default function RequestArtFormModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Dance',
    state: '',
    region: '',
    description: '',
    isUnderrepresented: true,
  });
  const [imagePreview, setImagePreview] = useState(null); // Holds Base64 string
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  // Convert uploaded image directly to Base64 string
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Base64 data URI string
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
  };

  const resetForm = () => {
    handleRemoveImage();
    setImageUrl('');
    setFormData({ name: '', category: 'Dance', state: '', region: '', description: '', isUnderrepresented: true });
    setSubmitted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Send regular JSON object (Matches req.body.imageUrl in requestArtForm controller)
      const finalImageUrl = imagePreview || imageUrl.trim() || '';

      await requestArtForm({
        name: formData.name,
        category: formData.category,
        state: formData.state,
        region: formData.region,
        description: formData.description,
        isUnderrepresented: formData.isUnderrepresented,
        imageUrl: finalImageUrl,
      });

      setSubmitted(true);
      if (onSuccess) onSuccess();

      setTimeout(() => {
        resetForm();
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Failed to submit art form request:', err);
      alert(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-gray-900 mb-1">Propose Missing Art Form</h3>
        <p className="text-xs text-gray-500 mb-4">
          Request addition of an unlisted traditional Indian folk art.
        </p>

        {submitted ? (
          <div className="py-8 text-center bg-amber-50 rounded-xl text-amber-900 font-bold border border-amber-200">
            ✓ Art form requested! Sent for verification.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              required
              placeholder="Art Form Name (e.g., Pandav Nritya)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 border border-amber-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500"
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
                className="w-full px-3.5 py-2 border border-amber-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <input
              type="text"
              placeholder="Region / District (e.g., Garhwal)"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full px-3.5 py-2 border border-amber-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
            />

            <textarea
              required
              rows="3"
              placeholder="Brief description and cultural background..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 border border-amber-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 resize-none"
            ></textarea>

            <label className="flex items-center gap-2 text-xs font-semibold text-amber-900 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isUnderrepresented}
                onChange={(e) => setFormData({ ...formData, isUnderrepresented: e.target.checked })}
                className="rounded accent-[#E65100]"
              />
              Mark this as a lesser-known art form
            </label>

            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-gray-700">
                Cover Photo <span className="text-gray-400 font-normal">(Optional)</span>
              </label>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3.5 py-2 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold cursor-pointer hover:bg-amber-100 transition">
                  <Upload className="w-4 h-4" />
                  <span>{imagePreview ? 'Change Photo' : 'Upload Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-10 h-10 object-cover rounded-lg border border-amber-200"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-sm"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#E65100] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#D84315] disabled:bg-gray-300 transition shadow-sm mt-2 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}