import React from 'react';
import { Heart, X } from 'lucide-react';

export const PatronModal = ({
  isOpen,
  onClose,
  donationSuccess,
  selectedPatronShow,
  handleDonationSubmit,
  donationAmount,
  setDonationAmount
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative border border-amber-100 overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 rounded-lg p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {donationSuccess ? (
          <div className="py-6 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-rose-600 fill-rose-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">Thank You, Patron!</h2>
            <p className="text-sm text-gray-600">
              Your generous donation of <span className="font-bold text-emerald-700">₹{donationSuccess}</span> {selectedPatronShow ? `for "${selectedPatronShow.title}"` : ''} has been received. You are directly supporting traditional Indian performers!
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition text-sm"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleDonationSubmit} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <Heart className="w-6 h-6 text-rose-600 fill-rose-600" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Support Cultural Artisans</h2>
                <p className="text-xs text-gray-500">
                  {selectedPatronShow ? `Support performative arts for "${selectedPatronShow.title}"` : 'Contribute to the revival of regional Indian art forms.'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700">Select Donation Amount (₹)</label>
              <div className="grid grid-cols-3 gap-2">
                {['200', '500', '1000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDonationAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      donationAmount === amt 
                        ? 'bg-rose-700 text-white border-rose-700' 
                        : 'bg-amber-50/50 text-amber-950 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Or Custom Amount (₹)</label>
              <input
                type="number"
                min="1"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                placeholder="Enter amount in ₹"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl transition text-sm shadow-md flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 fill-white" /> Complete Donation
            </button>
          </form>
        )}
      </div>
    </div>
  );
};