'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import { Edit2, Trash2, Plus, Calendar, GraduationCap, BookOpen, Users, UsersRound, School, Clock, FileText, LayoutDashboard, Menu, X, LogOut, Rocket, Hand } from 'lucide-react';

interface TipoSala {
  id_tipo_sala: number;
  descricao_tipo: string;
}

interface Sala {
  id_sala: number;
  numero: string;
  capacidade: number;
  id_tipo_sala: number;
  tipo?: TipoSala;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'warning';
}

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5].map(i => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 rounded animate-pulse" style={{ background: 'rgba(0,0,0,0.07)' }} />
        </td>
      ))}
    </tr>
  );
}

export default function SalasPage() {
  const router = useRouter();
  const [salas, setSalas] = useState<Sala[]>([]);
  const [tiposSala, setTiposSala] = useState<TipoSala[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Sala | null>(null);
  const [formNumero, setFormNumero] = useState('');
  const [formIdTipoSala, setFormIdTipoSala] = useState('');
  const [formCapacidade, setFormCapacidade] = useState('');
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
      const [salasRes, tiposRes] = await Promise.all([
        fetch('/api/salas', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/tipos-sala', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (salasRes.status === 401) { router.push('/'); return; }
      const salasData = await salasRes.json();
      const tiposData = await tiposRes.json();
      setSalas(Array.isArray(salasData) ? salasData : []);
      setTiposSala(Array.isArray(tiposData) ? tiposData : []);
    } catch {
      setToast({ message: 'Erro ao carregar dados.', type: 'error' });
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
    setFormNumero('');
    setFormIdTipoSala(tiposSala[0]?.id_tipo_sala?.toString() ?? '');
    setFormCapacidade('');
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(item: Sala) {
    setEditingItem(item);
    setFormNumero(item.numero);
    setFormIdTipoSala(item.id_tipo_sala.toString());
    setFormCapacidade(item.capacidade.toString());
    setFormError('');
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formNumero.trim() || !formIdTipoSala || !formCapacidade) {
      setFormError('Todos os campos são obrigatórios.');
      return;
    }
    const token = getToken();
    if (!token) return;

    setFormLoading(true);
    setFormError('');
    try {
      const payload = {
        numero: formNumero.trim(),
        id_tipo_sala: Number(formIdTipoSala),
        capacidade: Number(formCapacidade),
      };
      const url = editingItem ? `/api/salas/${editingItem.id_sala}` : '/api/salas';
      const method = editingItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || 'Erro ao salvar.'); return; }

      setModalOpen(false);
      setToast({ message: editingItem ? 'Sala atualizada!' : 'Sala criada!', type: 'success' });
      fetchData();
    } catch {
      setFormError('Erro de conexão.');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(item: Sala) {
    if (!confirm(`Excluir a sala "${item.numero}"?`)) return;
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`/api/salas/${item.id_sala}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        setToast({ message: data.error || 'Erro ao excluir.', type: 'error' });
        return;
      }
      setToast({ message: 'Sala excluída.', type: 'success' });
      fetchData();
    } catch {
      setToast({ message: 'Erro de conexão.', type: 'error' });
    }
  }

  const tipoColors: Record<string, { bg: string; color: string; border: string }> = {
    'Laboratório': { bg: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe' },
    'Auditório': { bg: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' },
    'Sala de Aula': { bg: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' },
    'default': { bg: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' },
  };

  function getTipoStyle(tipoNome?: string) {
    return tipoColors[tipoNome ?? ''] ?? tipoColors.default;
  }

  return (
    <div className="animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="sticky top-0 z-10 bg-slate-50 py-4 border-b border-slate-200/50 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Salas</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Gerencie as salas e laboratórios</p>
        </div>
        <div className="flex items-center gap-3">
          {!loading && (
            <span className="badge" style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>
              {salas.length} salas
            </span>
          )}
          <button onClick={openCreate} className="btn-primary">
            <Plus className="w-4 h-4 inline mr-1" /> Nova Sala
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <div className="overflow-x-auto w-full">
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  {['ID', 'Número', 'Tipo', 'Capacidade', 'Ações'].map(h => (
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
                ) : salas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-4xl"><School className="w-12 h-12 mb-3 text-slate-300 mx-auto" /></span>
                        <p className="font-medium" style={{ color: 'var(--muted)' }}>Nenhuma sala cadastrada</p>
                        <button onClick={openCreate} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                          <Plus className="w-4 h-4 inline mr-1" /> Adicionar sala
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  salas.map(item => {
                    const style = getTipoStyle(item.tipo?.descricao_tipo);
                    return (
                      <tr key={item.id_sala}
                        style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc'}
                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                      >
                        <td className="px-6 py-4 text-sm font-mono" style={{ color: 'var(--muted)' }}>#{item.id_sala}</td>
                        <td className="px-6 py-4 text-sm font-semibold">{item.numero}</td>
                        <td className="px-6 py-4">
                          <span className="badge" style={{ background: style.bg, color: style.color, border: style.border }}>
                            {item.tipo?.descricao_tipo ?? `Tipo #${item.id_tipo_sala}`}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span style={{ color: 'var(--foreground)' }}>{item.capacidade}</span>
                          <span className="ml-1 text-xs" style={{ color: 'var(--muted)' }}>vagas</span>
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Editar Sala' : 'Nova Sala'} size="sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && (
            <div className="p-3 rounded-lg text-sm"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
              {formError}
            </div>
          )}
          <div>
            <label htmlFor="sala-numero" className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Número / Identificador</label>
            <input id="sala-numero" type="text" value={formNumero} onChange={e => setFormNumero(e.target.value)}
              placeholder="Ex: LAB-101 ou SALA-05" className="input-field" required />
          </div>
          <div>
            <label htmlFor="sala-tipo" className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Tipo de Sala</label>
            <select id="sala-tipo" value={formIdTipoSala} onChange={e => setFormIdTipoSala(e.target.value)}
              className="input-field" style={{ cursor: 'pointer' }} required>
              <option value="" className="bg-white text-slate-800">Selecione o tipo...</option>
              {tiposSala.map(t => (
                <option key={t.id_tipo_sala} value={t.id_tipo_sala} className="bg-white text-slate-800">{t.descricao_tipo}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sala-cap" className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Capacidade (vagas)</label>
            <input id="sala-cap" type="number" min="1" value={formCapacidade} onChange={e => setFormCapacidade(e.target.value)}
              placeholder="40" className="input-field" required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium"
              style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>
              Cancelar
            </button>
            <button type="submit" disabled={formLoading} className="btn-primary flex-1 justify-center">
              {formLoading ? (
                <><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56" /></svg> Salvando...</>
              ) : (editingItem ? 'Salvar' : 'Criar Sala')}
            </button>
          </div>
        </form>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
