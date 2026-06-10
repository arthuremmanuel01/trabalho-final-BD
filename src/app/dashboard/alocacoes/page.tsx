'use client';

import { useEffect, useState, useCallback } from 'react';
import Toast from '@/components/ui/Toast';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  MeasuringStrategy,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import SidebarClasses from '@/components/ui/SidebarClasses';
import TimetableGrid from '@/components/ui/TimetableGrid';
import ClassCard from '@/components/ui/ClassCard';

interface Disciplina { id_disciplina: number; nome: string; periodo_ideal: number; }
interface Professor { id_professor: number; usuario?: { id_usuario: number; nome: string }; }
interface Turma { id_turma: number; ano: number; semestre: number; disciplina?: Disciplina; professor?: Professor; }
interface TipoSala { id_tipo_sala: number; descricao_tipo: string; }
interface Sala { id_sala: number; numero: string; capacidade: number; tipo?: TipoSala; }
interface Dia { id_dia: number; nome_dia: string; }
interface Horario { id_horario: number; hora_inicio: string; hora_fim: string; }
interface Alocacao {
  id_alocacao: number | string;
  id_turma?: number;
  id_sala?: number;
  id_dia?: number;
  id_horario?: number;
  turma?: Turma;
  sala?: Sala;
  dia?: Dia;
  horario?: Horario;
  isDraft?: boolean;
}
interface ToastState { message: string; type: 'success' | 'error' | 'warning'; }

