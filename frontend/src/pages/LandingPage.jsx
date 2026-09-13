import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { PreferencesContext } from '../context/PreferencesContext';
import { Compass, Sparkles, ShieldCheck, Heart } from 'lucide-react';

const CATEGORIES = [
  { id: 'Dance', name: 'Folk & Classical Dance', desc: 'Choliya, Langvir, Chhau, Kathakali' },
  { id: 'Music', name: 'Traditional Music', desc: 'Folk Ballads, Ragas, Vocal Lore' },
  { id: 'Theatre', name: 'Folk Theatre', desc: 'Ramman, Yakshagana, Nautanki' },
  { id: 'Craft', name: 'Handicrafts & Art', desc: 'Aipan, Pattachitra, Tanjore' }
];

export default function LandingPage() {
  const { continueAsGuest } = useContext(AuthContext);
  const { selectedPreferences, togglePreference } = useContext(PreferencesContext);
  const navigate = useNavigate();

  const handleStartExploring = () => {
    continueAsGuest();
    navigate('/explore');
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-gray-900 flex flex-col justify-between">
      {/* Hero Section */}
      <header className="max-w-6xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 border border-amber-200">
          <Sparkles className="w-4 h-4 text-[#E65100]" /> Empowering Indian Cultural Heritage
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
          Discover & Preserve <br />
          <span className="text-[#E65100]">India’s Living Heritage</span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 mb-10">
          Tvarita is an anti-popularity, equal-visibility platform dedicated to illuminating lesser-known folk art forms, traditional performers, and cultural showcases.
        </p>

        {/* Preference Selector */}
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-3xl border border-amber-200 shadow-xl mb-10">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">
            Select Your Cultural Interests (Optional)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {CATEGORIES.map((cat) => {
              const active = selectedPreferences.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => togglePreference(cat.id)}
                  className={`p-4 rounded-2xl border text-left transition ${
                    active 
                      ? 'bg-amber-50 border-[#E65100] text-amber-950 font-semibold shadow-sm' 
                      : 'bg-white border-amber-100 hover:border-amber-300 text-gray-700'
                  }`}
                >
                  <div className="text-sm font-bold">{cat.name}</div>
                  <div className="text-xs text-gray-500 font-normal">{cat.desc}</div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStartExploring}
              className="w-full sm:w-auto bg-[#E65100] text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-[#D84315] transition shadow-lg flex items-center justify-center gap-2 text-sm"
            >
              <Compass className="w-5 h-5" /> Explore Art Forms
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto border border-amber-300 text-amber-900 px-8 py-3.5 rounded-2xl font-bold hover:bg-amber-50 transition text-sm"
            >
              Sign In to Contribute
            </button>
          </div>
        </div>
      </header>

      {/* Trust Badges */}
      <section className="bg-amber-50/50 py-12 border-y border-amber-100">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-4">
            <ShieldCheck className="w-8 h-8 text-[#E65100] mx-auto mb-2" />
            <h4 className="font-bold text-gray-900 mb-1">Equal Visibility</h4>
            <p className="text-xs text-gray-600">No popularity algorithms. Every folk form and artist gets balanced exposure.</p>
          </div>
          <div className="p-4">
            <Sparkles className="w-8 h-8 text-[#E65100] mx-auto mb-2" />
            <h4 className="font-bold text-gray-900 mb-1">Authentic Documentation</h4>
            <p className="text-xs text-gray-600">Historical contexts, regional heritage, and verified performance schedules.</p>
          </div>
          <div className="p-4">
            <Heart className="w-8 h-8 text-[#E65100] mx-auto mb-2" />
            <h4 className="font-bold text-gray-900 mb-1">Community Driven</h4>
            <p className="text-xs text-gray-600">Propose unlisted arts, submit stories, and review experiences qualitatively.</p>
          </div>
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-gray-500">
        © 2026 Tvarita Arts Collective. Dedicated to Indian Cultural Heritage.
      </footer>
    </div>
  );
}