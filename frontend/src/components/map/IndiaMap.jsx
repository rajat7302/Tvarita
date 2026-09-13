import React from 'react';
import { MapPin } from 'lucide-react';

// Coordinates for State Pins on SVG Canvas
const STATE_PINS = [
  { state: "Uttarakhand", x: 260, y: 190, count: 2, isLesserKnown: true },
  { state: "Odisha", x: 420, y: 350, count: 1, isLesserKnown: true },
  { state: "Kerala", x: 220, y: 550, count: 1, isLesserKnown: false },
  { state: "West Bengal", x: 470, y: 310, count: 1, isLesserKnown: true },
  { state: "Mizoram", x: 570, y: 280, count: 1, isLesserKnown: true },
  { state: "Rajasthan", x: 180, y: 240, count: 1, isLesserKnown: false },
  { state: "Tamil Nadu", x: 260, y: 540, count: 1, isLesserKnown: false }
];

export default function IndiaMap({ onSelectState, selectedState }) {
  return (
    <div className="relative w-full bg-amber-50/30 rounded-3xl border border-amber-100 p-6 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4 px-2">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Cultural Discovery Map</h3>
          <p className="text-xs text-gray-500">Click state markers to filter art traditions</p>
        </div>

        {/* Map Marker Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#C62828]"></span>
            <span className="text-gray-700">Lesser-Known Art</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#1A237E]"></span>
            <span className="text-gray-700">Traditional Classical</span>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-lg aspect-[4/5]">
        <svg viewBox="0 0 650 650" className="w-full h-full drop-shadow-sm">
          {/* India Outline Representation */}
          <path
            d="M260,80 L310,120 L300,160 L340,190 L290,220 L220,200 L180,240 L160,300 L200,360 L240,430 L220,550 L260,580 L290,520 L310,420 L400,380 L480,330 L550,280 L580,250 L520,230 L460,260 L410,240 L350,160 Z"
            fill="#FFF8E1"
            stroke="#D84315"
            strokeWidth="2"
            strokeDasharray="4 2"
          />

          {/* Render State Pins */}
          {STATE_PINS.map((pin) => {
            const isSelected = selectedState === pin.state;
            const pinColor = pin.isLesserKnown ? '#C62828' : '#1A237E';

            return (
              <g
                key={pin.state}
                onClick={() => onSelectState(isSelected ? null : pin.state)}
                className="cursor-pointer group"
              >
                {/* Pulse outline for selected state */}
                {isSelected && (
                  <circle
                    cx={pin.x}
                    cy={pin.y}
                    r="20"
                    fill={pinColor}
                    opacity="0.2"
                    className="animate-ping"
                  />
                )}

                <circle
                  cx={pin.x}
                  cy={pin.y}
                  r="12"
                  fill={pinColor}
                  className="transition-transform duration-200 group-hover:scale-125 shadow-lg"
                />

                <text
                  x={pin.x}
                  y={pin.y + 4}
                  fill="#FFFFFF"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {pin.count}
                </text>

                {/* State Name Tooltip Tag */}
                <rect
                  x={pin.x - 35}
                  y={pin.y - 28}
                  width="70"
                  height="18"
                  rx="4"
                  fill="#1E1E1E"
                  opacity="0.85"
                />
                <text
                  x={pin.x}
                  y={pin.y - 16}
                  fill="#FFFFFF"
                  fontSize="9"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {pin.state}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {selectedState && (
        <button
          onClick={() => onSelectState(null)}
          className="mt-3 text-xs text-[#E65100] font-semibold hover:underline"
        >
          Clear state filter ({selectedState})
        </button>
      )}
    </div>
  );
}