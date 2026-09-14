import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ShowReviews({ showId, user }) {
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/shows/${showId}/reviews`);
      setReviews(res.data);
    } catch (err) {
      console.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showId) fetchReviews();
  }, [showId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please log in to share a review.');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/shows/${showId}/reviews`,
        { rating, comment, userName: user.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComment('');
      fetchReviews();
    } catch (err) {
      alert('Failed to post review.');
    }
  };

  return (
    <div className="mt-8 border-t border-amber-200 pt-6">
      <h3 className="text-xl font-bold text-amber-950 mb-4">Qualitative Reviews & Community Discussions</h3>

      {/* Review Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3 bg-amber-100/50 p-4 rounded-lg border border-amber-200">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-amber-900">Rating:</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="p-1 border rounded border-amber-300 text-sm"
            >
              {[5, 4, 3, 2, 1].map((num) => (
                <option key={num} value={num}>{num} ★</option>
              ))}
            </select>
          </div>
          <textarea
            required
            rows="3"
            value={comment}
            placeholder="Share your qualitative experience regarding the art performance..."
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 border rounded border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-700 text-sm"
          />
          <button type="submit" className="px-4 py-2 bg-amber-900 text-white text-sm rounded font-medium hover:bg-amber-800">
            Submit Review
          </button>
        </form>
      ) : (
        <p className="text-sm text-amber-800 italic mb-6">Sign in as a registered user or artist to leave a review.</p>
      )}

      {/* Reviews List */}
      {loading ? (
        <p className="text-sm text-amber-700">Loading feedback...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-amber-700 italic">No reviews submitted yet. Be the first to share your thoughts!</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((rev) => (
            <div key={rev._id} className="p-3 bg-white rounded border border-amber-200 shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-amber-950 text-sm">{rev.userName}</span>
                <span className="text-amber-600 text-xs font-bold">{'★'.repeat(rev.rating)}</span>
              </div>
              <p className="text-amber-900 text-sm">{rev.comment}</p>
              <span className="text-amber-500 text-[10px]">{new Date(rev.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}