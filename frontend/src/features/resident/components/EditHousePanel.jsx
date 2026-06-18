import React from 'react';
import { Home } from 'lucide-react';
import { T } from '../../../utils/translations';
import Button from '../../../components/ui/Button';

export default function EditHousePanel({ userPlotId, editHouseName, setEditHouseName, handleUpdateHouseName, language }) {
  const text = T[language];
  
  return (
    <form onSubmit={handleUpdateHouseName} className="w-full bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-black text-blue-400 tracking-widest">{text.editResidence} {userPlotId}</span>
        </div>
        <div className="flex gap-2">
            <input type="text" value={editHouseName} onChange={(e) => setEditHouseName(e.target.value)} 
                   className="flex-1 px-3 py-1.5 bg-slate-950 text-white rounded-lg border border-slate-700 focus:outline-none text-xs" />
            <Button type="submit" variant="primary" className="py-1.5 px-3">{text.save}</Button>
        </div>
    </form>
  );
}