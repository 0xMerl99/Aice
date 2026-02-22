
import React from 'react';
import { Entity } from '../types';

interface SidebarProps {
  entities: Entity[];
}

export const Sidebar: React.FC<SidebarProps> = ({ entities }) => {
  return (
    <div className="flex-none p-4 lg:p-6 border-b border-slate-800 bg-slate-900/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-slate-400 text-[8px] font-bold uppercase tracking-widest flex items-center">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          Matrix Sync
        </h2>
        <span className="text-slate-600 text-[7px] font-bold px-2 py-0.5 border border-slate-800 rounded">
          {entities.length} Nodes
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {entities.map(e => (
          <div key={e.id} className="flex flex-col items-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-sm hover:border-blue-500 transition-all group">
            <div 
              className="w-3 h-3 rounded-sm border border-white/5 shadow-inner" 
              style={{ backgroundColor: e.color }}
            />
            <span className="text-[7px] text-slate-400 group-hover:text-white transition-colors truncate w-full text-center">
              {e.name}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-1.5">
           <div className="flex justify-between text-[7px] font-bold uppercase tracking-wider">
             <span className="text-slate-600">Sync Capacity</span>
             <span className="text-blue-500">Stable</span>
           </div>
           <div className="h-0.5 w-full bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full w-[88%] bg-blue-500" />
           </div>
        </div>
      </div>
    </div>
  );
};
