'use client';

import { useState } from "react";
import { useMascotColors } from "@/app/contexts/MascotColorsContext";

interface JournalMascotExcitedProps {
  size?: number;
}

export function JournalMascotExcited({ size = 380 }: JournalMascotExcitedProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Use shared color context
  const { colors } = useMascotColors();

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
    <div className="relative">
      <svg
        width={size}
        height={size}
        viewBox="0 0 380 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative cursor-pointer transition-all duration-700"
        style={{
          filter: isHovered ? 'drop-shadow(0 30px 60px rgba(251, 146, 60, 0.25))' : 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.08))'
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

        {/* Symmetric top accents - like little ears or tufts - extra perky */}
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

        {/* Excited eyes - subtle upward curve with sparkle */}
        <g className="transition-all duration-300">
          {/* Left eye */}
          {!isBlinking && (
            <>
              <ellipse cx="155" cy="179" rx="8" ry="12" fill="#3E2723" opacity="0.85" />
              <ellipse cx="157" cy="177" rx="3" ry="4" fill="white" opacity="0.6" />
            </>
          )}
          {isBlinking && (
            <ellipse cx="155" cy="179" rx="8" ry="2" fill="#3E2723" opacity="0.85" />
          )}

          {/* Right eye */}
          {!isBlinking && (
            <>
              <ellipse cx="225" cy="179" rx="8" ry="12" fill="#3E2723" opacity="0.85" />
              <ellipse cx="227" cy="177" rx="3" ry="4" fill="white" opacity="0.6" />
            </>
          )}
          {isBlinking && (
            <ellipse cx="225" cy="179" rx="8" ry="2" fill="#3E2723" opacity="0.85" />
          )}
        </g>

        {/* Open mouth smile - like in the reference image */}
        <g>
          {/* White inner mouth fill */}
          <path
            d="M160 210 Q190 238 220 210 Q190 230 160 210 Z"
            fill="white"
            opacity="0.95"
          />
          
          {/* Top lip - gray curve */}
          <path
            d="M160 210 Q190 238 220 210"
            stroke="#3E2723"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.75"
          />
          
          {/* Bottom lip - gray curve that connects */}
          <path
            d="M160 210 Q190 230 220 210"
            stroke="#3E2723"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.75"
          />
        </g>

        {/* Soft blush - slightly higher and more vibrant for excitement */}
        <ellipse
          cx="128"
          cy="205"
          rx="24"
          ry="16"
          fill="url(#blushGradient)"
          opacity="0.42"
        />
        <ellipse
          cx="252"
          cy="205"
          rx="24"
          ry="16"
          fill="url(#blushGradient)"
          opacity="0.42"
        />

        {/* Floating elements - minimal sparkles for excitement */}
        <g className="transition-opacity duration-500" opacity="0.7">
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
  );
}
