import React from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-700" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search art forms (e.g. Choliya, Chhau, Kathakali)..."}
        className="w-full pl-12 pr-4 py-3 bg-white border border-amber-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E65100] focus:border-transparent shadow-sm"
      />
    </div>
  );
}