export default function AlocacoesPage() {
  const [alocacoes, setAlocacoes] = useState<Alocacao[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [dias, setDias] = useState<Dia[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [toast, setToast] = useState<ToastState | null>(null);
  const [perfil, setPerfil] = useState('');
  const [userId, setUserId] = useState<number | null>(null);

  const [activeDragData, setActiveDragData] = useState<any>(null);
  const [draftAllocations, setDraftAllocations] = useState<Alocacao[]>([]);
  const [selectedTurmaId, setSelectedTurmaId] = useState<number | null>(null);
  const [globalSalaId, setGlobalSalaId] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const combinedAllocations = [...alocacoes, ...draftAllocations];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    const uStr = localStorage.getItem('usuario');
    if (uStr) {
      try {
        const u = JSON.parse(uStr);
        setPerfil(u.perfil);
        setUserId(u.id);
      } catch {}
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (draftAllocations.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [draftAllocations]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [a, t, s, d, h] = await Promise.all([
      fetch('/api/alocacoes', { headers }).then(r => r.json()),
      fetch('/api/turmas', { headers }).then(r => r.json()),
      fetch('/api/salas', { headers }).then(r => r.json()),
      fetch('/api/dias', { headers }).then(r => r.json()),
      fetch('/api/horarios', { headers }).then(r => r.json()),
    ]);
    setAlocacoes(Array.isArray(a) ? a : []);
    setTurmas(Array.isArray(t) ? t : []);
    setSalas(Array.isArray(s) ? s : []);
    setDias(Array.isArray(d) ? d : []);
    setHorarios(Array.isArray(h) ? h : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const validateLocalPlacement = (turma: any, diaId: number, horarioId: number) => {
    const countPerDay = combinedAllocations.filter(a => a.turma?.id_turma === turma.id_turma && a.dia?.id_dia === diaId).length;
    if (countPerDay >= 2) return { valid: false, message: 'Máximo de 2 alocações por dia excedido para esta turma.' };

    const allocationsInSlot = combinedAllocations.filter(a => a.dia?.id_dia === diaId && a.horario?.id_horario === horarioId);
    
    const isConflict = allocationsInSlot.some(a =>
      (a.turma?.professor?.id_professor === turma.professor?.id_professor && turma.professor?.id_professor != null) ||
      a.turma?.id_turma === turma.id_turma
    );
    
    if (isConflict) return { valid: false, message: 'Conflito identificado: Professor ou Turma já alocada neste horário.' };

    if (globalSalaId) {
      const isSalaOcupada = allocationsInSlot.some(a => a.sala?.id_sala === Number(globalSalaId));
      if (isSalaOcupada) return { valid: false, message: 'A sala selecionada já possui alocação neste horário.' };
    }

    return { valid: true };
  };

  const handleSlotAction = (turma: any, dia: any, horario: any) => {
    if (!globalSalaId) {
      setToast({ message: 'Selecione uma sala no cabeçalho antes de alocar.', type: 'warning' });
      return;
    }
    const validation = validateLocalPlacement(turma, dia.id_dia, horario.id_horario);
    if (!validation.valid) {
      setToast({ message: validation.message || 'Erro de validação.', type: 'error' });
      return;
    }
    const salaObj = salas.find(s => s.id_sala === Number(globalSalaId));
    const newDraft: Alocacao = {
      id_alocacao: `draft-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      id_turma: turma.id_turma,
      id_sala: Number(globalSalaId),
      id_dia: dia.id_dia,
      id_horario: horario.id_horario,
      turma,
      sala: salaObj,
      dia,
      horario,
      isDraft: true,
    };
    setDraftAllocations(prev => [...prev, newDraft]);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragData(event.active.data.current);
    setSelectedTurmaId(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragData(null);

    if (!over) return; 

    if (over.data.current?.type === 'SLOT' && active.data.current?.type === 'TURMA') {
      handleSlotAction(active.data.current.turma, over.data.current.dia, over.data.current.horario);
    }
  };

  const handleSlotClick = (dia: any, horario: any) => {
    if (!selectedTurmaId) return;
    const turma = turmas.find(t => t.id_turma === selectedTurmaId);
    if (turma) handleSlotAction(turma, dia, horario);
  };

  async function handleSaveBulk() {
    setSaving(true);
    try {
      const payload = draftAllocations.map(d => ({
        id_turma: d.id_turma,
        id_sala: d.id_sala,
        id_dia: d.id_dia,
        id_horario: d.id_horario,
      }));

      const res = await fetch('/api/alocacoes/bulk', {
        method: 'POST', headers,
        body: JSON.stringify({ alocacoes: payload }),
      });
      const data = await res.json();

      if (!res.ok) {
        setToast({ message: data.error ?? 'Erro ao processar alocações.', type: 'error' });
        return;
      }
      
      setToast({ message: 'Modificações sincronizadas com sucesso.', type: 'success' });
      setDraftAllocations([]);
      fetchData();
    } finally {
      setSaving(false);
    }
  }

  function handleDiscardBulk() {
    if (confirm('Você tem certeza que deseja descartar todas as modificações atuais?')) {
      setDraftAllocations([]);
    }
  }

  async function handleDelete(a: Alocacao) {
    if (a.isDraft) {
      setDraftAllocations(prev => prev.filter(d => d.id_alocacao !== a.id_alocacao));
      return;
    }
    const label = `${a.turma?.disciplina?.nome ?? 'Turma'} — ${a.dia?.nome_dia} ${a.horario?.hora_inicio}`;
    if (!confirm(`Remover alocação definitiva do sistema: "${label}"?`)) return;
    
    const res = await fetch(`/api/alocacoes/${a.id_alocacao}`, { method: 'DELETE', headers });
    if (!res.ok) { 
      const data = await res.json();
      setToast({ message: data.error, type: 'error' }); 
      return; 
    }
    setToast({ message: 'Alocação removida do sistema.', type: 'success' });
    fetchData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <svg className="animate-spin w-8 h-8 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
        Carregando interface...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-2rem)]" style={{ backgroundColor: '#f8fafc' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Grade de Horários</h1>
          <p className="text-sm mt-1 text-slate-500">
            Arraste as turmas ou clique em uma para habilitar a Inserção Rápida.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">Sala Global:</label>
          <select
            className="border border-slate-300 rounded-md p-1.5 text-sm focus:ring-2 focus:ring-indigo-500 bg-white min-w-[200px]"
            value={globalSalaId}
            onChange={e => setGlobalSalaId(e.target.value)}
          >
            <option value="">Selecione uma sala...</option>
            {salas.map(s => (
              <option key={s.id_sala} value={s.id_sala}>
                {s.numero} — {s.tipo?.descricao_tipo}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        modifiers={[restrictToWindowEdges]}
        measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveDragData(null)}
      >
        <div className="flex flex-col xl:flex-row flex-1 h-[75vh] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <SidebarClasses 
            turmas={turmas} 
            selectedTurmaId={selectedTurmaId}
            onSelectTurma={(id) => setSelectedTurmaId(id === selectedTurmaId ? null : id)}
          />

          <TimetableGrid
            dias={dias}
            horarios={horarios}
            alocacoes={combinedAllocations}
            activeDragData={activeDragData}
            onDelete={handleDelete}
            perfil={perfil}
            selectedTurma={turmas.find(t => t.id_turma === selectedTurmaId)}
            onSlotClick={handleSlotClick}
          />
        </div>

        <DragOverlay dropAnimation={null}>
          {activeDragData && activeDragData.type === 'TURMA' ? (
            <div className="opacity-95 pointer-events-none shadow-2xl z-[9999] cursor-grabbing w-[320px]">
              <ClassCard turma={activeDragData.turma} isDragging={true} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {draftAllocations.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-slate-200 shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 z-50 animate-fade-in">
          <span className="text-sm font-medium text-slate-800">
            Você possui <strong className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{draftAllocations.length}</strong> alterações não salvas.
          </span>
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          <button 
            onClick={handleDiscardBulk}
            disabled={saving}
            className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            Descartar
          </button>
          <button 
            onClick={handleSaveBulk}
            disabled={saving}
            className="text-sm font-semibold bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 shadow-md transition-all flex items-center gap-2 hover:scale-105"
          >
            {saving ? (
              <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56" /></svg> Salvando</>
            ) : 'Salvar Mudanças'}
          </button>
        </div>
      )}
    </div>
  );
}
