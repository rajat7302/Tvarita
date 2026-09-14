import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminArtistVerification() {
  const [pendingArtists, setPendingArtists] = useState([]);

  const fetchPending = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/pending-artists', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingArtists(res.data);
    } catch (err) {
      console.error('Failed to fetch pending artists');
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleVerify = async (artistId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/admin/verify-artist/${artistId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingArtists(pendingArtists.filter((a) => a._id !== artistId));
    } catch (err) {
      alert('Verification failed.');
    }
  };

  return (
    <div className="p-6 bg-amber-50 rounded-xl border border-amber-200">
      <h2 className="text-2xl font-bold text-amber-950 mb-4">Pending Artist Team Verifications</h2>
      {pendingArtists.length === 0 ? (
        <p className="text-sm text-amber-800">No pending artist verification requests.</p>
      ) : (
        <div className="space-y-4">
          {pendingArtists.map((artist) => (
            <div key={artist._id} className="p-4 bg-white rounded-lg border border-amber-300 shadow-sm">
              <h3 className="font-bold text-amber-950 text-lg">{artist.artistProfile?.teamName || artist.name}</h3>
              <p className="text-sm text-amber-800 mb-2">{artist.artistProfile?.teamDescription}</p>

              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide mt-2">Team Members (Equal Status)</h4>
              <ul className="text-xs text-amber-900 list-disc list-inside mb-3">
                {artist.artistProfile?.members?.map((m, idx) => (
                  <li key={idx}><strong>{m.memberName}</strong> — {m.roleInTeam}</li>
                ))}
              </ul>

              <button
                onClick={() => handleVerify(artist._id)}
                className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-semibold rounded hover:bg-emerald-800"
              >
                Approve & Verify Artist
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}