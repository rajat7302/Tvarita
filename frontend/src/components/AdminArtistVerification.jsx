import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Use centralized API instance

export default function AdminArtistVerification() {
  const [pendingArtists, setPendingArtists] = useState([]);

  const fetchPending = async () => {
    try {
      const res = await api.get('/admin/pending-artists');
      setPendingArtists(res.data);
    } catch (err) {
      console.error('Failed to fetch pending artists', err);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleVerify = async (artistId) => {
    try {
      await api.patch(`/admin/verify-artist/${artistId}`);
      setPendingArtists(pendingArtists.filter((a) => a._id !== artistId));
    } catch (err) {
      alert('Verification failed.');
    }
  };

  return (
    <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-200/60 shadow-sm">
      <h2 className="text-xl font-bold text-amber-950 mb-4">Pending Artist Team Verifications</h2>
      {pendingArtists.length === 0 ? (
        <p className="text-xs text-amber-800 bg-amber-100/50 p-4 rounded-xl border border-amber-200">
          No pending artist verification requests.
        </p>
      ) : (
        <div className="space-y-4">
          {pendingArtists.map((artist) => (
            <div key={artist._id} className="p-4 bg-white rounded-2xl border border-amber-200 shadow-sm">
              <h3 className="font-bold text-amber-950 text-lg">{artist.artistProfile?.teamName || artist.name}</h3>
              <p className="text-sm text-amber-800 mb-2">{artist.artistProfile?.teamDescription}</p>

              {artist.artistProfile?.members?.length > 0 && (
                <>
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide mt-2">Team Members</h4>
                  <ul className="text-xs text-amber-900 list-disc list-inside mb-3">
                    {artist.artistProfile.members.map((m, idx) => (
                      <li key={idx}><strong>{m.memberName}</strong> — {m.roleInTeam}</li>
                    ))}
                  </ul>
                </>
              )}

              <button
                onClick={() => handleVerify(artist._id)}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition"
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