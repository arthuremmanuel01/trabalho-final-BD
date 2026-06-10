'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import { Edit2, Trash2, Plus, Calendar, GraduationCap, BookOpen, Users, UsersRound, School, Clock, FileText, LayoutDashboard, Menu, X, LogOut, Rocket, Hand } from 'lucide-react';

interface Horario {
  id_horario: number;
  hora_inicio: string;
  hora_fim: string;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'warning';
}

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4].map(i => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 rounded animate-pulse" style={{ background: 'rgba(0,0,0,0.07)' }} />
        </td>
      ))}
    </tr>
  );
}

function formatTime(time: string): string {
  if (!time) return '—';
  return time.substring(0, 5);
}

export default function HorariosPage() {
  const router = useRouter();
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Horario | null>(null);
  const [formInicio, setFormInicio] = useState('');
  const [formFim, setFormFim] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState<ToastState | null>(null);

  function getToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/'); return null; }
    return token;
  }

  async function fetchData() {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/horarios', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { router.push('/'); return; }
      const data = await res.json();
      setHorarios(Array.isArray(data) ? data : []);
    } catch {
      setToast({ message: 'Erro ao carregar horários.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      try {
        const usuario = JSON.parse(usuarioStr);
        if (usuario.perfil !== 'admin') {
          router.push('/dashboard');
          return;
        }
      } catch {}
    }
    fetchData(); 
  }, [router]);

  function openCreate() {
    setEditingItem(null);
    setFormInicio('');
    setFormFim('');
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(item: Horario) {
    setEditingItem(item);
    setFormInicio(formatTime(item.hora_inicio));
    setFormFim(formatTime(item.hora_fim));
    setFormError('');
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formInicio || !formFim) {
      setFormError('Hora de início e fim são obrigatórias.');
      return;
    }
    if (formFim <= formInicio) {
      setFormError('Hora fim deve ser após a hora início.');
      return;
    }
    const token = getToken();
    if (!token) return;

    setFormLoading(true);
    setFormError('');
    try {
      const payload = { hora_inicio: formInicio, hora_fim: formFim };
      const url = editingItem ? `/api/horarios/${editingItem.id_horario}` : '/api/horarios';
      const method = editingItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || 'Erro ao salvar.'); return; }

      setModalOpen(false);
      setToast({ message: editingItem ? 'Horário atualizado!' : 'Horário criado!', type: 'success' });
      fetchData();
    } catch {
      setFormError('Erro de conexão.');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(item: Horario) {
    if (!confirm(`Excluir o horário ${formatTime(item.hora_inicio)} - ${formatTime(item.hora_fim)}?`)) return;
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`/api/horarios/${item.id_horario}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        setToast({ message: data.error || 'Erro ao excluir.', type: 'error' });
        return;
      }
      setToast({ message: 'Horário excluído.', type: 'success' });
      fetchData();
    } catch {
      setToast({ message: 'Erro de conexão.', type: 'error' });
    }
  }

  function calcDuration(): string {
    if (!formInicio || !formFim || formFim <= formInicio) return '';
    const [h1, m1] = formInicio.split(':').map(Number);
    const [h2, m2] = formFim.split(':').map(Number);
    const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (mins <= 0) return '';
    return `${Math.floor(mins / 60)}h ${mins % 60}min`;
  }

  const duration = calcDuration();

  return (
    <div className="animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="sticky top-0 z-10 bg-slate-50 py-4 border-b border-slate-200/50 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Horários</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Defina os blocos de horário disponíveis</p>
        </div>
        <div className="flex items-center gap-3">
          {!loading && (
            <span className="badge" style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}>
              {horarios.length} horários
            </span>
          )}
          <button onClick={openCreate} className="btn-primary">
            <Plus className="w-4 h-4 inline mr-1" /> Novo Horário
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <div className="overflow-x-auto w-full">
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  {['ID', 'Hora Início', 'Hora Fim', 'Ações'].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--muted)', background: 'rgba(0,0,0,0.02)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                ) : horarios.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-4xl"><Clock className="w-12 h-12 mb-3 text-slate-300 mx-auto" /></span>
                        <p className="font-medium" style={{ color: 'var(--muted)' }}>Nenhum horário cadastrado</p>
                        <button onClick={openCreate} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                          <Plus className="w-4 h-4 inline mr-1" /> Adicionar horário
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  horarios.map(item => (
                    <tr key={item.id_horario}
                      style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc'}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                    >
                      <td className="px-6 py-4 text-sm font-mono" style={{ color: 'var(--muted)' }}>#{item.id_horario}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold font-mono" style={{ color: '#1e3a8a' }}>
                          {formatTime(item.hora_inicio)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold font-mono" style={{ color: '#991b1b' }}>
                          {formatTime(item.hora_fim)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(item)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}
                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#dbeafe'}
                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#eff6ff'}>
                            <Edit2 className="w-4 h-4 inline mr-1" /> Editar
                          </button>
                          <button onClick={() => handleDelete(item)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}
                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#fee2e2'}
                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'}>
                            <Trash2 className="w-4 h-4 inline mr-1" /> Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Editar Horário' : 'Novo Horário'} size="sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && (
            <div className="p-3 rounded-lg text-sm"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
              {formError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="hora-inicio" className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>
                Hora Início
              </label>
              <input
                id="hora-inicio"
                type="time"
                value={formInicio}
                onChange={e => setFormInicio(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label htmlFor="hora-fim" className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>
                Hora Fim
              </label>
              <input
                id="hora-fim"
                type="time"
                value={formFim}
                onChange={e => setFormFim(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          {duration && (
            <div className="p-3 rounded-lg text-sm"
              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' }}>
              ✓ Duração: {duration}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium"
              style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>
              Cancelar
            </button>
            <button type="submit" disabled={formLoading} className="btn-primary flex-1 justify-center">
              {formLoading ? (
                <><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56" /></svg> Salvando...</>
              ) : (editingItem ? 'Salvar' : 'Criar Horário')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
