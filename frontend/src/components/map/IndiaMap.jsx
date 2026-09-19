import React, { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from 'react-simple-maps';

// Official Survey of India complete boundary dataset (Includes full J&K and Ladakh)
const INDIA_STATES_GEOJSON_URL = 'https://raw.githubusercontent.com/udit-001/india-maps-data/master/geojson/india.geojson';

const STATE_PINS = [
  { state: 'Andaman and Nicobar Islands', coordinates: [92.75, 11.67] },
  { state: 'Andhra Pradesh', coordinates: [79.74, 15.91] },
  { state: 'Arunachal Pradesh', coordinates: [94.60, 28.10] }, // Adjusted for centering
  { state: 'Assam', coordinates: [92.90, 26.00], count: 1, isLesserKnown: true }, // Adjusted for centering
  { state: 'Bihar', coordinates: [85.31, 25.60] },
  { state: 'Chandigarh', coordinates: [76.78, 30.73] },
  { state: 'Chhattisgarh', coordinates: [81.86, 21.28] },
  { state: 'Dadra and Nagar Haveli and Daman and Diu', coordinates: [72.83, 20.27] },
  { state: 'Delhi', coordinates: [77.10, 28.61] },
  { state: 'Goa', coordinates: [74.12, 15.49] },
  { state: 'Gujarat', coordinates: [72.57, 23.02], count: 2 },
  { state: 'Haryana', coordinates: [76.78, 29.06] },
  { state: 'Himachal Pradesh', coordinates: [77.17, 31.10], count: 1, isLesserKnown: true },
  { state: 'Jammu and Kashmir', coordinates: [74.80, 33.70], count: 1 },
  { state: 'Jharkhand', coordinates: [85.32, 23.34] },
  { state: 'Karnataka', coordinates: [76.95, 12.97], count: 2 },
  { state: 'Kerala', coordinates: [76.27, 10.85], count: 3 },
  { state: 'Ladakh', coordinates: [77.58, 34.15] },
  { state: 'Lakshadweep', coordinates: [73.00, 10.56] },
  { state: 'Madhya Pradesh', coordinates: [77.41, 23.25], count: 2, isLesserKnown: true },
  { state: 'Maharashtra', coordinates: [73.85, 18.52], count: 2 },
  { state: 'Manipur', coordinates: [93.90, 24.70] }, // Adjusted for centering
  { state: 'Meghalaya', coordinates: [91.20, 25.40] }, // Adjusted for centering
  { state: 'Mizoram', coordinates: [92.80, 23.30] }, // Adjusted for centering
  { state: 'Nagaland', coordinates: [94.30, 26.15] }, // Adjusted for centering
  { state: 'Odisha', coordinates: [85.84, 20.30], count: 2, isLesserKnown: true },
  { state: 'Puducherry', coordinates: [79.81, 11.94] },
  { state: 'Punjab', coordinates: [75.85, 30.90], count: 1 },
  { state: 'Rajasthan', coordinates: [73.00, 26.90], count: 3 },
  { state: 'Sikkim', coordinates: [88.50, 27.55] }, // Adjusted for centering
  { state: 'Tamil Nadu', coordinates: [78.65, 11.13], count: 3 },
  { state: 'Telangana', coordinates: [79.20, 17.90] },
  { state: 'Tripura', coordinates: [91.75, 23.75] }, // Adjusted for centering
  { state: 'Uttar Pradesh', coordinates: [80.95, 26.85], count: 2 },
  { state: 'Uttarakhand', coordinates: [78.96, 30.07], count: 2, isLesserKnown: true },
  { state: 'West Bengal', coordinates: [87.85, 23.00], count: 2, isLesserKnown: true },
];

const STATE_NAME_ALIASES = {
  'Jammu & Kashmir': 'Jammu and Kashmir',
  'NCT of Delhi': 'Delhi',
  'Orissa': 'Odisha',
  'Pondicherry': 'Puducherry'
};

const getStateName = (geo) => {
  const rawName = geo.properties?.st_nm 
    || geo.properties?.ST_NM 
    || geo.properties?.NAME_1 
    || geo.properties?.name 
    || geo.properties?.state_name;
    
  return STATE_NAME_ALIASES[rawName] || rawName;
};

const normalizeState = (value) => String(value || '')
  .toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]/g, '');

