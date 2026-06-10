'use client';

import { useEffect, useState, useCallback } from 'react';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import { Edit2, Trash2, Plus, Calendar, GraduationCap, BookOpen, Users, UsersRound, School, Clock, FileText, LayoutDashboard, Menu, X, LogOut, Rocket, Hand, AlertTriangle, XCircle, Lock, User } from 'lucide-react';

interface Disciplina { id_disciplina: number; nome: string; periodo_ideal: number; }
interface Professor { id_professor: number; usuario?: { id_usuario: number; nome: string }; }
interface Turma { id_turma: number; ano: number; semestre: number; disciplina?: Disciplina; professor?: Professor; }
interface TipoSala { id_tipo_sala: number; descricao_tipo: string; }
interface Sala { id_sala: number; numero: string; capacidade: number; tipo?: TipoSala; }
interface Dia { id_dia: number; nome_dia: string; }
interface Horario { id_horario: number; hora_inicio: string; hora_fim: string; }
interface Alocacao {
  id_alocacao: number;
  turma?: Turma;
  sala?: Sala;
  dia?: Dia;
  horario?: Horario;
}
interface ToastState { message: string; type: 'success' | 'error' | 'warning'; }
interface BusinessError { message: string; rule: string; }

const RULE_LABELS: Record<string, { icon: string; color: string; label: string }> = {
  RULE_1: { icon: '⚠️', color: '#f59e0b', label: 'Limite Diário Excedido' },
  RULE_2: { icon: '🚫', color: '#ef4444', label: 'Conflito de Período Ideal' },
  RULE_3: { icon: '🚫', color: '#ef4444', label: 'Conflito de Professor' },
  RULE_4: { icon: '🚫', color: '#ef4444', label: 'Conflito de Sala' },
};

const emptyForm = { id_turma: '', id_sala: '', id_dia: '', id_horario: '' };

