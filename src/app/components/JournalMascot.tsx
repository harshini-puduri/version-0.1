'use client';

import { useState } from "react";
import { useMascotColors } from "@/app/contexts/MascotColorsContext";

interface JournalMascotProps {
  size?: number;
  showCustomization?: boolean;
}

export function JournalMascot({ size = 380, showCustomization = false }: JournalMascotProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Use shared color context
  const { colors, setColors, resetColors } = useMascotColors();

  // Blink animation effect
  const handleBlink = () => {
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 200);
  };

  // Random blinks
  useState(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        handleBlink();
      }
    }, 3000);
    return () => clearInterval(interval);
  });

  return (
    <div className="flex flex-col items-center gap-12">
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox="0 0 380 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative cursor-pointer transition-all duration-700"
          style={{
            filter: isHovered ? 'drop-shadow(0 30px 60px rgba(251, 146, 60, 0.2))' : 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.08))'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Main symmetric blob - organic shape with personality */}
          <path
            d="M190 55
               C235 58 275 80 295 125
               C310 160 312 200 302 240
               C292 275 270 305 235 320
               C205 333 175 335 145 325
               C110 313 80 285 65 245
               C52 210 50 170 60 135
               C72 95 100 70 140 60
               C160 56 175 55 190 55Z"
            fill="url(#elegantGradient)"
            className="transition-all duration-700"
            style={{
              transform: isHovered ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(1.03, 0.97)',
            }}
          />

          {/* Bottom shadow for depth */}
          <ellipse
            cx="190"
            cy="315"
            rx="110"
            ry="12"
            fill="#3E2723"
            opacity="0.03"
            className="transition-all duration-700"
            style={{
              transform: isHovered ? 'scale(1)' : 'scale(0.9, 1)',
            }}
          />

          {/* Inner glow for dimension */}
          <ellipse
            cx="195"
            cy="135"
            rx="85"
            ry="65"
            fill="url(#innerGlow)"
            opacity="0.6"
          />

          {/* Symmetric top accents - like little ears or tufts */}
          <path
            d="M115 85 Q105 65 120 58 Q135 55 142 75 Q138 90 125 92 Q115 90 115 85Z"
            fill="url(#accentGradient)"
            opacity="0.7"
            className="transition-all duration-700"
            style={{
              transform: isHovered ? 'translateY(0)' : 'translateY(-5px) translateX(-2px) rotate(-8deg)',
              transformOrigin: '125px 75px'
            }}
          />
          <path
            d="M265 85 Q275 65 260 58 Q245 55 238 75 Q242 90 255 92 Q265 90 265 85Z"
            fill="url(#accentGradient)"
            opacity="0.7"
            className="transition-all duration-700"
            style={{
              transform: isHovered ? 'translateY(0)' : 'translateY(-5px) translateX(2px) rotate(8deg)',
              transformOrigin: '255px 75px'
            }}
          />

          {/* Minimalist eyes - simple and elegant */}
          <g className="transition-all duration-300">
            {/* Left eye */}
            <ellipse
              cx="155"
              cy="180"
              rx="8"
              ry={isBlinking ? "2" : "12"}
              fill="#3E2723"
              opacity="0.85"
              className="transition-all duration-150"
            />
            {!isBlinking && (
              <ellipse cx="157" cy="177" rx="3" ry="4" fill="white" opacity="0.6" />
            )}

            {/* Right eye */}
            <ellipse
              cx="225"
              cy="180"
              rx="8"
              ry={isBlinking ? "2" : "12"}
              fill="#3E2723"
              opacity="0.85"
              className="transition-all duration-150"
            />
            {!isBlinking && (
              <ellipse cx="227" cy="177" rx="3" ry="4" fill="white" opacity="0.6" />
            )}
          </g>

          {/* Subtle smile - elegant curve */}
          <path
            d="M165 220 Q190 230 215 220"
            stroke="#3E2723"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />

          {/* Soft blush - symmetric placement */}
          <ellipse
            cx="130"
            cy="210"
            rx="22"
            ry="14"
            fill="url(#blushGradient)"
            opacity="0.35"
          />
          <ellipse
            cx="250"
            cy="210"
            rx="22"
            ry="14"
            fill="url(#blushGradient)"
            opacity="0.35"
          />

          {/* Floating elements on hover - minimal sparkles */}
          {isHovered && (
            <g className="transition-opacity duration-500">
              <circle cx="100" cy="130" r="2.5" fill="#FFF3E0" opacity="0.8">
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="85" cy="160" r="2" fill="#FFE0B2" opacity="0.7">
                <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="280" cy="130" r="2.5" fill="#FFF3E0" opacity="0.8">
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2.2s" repeatCount="indefinite" />
              </circle>
              <circle cx="295" cy="160" r="2" fill="#FFE0B2" opacity="0.7">
                <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2.7s" repeatCount="indefinite" />
              </circle>
            </g>
          )}

          {/* Premium gradient definitions */}
          <defs>
            <linearGradient id="elegantGradient" x1="30%" y1="0%" x2="70%" y2="100%">
              <stop offset="0%" stopColor="#FFF8E1" />
              <stop offset="25%" stopColor="#FFECB3" />
              <stop offset="50%" stopColor={colors.secondary} />
              <stop offset="75%" stopColor="#FFD54F" />
              <stop offset="100%" stopColor={colors.primary} />
            </linearGradient>
            
            <linearGradient id="accentGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors.accent} />
              <stop offset="100%" stopColor="#FFF59D" />
            </linearGradient>

            <radialGradient id="blushGradient">
              <stop offset="0%" stopColor={colors.blush} />
              <stop offset="100%" stopColor="#FF8A65" />
            </radialGradient>

            <radialGradient id="innerGlow">
              <stop offset="0%" stopColor="#FFF3E0" />
              <stop offset="100%" stopColor="#FFECB3" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Color customization panel */}
      {showCustomization && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-100 max-w-md w-full">
          <h3 className="text-lg font-light text-amber-950 mb-4 tracking-wide">Customize Colors</h3>
          
          <div className="space-y-4">
            {/* Primary Color */}
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm text-amber-800 font-light tracking-wide">Primary</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors.primary}
                  onChange={(e) => setColors({...colors, primary: e.target.value})}
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 border-amber-200 transition-transform hover:scale-105"
                />
                <input
                  type="text"
                  value={colors.primary}
                  onChange={(e) => setColors({...colors, primary: e.target.value})}
                  className="w-24 px-2 py-1 text-xs rounded-md border border-amber-200 font-mono"
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm text-amber-800 font-light tracking-wide">Secondary</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors.secondary}
                  onChange={(e) => setColors({...colors, secondary: e.target.value})}
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 border-amber-200 transition-transform hover:scale-105"
                />
                <input
                  type="text"
                  value={colors.secondary}
                  onChange={(e) => setColors({...colors, secondary: e.target.value})}
                  className="w-24 px-2 py-1 text-xs rounded-md border border-amber-200 font-mono"
                />
              </div>
            </div>

            {/* Accent Color */}
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm text-amber-800 font-light tracking-wide">Accent</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors.accent}
                  onChange={(e) => setColors({...colors, accent: e.target.value})}
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 border-amber-200 transition-transform hover:scale-105"
                />
                <input
                  type="text"
                  value={colors.accent}
                  onChange={(e) => setColors({...colors, accent: e.target.value})}
                  className="w-24 px-2 py-1 text-xs rounded-md border border-amber-200 font-mono"
                />
              </div>
            </div>

            {/* Blush Color */}
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm text-amber-800 font-light tracking-wide">Blush</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors.blush}
                  onChange={(e) => setColors({...colors, blush: e.target.value})}
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 border-amber-200 transition-transform hover:scale-105"
                />
                <input
                  type="text"
                  value={colors.blush}
                  onChange={(e) => setColors({...colors, blush: e.target.value})}
                  className="w-24 px-2 py-1 text-xs rounded-md border border-amber-200 font-mono"
                />
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={resetColors}
              className="w-full mt-4 py-2 px-4 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg transition-colors font-light tracking-wide text-sm"
            >
              Reset to Default
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
