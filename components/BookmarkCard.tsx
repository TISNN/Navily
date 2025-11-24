import React from 'react';
import { Bookmark, ViewMode } from '../types';
import { ExternalLink, MoreHorizontal, Trash2, Edit2, Heart, Copy, Calendar, Tag } from 'lucide-react';

interface BookmarkCardProps {
  bookmark: Bookmark;
  viewMode: ViewMode;
  onEdit: (b: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onCopyUrl: (url: string) => void;
}

export const BookmarkCard: React.FC<BookmarkCardProps> = ({ 
  bookmark, 
  viewMode,
  onEdit, 
  onDelete, 
  onToggleFavorite,
  onCopyUrl
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (ts: number) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(ts));
  };

  // --- GRID VIEW ---
  if (viewMode === 'grid') {
    return (
      <div className="group relative flex flex-col bg-[#0F0F0F] border border-white/5 rounded-sm p-5 transition-all duration-500 hover:border-white/20 hover:shadow-[0_10px_30px_-5px_rgba(255,255,255,0.08)] hover:-translate-y-1 overflow-hidden h-40 hover:h-auto min-h-[160px]">
        
        {/* Metallic sheen on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative z-10 flex justify-between items-start mb-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-sm bg-[#1A1A1A] border border-white/5 text-lg shadow-inner group-hover:border-white/20 transition-colors">
            <span className="drop-shadow-md filter grayscale group-hover:grayscale-0 transition-all duration-300">{bookmark.icon}</span>
          </div>
          
          {/* Action Buttons - Only visible on hover */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <button 
              onClick={(e) => { e.preventDefault(); onToggleFavorite(bookmark.id); }}
              className={`p-1.5 rounded-full transition-all ${bookmark.isFavorite ? 'text-white bg-white/10' : 'text-navily-muted hover:text-white hover:bg-white/5'}`}
            >
              <Heart size={14} fill={bookmark.isFavorite ? "currentColor" : "none"} />
            </button>
             <button 
              onClick={(e) => { e.preventDefault(); onEdit(bookmark); }}
              className="p-1.5 rounded-full text-navily-muted hover:text-white hover:bg-white/5 transition-colors"
            >
              <Edit2 size={14} />
            </button>
            <button 
                onClick={() => { onDelete(bookmark.id); }}
                className="p-1.5 rounded-full text-navily-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={14} />
            </button>
          </div>
        </div>

        <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="relative z-10 block group-hover:cursor-pointer">
          <h3 className="text-lg font-bold text-white mb-1 leading-tight group-hover:text-navily-silver transition-colors line-clamp-1 tracking-tight">
            {bookmark.title}
          </h3>
          
          {/* Tags visible by default */}
          <div className="flex flex-wrap gap-1 mb-2 group-hover:hidden transition-all delay-75">
             <span className="text-[10px] uppercase tracking-widest font-bold px-1.5 py-0.5 bg-white/5 text-navily-muted border border-white/5 rounded-sm">
                {bookmark.category}
             </span>
             {bookmark.tags?.[0] && (
               <span className="text-[10px] text-navily-muted px-1.5 py-0.5 border border-white/5 rounded-sm opacity-60">
                 #{bookmark.tags[0]}
               </span>
             )}
          </div>

          {/* Description reveals on hover */}
          <div className="hidden group-hover:block animate-fade-in">
             <p className="text-xs text-navily-muted leading-relaxed mb-3 line-clamp-3 font-light">
              {bookmark.description}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-white/40 uppercase tracking-widest">
              <span>Open Link</span>
              <ExternalLink size={10} />
            </div>
          </div>
        </a>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="group relative flex items-center gap-6 bg-[#0F0F0F] border border-white/5 rounded-sm p-4 transition-all duration-300 hover:border-white/20 hover:bg-[#141414] animate-fade-in">
      <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-sm bg-[#1A1A1A] border border-white/5 text-xl">
        <span className="filter grayscale group-hover:grayscale-0 transition-all">{bookmark.icon}</span>
      </div>

      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-[2fr_3fr_1fr] gap-4 items-center">
        <div>
           <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="block">
            <h3 className="text-lg font-bold text-white truncate group-hover:text-navily-silver transition-colors">
              {bookmark.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[10px] uppercase tracking-widest text-navily-muted flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                  {bookmark.category}
               </span>
               {bookmark.tags && bookmark.tags.length > 0 && (
                  <span className="text-[10px] text-navily-muted opacity-50 flex gap-2">
                    {bookmark.tags.slice(0, 2).map(t => <span key={t}>#{t}</span>)}
                  </span>
               )}
            </div>
          </a>
        </div>
        
        <p className="hidden md:block text-sm text-navily-muted truncate font-light">
          {bookmark.description}
        </p>

        <div className="hidden md:flex items-center gap-2 text-xs text-navily-muted">
          <Calendar size={12} />
          {formatDate(bookmark.createdAt)}
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
        <button 
          onClick={() => onToggleFavorite(bookmark.id)}
          className={`p-2 rounded-full hover:bg-white/10 ${bookmark.isFavorite ? 'text-white' : 'text-navily-muted'}`}
        >
          <Heart size={16} fill={bookmark.isFavorite ? "currentColor" : "none"} />
        </button>
        
        <button 
          onClick={() => onCopyUrl(bookmark.url)}
          className="p-2 rounded-full text-navily-muted hover:text-white hover:bg-white/10"
        >
          <Copy size={16} />
        </button>

        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full text-navily-muted hover:text-white hover:bg-white/10"
          >
            <MoreHorizontal size={16} />
          </button>
          
          {showMenu && (
             <div className="absolute right-0 top-full mt-2 w-36 bg-[#1A1A1A] border border-white/10 rounded-sm shadow-2xl z-20 overflow-hidden text-xs uppercase tracking-wider font-medium">
                <button 
                  onClick={() => { onEdit(bookmark); setShowMenu(false); }}
                  className="w-full text-left px-4 py-3 text-navily-silver hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button 
                  onClick={() => { onDelete(bookmark.id); setShowMenu(false); }}
                  className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
          )}
        </div>
        
        <a 
          href={bookmark.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 rounded-full text-navily-muted hover:text-white hover:bg-white/10"
        >
          <ExternalLink size={16} />
        </a>
      </div>
    </div>
  );
};