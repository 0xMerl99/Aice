
import React, { useState, useEffect } from 'react';
import { Entity } from '../types';

interface RightSidebarProps {
  entities: Entity[];
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ entities }) => {
  const [activities, setActivities] = useState<string[]>([
    "System: Syncing Sector 4...",
    "Network: 14 nodes discovered",
    "Atmosphere: Day cycle starting"
  ]);
  
  const [moods, setMoods] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const initialMoods: {[key: string]: string} = {};
    const icons = ['😊', '🤖', '⚡', '🤔', '😎', '🔋', '📡'];
    entities.forEach(e => {
      initialMoods[e.id] = icons[Math.floor(Math.random() * icons.length)];
    });
    setMoods(initialMoods);
  }, [entities]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6 && entities.length > 0) {
        const randomAgent = entities[Math.floor(Math.random() * entities.length)];
        const actions = [
          "scanning neural pathways", 
          "optimizing motor nodes", 
          "recalibrating state-machine", 
          "sending heartbeat ping", 
          "syncing local variables"
        ];
        const newAct = `${randomAgent.name}: ${actions[Math.floor(Math.random() * actions.length)]}`;
        setActivities(prev => [newAct, ...prev].slice(0, 15));
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [entities]);

  const SectionHeader = ({ title, iconColor = "green-500" }: { title: string, iconColor?: string }) => (
    <h2 className="text-slate-500 text-[8px] mb-4 flex items-center uppercase font-bold tracking-widest">
      <span className={`w-1.5 h-1.5 bg-${iconColor} rounded-full mr-2 flex-shrink-0 shadow-[0_0_5px_currentColor]`}></span>
      {title}
    </h2>
  );

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 overflow-hidden select-none">
      {/* Matrix Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-900 flex-shrink-0">
        <h1 className="text-white text-sm tracking-tighter outline-text text-center pixel-font">
          DATA<span className="text-green-500">_MATRIX</span>
        </h1>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <a 
            href="https://ai.google.dev/gemini-api/docs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 border border-slate-700 bg-slate-950 text-slate-400 text-[7px] text-center font-bold hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            DOCS
          </a>
          <a 
            href="https://x.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 border border-slate-700 bg-slate-950 text-slate-400 text-[7px] text-center font-bold hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            FEED
          </a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-10 pb-32">
        
        {/* Activity Stream */}
        <div>
          <SectionHeader title="NEURAL_STREAM" iconColor="blue-400" />
          <div className="space-y-3 bg-slate-950/20 p-3 rounded-sm border border-slate-800/30">
            {activities.map((act, i) => (
              <div key={i} className="flex items-start animate-in fade-in slide-in-from-right-1">
                <span className="text-[6px] text-blue-500 font-bold mr-2 mt-1 opacity-50">[{i}]</span>
                <span className="text-[7.5px] text-slate-400 leading-snug font-medium truncate w-full">{act}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Matrix */}
        <div>
          <SectionHeader title="LIFECYCLE_MATRIX" iconColor="yellow-500" />
          <div className="space-y-2">
            {entities.map(e => (
              <div key={e.id} className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-sm hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="text-[10px] grayscale brightness-125">{moods[e.id] || '⚡'}</span>
                  <span className="text-[8px] text-slate-300 font-bold tracking-tight truncate">{e.name}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[6px] text-slate-600 font-bold uppercase tracking-tighter">Sync</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${e.bubbleTimer > 0 ? 'bg-green-500 animate-pulse' : 'bg-slate-800'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Stats */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-sm">
            <SectionHeader title="WORLD_BASELINE" iconColor="pink-500" />
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <span className="text-[6px] text-slate-500 uppercase">Entropy</span>
                    <span className="text-[10px] text-white font-bold">12.4%</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[6px] text-slate-500 uppercase">Latency</span>
                    <span className="text-[10px] text-white font-bold">0.02s</span>
                </div>
            </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
      `}</style>
    </div>
  );
};
