import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import api from '../services/api';
import { ShieldCheck, Check } from 'lucide-react';
import AdminArtistVerification from '../components/AdminArtistVerification';
export default function AdminDashboardPage() {
  const [pendingForms, setPendingForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingArtForms();
  }, []);

  const fetchPendingArtForms = async () => {
    try {
      const res = await api.get('/admin/pending-artforms');
      setPendingForms(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    await api.put(`/admin/approve-artform/${id}`);
    fetchPendingArtForms();
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-gray-900 pb-16">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 pt-8 space-y-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-[#E65100]" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Control Center</h1>
            <p className="text-xs text-gray-500">Review pending art form proposals and user verification</p>
          </div>
        </div>

        {/* 2. Render Artist Verification Component here */}
        <AdminArtistVerification />

        {/* Pending Art Forms Section */}
        <section className="bg-white rounded-3xl border border-amber-100 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Pending Art Form Proposals</h2>

          {loading ? (
            <p className="text-xs text-gray-500">Loading proposals...</p>
          ) : pendingForms.length === 0 ? (
            <p className="text-xs text-gray-500 bg-amber-50 p-4 rounded-xl border border-amber-100">
              No unapproved art forms currently in queue.
            </p>
          ) : (
            <div className="space-y-4">
              {pendingForms.map(form => (
                <div key={form._id} className="p-4 border border-amber-200 rounded-2xl bg-amber-50/30 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900">{form.name}</h4>
                    <p className="text-xs text-amber-900 font-semibold">{form.category} • {form.state}</p>
                    <p className="text-xs text-gray-600 mt-1">{form.description}</p>
                  </div>

                  <button
                    onClick={() => handleApprove(form._id)}
                    className="flex items-center gap-1 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}