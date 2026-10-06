import React, { useEffect, useState } from 'react';
import { X, Plus, Trash2, Camera } from 'lucide-react';
import api from '../../services/api';

export default function EditProfileModal({ isOpen, onClose, user, onUpdateSuccess }) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;

    setName(user.name || '');
    setBio(user.bio || '');
    setAvatarFile(null);
    setAvatarPreview(user.profilePhotoUrl || '');
    setTeamName(user.artistProfile?.teamName || '');
    setTeamDescription(user.artistProfile?.teamDescription || '');
    setMembers(user.artistProfile?.members || []);
  }, [isOpen, user]);

  if (!isOpen) return null;

  const canManageTeam = user?.role === 'artist' || user?.role === 'admin';

  // Dynamic Member Handlers for Teams
  const handleAddMember = () => {
    setMembers((current) => [...current, { memberName: '', roleInTeam: '' }]);
  };

  const handleMemberChange = (index, field, value) => {
    setMembers((current) => current.map((member, i) => (
      i === index ? { ...member, [field]: value } : member
    )));
  };

  const handleRemoveMember = (index) => {
    setMembers((current) => current.filter((_, i) => i !== index));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Choose an image for your profile photo.');
      event.target.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Profile photo must be smaller than 10 MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxDimension = 900;
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (!blob) return;
          const compressed = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });
          setAvatarFile(compressed);
          setAvatarPreview(URL.createObjectURL(compressed));
        }, 'image/jpeg', 0.82);
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name,
        bio,
        ...(canManageTeam && {
          artistProfile: {
            teamName,
            teamDescription,
            members,
          },
        }),
      };

      const res = await api.put('/auth/profile', payload);
      let updatedUser = res.data.user;
      if (avatarFile) {
        const photoPayload = new FormData();
        photoPayload.append('avatar', avatarFile);
        try {
          const photoResponse = await api.post('/auth/profile/avatar', photoPayload);
          updatedUser = photoResponse.data.user;
        } catch (photoError) {
          onUpdateSuccess?.(updatedUser);
          alert(photoError.response?.data?.message || 'Profile was saved, but the photo upload failed.');
          return;
        }
      }
      if (onUpdateSuccess) onUpdateSuccess(updatedUser);
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Profile</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            {avatarPreview ? <img src={avatarPreview} alt="Profile preview" className="h-16 w-16 rounded-full border border-amber-200 object-cover" /> : <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-2xl font-bold text-amber-800">{name.slice(0, 1).toUpperCase()}</div>}
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100">
              <Camera className="h-4 w-4" /> Change profile photo
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Full Name / Account Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 border border-amber-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-gray-700">About me</label>
            <textarea
              rows="3"
              maxLength={500}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="Write a short bio other community members can see..."
              className="w-full resize-y rounded-xl border border-amber-200 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none"
            />
            <p className="mt-1 text-right text-[10px] text-gray-400">{bio.length}/500</p>
          </div>

          {canManageTeam && <div className="space-y-4 border-t border-amber-100 pt-4">
              <h4 className="text-sm font-bold text-amber-900">Artist / Team Information</h4>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Team / Group Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., Garhwali Cultural Group"
                  className="w-full px-3.5 py-2 border border-amber-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Team Overview / Bio</label>
                <textarea
                  rows="3"
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  className="w-full px-3.5 py-2 border border-amber-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 resize-none"
                ></textarea>
              </div>

              {/* Dynamic Team Members List */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-gray-700">Team Members</label>
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="flex items-center gap-1 text-xs font-bold text-[#E65100] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Member
                  </button>
                </div>

                <div className="space-y-2">
                  {members.map((m, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Member Name"
                        value={m.memberName}
                        onChange={(e) => handleMemberChange(idx, 'memberName', e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-amber-200 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Role (e.g. Lead Singer)"
                        value={m.roleInTeam}
                        onChange={(e) => handleMemberChange(idx, 'roleInTeam', e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-amber-200 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(idx)}
                        className="text-red-500 p-1 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
          </div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E65100] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#D84315] disabled:bg-gray-300 transition"
          >
            {loading ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}