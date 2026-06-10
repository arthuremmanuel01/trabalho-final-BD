'use client';

import DraggableClassCard from './DraggableClassCard';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface SidebarClassesProps {
  turmas: any[];
  selectedTurmaId?: number | null;
  onSelectTurma?: (turmaId: number) => void;
}

export default function SidebarClasses({ turmas, selectedTurmaId, onSelectTurma }: SidebarClassesProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTurmas = turmas.filter((t) => {
    const search = searchTerm.toLowerCase();
    const nome = t.disciplina?.nome?.toLowerCase() || '';
    const prof = t.professor?.usuario?.nome?.toLowerCase() || '';
    return nome.includes(search) || prof.includes(search);
  });

  return (
    <div className="w-full xl:w-80 bg-slate-50 border-b xl:border-b-0 xl:border-r border-slate-200 flex flex-col h-[40vh] xl:h-auto xl:max-h-full">
      <div className="p-4 border-b border-slate-200 bg-white shrink-0">
        <h2 className="text-lg font-bold text-slate-800">Turmas Disponíveis</h2>
        <p className="text-sm text-slate-500 mt-1">Arraste para a grade ao lado</p>
        
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar turma ou professor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredTurmas.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            Nenhuma turma encontrada.
          </div>
        ) : (
          filteredTurmas.map((turma) => (
            <DraggableClassCard 
              key={`turma-${turma.id_turma}`} 
              id={`turma-${turma.id_turma}`} 
              turma={turma} 
              isSelected={selectedTurmaId === turma.id_turma}
              onClick={() => onSelectTurma && onSelectTurma(turma.id_turma)}
            />
          ))
        )}
      </div>
    </div>
  );
}
