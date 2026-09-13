import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/common/NavBar';
import SearchBar from '../components/common/SearchBar';
import ArtFormCard from '../components/cards/ArtFormCard';
import IndiaMap from '../components/map/IndiaMap';
import RequestArtFormModal from '../components/forms/RequestArtFormModal';
import GuestGateModal from '../components/common/GuestGateModal';
import { getArtForms } from '../services/artFormService';
import { AuthContext } from '../context/AuthContext';
import { PreferencesContext } from '../context/PreferencesContext';
import { PlusCircle, Filter } from 'lucide-react';

export default function ExplorePage() {
  const { isGuest } = useContext(AuthContext);
  const { selectedPreferences } = useContext(PreferencesContext);

  const [artForms, setArtForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showUnderrepresentedOnly, setShowUnderrepresentedOnly] = useState(false);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isGateOpen, setIsGateOpen] = useState(false);

  useEffect(() => {
    fetchArtForms();
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRequest = () => {
    if (isGuest) {
      setIsGateOpen(true);
    } else {
      setIsRequestModalOpen(true);
    }
  };

  const filteredArtForms = artForms.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          item.state.toLowerCase().includes(search.toLowerCase()) ||
                          item.category.toLowerCase().includes(search.toLowerCase());

    const matchesPreference = selectedPreferences.length === 0 || selectedPreferences.includes(item.category);

    return matchesSearch && matchesPreference;
  });

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-gray-900 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Top Action Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Explore Cultural Arts</h1>
            <p className="text-xs text-gray-500 mt-1">Discover traditional Indian performance arts and regional crafts.</p>
          </div>

          <button
            onClick={handleOpenRequest}
            className="flex items-center gap-2 bg-[#E65100] text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#D84315] transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" /> Propose Missing Art Form
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="mb-8 space-y-4">
          <SearchBar value={search} onChange={setSearch} />

          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <Filter className="w-4 h-4 text-amber-800 flex-shrink-0" />
              {['All', 'Dance', 'Music', 'Theatre', 'Craft'].map(cat => (
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
          {/* SVG Map Section */}
          <div className="lg:col-span-1">
            <IndiaMap onSelectState={setSelectedState} selectedState={selectedState} />
          </div>

          {/* Art Forms Grid */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-16 text-amber-800 font-medium">Loading Art Forms...</div>
            ) : filteredArtForms.length === 0 ? (
              <div className="bg-amber-50/50 p-8 rounded-2xl text-center border border-amber-100">
                <p className="text-gray-600 font-semibold mb-2">No art forms match your search criteria.</p>
                <button 
                  onClick={() => { setSearch(''); setSelectedState(null); setSelectedCategory('All'); setShowUnderrepresentedOnly(false); }}
                  className="text-xs text-[#E65100] font-bold underline"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredArtForms.map(artForm => (
                  <ArtFormCard key={artForm._id} artForm={artForm} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <RequestArtFormModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} />
      <GuestGateModal isOpen={isGateOpen} onClose={() => setIsGateOpen(false)} actionName="propose a missing art form" />
    </div>
  );
}