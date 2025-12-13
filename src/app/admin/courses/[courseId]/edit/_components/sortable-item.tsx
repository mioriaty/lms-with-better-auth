import { cn } from '@/libs/utils/string';
import { DraggableSyntheticListeners } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CSSProperties, ReactNode } from 'react';

interface SortableItemProps {
  id: string;
  children: (listeners: DraggableSyntheticListeners) => ReactNode;
  className?: string;
  data?: {
    type: 'chapter' | 'lesson';
    chapterId?: string; // only relevant for lessons
  };
}

export function SortableItem({ children, id, className, data }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    position: 'relative',
    zIndex: isDragging ? 999 : undefined
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(className, isDragging ? 'opacity-80 shadow-lg' : '')}
    >
      {children(listeners)}
    </div>
  );
}
