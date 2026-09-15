import React, { useState } from 'react';

// Precisely recalibrated coordinates mapped to the new high-fidelity SVG trace (500x600 viewBox)
const STATE_PINS = [
  { state: "Uttarakhand", x: 250, y: 110, count: 2, isLesserKnown: true },
  { state: "Jammu & Kashmir", x: 195, y: 50, count: 1, isLesserKnown: false },
  { state: "Himachal Pradesh", x: 220, y: 80, count: 1, isLesserKnown: true },
  { state: "Punjab", x: 185, y: 100, count: 1, isLesserKnown: false },
  { state: "Rajasthan", x: 135, y: 180, count: 3, isLesserKnown: false },
  { state: "Gujarat", x: 80, y: 250, count: 2, isLesserKnown: false },
  { state: "Uttar Pradesh", x: 260, y: 165, count: 2, isLesserKnown: false },
  { state: "Madhya Pradesh", x: 220, y: 235, count: 2, isLesserKnown: true },
  { state: "Maharashtra", x: 160, y: 315, count: 2, isLesserKnown: false },
  { state: "Odisha", x: 300, y: 285, count: 2, isLesserKnown: true },
  { state: "West Bengal", x: 345, y: 250, count: 2, isLesserKnown: true },
  { state: "Assam", x: 405, y: 175, count: 1, isLesserKnown: true },
  { state: "Mizoram", x: 420, y: 235, count: 1, isLesserKnown: true },
  { state: "Karnataka", x: 170, y: 405, count: 2, isLesserKnown: false },
  { state: "Kerala", x: 190, y: 495, count: 3, isLesserKnown: false },
  { state: "Tamil Nadu", x: 230, y: 475, count: 3, isLesserKnown: false },
];

export default function IndiaMap({ onSelectState, selectedState }) {
  const [hoveredState, setHoveredState] = useState(null);

  return (
    <div className="relative w-full bg-amber-50/20 rounded-3xl border border-amber-100 p-5 flex flex-col items-center shadow-xs">
      {/* Header & Legend */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
        <div>
          <h3 className="font-bold text-gray-900 text-base">Cultural Discovery Map</h3>
          <p className="text-xs text-gray-500">Click state markers to filter art traditions</p>
        </div>

        <div className="flex items-center gap-3 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C62828]"></span>
            <span className="text-gray-600 text-[11px]">Lesser-Known</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1A237E]"></span>
            <span className="text-gray-600 text-[11px]">Classical</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full aspect-[5/6]">
        <svg viewBox="0 0 500 600" className="w-full h-full filter drop-shadow-md">
          
          {/* High-Fidelity Geographical India Trace */}
          <path
            d="M 215,20 L 225,25 L 220,40 L 235,50 L 240,65 L 255,80 L 250,90 L 270,110 L 265,120 L 285,130 L 275,145 L 305,150 L 320,150 L 330,165 L 345,160 L 360,175 L 380,160 L 395,155 L 420,150 L 440,160 L 450,180 L 435,210 L 440,240 L 425,260 L 415,250 L 410,270 L 395,255 L 385,255 L 385,240 L 370,240 L 360,260 L 350,285 L 335,310 L 315,335 L 305,360 L 290,380 L 275,410 L 265,445 L 250,470 L 245,510 L 235,530 L 220,545 L 205,535 L 200,510 L 185,480 L 175,450 L 165,420 L 155,385 L 140,360 L 130,330 L 115,310 L 95,305 L 75,310 L 60,305 L 45,295 L 40,270 L 60,260 L 55,240 L 65,225 L 85,230 L 85,210 L 65,200 L 55,185 L 75,175 L 90,180 L 105,155 L 120,135 L 130,120 L 145,110 L 160,90 L 155,75 L 165,65 L 175,50 L 185,30 L 200,20 Z"
            fill="#FFF8E1"
            stroke="#D84315"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 3"
          />

          {/* Interactive State Pins */}
          {STATE_PINS.map((pin) => {
            const isSelected = selectedState === pin.state;
            const isHovered = hoveredState === pin.state;
            const pinColor = pin.isLesserKnown ? '#C62828' : '#1A237E';

            return (
              <g
                key={pin.state}
                onClick={() => onSelectState(isSelected ? null : pin.state)}
                onMouseEnter={() => setHoveredState(pin.state)}
                onMouseLeave={() => setHoveredState(null)}
                className="cursor-pointer group"
              >
                {/* Pulse Ring when Selected */}
                {isSelected && (
                  <circle
                    cx={pin.x}
                    cy={pin.y}
                    r="16"
                    fill={pinColor}
                    opacity="0.25"
                    className="animate-ping"
                  />
                )}

                {/* Pin Circle */}
                <circle
                  cx={pin.x}
                  cy={pin.y}
                  r={isSelected ? "12" : "9.5"}
                  fill={pinColor}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="transition-all duration-200 group-hover:scale-125"
                />

                {/* Count Badge */}
                <text
                  x={pin.x}
                  y={pin.y + 3}
                  fill="#FFFFFF"
                  fontSize="8.5"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="pointer-events-none select-none"
                >
                  {pin.count}
                </text>

                {/* Tooltip Label */}
                {(isHovered || isSelected) && (
                  <g className="transition-opacity duration-150 pointer-events-none">
                    <rect
                      x={pin.x - (pin.state.length * 3.2 + 8)}
                      y={pin.y - 25}
                      width={pin.state.length * 6.4 + 16}
                      height="17"
                      rx="4"
                      fill="#1E293B"
                      opacity="0.92"
                    />
                    <text
                      x={pin.x}
                      y={pin.y - 13}
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {pin.state}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Clear Filter Action */}
      {selectedState && (
        <button
          onClick={() => onSelectState(null)}
          className="mt-3 text-xs text-[#E65100] font-semibold hover:underline bg-amber-100/50 px-4 py-1.5 rounded-full border border-amber-200 transition-colors"
        >
          Clear state filter ({selectedState})
        </button>
      )}
    </div>
  );
}