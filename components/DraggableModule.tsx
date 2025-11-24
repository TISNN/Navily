import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface DraggableModuleProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export const DraggableModule: React.FC<DraggableModuleProps> = ({ 
  id, 
  children, 
  className = '' 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${className}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-2 top-2 z-10 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/5 rounded"
        title="拖拽重新排列"
      >
        <GripVertical size={16} className="text-navily-muted hover:text-white" />
      </div>
      
      {/* Module Content */}
      <div className={isDragging ? 'pointer-events-none' : ''}>
        {children}
      </div>
    </div>
  );
};

