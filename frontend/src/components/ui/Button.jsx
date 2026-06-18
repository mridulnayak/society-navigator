import React from 'react';

export default function Button({ children, onClick, variant = 'primary', className = '', type = 'button' }) {
  const baseStyle = "py-2.5 px-4 rounded-xl font-black text-xs tracking-wider transition-all flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]",
    danger: "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30",
    warning: "text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20",
    secondary: "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700",
    ghost: "p-1.5 rounded-full bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700"
  };

  return (
    <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}