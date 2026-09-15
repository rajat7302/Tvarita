import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/common/NavBar';
import SearchBar from '../components/common/SearchBar';
import ArtFormCard from '../components/cards/ArtFormCard';
import IndiaMap from '../components/map/IndiaMap';
import RequestArtFormModal from '../components/forms/RequestArtFormModal';
import CreateShowModal from '../components/CreateShowModal';
import GuestGateModal from '../components/common/GuestGateModal';
import { getArtForms } from '../services/artFormService';
import { getShows } from '../services/showService';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { PreferencesContext } from '../context/PreferencesContext';
import { PlusCircle, Calendar, Filter, MapPin, Ticket, CheckCircle, MessageSquare, Image as ImageIcon, X } from 'lucide-react';

const extractImageUrl = (img) => {
  if (!img) return null;
  if (typeof img === 'string') return img;
  if (typeof img === 'object') return img.url || img.secure_url || img.path || null;
  return null;
};

const extractTickets = (showData) => {
  if (!showData) return 100;
  const keys = ['availableTickets', 'ticketsLeft', 'tickets', 'capacity', 'totalTickets', 'ticketCount', 'maxCapacity'];
  for (let key of keys) {
    if (showData[key] !== undefined && showData[key] !== null) {
      const num = Number(showData[key]);
      if (!isNaN(num)) return num;
    }
  }
  return 100;
};

