import React from 'react';
import { PlusCircle } from 'lucide-react';

export default function AddPlotModal({
    handleSaveNewPlot,
    newPlotCoords, setNewPlotCoords,
    newPlotId, setNewPlotId,
    newPlotName, setNewPlotName
}) {
  if (!newPlotCoords) return null; // Safety check

  return (
    <div className="absolute inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto">
        <form onSubmit={handleSaveNewPlot} className="bg-slate-900 border border-emerald-500/30 p-6 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2 justify-center">
                <PlusCircle className="w-5 h-5 text-emerald-500" />
                <h2 className="text-white font-black tracking-widest text-center">ADD NEW PLOT</h2>
            </div>
            
            <input type="text" placeholder="Plot Number (e.g. C-12)" value={newPlotId} onChange={(e) => setNewPlotId(e.target.value)} required 
                   className="w-full px-4 py-2.5 bg-slate-950 text-white font-bold uppercase rounded-xl border border-slate-700 focus:outline-none text-sm" />
            
            <input type="text" placeholder="Resident Name (Optional)" value={newPlotName} onChange={(e) => setNewPlotName(e.target.value)} 
                   className="w-full px-4 py-2.5 bg-slate-950 text-white rounded-xl border border-slate-700 focus:outline-none text-sm" />
            
            <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setNewPlotCoords(null)} className="flex-1 py-2.5 rounded-xl font-bold text-xs text-slate-400 bg-slate-800 hover:bg-slate-700">CANCEL</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500">SAVE TO DB</button>
            </div>
        </form>
    </div>
  );
}