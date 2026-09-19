import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder }) {
  const [isSmallScreen, setIsSmallScreen] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 639px)');
    const handleChange = (e) => setIsSmallScreen(e.matches);
    handleChange(mql);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  const defaultPlaceholder = isSmallScreen
    ? 'Search art forms...'
    : 'Search art forms (e.g. Choliya, Chhau, Kathakali)...';

  return (
    <div className="relative w-full">
      <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-amber-700" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || defaultPlaceholder}
        className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-amber-200 rounded-2xl text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E65100] focus:border-transparent shadow-sm"
      />
    </div>
  );
}