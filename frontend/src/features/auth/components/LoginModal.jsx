import React from 'react';
import { Mail, Key } from 'lucide-react'; // 📧 Swapped to Mail icon

export default function LoginModal({ 
    handleLogin, 
    loginUser, setLoginUser, 
    loginPass, setLoginPass, 
    loginError, 
    setShowLoginModal 
}) {
  return (
    <div className="absolute inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto">
        <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col gap-4">
            <h2 className="text-white font-black tracking-widest text-center mb-2">PORTAL ACCESS</h2>
            
            {loginError && <p className="text-red-400 text-xs text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{loginError}</p>}
            
            <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input type="email" placeholder="Email Address" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} required 
                       className="w-full pl-10 pr-4 py-2.5 bg-slate-950 text-white rounded-xl border border-slate-700 focus:outline-none text-sm" />
            </div>
            
            <div className="relative">
                <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input type="password" placeholder="Password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} required 
                       className="w-full pl-10 pr-4 py-2.5 bg-slate-950 text-white rounded-xl border border-slate-700 focus:outline-none text-sm" />
            </div>
            
            <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setShowLoginModal(false)} className="flex-1 py-2.5 rounded-xl font-bold text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 transition-colors">CANCEL</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 transition-colors">LOGIN</button>
            </div>
        </form>
    </div>
  );
}