export default function ExplorePage() {
  const { isGuest, user } = useContext(AuthContext);
  const { selectedPreferences } = useContext(PreferencesContext);

  const [artForms, setArtForms] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingShows, setLoadingShows] = useState(true);
  const [bookingLoadingId, setBookingLoadingId] = useState(null);

  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showUnderrepresentedOnly, setShowUnderrepresentedOnly] = useState(false);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isCreateShowModalOpen, setIsCreateShowModalOpen] = useState(false);
  const [isGateOpen, setIsGateOpen] = useState(false);

  const [paymentSuccessData, setPaymentSuccessData] = useState(null);
  const [activeDiscussionShow, setActiveDiscussionShow] = useState(null);
  
  const [localComments, setLocalComments] = useState({});
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentPhoto, setNewCommentPhoto] = useState(null);

  useEffect(() => {
    fetchArtForms();
    fetchShowsList();
  }, []);

  const fetchArtForms = async () => {
    setLoading(true);
    try {
      const response = await getArtForms({});
      const data = response?.data?.artForms || response?.data?.data || response?.data || response;
      setArtForms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch art forms:', err);
      setArtForms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchShowsList = async () => {
    setLoadingShows(true);
    try {
      const response = await getShows();
      const data = response?.data?.shows || response?.data?.data || response?.data || response;
      setShows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch shows:', err);
      setShows([]);
    } finally {
      setLoadingShows(false);
    }
  };

  const handleBookTicket = async (show) => {
    if (isGuest) {
      setIsGateOpen(true);
      return;
    }

    const showId = show._id || show.id;
    setBookingLoadingId(showId);
    try {
      await api.post(`/shows/${showId}/book`, { ticketsCount: 1 });
      setPaymentSuccessData(show);
      fetchShowsList();
      setTimeout(() => setPaymentSuccessData(null), 3000);
    } catch (err) {
      console.error('Booking error:', err);
      alert(err.response?.data?.message || 'Failed to book ticket.');
    } finally {
      setBookingLoadingId(null);
    }
  };

  const handleAddComment = () => {
    if (!newCommentText.trim() && !newCommentPhoto) return;
    
    const showId = activeDiscussionShow._id || activeDiscussionShow.id;
    const comment = {
      id: Date.now(),
      text: newCommentText,
      photo: newCommentPhoto,
      author: user?.name || 'You',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setLocalComments(prev => ({
      ...prev,
      [showId]: [...(prev[showId] || []), comment]
    }));

    setNewCommentText('');
    setNewCommentPhoto(null);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCommentPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const safeArtForms = Array.isArray(artForms) ? artForms : [];
  const safeShows = Array.isArray(shows) ? shows : [];

  // Filter shows based on search query
  const filteredShows = safeShows.filter((show) => {
    if (!show) return false;
    const searchTerm = (search || '').toLowerCase().trim();
    if (!searchTerm) return true;

    const searchableText = [
      show.title,
      show.artFormName,
      show.description,
      show.venue,
      show.location,
      show.category
    ].filter(Boolean).join(' ').toLowerCase();

    return searchableText.includes(searchTerm);
  });

  // Normalize map selection to ensure valid filtering
  const activeStateFilter = (selectedState && !['india', 'all', 'national', 'null', 'undefined'].includes(String(selectedState).toLowerCase().trim())) 
    ? String(selectedState).toLowerCase().trim() 
    : null;

  // Safe and flexible filtering for Art Forms
  const filteredArtForms = safeArtForms.filter((item) => {
    if (!item) return false;
    
    const searchTerm = (search || '').toLowerCase().trim();
    
    // 1. Text search matching
    const searchableText = [
      item.name, 
      item.artFormName, 
      item.title, 
      item.state, 
      item.region, 
      item.location, 
      item.description, 
      item.about, 
      item.category,
      item.artFormCategory
    ].filter(Boolean).join(' ').toLowerCase();

    const matchesSearch = !searchTerm || searchableText.includes(searchTerm);

    // 2. Category matching
    const itemCategory = (item.category || item.artFormCategory || item.type || '').toLowerCase();
    const matchesCategory = selectedCategory === 'All' || itemCategory === selectedCategory.toLowerCase();

    // 3. Lesser-known / Underrepresented flag matching
    const isLesserKnown = Boolean(item.isUnderrepresented || item.underrepresented || item.isLesserKnown);
    const matchesUnderrepresented = !showUnderrepresentedOnly || isLesserKnown;

    // 4. Map state selection matching
    const itemState = (item.state || item.region || item.location || '').toLowerCase();
    const matchesState = !activeStateFilter || itemState.includes(activeStateFilter) || activeStateFilter.includes(itemState);

    return matchesSearch && matchesCategory && matchesUnderrepresented && matchesState;
  });

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-gray-900 pb-16 relative">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Explore Cultural Arts</h1>
            <p className="text-xs text-gray-500 mt-1">
              Discover traditional Indian performance arts and regional crafts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => isGuest ? setIsGateOpen(true) : setIsCreateShowModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-800 transition shadow-sm"
            >
              <Calendar className="w-4 h-4" /> Post Upcoming Show
            </button>

            <button
              onClick={() => isGuest ? setIsGateOpen(true) : setIsRequestModalOpen(true)}
              className="flex items-center gap-2 bg-[#E65100] text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#D84315] transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" /> Propose Missing Art Form
            </button>
          </div>
        </div>

        {/* Live Upcoming Shows Section */}
        <section className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-amber-950 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-700" /> Upcoming Live Shows
            </h2>
            <span className="text-xs font-semibold text-gray-500">
              {filteredShows.length} {filteredShows.length === 1 ? 'Show' : 'Shows'} Scheduled
            </span>
          </div>

          {loadingShows ? (
            <div className="text-center py-6 text-xs text-amber-800">Loading upcoming shows...</div>
          ) : filteredShows.length === 0 ? (
            <div className="p-6 bg-amber-50/40 rounded-xl text-center border border-amber-100 text-xs text-gray-600">
              No live shows match your search criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredShows.map((show, idx) => {
                if (!show) return null;
                const showImage = extractImageUrl(show.imageUrl) || extractImageUrl(show.image) || extractImageUrl(show.bannerUrl) || extractImageUrl(show.banner);
                const availableTickets = extractTickets(show);
                const isSoldOut = availableTickets <= 0;
                const showId = show._id || show.id || `show-${idx}`;

                return (
                  <div
                    key={showId}
                    className="p-4 bg-[#FFFDF9] rounded-xl border border-amber-200/70 shadow-sm flex flex-col justify-between transition hover:shadow-md"
                  >
                    <div>
                      {showImage ? (
                        <img 
                          src={showImage} 
                          alt={show.title || 'Show Image'} 
                          className="w-full h-36 object-cover rounded-lg mb-3 border border-amber-100"
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-36 bg-amber-50 rounded-lg mb-3 border border-amber-100 flex items-center justify-center text-amber-800 text-xs font-medium">
                          No Image Available
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-bold rounded-md text-[10px] uppercase tracking-wider">
                          {show.artFormName || show.category || 'Performance'}
                        </span>
                        <span className="font-extrabold text-emerald-700 text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {show.ticketPrice || show.price ? `₹${show.ticketPrice || show.price}` : 'Free'}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-gray-900">{show.title || 'Untitled Show'}</h3>
                      {show.description && (
                        <p className="text-xs text-gray-600 line-clamp-2 mt-1">{show.description}</p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-amber-100 space-y-3">
                      <div className="text-[11px] text-gray-500 flex justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-800" />
                            <span className="truncate max-w-[120px]">{show.venue || show.location || 'TBD'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-amber-800" />
                            <span>
                              {show.date ? new Date(show.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="flex items-center justify-end gap-1.5">
                            <Ticket className="w-3.5 h-3.5 text-amber-800" />
                            <span>{availableTickets} left</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveDiscussionShow(show)}
                          className="flex-1 px-3 py-2 bg-amber-50 text-amber-900 hover:bg-amber-100 font-bold rounded-xl text-xs transition border border-amber-200 flex items-center justify-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Discuss
                        </button>
                        <button
                          onClick={() => handleBookTicket(show)}
                          disabled={isSoldOut || bookingLoadingId === showId}
                          className="flex-1 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-300 text-white font-bold rounded-xl text-xs transition shadow-sm"
                        >
                          {isSoldOut ? 'Sold Out' : bookingLoadingId === showId ? 'Wait...' : 'Book Ticket'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Search & Filter Bar */}
        <div className="space-y-4">
          <SearchBar value={search} onChange={(val) => setSearch(typeof val === 'string' ? val : val?.target?.value || '')} />

          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <Filter className="w-4 h-4 text-amber-800 flex-shrink-0" />
              {['All', 'Dance', 'Music', 'Theatre', 'Craft'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-amber-900 text-white'
                      : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {activeStateFilter && (
                <button
                  onClick={() => setSelectedState(null)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-lg border border-amber-300 hover:bg-amber-200 transition"
                >
                  <span>State: {selectedState}</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <label className="flex items-center gap-2 text-xs font-bold text-amber-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUnderrepresentedOnly}
                  onChange={(e) => setShowUnderrepresentedOnly(e.target.checked)}
                  className="rounded accent-[#E65100]"
                />
                Show Lesser-Known Forms Only
              </label>
            </div>
          </div>
        </div>

        {/* Map and Art Form Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <IndiaMap onSelectState={setSelectedState} selectedState={selectedState} />
          </div>

          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-16 text-amber-800 font-medium">Loading Art Forms...</div>
            ) : filteredArtForms.length === 0 ? (
              <div className="bg-amber-50/50 p-8 rounded-2xl text-center border border-amber-100 space-y-3">
                <p className="text-gray-600 font-semibold">No art forms match your search criteria.</p>
                <button
                  onClick={() => {
                    setSearch('');
                    setSelectedState(null);
                    setSelectedCategory('All');
                    setShowUnderrepresentedOnly(false);
                  }}
                  className="inline-block px-4 py-2 bg-[#E65100] text-white text-xs font-bold rounded-xl hover:bg-[#D84315] transition shadow-sm"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredArtForms.map((artForm, index) => (
                  <ArtFormCard key={artForm._id || artForm.id || index} artForm={artForm} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Payment Confirmation Modal */}
      {paymentSuccessData && (
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
              onClick={() => setPaymentSuccessData(null)}
              className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Discussion Modal */}
      {activeDiscussionShow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-amber-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-800" /> 
                Discussion: {activeDiscussionShow.title}
              </h3>
              <button 
                onClick={() => { setActiveDiscussionShow(null); setNewCommentPhoto(null); }} 
                className="text-gray-400 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {!(localComments[activeDiscussionShow._id || activeDiscussionShow.id]?.length) ? (
                <div className="text-center py-8 text-sm text-gray-400 font-medium">
                  No comments yet. Be the first to start the discussion or share a photo!
                </div>
              ) : (
                localComments[activeDiscussionShow._id || activeDiscussionShow.id].map(comment => (
                  <div key={comment.id} className="bg-[#FFFDF9] p-3 rounded-xl shadow-sm border border-amber-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-emerald-700">{comment.author}</span>
                      <span className="text-[10px] text-gray-400">{comment.time}</span>
                    </div>
                    {comment.text && <p className="text-sm text-gray-700 mb-2">{comment.text}</p>}
                    {comment.photo && (
                      <img src={comment.photo} alt="User Upload" className="w-full h-40 object-cover rounded-lg border border-gray-100" />
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-white border-t border-gray-100 space-y-3">
              {newCommentPhoto && (
                <div className="relative inline-block">
                  <img src={newCommentPhoto} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
                  <button onClick={() => setNewCommentPhoto(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <label className="cursor-pointer p-2 bg-amber-50 text-amber-800 rounded-xl hover:bg-amber-100 transition border border-amber-200">
                  <ImageIcon className="w-5 h-5" />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
                <input 
                  type="text" 
                  placeholder="Ask a question or share a thought..." 
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <button 
                  onClick={handleAddComment}
                  className="px-4 py-2 bg-emerald-700 text-white text-sm font-bold rounded-xl hover:bg-emerald-800 transition"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modals */}
      <RequestArtFormModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={fetchArtForms}
      />
      <CreateShowModal
        isOpen={isCreateShowModalOpen}
        onClose={() => setIsCreateShowModalOpen(false)}
        onSuccess={fetchShowsList}
      />
      <GuestGateModal
        isOpen={isGateOpen}
        onClose={() => setIsGateOpen(false)}
        actionName="book or post a show"
      />
    </div>
  );
}