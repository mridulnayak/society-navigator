import React from 'react';

export default function FloatingCard({ children, className = '' }) {
  return (
    <div className={`pointer-events-auto bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-slate-700 ${className}`}>
      {children}
    </div>
  );
}