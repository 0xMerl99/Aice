
import React, { useState, useEffect, useRef } from 'react';
import { Entity, ChatMessage } from '../types';

interface LeftSidebarProps {
  entities: Entity[];
  onAssignTask: (agentId: string, task: string) => void;
  messages: ChatMessage[];
  isProcessing: boolean;
}

interface Alert {
  id: string;
  text: string;
  type: 'warning' | 'info' | 'critical';
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ entities, onAssignTask, messages, isProcessing }) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [taskText, setTaskText] = useState('');
  const logEndRef = useRef<HTMLDivElement>(null);
  
  const [alerts] = useState<Alert[]>([
    { id: '1', text: 'Anomalous node detected in Sector 7', type: 'warning' },
    { id: '2', text: 'Atmospheric density stabilizing', type: 'info' }
  ]);

  useEffect(() => {
    if (!selectedAgentId && entities.length > 0) {
      setSelectedAgentId(entities[0].id);
    }
  }, [entities, selectedAgentId]);

  // Auto-scroll the chat log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleAssignClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAgentId && taskText.trim() && !isProcessing) {
      onAssignTask(selectedAgentId, taskText.trim());
      setTaskText('');
    }
  };

  const SectionHeader = ({ title, count, iconColor = "blue-500" }: { title: string, count?: number, iconColor?: string }) => (
    <h2 className="text-slate-500 text-[8px] mb-4 flex items-center uppercase font-bold tracking-widest">
      <span className={`w-1.5 h-1.5 bg-${iconColor} rounded-full mr-2 flex-shrink-0 shadow-[0_0_5px_currentColor]`}></span>
      {title} {count !== undefined && count > 0 ? `(${count})` : ''}
    </h2>
  );

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 overflow-hidden select-none">
      {/* Fixed Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-900 flex-shrink-0">
        <h1 className="text-white text-sm tracking-tighter outline-text text-center pixel-font">
          CORE<span className="text-blue-500">_COMMAND</span>
        </h1>
        <div className="mt-4 p-2 bg-blue-500/10 border border-blue-500/20 text-center">
          <span className="text-[6px] text-blue-400 font-bold uppercase tracking-widest animate-pulse">Connection: Secure</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-10 pb-4">
        
        {/* Terminal Chat Box / Log */}
        <div>
          <SectionHeader title="TERMINAL_LOG" iconColor="pink-500" />
          <div className="bg-black/60 p-4 rounded-sm border border-slate-800/50 min-h-[120px] max-h-[250px] overflow-y-auto custom-scrollbar flex flex-col gap-3">
            {messages.length === 0 ? (
              <div className="text-[7px] text-slate-700 italic uppercase text-center py-10">Awaiting Signal Data...</div>
            ) : (
              messages.map(m => (
                <div key={m.id} className="animate-in fade-in slide-in-from-left-2 duration-300">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[7px] font-bold uppercase tracking-widest ${m.sender === 'You' ? 'text-blue-400' : 'text-pink-500'}`}>
                      {m.sender}
                    </span>
                    <span className="text-[5px] text-slate-700">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[8px] text-slate-300 leading-relaxed bg-slate-900/40 p-2 rounded-sm border-l border-slate-700">
                    {m.text}
                  </p>
                </div>
              ))
            )}
            {isProcessing && (
              <div className="text-[7px] text-blue-500 italic animate-pulse uppercase tracking-widest mt-2">
                &gt; Processing neural link...
              </div>
            )}
            <div ref={logEndRef} />
          </div>
        </div>

        {/* Nodes Grid */}
        <div>
          <SectionHeader title="ACTIVE_NODES" count={entities.length} />
          <div className="grid grid-cols-2 gap-2">
            {entities.map(e => (
              <div 
                key={e.id} 
                onClick={() => setSelectedAgentId(e.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-sm border transition-all cursor-pointer ${selectedAgentId === e.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 hover:bg-slate-800/50'}`}
              >
                <div className="w-2.5 h-2.5 rounded-sm shadow-lg" style={{ backgroundColor: e.color }} />
                <span className={`text-[7px] text-center truncate w-full ${selectedAgentId === e.id ? 'text-white font-bold' : 'text-slate-500'}`}>
                  {e.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Node Status Info */}
        {selectedAgentId && (
          <div className="animate-in fade-in duration-500">
            <SectionHeader title="INTEL_BRIEF" iconColor="green-500" />
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-sm">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-[7px] text-slate-500 uppercase">Neural Status</span>
                    <span className="text-[7px] text-green-500">OPTIMAL</span>
                </div>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[82%]"></div>
                </div>
                <div className="mt-4 text-[7px] text-slate-600 uppercase font-bold tracking-tighter">
                  Targeting Node: {entities.find(e => e.id === selectedAgentId)?.id}
                </div>
            </div>
          </div>
        )}
      </div>

      {/* Terminal Input Box */}
      <div className="p-6 border-t border-slate-800 bg-slate-950 flex-shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        <form onSubmit={handleAssignClick} className="flex flex-col gap-3">
          <div className="flex justify-between items-center mb-1 px-1">
             <span className="text-[7px] text-slate-700 uppercase font-bold tracking-widest">Input Directive</span>
             <span className="text-[7px] text-blue-500 font-bold uppercase animate-pulse">
               [{selectedAgentId ? entities.find(e => e.id === selectedAgentId)?.name : 'IDLE'}]
             </span>
          </div>
          <div className="relative">
            <input 
              type="text"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              placeholder="TYPE DIRECTIVE..."
              disabled={isProcessing}
              className="w-full bg-black border border-slate-800 text-[8px] text-white p-4 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-900 uppercase tracking-widest disabled:opacity-30"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_currentColor] animate-pulse" />
          </div>
          <button 
            type="submit"
            disabled={!taskText.trim() || !selectedAgentId || isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-20 text-white text-[8px] p-3.5 font-bold uppercase transition-all active:scale-95 shadow-lg border-b-2 border-blue-900"
          >
            Execute_Link
          </button>
        </form>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
      `}</style>
    </div>
  );
};
