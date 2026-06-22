import React, { useState, useEffect } from 'react';
import { Users, X, Trash2, Loader2, Home, Mail, Calendar } from 'lucide-react';

export default function ResidentDirectoryModal({ setShowDirectoryModal }) {
    const [residents, setResidents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // 📡 FETCH RESIDENTS ON MOUNT
    useEffect(() => {
        fetchResidents();
    }, []);

    const fetchResidents = async () => {
        setIsLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:5000/api/users', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('society_token')}` }
            });
            const data = await res.json();
            
            if (data.success) {
                setResidents(data.users);
            } else {
                setError(data.error || 'Failed to load directory.');
            }
        } catch (err) {
            setError('Server connection failed.');
        } finally {
            setIsLoading(false);
        }
    };

    // 🗑️ REVOKE ACCESS / DELETE USER
    const handleDelete = async (userId, userEmail) => {
        const confirmDelete = window.confirm(`Are you sure you want to permanently revoke access for ${userEmail}?`);
        if (!confirmDelete) return;

        try {
            const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('society_token')}` }
            });
            const data = await res.json();

            if (data.success) {
                // Remove the user from the local UI state without needing to refresh the page
                setResidents(residents.filter(user => user.id !== userId));
            } else {
                alert(data.error || 'Failed to delete user.');
            }
        } catch (err) {
            alert('Server connection failed.');
        }
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* 🏷️ HEADER */}
                <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <h2 className="text-sm font-black text-white tracking-widest uppercase">Resident Directory</h2>
                    </div>
                    <button 
                        onClick={() => setShowDirectoryModal(false)}
                        className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 🗄️ DATA TABLE / CONTENT */}
                <div className="flex-1 overflow-auto p-5">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Decrypting Records...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-center">
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    ) : residents.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                            <p className="text-slate-400 font-medium">No residents found in the system.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-800">
                            <table className="w-full text-left text-sm text-slate-300">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-4 font-black tracking-wider"><div className="flex items-center gap-2"><Home className="w-4 h-4"/> Plot / House</div></th>
                                        <th className="px-6 py-4 font-black tracking-wider"><div className="flex items-center gap-2"><Mail className="w-4 h-4"/> Registered Email</div></th>
                                        <th className="px-6 py-4 font-black tracking-wider"><div className="flex items-center gap-2"><Calendar className="w-4 h-4"/> Date Added</div></th>
                                        <th className="px-6 py-4 font-black tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {residents.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4 font-bold text-white">{user.plotId}</td>
                                            <td className="px-6 py-4 text-slate-400">{user.email}</td>
                                            <td className="px-6 py-4 text-xs font-medium text-slate-500">
                                                {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => handleDelete(user.id, user.email)}
                                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                    title="Revoke Access"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* 🦶 FOOTER */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Total Records: {residents.length}
                    </p>
                    <button 
                        onClick={() => setShowDirectoryModal(false)}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                        CLOSE
                    </button>
                </div>
            </div>
        </div>
    );
}