export default function IndiaMap({ onSelectState, selectedState, artForms = [] }) {
  const [hoveredState, setHoveredState] = useState(null);

  return (
    <div className="relative w-full bg-amber-50/20 rounded-3xl border border-amber-100 p-4 sm:p-6 flex flex-col items-center shadow-xs">
      {/* Header & Legend */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 px-1">
        <div>
          <h3 className="font-bold text-gray-900 text-base sm:text-lg">Cultural Discovery Map</h3>
          <p className="text-xs text-gray-500">Click state markers to filter art traditions</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#C62828]"></span>
            <span className="text-gray-600">Lesser-Known</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#1A237E]"></span>
            <span className="text-gray-600">Classical</span>
          </div>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative w-full flex items-center justify-center">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 1000,
            center: [80.5, 22.5]
          }}
          className="w-full h-auto filter drop-shadow-md max-h-[600px]"
        >
          <Geographies geography={INDIA_STATES_GEOJSON_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const stateName = getStateName(geo);
                const isSelected = selectedState === stateName;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => onSelectState && onSelectState(isSelected ? null : stateName)}
                    fill={isSelected ? '#F59E0B' : '#FFF8E1'}
                    stroke="#D84315"
                    strokeWidth={0.7}
                    style={{
                      default: { outline: 'none' },
                      hover: { fill: '#FDE68A', stroke: '#B45309', outline: 'none', cursor: 'pointer' },
                      pressed: { fill: '#F59E0B', outline: 'none' },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* Markers */}
          {STATE_PINS.map((pin) => {
            const isSelected = selectedState === pin.state;
            const isHovered = hoveredState === pin.state;
            const matchingArtForms = artForms.filter((artForm) => {
              const formState = artForm.state || artForm.region || artForm.location;
              if (!formState) return false;
              return normalizeState(formState).includes(normalizeState(pin.state))
                || normalizeState(pin.state).includes(normalizeState(formState));
            });
            const artFormCount = matchingArtForms.length;
            const hasLesserKnownForm = matchingArtForms.some((artForm) => Boolean(
              artForm.isUnderrepresented || artForm.underrepresented || artForm.isLesserKnown
            ));
            const pinColor = hasLesserKnownForm ? '#C62828' : '#1A237E';

            return (
              <Marker
                key={pin.state}
                coordinates={pin.coordinates}
                onClick={() => onSelectState && onSelectState(isSelected ? null : pin.state)}
                onMouseEnter={() => setHoveredState(pin.state)}
                onMouseLeave={() => setHoveredState(null)}
                className="cursor-pointer group"
              >
                {isSelected && (
                  <circle
                    r="18"
                    fill={pinColor}
                    opacity="0.3"
                    className="animate-ping"
                  />
                )}

                <circle
                  r={isSelected ? "14" : "11"}
                  fill={pinColor}
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  className="transition-all duration-200 group-hover:scale-125"
                />

                <text
                  y="4"
                  fill="#FFFFFF"
                  fontSize={isSelected ? "11" : "9.5"}
                  fontWeight="bold"
                  textAnchor="middle"
                  className="pointer-events-none select-none"
                >
                  {artFormCount}
                </text>

                {(isHovered || isSelected) && (
                  <g className="transition-opacity duration-150 pointer-events-none">
                    <rect
                      x={-(pin.state.length * 4 + 10)}
                      y="-28"
                      width={pin.state.length * 8 + 20}
                      height="20"
                      rx="5"
                      fill="#1E293B"
                      opacity="0.92"
                    />
                    <text
                      y="-14"
                      fill="#FFFFFF"
                      fontSize="10.5"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {pin.state}
                    </text>
                  </g>
                )}
              </Marker>
            );
          })}
        </ComposableMap>
      </div>

      {/* Clear Filter */}
      {selectedState && (
        <button
          onClick={() => onSelectState(null)}
          className="mt-4 text-xs text-[#E65100] font-semibold hover:underline bg-amber-100/50 px-4 py-1.5 rounded-full border border-amber-200 transition-colors"
        >
          Clear state filter ({selectedState})
        </button>
      )}
    </div>
  );
}