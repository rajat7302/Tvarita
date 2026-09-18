import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import PasswordStrengthMeter from '../components/common/PasswordStrengthMeter';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export default function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('user');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    teamName: '',
    teamDescription: ''
  });

  const [members, setMembers] = useState([{ memberName: '', roleInTeam: '' }]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleMemberChange = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const addMemberField = () => {
    setMembers([...members, { memberName: '', roleInTeam: '' }]);
  };

  const removeMemberField = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      ...formData,
      role,
      artistProfile: role === 'artist' ? {
        teamName: formData.teamName,
        teamDescription: formData.teamDescription,
        members
      } : undefined
    };

    try {
     await axios.post(`${API_BASE_URL}/auth/register`, payload);
      setSuccess(
        role === 'artist'
          ? 'Artist registration submitted! Awaiting Admin verification.'
          : 'Account created successfully! You can now log in.'
      );
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-amber-200 shadow-xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-2 shadow">
            T
          </div>
          <h2 className="text-2xl font-bold text-stone-900">Join Tvarita</h2>
          <p className="text-xs text-stone-500 mt-1">Create an account to support & document cultural heritage</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-200">{error}</div>}
        {success && <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm mb-4 border border-emerald-200">{success}</div>}

        {/* Role Toggle */}
        <div className="flex bg-stone-100 p-1 rounded-xl mb-5 border border-stone-200">
          <button
            type="button"
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              role === 'user' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
            onClick={() => setRole('user')}
          >
            Cultural Enthusiast
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              role === 'artist' ? 'bg-orange-600 text-white shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
            onClick={() => setRole('artist')}
          >
            Artist / Performing Group
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Rajat Joshi"
              className="w-full p-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              className="w-full p-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full p-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <PasswordStrengthMeter password={formData.password} />
          </div>

          {/* Artist Team Profile Fields */}
{role === 'artist' && (
  <div className="border-t border-stone-200 pt-4 space-y-4">
    <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 text-[11px] text-orange-950">
      <strong>Anti-Popularity Ethos:</strong> Artist teams require Admin verification before posting shows. Every team member is registered with equal standing.
    </div>

    <div>
      <label className="block text-xs font-semibold text-stone-700 mb-1">Team / Performing Group Name</label>
      <input
        type="text"
        required
        placeholder="e.g. Kumaoni Choliya Troupe"
        className="w-full p-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
        onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
      />
    </div>

    <div>
      <label className="block text-xs font-semibold text-stone-700 mb-1">Team Description</label>
      <textarea
        rows="2"
        placeholder="Describe your performing team and traditional art form..."
        className="w-full p-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
        onChange={(e) => setFormData({ ...formData, teamDescription: e.target.value })}
      />
    </div>

    {/* Structured Dynamic Teammates List */}
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-semibold text-stone-700">Team Members & Roles</label>
        <span className="text-[10px] text-stone-500">Add 2, 4, or any number of members</span>
      </div>

      {members.map((m, idx) => (
        <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2 relative">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-stone-600">Member #{idx + 1}</span>
            {members.length > 1 && (
              <button
                type="button"
                onClick={() => removeMemberField(idx)}
                className="text-xs text-red-600 font-semibold hover:underline"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              required
              placeholder="Full Name"
              className="p-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              value={m.memberName}
              onChange={(e) => handleMemberChange(idx, 'memberName', e.target.value)}
            />
            <input
              type="text"
              required
              placeholder="Role (e.g. Dhol, Dancer)"
              className="p-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              value={m.roleInTeam}
              onChange={(e) => handleMemberChange(idx, 'roleInTeam', e.target.value)}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addMemberField}
        className="w-full py-2 bg-stone-100 text-stone-800 text-xs font-semibold rounded-xl border border-dashed border-stone-400 hover:bg-stone-200 transition"
      >
        + Add Another Teammate
      </button>
    </div>
  </div>
)}

          <button
            type="submit"
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition shadow"
          >
            {role === 'artist' ? 'Submit Artist Profile for Verification' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-stone-500 mt-4">
          Already have an account? <Link to="/login" className="text-orange-600 font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
