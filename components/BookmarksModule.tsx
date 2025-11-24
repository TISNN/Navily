import React from 'react';
import { SortableContext, verticalListSortingStrategy, rectSortingStrategy } from '@dnd-kit/sortable';
import { Bookmark, ViewMode } from '../types';
import { DraggableBookmarkCard } from './DraggableBookmarkCard';
import { LayoutGrid, List } from 'lucide-react';

interface BookmarksModuleProps {
  bookmarks: Bookmark[];
  viewMode: ViewMode;
  activeTab: string;
  onViewModeChange: (mode: ViewMode) => void;
  onTabChange: (tab: string) => void;
  onEdit: (b: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onCopyUrl: (url: string) => void;
  onAddNew: () => void;
}

export const BookmarksModule: React.FC<BookmarksModuleProps> = ({
  bookmarks,
  viewMode,
  activeTab,
  onViewModeChange,
  onTabChange,
  onEdit,
  onDelete,
  onToggleFavorite,
  onCopyUrl,
  onAddNew,
}) => {
  return (
    <div className="bg-[#0F0F0F]/50 border border-white/5 rounded-sm p-5 backdrop-blur-sm flex flex-col min-h-[400px] max-h-[800px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 text-white">
        <LayoutGrid size={16} />
        <h2 className="text-sm font-bold uppercase tracking-widest">Bookmarks</h2>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-4 border-b border-white/5 mb-4 overflow-x-auto scrollbar-hide pb-2">
        {['All', 'Work', 'Study', 'Life', 'Custom'].map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`text-xs font-medium tracking-wide transition-all relative whitespace-nowrap ${
              activeTab === tab ? 'text-white' : 'text-navily-muted hover:text-white'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] -mb-2"></span>
            )}
          </button>
        ))}
        
        <div className="flex-1"></div>
        
        {/* View Toggle */}
        <div className="flex gap-1">
          <button 
            onClick={() => onViewModeChange('grid')} 
            className={`p-1.5 rounded-sm transition-colors ${
              viewMode === 'grid' ? 'text-white bg-white/10' : 'text-navily-muted hover:text-white'
            }`}
          >
            <LayoutGrid size={12} />
          </button>
          <button 
            onClick={() => onViewModeChange('list')} 
            className={`p-1.5 rounded-sm transition-colors ${
              viewMode === 'list' ? 'text-white bg-white/10' : 'text-navily-muted hover:text-white'
            }`}
          >
            <List size={12} />
          </button>
        </div>
      </div>

      {/* Bookmarks List */}
      <div className="flex-1 overflow-y-auto">
        {bookmarks.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-sm">
            <p className="text-navily-muted text-sm mb-4">No signals detected in this sector.</p>
            <button 
              onClick={onAddNew} 
              className="text-white text-xs underline underline-offset-4 hover:text-navily-silver transition-colors"
            >
              Initialize new coordinate
            </button>
          </div>
        ) : (
          <SortableContext 
            items={bookmarks.map(b => b.id)} 
            strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
          >
            <div className={`
              ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'flex flex-col gap-3'}
            `}>
              {bookmarks.map(bm => (
                <DraggableBookmarkCard 
                  key={bm.id} 
                  bookmark={bm} 
                  viewMode={viewMode}
                  onEdit={onEdit} 
                  onDelete={onDelete}
                  onToggleFavorite={onToggleFavorite}
                  onCopyUrl={onCopyUrl}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
};

