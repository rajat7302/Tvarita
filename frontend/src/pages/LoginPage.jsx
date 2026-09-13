import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/explore');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl border border-amber-200 shadow-xl max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#E65100] text-white font-bold text-2xl rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-md">
            T
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-xs text-gray-500">Sign in to your Tvarita Arts Collective account</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-amber-50/20 border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E65100]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-amber-50/20 border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E65100]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#E65100] text-white py-3 rounded-xl font-bold hover:bg-[#D84315] transition shadow-md flex items-center justify-center gap-2 text-sm"
          >
            <LogIn className="w-4 h-4" /> Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-600">
          Don't have an account? <Link to="/register" className="text-[#E65100] font-bold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}