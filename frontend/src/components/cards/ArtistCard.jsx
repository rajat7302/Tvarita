import React from 'react';
import { User, Users } from 'lucide-react';

export default function ArtistCard({ artist }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm flex items-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-amber-800 font-bold text-xl">
        {artist.images && artist.images[0] ? (
          <img src={artist.images[0]} alt={artist.name} className="w-full h-full object-cover" />
        ) : (
          artist.type === 'group' ? <Users className="w-8 h-8" /> : <User className="w-8 h-8" />
        )}
      </div>

      <div className="flex-grow">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="font-bold text-gray-900">{artist.name}</h4>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            {artist.type}
          </span>
        </div>
        <p className="text-xs text-gray-600 line-clamp-2">{artist.bio}</p>
      </div>
    </div>
  );
}