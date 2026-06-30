import React, { useState } from 'react';
import Papa from 'papaparse';
import { UploadCloud, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
export default function BulkUploadModal({ setShowBulkUpload, setPlotDatabase, plotDatabase }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError('');
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return setError("Please select a CSV file first.");
        setUploading(true);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const plots = results.data.map(row => ({
                    id: row.id?.toUpperCase().trim(),
                    name: row.name?.trim() || `Plot ${row.id}`,
                    lat: parseFloat(row.lat),
                    lng: parseFloat(row.lng)
                }));

                if (plots.some(p => !p.id || isNaN(p.lat) || isNaN(p.lng))) {
                    setUploading(false);
                    return setError("Invalid CSV Format. Must have: id, name, lat, lng");
                }

                try {
                    const token = localStorage.getItem('society_token');
                    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/plots/bulk`,{
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ plots })
                    });
                    
                    const data = await res.json();
                    if (data.success) {
                        setPlotDatabase([...plotDatabase, ...data.plots]);
                        alert(data.message);
                        setShowBulkUpload(false);
                    } else {
                        setError(data.error);
                    }
                } catch (err) {
                    setError("Server connection failed.");
                }
                setUploading(false);
            }
        });
    };

    return (
        <div className="absolute inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-4">
                <div className="flex items-center justify-center gap-2 mb-2 text-blue-400">
                    <UploadCloud className="w-6 h-6" />
                    <h2 className="text-white font-black tracking-widest text-center">DATABASE UPLOAD</h2>
                </div>

                <div className="text-xs text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <p className="font-bold text-slate-300 mb-1">Required CSV Columns:</p>
                    <code className="text-emerald-400">id, name, lat, lng</code><br/>
                    Example row: <br/>
                    <code className="text-slate-500">A-01, Sharma House, 21.2106, 81.6255</code>
                </div>

                {error && <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-2 rounded border border-red-500/20"><AlertCircle className="w-4 h-4"/>{error}</div>}

                <form onSubmit={handleUpload} className="flex flex-col gap-4 mt-2">
                    
                    {/* 🎨 THE NEW ENTERPRISE FILE DROPZONE */}
                    <label className="flex flex-col items-center justify-center w-full h-24 px-4 transition bg-slate-950 border-2 border-slate-700 border-dashed rounded-xl appearance-none cursor-pointer hover:border-blue-500/50 hover:bg-slate-900 focus:outline-none group">
                        <span className="flex items-center space-x-2">
                            {file ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <UploadCloud className="w-6 h-6 text-slate-500 group-hover:text-blue-400 transition-colors" />}
                            <span className={`font-bold text-sm ${file ? 'text-emerald-400' : 'text-slate-500 group-hover:text-blue-400 transition-colors'}`}>
                                {file ? file.name : "Click to select CSV file"}
                            </span>
                        </span>
                        {/* We hide the ugly default input completely! */}
                        <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                    </label>
                    
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setShowBulkUpload(false)} disabled={uploading} className="flex-1 py-3 rounded-xl font-bold text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 transition-all">CANCEL</button>
                        <button type="submit" disabled={uploading || !file} className="flex-1 py-3 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500 transition-all flex items-center justify-center gap-2">
                            {uploading ? "UPLOADING..." : <><FileText className="w-4 h-4"/> UPLOAD CSV</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}