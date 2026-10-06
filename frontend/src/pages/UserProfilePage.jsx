import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Ban, MessageCircle, UserPlus } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ImageLightbox from '../components/common/ImageLightbox';

export default function UserProfilePage() {
  const { userId } = useParams();
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('none');
  const [blockedByMe, setBlockedByMe] = useState(false);
  const [blockedMe, setBlockedMe] = useState(false);
  const [error, setError] = useState('');

  const loadProfile = async () => {
    try {
      const response = await api.get(`/social/people/${userId}`);
      setProfile(response.data.user);
      setStatus(response.data.friendshipStatus);
      setBlockedByMe(response.data.blockedByMe);
      setBlockedMe(response.data.blockedMe);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load profile.');
    }
  };

  useEffect(() => { loadProfile(); }, [userId]);

  const sendRequest = async () => {
    try {
      const response = await api.post(`/social/friend-requests/${userId}`);
      setStatus(response.data.status || 'pending');
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Friend request failed.');
    }
  };

  const toggleBlock = async () => {
    try {
      if (blockedByMe) await api.delete(`/social/blocked/${userId}`);
      else await api.post(`/social/blocked/${userId}`);
      setBlockedByMe(!blockedByMe);
      setError('');
      await loadProfile();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update block settings.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-gray-900">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-10">
        {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {!profile ? <p className="text-sm text-gray-500">Loading profile…</p> : <section className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            {profile.profilePhotoUrl ? <ImageLightbox src={profile.profilePhotoUrl} alt={`${profile.name} profile photo`} className="h-16 w-16 shrink-0 rounded-full border border-amber-200" imageClassName="h-full w-full rounded-full object-cover" /> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xl font-extrabold text-amber-900">{profile.name?.slice(0, 1)?.toUpperCase()}</div>}
            <div className="min-w-0 flex-1"><h1 className="text-2xl font-extrabold">{profile.name}</h1><p className="mt-1 text-xs font-semibold capitalize text-amber-800">{profile.role === 'artist' ? profile.artistProfile?.teamName || 'Artist' : 'Cultural enthusiast'}</p></div>
          </div>
          <div className="mt-6 border-t border-amber-100 pt-4"><h2 className="text-xs font-bold uppercase text-gray-500">About</h2><p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{profile.bio || 'No bio added yet.'}</p></div>
          {user && String(user._id || user.id) !== String(profile._id) && <div className="mt-6 flex flex-wrap gap-2">
            {blockedMe ? <span className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600">This person has blocked you</span> : blockedByMe ? <span className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">You blocked this profile</span> : status === 'accepted' ? <a href="/friends" className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white"><MessageCircle className="h-4 w-4" /> Open friends & chat</a> : status === 'pending' ? <span className="rounded-xl bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900">Request pending</span> : <button onClick={sendRequest} className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white"><UserPlus className="h-4 w-4" /> Add friend</button>}
            {!blockedMe && <button onClick={toggleBlock} className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"><Ban className="h-4 w-4" />{blockedByMe ? 'Unblock' : 'Block'}</button>}
          </div>}
        </section>}
      </main>
    </div>
  );
}
