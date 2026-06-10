'use client';

import { useDraggable } from '@dnd-kit/core';
import ClassCard from './ClassCard';

interface DraggableClassCardProps {
  id: string;
  turma: any;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function DraggableClassCard({ id, turma, isSelected, onClick }: DraggableClassCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: id,
    data: {
      type: 'TURMA',
      turma: turma,
    },
  });

  const style = {
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab relative">
      {onClick && <div className="absolute inset-0 z-10" onClick={(e) => { e.stopPropagation(); onClick(); }}></div>}
      <ClassCard turma={turma} isDragging={isDragging} isSelected={isSelected} onClick={onClick} />
    </div>
  );
}
