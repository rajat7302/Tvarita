import React from 'react';
import { HeartHandshake } from 'lucide-react';

export default function ExperienceCard({ experience }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 mb-2">
        <HeartHandshake className="w-4 h-4 text-[#E65100]" />
        <span>Attendee Reflection by {experience.userId?.name || 'Anonymous Cultural Observer'}</span>
      </div>

      <p className="text-sm text-gray-800 italic bg-amber-50/40 p-3.5 rounded-xl border border-amber-100">
        "{experience.content}"
      </p>

      {experience.imageUrl && (
        <img 
          src={experience.imageUrl} 
          alt="User experience photograph" 
          className="mt-3 rounded-xl h-40 w-full object-cover" 
        />
      )}
    </div>
  );
}