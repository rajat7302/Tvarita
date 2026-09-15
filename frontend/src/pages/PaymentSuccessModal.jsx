import React from 'react';
import { CheckCircle } from 'lucide-react';

export const PaymentSuccessModal = ({ paymentSuccessData, onClose }) => {
  if (!paymentSuccessData) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Payment Successful!</h2>
        <p className="text-sm text-gray-500 mb-6">
          Your ticket for <span className="font-bold text-gray-900">{paymentSuccessData.title}</span> has been confirmed.
        </p>
        <button 
          onClick={onClose}
          className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition"
        >
          Done
        </button>
      </div>
    </div>
  );
};