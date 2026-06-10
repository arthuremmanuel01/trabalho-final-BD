import { GripVertical, User } from 'lucide-react';

interface ClassCardProps {
  turma: any;
  isDragging?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function ClassCard({ turma, isDragging, isSelected, onClick }: ClassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`relative flex items-center bg-white border rounded-xl p-3 shadow-sm ${onClick ? 'cursor-pointer' : ''} ${
        isDragging 
          ? 'shadow-lg ring-2 ring-indigo-500 ring-opacity-50 border-indigo-300 transition-none' 
          : isSelected
          ? 'ring-2 ring-indigo-600 border-indigo-600 bg-indigo-50/50'
          : 'border-slate-200 hover:shadow-md hover:border-indigo-300 transition-all'
      }`}
    >
      <div className="mr-3 text-slate-400 cursor-grab">
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-slate-800 truncate">
          {turma.disciplina?.nome ?? 'Disciplina'}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="flex items-center text-xs text-slate-500 truncate">
            <User className="w-3.5 h-3.5 mr-1" />
            {turma.professor?.usuario?.nome ?? 'Sem Professor'}
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
            {turma.disciplina?.periodo_ideal ?? '?'}º P
          </span>
        </div>
      </div>
    </div>
  );
}
