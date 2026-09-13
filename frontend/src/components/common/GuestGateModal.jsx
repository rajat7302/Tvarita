import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, X } from 'lucide-react';

export default function GuestGateModal({ isOpen, onClose, actionName }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-amber-100">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            T
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Required</h3>
          <p className="text-gray-600 text-sm mb-6">
            You need to be logged in to {actionName || 'perform this action'}. Join the Tvarita community to preserve and support Indian cultural arts!
          </p>

          <div className="space-y-3">
            <button
              onClick={() => { onClose(); navigate('/login'); }}
              className="w-full flex items-center justify-center gap-2 bg-[#E65100] text-white py-2.5 rounded-xl font-medium hover:bg-[#D84315] transition shadow-md"
            >
              <LogIn className="w-4 h-4" /> Log In
            </button>
            <button
              onClick={() => { onClose(); navigate('/register'); }}
              className="w-full flex items-center justify-center gap-2 border border-amber-700 text-amber-800 py-2.5 rounded-xl font-medium hover:bg-amber-50 transition"
            >
              <UserPlus className="w-4 h-4" /> Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}