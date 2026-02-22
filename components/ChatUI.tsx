
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatUIProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
}

export const ChatUI: React.FC<ChatUIProps> = ({ messages, onSendMessage, isProcessing }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-900">
      {/* Log */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 scroll-smooth custom-scrollbar"
      >
        {messages.map((m) => (
          <div key={m.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="text-[8px] text-pink-500 font-bold uppercase tracking-widest block mb-1">
              {m.sender}
            </span>
            <span className="text-[10px] text-slate-300 leading-relaxed block bg-slate-950/40 p-2 border-l border-slate-700">
              {m.text}
            </span>
          </div>
        ))}
        {isProcessing && (
          <div className="text-[7px] text-blue-500 italic animate-pulse uppercase tracking-widest">
            Intercepting signal...
          </div>
        )}
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <span className="text-[7px] text-slate-700 italic uppercase tracking-widest border border-slate-800/40 p-4">
              Comm-Link established.
            </span>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 lg:p-6 border-t border-slate-800 bg-slate-950/20">
        <div className="relative">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="TYPE DIRECTIVE..."
            className="w-full bg-slate-950 border border-slate-800 text-[9px] text-white p-4 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-800 uppercase tracking-widest"
            disabled={isProcessing}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
        </div>
      </form>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
        }
      `}</style>
    </div>
  );
};
