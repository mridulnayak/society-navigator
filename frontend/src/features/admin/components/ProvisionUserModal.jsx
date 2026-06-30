import React, { useState } from 'react';
import { UserPlus, Mail, Key, MapPin, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function ProvisionUserModal({ setShowProvisionModal, plotDatabase }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [plotId, setPlotId] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // 🎲 Helper to generate a secure random password
    const generatePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
        let pass = "";
        for (let i = 0; i < 10; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
        setPassword(pass);
    };

    const handleProvision = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!email || !password || !plotId) return setError("All fields are required.");
        
        setLoading(true);
        try {
            const token = localStorage.getItem('society_token');
           const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ email, password, role: 'resident', plotId })
            });
            
            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                setEmail('');
                setPassword('');
                setPlotId('');
            } else {
                setError(data.error || "Failed to create account.");
            }
        } catch (err) {
            setError("Server connection failed.");
        }
        setLoading(false);
    };

    return (
        <div className="absolute inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-4">
                <div className="flex items-center justify-center gap-2 mb-2 text-emerald-400">
                    <UserPlus className="w-6 h-6" />
                    <h2 className="text-white font-black tracking-widest text-center">PROVISION RESIDENT</h2>
                </div>

                {error && <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20"><AlertCircle className="w-4 h-4 shrink-0"/>{error}</div>}
                
                {success && (
                    <div className="flex flex-col items-center gap-2 text-emerald-400 text-xs bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/20 text-center">
                        <CheckCircle2 className="w-8 h-8"/>
                        <p className="font-bold text-sm text-white">Account Created Successfully!</p>
                        <p>Share the email and password with the resident.</p>
                    </div>
                )}

                <form onSubmit={handleProvision} className="flex flex-col gap-4 mt-2">
                    {/* PLOT DROPDOWN */}
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <select value={plotId} onChange={(e) => setPlotId(e.target.value)} required className="w-full pl-10 pr-4 py-2.5 bg-slate-950 text-white rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 text-sm appearance-none">
                            <option value="" disabled>Assign to House / Plot</option>
                            {plotDatabase.map(plot => (
                                <option key={plot.id} value={plot.id}>{plot.id} {plot.name ? `(${plot.name})` : ''}</option>
                            ))}
                        </select>
                    </div>

                    {/* EMAIL INPUT */}
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input type="email" placeholder="Resident Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-2.5 bg-slate-950 text-white rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 text-sm placeholder:text-slate-500" />
                    </div>

                    {/* PASSWORD INPUT & GENERATOR */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-10 pr-4 py-2.5 bg-slate-950 text-white rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 text-sm placeholder:text-slate-500" />
                        </div>
                        <button type="button" onClick={generatePassword} title="Generate Random Password" className="px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-emerald-400 transition-colors"><RefreshCw className="w-4 h-4"/></button>
                    </div>
                    
                    {/* ACTIONS */}
                    <div className="flex gap-2 mt-2">
                        <button type="button" onClick={() => setShowProvisionModal(false)} className="flex-1 py-3 rounded-xl font-bold text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 transition-all">CLOSE</button>
                        <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                            {loading ? "CREATING..." : <><UserPlus className="w-4 h-4"/> CREATE ACCOUNT</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}