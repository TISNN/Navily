import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { BookmarkCard } from './BookmarkCard';
import { Bookmark, ViewMode } from '../types';

interface DraggableBookmarkCardProps {
  bookmark: Bookmark;
  viewMode: ViewMode;
  onEdit: (b: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onCopyUrl: (url: string) => void;
}

export const DraggableBookmarkCard: React.FC<DraggableBookmarkCardProps> = ({
  bookmark,
  viewMode,
  onEdit,
  onDelete,
  onToggleFavorite,
  onCopyUrl,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bookmark.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group/bookmark"
    >
      {/* Drag Handle - Only visible on hover */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-2 top-2 z-20 cursor-grab active:cursor-grabbing opacity-0 group-hover/bookmark:opacity-100 transition-opacity p-1 hover:bg-white/5 rounded"
        title="拖拽重新排列"
      >
        <GripVertical size={14} className="text-navily-muted hover:text-white" />
      </div>
      
      {/* Bookmark Card */}
      <div className={isDragging ? 'pointer-events-none' : ''}>
        <BookmarkCard
          bookmark={bookmark}
          viewMode={viewMode}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
          onCopyUrl={onCopyUrl}
        />
      </div>
    </div>
  );
};

