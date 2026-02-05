import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gradCyan" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#22d3ee" />
      </linearGradient>
      <linearGradient id="gradPurple" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#d8b4fe" />
      </linearGradient>
      <linearGradient id="gradYellow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#fde047" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    <g filter="url(#glow)">
      {/* Top Circle - Cyan */}
      <circle cx="50" cy="38" r="24" stroke="url(#gradCyan)" strokeWidth="8" fill="none" opacity="0.9" />
      
      {/* Bottom Right Circle - Purple */}
      <circle cx="65" cy="65" r="24" stroke="url(#gradPurple)" strokeWidth="8" fill="none" opacity="0.9" />
      
      {/* Bottom Left Circle - Yellow */}
      <circle cx="35" cy="65" r="24" stroke="url(#gradYellow)" strokeWidth="8" fill="none" opacity="0.9" />
    </g>
    
    {/* Center dot to unify */}
    <circle cx="50" cy="56" r="4" fill="white" opacity="0.8" />
  </svg>
);
