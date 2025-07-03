'use client';

import React from 'react';

const AuroraBackground = ({ children }: { children: React.ReactNode }) => (
  <div className="relative min-h-screen w-full bg-gray-900 text-white overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
      <div
        className="absolute top-1/2 left-1/2 w-[150%] h-[150%] transform -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(13, 186, 153, 0.15), rgba(14, 165, 233, 0.1), transparent 60%)',
          animation: 'aurora-spin 20s linear infinite',
        }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 w-[120%] h-[120%] transform -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            'radial-gradient(circle at 30% 70%, rgba(56, 189, 248, 0.1), transparent 50%), radial-gradient(circle at 70% 30%, rgba(16, 185, 129, 0.1), transparent 50%)',
          animation: 'aurora-spin-reverse 25s linear infinite',
        }}
      ></div>
      <style jsx>{`
        @keyframes aurora-spin {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        @keyframes aurora-spin-reverse {
          from {
            transform: translate(-50%, -50%) rotate(360deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(0deg);
          }
        }
      `}</style>
    </div>
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

export default AuroraBackground;