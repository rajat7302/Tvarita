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
import { PlusCircle, Calendar, Filter, MapPin, Ticket } from 'lucide-react';

export default function ExplorePage() {
  const { isGuest } = useContext(AuthContext);
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

  useEffect(() => {
    fetchArtForms();
    fetchShowsList();
  }, [selectedState, selectedCategory, showUnderrepresentedOnly]);

  const fetchArtForms = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedState) params.state = selectedState;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (showUnderrepresentedOnly) params.underrepresented = 'true';

      const data = await getArtForms(params);
      setArtForms(data);
    } catch (err) {
      console.error('Failed to fetch art forms:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchShowsList = async () => {
    setLoadingShows(true);
    try {
      const data = await getShows();
      setShows(data || []);
    } catch (err) {
      console.error('Failed to fetch shows:', err);
    } finally {
      setLoadingShows(false);
    }
  };

  const handleBookTicket = async (showId) => {
    if (isGuest) {
      setIsGateOpen(true);
      return;
    }

    setBookingLoadingId(showId);
    try {
      await api.post(`/shows/${showId}/book`, { ticketsCount: 1 });
      alert('Ticket booked successfully!');
      fetchShowsList();
    } catch (err) {
      console.error('Booking error:', err);
      alert(err.response?.data?.message || 'Failed to book ticket.');
    } finally {
      setBookingLoadingId(null);
    }
  };

  const handleOpenRequest = () => {
    if (isGuest) {
      setIsGateOpen(true);
    } else {
      setIsRequestModalOpen(true);
    }
  };

  const handleOpenCreateShow = () => {
    if (isGuest) {
      setIsGateOpen(true);
    } else {
      setIsCreateShowModalOpen(true);
    }
  };

  const filteredArtForms = artForms.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.state.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());

    const matchesPreference =
      selectedPreferences.length === 0 || selectedPreferences.includes(item.category);

    return matchesSearch && matchesPreference;
  });

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-gray-900 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Top Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Explore Cultural Arts</h1>
            <p className="text-xs text-gray-500 mt-1">
              Discover traditional Indian performance arts and regional crafts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreateShow}
              className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-800 transition shadow-sm"
            >
              <Calendar className="w-4 h-4" /> Post Upcoming Show
            </button>

            <button
              onClick={handleOpenRequest}
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
              {shows.length} {shows.length === 1 ? 'Show' : 'Shows'} Scheduled
            </span>
          </div>

          {loadingShows ? (
            <div className="text-center py-6 text-xs text-amber-800">Loading upcoming shows...</div>
          ) : shows.length === 0 ? (
            <div className="p-6 bg-amber-50/40 rounded-xl text-center border border-amber-100 text-xs text-gray-600">
              No live shows posted yet. Be the first to publish an event using the button above!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shows.map((show) => (
                <div
                  key={show._id}
                  className="p-4 bg-[#FFFDF9] rounded-xl border border-amber-200/70 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-bold rounded-md text-[10px] uppercase tracking-wider">
                        {show.artFormName || 'Performance'}
                      </span>
                      <span className="font-extrabold text-emerald-700 text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {show.ticketPrice > 0 ? `₹${show.ticketPrice}` : 'Free'}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-gray-900">{show.title}</h3>
                    {show.description && (
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">{show.description}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-amber-100 flex items-end justify-between gap-2">
                    <div className="text-[11px] text-gray-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-800 flex-shrink-0" />
                        <span className="truncate max-w-[120px] sm:max-w-[150px]">{show.venue}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-800 flex-shrink-0" />
                        <span>
                          {new Date(show.date).toLocaleString([], {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Ticket className="w-3.5 h-3.5 text-amber-800 flex-shrink-0" />
                        <span>{show.availableTickets} / {show.totalTickets} left</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBookTicket(show._id)}
                      disabled={show.availableTickets <= 0 || bookingLoadingId === show._id}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-300 text-white font-bold rounded-xl text-xs transition shadow-sm flex-shrink-0"
                    >
                      {show.availableTickets <= 0
                        ? 'Sold Out'
                        : bookingLoadingId === show._id
                        ? 'Booking...'
                        : 'Book Ticket'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Search & Filter Controls */}
        <div className="space-y-4">
          <SearchBar value={search} onChange={setSearch} />

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

        {/* Map & Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <IndiaMap onSelectState={setSelectedState} selectedState={selectedState} />
          </div>

          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-16 text-amber-800 font-medium">Loading Art Forms...</div>
            ) : filteredArtForms.length === 0 ? (
              <div className="bg-amber-50/50 p-8 rounded-2xl text-center border border-amber-100">
                <p className="text-gray-600 font-semibold mb-2">No art forms match your search criteria.</p>
                <button
                  onClick={() => {
                    setSearch('');
                    setSelectedState(null);
                    setSelectedCategory('All');
                    setShowUnderrepresentedOnly(false);
                  }}
                  className="text-xs text-[#E65100] font-bold underline"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredArtForms.map((artForm) => (
                  <ArtFormCard key={artForm._id} artForm={artForm} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
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