export default function AlocacoesPage() {
  const [alocacoes, setAlocacoes] = useState<Alocacao[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [dias, setDias] = useState<Dia[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [businessError, setBusinessError] = useState<BusinessError | null>(null);
  const [filterDia, setFilterDia] = useState('');
  const [perfil, setPerfil] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [showOnlyMyClasses, setShowOnlyMyClasses] = useState(false);

  useEffect(() => {
    const uStr = localStorage.getItem('usuario');
    if (uStr) {
      try {
        const u = JSON.parse(uStr);
        setPerfil(u.perfil);
        setUserId(u.id);
        if (u.perfil === 'professor') {
          setShowOnlyMyClasses(true);
        }
      } catch {}
    }
  }, []);

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

  function openCreate() {
    setForm(emptyForm);
    setBusinessError(null);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.id_turma || !form.id_sala || !form.id_dia || !form.id_horario) {
      setToast({ message: 'Selecione todos os campos.', type: 'error' }); return;
    }
    setSaving(true);
    setBusinessError(null);
    try {
      const res = await fetch('/api/alocacoes', {
        method: 'POST', headers,
        body: JSON.stringify({
          id_turma: Number(form.id_turma),
          id_sala: Number(form.id_sala),
          id_dia: Number(form.id_dia),
          id_horario: Number(form.id_horario),
        }),
      });
      const data = await res.json();

      if (res.status === 422) {
        // Violação de regra de negócio (erro exibido dentro do próprio modal)
        setBusinessError({ message: data.error, rule: data.rule ?? 'UNKNOWN' });
        return;
      }
      if (!res.ok) {
        setToast({ message: data.error ?? 'Erro ao criar alocação.', type: 'error' }); return;
      }
      setToast({ message: 'Alocação criada com sucesso!', type: 'success' });
      setModalOpen(false);
      fetchData();
    } finally { setSaving(false); }
  }

  async function handleDelete(a: Alocacao) {
    const label = `${a.turma?.disciplina?.nome ?? 'Turma'} — ${a.dia?.nome_dia} ${a.horario?.hora_inicio}`;
    if (!confirm(`Remover alocação: "${label}"?`)) return;
    const res = await fetch(`/api/alocacoes/${a.id_alocacao}`, { method: 'DELETE', headers });
    const data = await res.json();
    if (!res.ok) { setToast({ message: data.error, type: 'error' }); return; }
    setToast({ message: 'Alocação removida.', type: 'success' });
    fetchData();
  }

  const filteredAlocacoes = alocacoes.filter(a => {
    if (filterDia && String(a.dia?.id_dia) !== filterDia) return false;
    if (showOnlyMyClasses && userId && a.turma?.professor?.usuario?.id_usuario !== userId) return false;
    return true;
  });

  const ruleInfo = businessError ? (RULE_LABELS[businessError.rule] ?? { icon: '❌', color: '#ef4444', label: 'Regra violada' }) : null;

  return (
    <div className="animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}


      <div className="sticky top-0 z-10 bg-slate-50 py-4 border-b border-slate-200/50 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestão de Alocações</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {alocacoes.length} alocação(ões) · Validações automáticas de conflito ativas
          </p>
        </div>
        {perfil !== 'professor' && (
          <button onClick={openCreate} className="btn-primary" id="btn-nova-alocacao">
            <Calendar className="w-4 h-4 inline mr-1" /> Nova Alocação
          </button>
        )}
      </div>




      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Filtrar por dia:</label>
        <select className="input-field" style={{ width: 'auto', minWidth: '180px' }} value={filterDia} onChange={e => setFilterDia(e.target.value)}>
          <option value="">Todos os dias</option>
          {dias.map(d => <option key={d.id_dia} value={d.id_dia}>{d.nome_dia}</option>)}
        </select>
        {filterDia && (
          <button onClick={() => setFilterDia('')} className="text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(0,0,0,0.07)', color: 'var(--muted)', border: '1px solid var(--card-border)' }}>
            Limpar filtro
          </button>
        )}
        
        <div className="flex items-center gap-2 ml-4">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={showOnlyMyClasses} onChange={(e) => setShowOnlyMyClasses(e.target.checked)} />
              <div className={`block w-10 h-6 rounded-full transition-colors ${showOnlyMyClasses ? 'bg-red-800' : 'bg-gray-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showOnlyMyClasses ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <span className="ml-3 text-sm font-medium text-slate-700">Ver apenas minhas turmas</span>
          </label>
        </div>

        <span className="ml-auto text-sm" style={{ color: 'var(--muted)' }}>{filteredAlocacoes.length} resultado(s)</span>
      </div>


      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-32 rounded-xl animate-pulse" style={{ background: 'rgba(0,0,0,0.05)' }} />)}
        </div>
      ) : filteredAlocacoes.length === 0 ? (
        <div className="card text-center py-16" style={{ color: 'var(--muted)' }}>
          <p className="text-5xl mb-4"><Calendar className="w-12 h-12 mb-3 text-slate-300 mx-auto" /></p>
          <p className="font-medium text-lg">Nenhuma alocação {filterDia ? 'neste dia' : 'cadastrada'}</p>
          <p className="text-sm mt-2">Clique em &ldquo;Nova Alocação&rdquo; para começar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAlocacoes.map((a, idx) => (
            <div key={a.id_alocacao} className="card animate-fade-in flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              style={{ animationDelay: `${idx * 0.04}s`, borderColor: 'var(--card-border)' }}>
              

              <div className="flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center text-center"
                style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                <span className="text-xs font-bold" style={{ color: '#9a3412' }}>
                  {a.horario?.hora_inicio?.slice(0, 5) ?? '--'}
                </span>
                <span className="text-xs" style={{ color: '#c2410c' }}>
                  {a.horario?.hora_fim?.slice(0, 5) ?? '--'}
                </span>
              </div>


              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{a.turma?.disciplina?.nome ?? 'Disciplina'}</p>
                <p className="text-sm flex items-center gap-1" style={{ color: 'var(--muted)' }}>
                  <User className="w-3.5 h-3.5" /> {a.turma?.professor?.usuario?.nome ?? '—'}
                </p>
              </div>


              <div className="text-center flex-shrink-0">
                <span className="badge" style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>
                  {a.dia?.nome_dia ?? '—'}
                </span>
              </div>


              <div className="text-center flex-shrink-0">
                <p className="font-medium text-sm flex items-center gap-1"><School className="w-3.5 h-3.5" /> {a.sala?.numero ?? '—'}</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  {a.sala?.tipo?.descricao_tipo ?? ''} · {a.sala?.capacidade} vagas
                </p>
              </div>


              <div className="text-center flex-shrink-0">
                <span className="badge badge-admin">
                  {a.turma?.disciplina?.periodo_ideal ?? '?'}º período
                </span>
              </div>


              {perfil !== 'professor' && (
                <button onClick={() => handleDelete(a)} className="flex-shrink-0 px-3 py-2 rounded-lg text-xs transition-all"
                  style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>
                  <Trash2 className="w-4 h-4 inline mr-1" /> Remover
                </button>
              )}
            </div>
          ))}
        </div>
      )}


      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nova Alocação de Horário" size="lg">
        <div className="flex flex-col gap-4">
          

          {businessError && (
            <div className="rounded-xl p-4 flex items-start gap-3 animate-fade-in bg-red-50 border border-red-200">
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800 font-medium">
                  {businessError.message}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>
                Turma / Disciplina <span style={{ color: '#f87171' }}>*</span>
              </label>
              <select className="input-field" value={form.id_turma}
                onChange={e => { setForm(f => ({ ...f, id_turma: e.target.value })); setBusinessError(null); }}>
                <option value="">Selecione a turma</option>
                {turmas.map(t => (
                  <option key={t.id_turma} value={t.id_turma}>
                    [{t.disciplina?.periodo_ideal ?? '?'}º per.] {t.disciplina?.nome} — Prof. {t.professor?.usuario?.nome ?? '?'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>
                Sala <span style={{ color: '#f87171' }}>*</span>
              </label>
              <select className="input-field" value={form.id_sala}
                onChange={e => { setForm(f => ({ ...f, id_sala: e.target.value })); setBusinessError(null); }}>
                <option value="">Selecione a sala</option>
                {salas.map(s => (
                  <option key={s.id_sala} value={s.id_sala}>
                    {s.numero} — {s.tipo?.descricao_tipo} ({s.capacidade} vagas)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>
                  Dia da Semana <span style={{ color: '#f87171' }}>*</span>
                </label>
                <select className="input-field" value={form.id_dia}
                  onChange={e => { setForm(f => ({ ...f, id_dia: e.target.value })); setBusinessError(null); }}>
                  <option value="">Selecione o dia</option>
                  {dias.map(d => <option key={d.id_dia} value={d.id_dia}>{d.nome_dia}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>
                  Horário <span style={{ color: '#f87171' }}>*</span>
                </label>
                <select className="input-field" value={form.id_horario}
                  onChange={e => { setForm(f => ({ ...f, id_horario: e.target.value })); setBusinessError(null); }}>
                  <option value="">Selecione o horário</option>
                  {horarios.map(h => <option key={h.id_horario} value={h.id_horario}>{h.hora_inicio} – {h.hora_fim}</option>)}
                </select>
              </div>
            </div>
          </div>


          <div className="rounded-lg p-3 text-xs" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e3a8a' }}>
            <p className="font-semibold mb-1 flex items-center gap-1" style={{ color: '#1e3a8a' }}><Lock className="w-3.5 h-3.5" /> Regras de Negócio Ativas</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Máximo 2 alocações por turma por dia</li>
              <li>Disciplinas do mesmo período não compartilham horário/dia</li>
              <li>Professor não pode ter 2 turmas no mesmo horário/dia</li>
              <li>Sem conflito de sala (mesma sala, dia e horário)</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <button className="btn-primary flex-1" onClick={handleSave} disabled={saving} id="btn-submit-alocacao">
              {saving ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
                  Validando...
                </span>
              ) : <><Calendar className="w-4 h-4" /> Alocar</>}
            </button>
            <button onClick={() => setModalOpen(false)} className="flex-1 py-2 rounded-lg text-sm"
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569' }}>
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
