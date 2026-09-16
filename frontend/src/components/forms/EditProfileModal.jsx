import React, { useEffect, useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';

export default function EditProfileModal({ isOpen, onClose, user, onUpdateSuccess }) {
  const [name, setName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;

    setName(user.name || '');
    setTeamName(user.artistProfile?.teamName || '');
    setTeamDescription(user.artistProfile?.teamDescription || '');
    setMembers(user.artistProfile?.members || []);
  }, [isOpen, user]);

  if (!isOpen) return null;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name,
        artistProfile: {
          teamName,
          teamDescription,
          members,
        },
      };

      const res = await api.put('/auth/profile', payload);
      if (onUpdateSuccess) onUpdateSuccess(res.data.user);
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

          <div className="space-y-4 border-t border-amber-100 pt-4">
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
          </div>

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