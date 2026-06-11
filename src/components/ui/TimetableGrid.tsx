'use client';

import DroppableSlot from './DroppableSlot';
import { User, School, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface TimetableGridProps {
  dias: any[];
  horarios: any[];
  alocacoes: any[];
  activeDragData: any;
  onDelete?: (alocacao: any) => void;
  perfil?: string;
  userId?: number | null;
  selectedTurma?: any;
  onSlotClick?: (dia: any, horario: any) => void;
  globalSalaId?: string;
}

export default function TimetableGrid({
  dias,
  horarios,
  alocacoes,
  activeDragData,
  onDelete,
  perfil,
  userId,
  selectedTurma,
  onSlotClick,
  globalSalaId,
}: TimetableGridProps) {
  const [hoveredSlot, setHoveredSlot] = useState<{diaId: number, horarioId: number} | null>(null);

  const sortedDias = [...dias].sort((a, b) => a.id_dia - b.id_dia);
  const sortedHorarios = [...horarios].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

  const formatRoomName = (str?: string) => {
    if (!str) return 'S/ Sala';
    const parts = str.split('|').map(s => s.trim());
    if (parts.length >= 3) {
      const bloco = parts[0].replace(/bloco\s+/i, '');
      const lastWords = parts[parts.length - 1].split(' ');
      const num = lastWords[lastWords.length - 1].replace(/\.$/, '');
      return `Sala ${bloco}-${num}`.replace('--', '-');
    }
    return str.replace(/Laborat[óo]rio/i, 'Lab').replace(/Sala de [Aa]ula/i, 'Sala');
  };

  const checkConflict = (targetTurma: any, diaId: number, horarioId: number) => {
    if (!targetTurma) return false;
    
    // Regra 1: Limite de 2 alocações por dia
    const countPerDay = alocacoes.filter(a => a.turma?.id_turma === targetTurma.id_turma && a.dia?.id_dia === diaId).length;
    if (countPerDay >= 2) return true;

    const allocationsInSlot = alocacoes.filter(
      (a) => a.dia?.id_dia === diaId && a.horario?.id_horario === horarioId
    );

    for (const a of allocationsInSlot) {
      // Regra 2: Conflito de Período
      if (
        a.turma?.disciplina?.periodo_ideal === targetTurma.disciplina?.periodo_ideal &&
        a.turma?.id_turma !== targetTurma.id_turma
      ) {
        return true;
      }
      
      // Regra 3: Conflito de Professor
      if (
        a.turma?.professor?.id_professor === targetTurma.professor?.id_professor &&
        targetTurma.professor?.id_professor != null &&
        a.turma?.id_turma !== targetTurma.id_turma
      ) {
        return true;
      }

      // Mesma turma no mesmo horário
      if (a.turma?.id_turma === targetTurma.id_turma) {
        return true;
      }

      // Regra 4: Conflito de Sala Global
      if (globalSalaId && a.sala?.id_sala === Number(globalSalaId)) {
         return true;
      }
    }
    return false;
  };

  return (
    <div className="flex-1 bg-white overflow-hidden flex flex-col p-2 xl:p-4 rounded-xl border border-slate-200 shadow-sm ml-0 xl:ml-6 mt-4 xl:mt-0">
      <div className="flex-1 overflow-auto">
        <div className="min-w-[600px] w-full">
          <div className="flex sticky top-0 z-40 bg-white border-b border-slate-200 pb-2 mb-2">
            <div className="w-14 shrink-0 bg-white"></div>
            {sortedDias.map((dia) => (
              <div key={dia.id_dia} className="flex-1 px-1 text-center bg-white min-w-0">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider truncate block">
                  {dia.nome_dia.split('-')[0]}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {sortedHorarios.map((horario) => (
              <div key={horario.id_horario} className="flex group/row">
                <div className="w-14 shrink-0 flex flex-col items-center justify-center py-2 pr-2 border-r border-slate-100 bg-white z-30">
                  <span className="text-xs font-bold text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                    {horario.hora_inicio}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">{horario.hora_fim}</span>
                </div>

                {sortedDias.map((dia) => {
                  const allocationsInSlot = alocacoes.filter(
                    (a) => a.dia?.id_dia === dia.id_dia && a.horario?.id_horario === horario.id_horario
                  );

                  let isValidDrop = undefined;
                  let isConflict = undefined;

                  if (activeDragData && activeDragData.type === 'TURMA') {
                    isConflict = checkConflict(activeDragData.turma, dia.id_dia, horario.id_horario);
                    isValidDrop = !isConflict;
                  }

                  const isSimulatedOver = hoveredSlot?.diaId === dia.id_dia && hoveredSlot?.horarioId === horario.id_horario;
                  let simulatedIsValid = undefined;
                  let simulatedIsConflict = undefined;

                  if (selectedTurma && !activeDragData) {
                    simulatedIsConflict = checkConflict(selectedTurma, dia.id_dia, horario.id_horario);
                    simulatedIsValid = !simulatedIsConflict;
                  }

                  return (
                    <div key={`slot-${dia.id_dia}-${horario.id_horario}`} className="flex-1 px-1 relative min-w-0">
                      <DroppableSlot
                        id={`slot-${dia.id_dia}-${horario.id_horario}`}
                        dia={dia}
                        horario={horario}
                        isValidDrop={isValidDrop}
                        isConflict={isConflict}
                        isSimulatedOver={isSimulatedOver}
                        simulatedIsValid={simulatedIsValid}
                        simulatedIsConflict={simulatedIsConflict}
                        onClick={() => { if (selectedTurma && onSlotClick) onSlotClick(dia, horario); }}
                        onMouseEnter={() => { if (selectedTurma) setHoveredSlot({ diaId: dia.id_dia, horarioId: horario.id_horario }); }}
                        onMouseLeave={() => setHoveredSlot(null)}
                      >
                        {allocationsInSlot.map((alloc) => {
                          const isMyClass = perfil === 'professor' && alloc.turma?.professor?.usuario?.id_usuario === userId;
                          
                          let cardClasses = 'bg-white border-slate-200 hover:border-indigo-300';
                          if (alloc.isDraft) {
                            cardClasses = 'bg-amber-50 border-amber-300';
                          } else if (perfil === 'professor') {
                            if (isMyClass) {
                              cardClasses = 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-400 shadow-md';
                            } else {
                              cardClasses = 'bg-slate-50 border-slate-200 opacity-60 grayscale-[50%]';
                            }
                          }

                          return (
                            <div
                              key={`alloc-${alloc.id_alocacao}`}
                              className={`relative group border rounded-md p-1.5 shadow-sm transition-all ${cardClasses}`}
                            >
                            {alloc.isDraft && (
                              <div className="absolute -top-1.5 -right-1.5 bg-amber-400 text-amber-900 text-[8px] font-bold px-1 rounded-sm shadow-sm z-10">
                                DRAFT
                              </div>
                            )}
                            <div className="flex justify-between items-start mb-0.5">
                              <span className="font-semibold text-[11px] leading-tight text-slate-800 line-clamp-2" title={alloc.turma?.disciplina?.nome}>
                                {alloc.turma?.disciplina?.nome}
                              </span>
                              {perfil !== 'professor' && onDelete && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); onDelete(alloc); }}
                                  className="opacity-0 group-hover:opacity-100 p-0.5 text-red-500 hover:bg-red-50 rounded transition-all absolute top-0.5 right-0.5 bg-white shadow-sm"
                                  title="Remover"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            <div className="flex flex-col gap-0.5 mt-1">
                              <div className="flex items-center text-slate-500">
                                <User className="w-3 h-3 mr-1 shrink-0" />
                                <span className="text-[10px] truncate" title={alloc.turma?.professor?.usuario?.nome}>
                                  {alloc.turma?.professor?.usuario?.nome?.split(' ')[0] ?? 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center text-slate-500">
                                <School className="w-3 h-3 mr-1 shrink-0" />
                                <span className="text-[10px] truncate font-medium text-slate-600" title={alloc.sala?.numero}>
                                  {formatRoomName(alloc.sala?.numero)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="absolute z-[100] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-slate-800 text-white rounded shadow-xl text-xs pointer-events-none">
                              <div className="font-bold mb-1 border-b border-slate-600 pb-1">{alloc.turma?.disciplina?.nome}</div>
                              <div className="mb-0.5 text-slate-200">Prof: {alloc.turma?.professor?.usuario?.nome || '—'}</div>
                              <div className="mb-0.5 text-slate-200">Sala: {alloc.sala?.numero || '—'}</div>
                              <div className="text-slate-300 italic mt-1">{alloc.turma?.disciplina?.periodo_ideal}º Período</div>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                            </div>
                          </div>
                          );
                        })}
                      </DroppableSlot>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
