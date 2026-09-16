import React, { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from 'react-simple-maps';

const HIGH_RES_INDIA_TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

const STATE_PINS = [
  { state: "Uttarakhand", coordinates: [78.9629, 30.0668], count: 2, isLesserKnown: true },
  { state: "Jammu & Kashmir", coordinates: [74.7973, 34.0837], count: 1, isLesserKnown: false },
  { state: "Himachal Pradesh", coordinates: [77.1734, 31.1048], count: 1, isLesserKnown: true },
  { state: "Punjab", coordinates: [75.3412, 31.1471], count: 1, isLesserKnown: false },
  { state: "Rajasthan", coordinates: [74.2179, 27.0238], count: 3, isLesserKnown: false },
  { state: "Gujarat", coordinates: [71.1924, 22.2587], count: 2, isLesserKnown: false },
  { state: "Uttar Pradesh", coordinates: [80.9462, 26.8467], count: 2, isLesserKnown: false },
  { state: "Madhya Pradesh", coordinates: [78.6569, 22.9734], count: 2, isLesserKnown: true },
  { state: "Maharashtra", coordinates: [75.7139, 19.7515], count: 2, isLesserKnown: false },
  { state: "Odisha", coordinates: [85.0985, 20.9517], count: 2, isLesserKnown: true },
  { state: "West Bengal", coordinates: [87.8550, 22.9868], count: 2, isLesserKnown: true },
  { state: "Assam", coordinates: [92.9376, 26.2006], count: 1, isLesserKnown: true },
  { state: "Karnataka", coordinates: [75.7139, 15.3173], count: 2, isLesserKnown: false },
  { state: "Kerala", coordinates: [76.2711, 10.8505], count: 3, isLesserKnown: false },
  { state: "Tamil Nadu", coordinates: [78.6569, 11.1271], count: 3, isLesserKnown: false },
];

export default function IndiaMap({ onSelectState, selectedState }) {
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
          <Geographies geography={HIGH_RES_INDIA_TOPO_URL}>
            {({ geographies }) =>
              geographies
                .filter((geo) => geo.id === "356" || geo.properties.name === "India")
                .map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#FFF8E1"
                    stroke="#D84315"
                    strokeWidth={1.2}
                    style={{
                      default: { outline: 'none' },
                      hover: { fill: '#FDE68A', stroke: '#B45309', outline: 'none', cursor: 'pointer' },
                      pressed: { fill: '#F59E0B', outline: 'none' },
                    }}
                  />
                ))
            }
          </Geographies>

          {/* Markers */}
          {STATE_PINS.map((pin) => {
            const isSelected = selectedState === pin.state;
            const isHovered = hoveredState === pin.state;
            const pinColor = pin.isLesserKnown ? '#C62828' : '#1A237E';

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
                  {pin.count}
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