import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import api from '../services/api';
import PasswordStrengthMeter from '../components/common/PasswordStrengthMeter';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const token = searchParams.get('token');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('This reset link is invalid or incomplete. Please request a new one.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      setSuccess(response.data.message);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password. Please request a new link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl border border-amber-200 shadow-xl max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#E65100] text-white rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-md">
            <KeyRound className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Choose a new password</h1>
          <p className="text-xs text-gray-500 mt-1">Use a password you have not used elsewhere.</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">{error}</div>}
        {success && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200">{success}</div>}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">New password</label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full px-4 py-2.5 bg-amber-50/20 border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E65100]"
              />
              <PasswordStrengthMeter password={password} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Confirm new password</label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full px-4 py-2.5 bg-amber-50/20 border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E65100]"
              />
            </div>
            <button disabled={loading} type="submit" className="w-full bg-[#E65100] disabled:bg-orange-300 text-white py-3 rounded-xl font-bold hover:bg-[#D84315] transition shadow-md text-sm">
              {loading ? 'Updating password...' : 'Update password'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-gray-600">
          <Link to="/login" className="text-[#E65100] font-bold hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
