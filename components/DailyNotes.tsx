
import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { getNotes, saveNotes } from '../services/storageService';
import { Search, Plus, FileText, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';

export const DailyNotes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Note Input State
  const [currentContent, setCurrentContent] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    setNotes(getNotes());
  }, []);

  const handleSaveNote = () => {
    if (!currentContent.trim()) return;
    
    const newNote: Note = {
      id: crypto.randomUUID(),
      content: currentContent,
      createdAt: Date.now()
    };
    
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    setCurrentContent('');
    setIsInputFocused(false);
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSaveNote();
    }
  };

  // Simple Markdown-like renderer for display
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Heading
      if (line.startsWith('# ')) {
        return <div key={i} className="text-white font-bold mb-1">{line.substring(2)}</div>;
      }
      // List
      if (line.startsWith('- ')) {
        return (
          <div key={i} className="flex gap-2 pl-2 mb-1 text-navily-silver/90">
             <span className="text-white/40">•</span>
             <span>{line.substring(2)}</span>
          </div>
        );
      }
      // Checkbox
      if (line.startsWith('- [ ] ')) {
        return (
          <div key={i} className="flex gap-2 mb-1 text-navily-silver/80">
            <span className="font-mono text-white/40">[ ]</span>
            <span className="decoration-white/20">{line.substring(6)}</span>
          </div>
        );
      }
      return <div key={i} className="min-h-[1.2em] mb-0.5 text-navily-silver/80">{line}</div>;
    });
  };

  const filteredNotes = notes.filter(n => 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col bg-[#0F0F0F]/50 border border-white/5 rounded-sm backdrop-blur-sm overflow-hidden min-h-[400px] max-h-[700px]">
      
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 text-white cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <FileText size={16} />
          <h2 className="text-sm font-bold uppercase tracking-widest">Thought Log</h2>
        </div>
        <div className="flex items-center gap-2">
            <div className="relative">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-navily-muted" />
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="GREP..."
                    className="bg-[#1A1A1A] border border-white/5 rounded-sm py-1 pl-6 pr-2 text-[10px] font-mono text-white focus:outline-none focus:border-white/20 w-24 transition-all focus:w-32"
                />
            </div>
        </div>
      </div>

      {/* Editor Input Area - Always visible at top or bottom? Let's put at top for quick capture */}
      <div className={`p-4 border-b border-white/5 bg-[#050505] transition-colors ${isInputFocused ? 'border-white/20' : ''}`}>
        <textarea
            value={currentContent}
            onChange={(e) => setCurrentContent(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="> Capture thought fragment (Markdown supported)..."
            className="w-full bg-transparent text-sm font-mono text-navily-silver placeholder:text-navily-muted/30 focus:outline-none resize-none h-20 custom-scrollbar"
        />
        <div className="flex justify-between items-center mt-2">
            <span className="text-[9px] text-navily-muted uppercase font-mono">{currentContent.length} chars</span>
            <button 
                onClick={handleSaveNote}
                disabled={!currentContent.trim()}
                className="px-3 py-1 bg-white/10 hover:bg-white text-white hover:text-black text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Log Entry [Cmd+Ent]
            </button>
        </div>
      </div>

      {/* Notes Feed */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        {filteredNotes.length === 0 ? (
            <div className="text-center py-10 opacity-30">
                <div className="font-mono text-xs mb-2">-- NO LOGS FOUND --</div>
            </div>
        ) : (
            filteredNotes.map(note => (
                <div key={note.id} className="group relative animate-fade-in">
                    <div className="flex items-baseline justify-between mb-1">
                        <span className="text-[10px] font-mono text-navily-muted/60">
                            {new Date(note.createdAt).toLocaleString(undefined, { 
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                            })}
                        </span>
                        <button 
                           onClick={() => handleDeleteNote(note.id)}
                           className="opacity-0 group-hover:opacity-100 text-navily-muted hover:text-red-400 transition-opacity"
                        >
                            <Trash2 size={10} />
                        </button>
                    </div>
                    <div className="text-xs font-mono border-l-2 border-white/10 pl-3 py-1 group-hover:border-white/30 transition-colors">
                        {renderContent(note.content)}
                    </div>
                </div>
            ))
        )}
      </div>

    </div>
  );
};
