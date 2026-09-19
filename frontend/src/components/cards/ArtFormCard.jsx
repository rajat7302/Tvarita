import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Sparkles } from 'lucide-react';

export default function ArtFormCard({ artForm }) {
  return (
    <Link 
      to={`/artform/${artForm._id}`} 
      className="group bg-white rounded-2xl overflow-hidden border border-amber-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full"
    >
      <div className="relative h-48 bg-amber-100 overflow-hidden">
        {artForm.images && artForm.images[0] ? (
          <img 
            src={artForm.images[0]} 
            alt={artForm.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-amber-700 font-bold text-xl">
            {artForm.name}
          </div>
        )}

        {artForm.isUnderrepresented && (
          <div className="absolute top-3 right-3 bg-red-700 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Sparkles className="w-3 h-3" /> Lesser Known
          </div>
        )}

        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
          <MapPin className="w-3 h-3 text-amber-400" /> {artForm.state}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#E65100] mb-1">
            {artForm.category}
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#E65100] transition-colors">
            {artForm.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {artForm.description}
          </p>
        </div>

        <div className="pt-3 border-t border-amber-50 flex items-center justify-between gap-2 text-xs font-medium text-amber-900">
          <span className="truncate min-w-0" title={`Region: ${artForm.region || 'Regional'}`}>Region: {artForm.region || 'Regional'}</span>
          <span className="flex-shrink-0 group-hover:translate-x-1 transition-transform">Explore →</span>
        </div>
      </div>
    </Link>
  );
}