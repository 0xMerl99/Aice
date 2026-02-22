
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameEngine } from './components/GameEngine';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { Entity, ChatMessage } from './types';

type ViewMode = 'town' | 'command' | 'data';

const App: React.FC = () => {
  const [entities, setEntities] = useState<Entity[]>([
    { id: 'player', name: 'You', pos: { x: 20, y: 15 }, targetPos: { x: 20, y: 15 }, color: '#3b82f6', bubbleTimer: 0, isPlayer: true },
    { id: 'npc1', name: 'Byron', pos: { x: 34, y: 24 }, targetPos: { x: 34, y: 24 }, color: '#ec4899', bubbleTimer: 0 },
    { id: 'npc2', name: 'Eliza', pos: { x: 22, y: 12 }, targetPos: { x: 22, y: 12 }, color: '#10b981', bubbleTimer: 0 },
    { id: 'npc3', name: 'Marcus', pos: { x: 5, y: 15 }, targetPos: { x: 5, y: 15 }, color: '#f59e0b', bubbleTimer: 0 },
    { id: 'npc4', name: 'Ciara', pos: { x: 10, y: 5 }, targetPos: { x: 10, y: 5 }, color: '#06b6d4', bubbleTimer: 0 },
    { id: 'npc5', name: 'Zerebro', pos: { x: 18, y: 4 }, targetPos: { x: 18, y: 4 }, color: '#8b5cf6', bubbleTimer: 0 },
    { id: 'npc6', name: 'Lola', pos: { x: 25, y: 22 }, targetPos: { x: 25, y: 22 }, color: '#f43f5e', bubbleTimer: 0 },
    { id: 'npc7', name: 'Zerepy', pos: { x: 32, y: 8 }, targetPos: { x: 32, y: 8 }, color: '#10b981', bubbleTimer: 0 },
    { id: 'npc8', name: 'Rig', pos: { x: 12, y: 26 }, targetPos: { x: 12, y: 26 }, color: '#78350f', bubbleTimer: 0 },
  ]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('town');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  
  const interactedNpcs = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const triggerNpcResponse = useCallback(async (npcId: string, playerText?: string, isProximityTrigger: boolean = false) => {
    if (isProcessing) return;
    const npc = entities.find(e => e.id === npcId);
    if (!npc) return;

    setIsProcessing(true);
    try {
      let prompt = isProximityTrigger 
        ? `You are ${npc.name}, a pixel citizen in a neon-lit town. Greet the player shortly (max 8 words).`
        : `You are ${npc.name}, a pixel citizen. Player says: "${playerText}". Respond shortly (max 12 words).`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, npcName: npc.name }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      
      const data = await response.json();
      const aiText = data.text || "Hello.";
      
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: npc.name, text: aiText, timestamp: Date.now() }].slice(-15));
      setEntities(prev => prev.map(e => e.id === npc.id ? { ...e, bubbleText: aiText, bubbleTimer: 4000 } : e));
    } catch (err) {
      console.error("AI Error:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [entities, isProcessing]);

  const handleSendMessage = useCallback(async (agentId: string, text: string) => {
    const newMessage: ChatMessage = { id: Date.now().toString(), sender: 'You', text, timestamp: Date.now() };
    setMessages(prev => [...prev, newMessage].slice(-15));
    
    // Visually show player bubble if the sender is near or it's a direct command
    setEntities(prev => prev.map(e => e.id === 'player' ? { ...e, bubbleText: text, bubbleTimer: 3000 } : e));

    // Force response from selected agent
    triggerNpcResponse(agentId, text);
  }, [entities, triggerNpcResponse]);

  const handleAssignTask = (agentId: string, task: string) => {
    handleSendMessage(agentId, task);
  };

  useEffect(() => {
    const player = entities.find(e => e.isPlayer);
    if (!player) return;
    entities.forEach(e => {
      if (e.isPlayer) return;
      const dist = Math.sqrt(Math.pow(e.pos.x - player.pos.x, 2) + Math.pow(e.pos.y - player.pos.y, 2));
      if (dist < 2.5 && !interactedNpcs.current.has(e.id)) {
        interactedNpcs.current.add(e.id);
        triggerNpcResponse(e.id, undefined, true);
      } else if (dist > 6 && interactedNpcs.current.has(e.id)) {
        interactedNpcs.current.delete(e.id);
      }
    });
  }, [entities, triggerNpcResponse]);

  const updateEntityPosition = useCallback((id: string, newPos: { x: number, y: number }) => {
    setEntities(prev => prev.map(e => e.id === id ? { ...e, pos: newPos, targetPos: newPos } : e));
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0d0d12] flex flex-col lg:flex-row">
      
      {/* Left Sidebar: Command Core */}
      <div className={`${isMobile ? (viewMode === 'command' ? 'flex' : 'hidden') : 'flex'} w-full lg:w-72 xl:w-96 h-full border-r border-slate-800 bg-slate-900 z-20`}>
        <LeftSidebar 
          entities={entities.filter(e => !e.isPlayer)} 
          onAssignTask={handleAssignTask}
          messages={messages}
          isProcessing={isProcessing}
        />
      </div>

      {/* Main Town View: Center Viewport */}
      <div className={`flex-1 relative flex flex-col h-full ${isMobile && viewMode !== 'town' ? 'hidden' : 'flex'}`}>
        <div className="flex-1 relative overflow-hidden flex items-center justify-center">
          <GameEngine 
            entities={entities} 
            setEntities={setEntities}
            onPlayerMove={updateEntityPosition}
          />
          
          <div className="absolute top-4 left-4 pointer-events-none z-10 flex flex-col gap-1">
             <div className="flex gap-2">
               <span className="text-[7px] text-blue-400 uppercase font-bold tracking-widest bg-black/60 px-2 py-1 border border-white/5 rounded-sm backdrop-blur-md">UPLINK: ACTIVE</span>
               <span className="text-[7px] text-pink-500 uppercase font-bold tracking-widest bg-black/60 px-2 py-1 border border-white/5 rounded-sm backdrop-blur-md">SYNC: STABLE</span>
             </div>
          </div>

          <div className="absolute bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 pointer-events-none w-full max-w-xs lg:max-w-md px-4">
            <div className="bg-black/60 backdrop-blur-md px-4 py-2 border border-white/10 rounded-sm text-[7px] text-white/40 uppercase tracking-widest text-center shadow-2xl">
              {isMobile ? 'Touch to Travel • Proximity Active' : 'WASD or Click to Move • Proximity Chat'}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Data Matrix */}
      <div className={`${isMobile ? (viewMode === 'data' ? 'flex' : 'hidden') : 'flex'} w-full lg:w-72 xl:w-80 h-full border-l border-slate-800 bg-slate-900 z-20`}>
        <RightSidebar 
          entities={entities} 
        />
      </div>

      {/* Mobile Nav */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 flex items-center justify-around px-8 z-30">
          <button onClick={() => setViewMode('command')} className={`flex flex-col items-center gap-1 transition-all ${viewMode === 'command' ? 'text-blue-500 scale-110' : 'text-slate-500'}`}>
             <span className="text-[7px] font-bold uppercase tracking-widest">CMD</span>
          </button>
          <button onClick={() => setViewMode('town')} className={`flex flex-col items-center gap-1 transition-all ${viewMode === 'town' ? 'text-pink-500 scale-110' : 'text-slate-500'}`}>
             <span className="text-[7px] font-bold uppercase tracking-widest">VIEW</span>
          </button>
          <button onClick={() => setViewMode('data')} className={`flex flex-col items-center gap-1 transition-all ${viewMode === 'data' ? 'text-green-500 scale-110' : 'text-slate-500'}`}>
             <span className="text-[7px] font-bold uppercase tracking-widest">DATA</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
