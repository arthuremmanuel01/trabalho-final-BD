'use client';

import { useDroppable } from '@dnd-kit/core';

interface DroppableSlotProps {
  id: string;
  dia: any;
  horario: any;
  children?: React.ReactNode;
  isValidDrop?: boolean;
  isConflict?: boolean;
  isSimulatedOver?: boolean;
  simulatedIsValid?: boolean;
  simulatedIsConflict?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function DroppableSlot({ 
  id, dia, horario, children, isValidDrop, isConflict,
  isSimulatedOver, simulatedIsValid, simulatedIsConflict,
  onClick, onMouseEnter, onMouseLeave 
}: DroppableSlotProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
    data: {
      type: 'SLOT',
      dia,
      horario,
    },
  });

  const activeIsOver = isOver || isSimulatedOver;
  const hasActiveItem = isValidDrop !== undefined || simulatedIsValid !== undefined;
  const isCurrentlyConflict = isConflict ?? simulatedIsConflict;
  const isCurrentlyValid = isValidDrop ?? simulatedIsValid;

  let bgClass = 'bg-slate-50 border-slate-100 border-dashed';
  
  if (hasActiveItem) {
    if (isCurrentlyConflict) {
      bgClass = activeIsOver 
        ? 'bg-rose-100 border-rose-500 ring-2 ring-rose-200 cursor-not-allowed'
        : 'bg-rose-50 border-rose-300 border-dashed cursor-not-allowed bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#fee2e2_10px,#fee2e2_20px)]';
    } else if (isCurrentlyValid) {
      bgClass = activeIsOver
        ? 'bg-emerald-100 border-emerald-500 ring-2 ring-emerald-200 cursor-pointer'
        : 'bg-emerald-50 border-emerald-300 border-dashed cursor-pointer hover:bg-emerald-100';
    }
  } else if (children) {
    bgClass = 'bg-transparent border-transparent';
  }

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`min-h-[80px] h-full w-full p-2 border-2 rounded-xl transition-colors duration-200 flex flex-col gap-2 ${bgClass}`}
    >
      {children}
    </div>
  );
}
