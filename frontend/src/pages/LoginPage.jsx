import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, LogIn, Mail, Eye, EyeOff } from 'lucide-react';
import GoogleSignInButton from '../components/common/GoogleSignInButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setError('');
    setResetMessage('');
    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setResetMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to request a reset link.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credential) => {
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/google', { credential });
      login(response.data.user, response.data.token);
      navigate('/explore');
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const showLogin = () => {
    setIsForgotPassword(false);
    setError('');
    setResetMessage('');
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-4">
      {/* Set a fixed max-width and min-height wrapper with smooth transition to stop container jumping */}
      <div className="bg-white p-8 rounded-3xl border border-amber-200 shadow-xl max-w-md w-full transition-all duration-300 ease-in-out">
        
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#E65100] text-white font-bold text-2xl rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-md">
            T
          </div>
          <h2 className="text-2xl font-bold text-gray-900 transition-all">
            {isForgotPassword ? 'Reset your password' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {isForgotPassword
              ? 'Enter your email and we will send a secure reset link.'
              : 'Sign in to your Tvarita Arts Collective account'}
          </p>
        </div>

        {/* Error / Success Notifications with smooth visibility */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 transition-all">
            {error}
          </div>
        )}
        {resetMessage && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200 transition-all">
            {resetMessage}
          </div>
        )}

        <form onSubmit={isForgotPassword ? handleForgotPassword : handleLogin} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-2.5 bg-amber-50/20 border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E65100] transition-all"
            />
          </div>

          {/* Password Field + Show Password Toggle */}
          {!isForgotPassword && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-11 bg-amber-50/20 border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E65100] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-[#E65100]" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Forgot Password Button */}
          {!isForgotPassword && (
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(true);
                setError('');
              }}
              className="block ml-auto -mt-1 text-xs font-bold text-[#E65100] hover:underline"
            >
              Forgot password?
            </button>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E65100] text-white py-3 rounded-xl font-bold hover:bg-[#D84315] active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 text-sm"
          >
            {isForgotPassword ? <Mail className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            {loading ? 'Processing...' : isForgotPassword ? 'Send reset link' : 'Sign In'}
          </button>
        </form>

        {/* Google Login Section (Reserved Height wrapper prevents jumps) */}
        {!isForgotPassword && (
          <div className="mt-5">
            <div className="relative mb-4 text-center before:absolute before:inset-x-0 before:top-1/2 before:border-t before:border-amber-100">
              <span className="relative bg-white px-3 text-[10px] font-medium uppercase tracking-wide text-gray-400">
                or
              </span>
            </div>
            <div className="min-h-[44px] flex flex-col justify-center items-center">
              <GoogleSignInButton onCredential={handleGoogleLogin} onError={setError} />
            </div>
            <p className="mt-3 text-center text-[10px] text-gray-500">
              Use the Google email already registered with Tvarita.
            </p>
          </div>
        )}

        {/* Back to Sign In Link */}
        {isForgotPassword && (
          <button
            type="button"
            onClick={showLogin}
            className="mt-5 flex items-center gap-1 mx-auto text-xs font-bold text-gray-600 hover:text-[#E65100] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
          </button>
        )}

        {/* Bottom Register Link */}
        {!isForgotPassword && (
          <p className="mt-6 text-center text-xs text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#E65100] font-bold hover:underline">
              Register
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}