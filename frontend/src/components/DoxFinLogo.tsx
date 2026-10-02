import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const DoxFinLogo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const iconSizes = {
    sm: { w: 26, h: 26, r: 6 },
    md: { w: 34, h: 34, r: 8 },
    lg: { w: 44, h: 44, r: 10 }
  };

  const textSizes = {
    sm: { f: '1.05rem', sub: '0.65rem' },
    md: { f: '1.35rem', sub: '0.75rem' },
    lg: { f: '1.85rem', sub: '0.9rem' }
  };

  const { w, h, r } = iconSizes[size];

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', userSelect: 'none' }}>
      {/* Exact Logo Icon from Image 1: Dark box with cyan 'D' and green chevron */}
      <svg
        width={w}
        height={h}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Dark Navy Rounded Rectangle Box */}
        <rect width="100" height="100" rx={r * 2.5} fill="#0d1527" />
        
        {/* Cyan Stylized "D" Outline */}
        <path
          d="M 22 24 L 54 24 C 74 24 84 36 84 50 C 84 64 74 76 54 76 L 22 76 Z"
          stroke="#00a3e0"
          strokeWidth="11"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Inner vertical bar */}
        <line x1="38" y1="36" x2="38" y2="64" stroke="#00a3e0" strokeWidth="9" strokeLinecap="round" />
        
        {/* Green forward chevron inside the 'D' */}
        <path
          d="M 52 38 L 65 50 L 52 62"
          stroke="#00c875"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {/* DOXFIN Wordmark with Green Dot */}
      {showText && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span
            style={{
              fontSize: textSizes[size].f,
              fontWeight: 900,
              letterSpacing: '0.02em',
              lineHeight: 1,
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}
          >
            <span style={{ color: '#0f172a' }}>DOX</span>
            <span style={{ color: '#0084d1' }}>FIN</span>
          </span>
          {/* Vibrant Green Dot */}
          <span
            style={{
              width: size === 'sm' ? 6 : size === 'md' ? 8 : 10,
              height: size === 'sm' ? 6 : size === 'md' ? 8 : 10,
              backgroundColor: '#00c875',
              borderRadius: '50%',
              display: 'inline-block',
              marginLeft: '2px'
            }}
          />
        </div>
      )}
    </div>
  );
};
