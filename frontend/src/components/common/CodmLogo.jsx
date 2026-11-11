import React from 'react';

/**
 * Call of Duty: Mobile Official Logo Component
 * Uses the user-provided official black CODM logo image.
 */
export default function CodmLogo({ className = "w-8 h-8", variant = "image" }) {
  if (variant === "emblem") {
    // Hexagonal gold emblem fallback
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
        <svg
          viewBox="1185 285 175 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm transition-transform group-hover:scale-105"
        >
          <defs>
            <linearGradient id="codmGoldGrad" x1="1190" y1="290" x2="1354" y2="480" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>
          <path
            d="M1272.13 290.64L1190.77 337.61V431.55L1272.13 478.52L1353.48 431.55V337.61L1272.13 290.64Z"
            fill="#071e54"
            opacity="0.9"
          />
          <path
            d="M1272.13 290.64L1190.77 337.61V431.55L1272.13 478.52L1353.48 431.55V337.61L1272.13 290.64ZM1247.04 422.29L1228.32 434.24L1214.94 425.52V344.89L1228.28 336.29L1247.03 348V422.3H1247.04V422.29ZM1292.48 401.06L1272.15 412L1251.82 401.06V350.46L1272.15 361.4L1292.48 350.46V401.06ZM1329.3 425.52L1315.92 434.26L1297.19 422.31V348.02L1315.95 336.31L1329.29 344.91V425.53H1329.3V425.52Z"
            fill="url(#codmGoldGrad)"
          />
        </svg>
      </div>
    );
  }

  // Official Black Logo provided by user
  return (
    <div className={`relative flex items-center justify-center shrink-0 overflow-hidden bg-black rounded-xl ${className}`}>
      <img
        src="/codm-logo.jpg"
        alt="Call of Duty: Mobile Logo"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
