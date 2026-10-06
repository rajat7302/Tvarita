import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import api from '../services/api';
import { ShieldCheck, Check, X, Image as ImageIcon, Flag, Ticket } from 'lucide-react';
import AdminArtistVerification from '../components/AdminArtistVerification';
export default function AdminDashboardPage() {
  const [pendingForms, setPendingForms] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [ticketCode, setTicketCode] = useState('');
  const [ticketResult, setTicketResult] = useState(null);
  const [ticketError, setTicketError] = useState('');

  useEffect(() => {
    fetchPendingArtForms();
    fetchReports();
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

  const fetchReports = async () => {
    try {
      const response = await api.get('/admin/reports');
      setReports(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setActionError(error.response?.data?.message || 'Could not load comment reports.');
    }
  };

  const handleReportAction = async (id, action) => {
    try {
      await api.patch(`/admin/reports/${id}`, { action });
      await fetchReports();
    } catch (error) {
      setActionError(error.response?.data?.message || 'Could not update report.');
    }
  };

  const handleVerifyTicket = async (event) => {
    event.preventDefault();
    setTicketResult(null);
    setTicketError('');
    try {
      const response = await api.post('/admin/verify-ticket', { ticketCode });
      setTicketResult(response.data.booking);
      setTicketCode('');
    } catch (error) {
      setTicketError(error.response?.data?.message || 'Ticket verification failed.');
    }
  };

  const handleApprove = async (id) => {
    setActionError('');
    try {
      await api.put(`/admin/approve-artform/${id}`);
      await fetchPendingArtForms();
    } catch (error) {
      setActionError(error.response?.data?.message || 'Could not approve proposal.');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Reason for rejecting this proposal (optional):');
    if (reason === null) return;
    setActionError('');
    try {
      await api.put(`/admin/reject-artform/${id}`, { reason });
      await fetchPendingArtForms();
    } catch (error) {
      setActionError(error.response?.data?.message || 'Could not reject proposal.');
    }
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

        <section className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2"><Ticket className="h-5 w-5 text-emerald-700" /><h2 className="text-lg font-bold">Verify Entry Ticket</h2></div>
          <form onSubmit={handleVerifyTicket} className="flex flex-col gap-2 sm:flex-row">
            <input value={ticketCode} onChange={(event) => setTicketCode(event.target.value)} required placeholder="Enter scanned ticket code" className="min-w-0 flex-1 rounded-xl border border-amber-200 px-3 py-2 text-sm" />
            <button className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800">Verify and admit</button>
          </form>
          {ticketError && <p role="alert" className="mt-3 text-xs text-red-700">{ticketError}</p>}
          {ticketResult && <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">Valid entry: {ticketResult.showId?.title} · {ticketResult.ticketsBooked} ticket(s). Ticket marked used.</p>}
        </section>

        {/* Pending Art Forms Section */}
        <section className="bg-white rounded-3xl border border-amber-100 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Pending Art Form Proposals</h2>
          {actionError && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">{actionError}</p>}

          {loading ? (
            <p className="text-xs text-gray-500">Loading proposals...</p>
          ) : pendingForms.length === 0 ? (
            <p className="text-xs text-gray-500 bg-amber-50 p-4 rounded-xl border border-amber-100">
              No unapproved art forms currently in queue.
            </p>
          ) : (
            <div className="space-y-4">
              {pendingForms.map(form => (
                <div key={form._id} className="grid gap-4 rounded-2xl border border-amber-200 bg-amber-50/30 p-4 md:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
                    {form.images?.[0] ? (
                      <a href={form.images[0]} target="_blank" rel="noreferrer" className="block h-40 w-full shrink-0 overflow-hidden rounded-xl border border-amber-200 bg-white sm:w-56">
                        <img src={form.images[0]} alt={`${form.name} proposal`} className="h-full w-full object-cover" />
                      </a>
                    ) : (
                      <div className="flex h-40 w-full shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-white text-gray-400 sm:w-56">
                        <ImageIcon className="h-7 w-7" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-lg font-bold text-gray-900">{form.name}</h4>
                      <p className="mt-1 text-xs font-semibold text-amber-900">{form.category} · {form.state}{form.region ? ` · ${form.region}` : ''}</p>
                      <p className="mt-3 whitespace-pre-line text-sm text-gray-700">{form.description}</p>
                      {form.historicalContext && <div className="mt-3 rounded-xl border border-amber-100 bg-white p-3"><p className="text-[10px] font-bold uppercase text-amber-900">Historical context</p><p className="mt-1 whitespace-pre-line text-xs text-gray-700">{form.historicalContext}</p></div>}
                      <p className="mt-3 text-xs font-semibold text-gray-500">{form.isUnderrepresented ? 'Marked lesser-known by proposer' : 'Not marked lesser-known'}</p>
                      <p className="mt-1 text-[11px] text-gray-400">Submitted {form.createdAt ? new Date(form.createdAt).toLocaleString() : 'date unavailable'}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 md:flex-col md:items-stretch">
                    <button onClick={() => handleApprove(form._id)} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800">
                      <Check className="h-4 w-4" /> Approve
                    </button>
                    <button onClick={() => handleReject(form._id)} className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50">
                      <X className="h-4 w-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-700" />
            <h2 className="text-lg font-bold text-gray-900">Reported Comments</h2>
            <span className="text-xs text-gray-500">{reports.length} open</span>
          </div>
          {reports.length === 0 ? (
            <p className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-xs text-gray-500">No open comment reports.</p>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <article key={report._id} className="rounded-2xl border border-red-100 bg-red-50/40 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-bold text-red-800">{report.targetType === 'showReview' ? 'Show discussion' : 'Art-form discussion'} · {report.reporterName}</p>
                    <time className="text-[11px] text-gray-400">{new Date(report.createdAt).toLocaleString()}</time>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{report.contentExcerpt || 'No text provided with this comment.'}</p>
                  <p className="mt-2 text-xs text-gray-600"><span className="font-bold">Report reason:</span> {report.reason}</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => handleReportAction(report._id, 'hide')} className="rounded-lg bg-red-700 px-3 py-2 text-xs font-bold text-white hover:bg-red-800">Hide comment</button>
                    <button onClick={() => handleReportAction(report._id, 'dismiss')} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50">Dismiss report</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}