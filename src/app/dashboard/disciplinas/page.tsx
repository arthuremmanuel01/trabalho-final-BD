'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import { Edit2, Trash2, Plus, Calendar, GraduationCap, BookOpen, Users, UsersRound, School, Clock, FileText, LayoutDashboard, Menu, X, LogOut, Rocket, Hand } from 'lucide-react';

interface Curso {
  id_curso: number;
  nome: string;
  sigla: string;
}

interface Disciplina {
  id_disciplina: number;
  nome: string;
  carga_horaria: number;
  periodo_ideal: number;
  id_curso: number;
  curso?: Curso;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'warning';
}

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 rounded animate-pulse" style={{ background: 'rgba(0,0,0,0.07)' }} />
        </td>
      ))}
    </tr>
  );
}

export default function DisciplinasPage() {
  const router = useRouter();
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Disciplina | null>(null);
  const [formNome, setFormNome] = useState('');
  const [formIdCurso, setFormIdCurso] = useState('');
  const [formCargaHoraria, setFormCargaHoraria] = useState('');
  const [formPeriodoIdeal, setFormPeriodoIdeal] = useState('');
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
      const [disciplinasRes, cursosRes] = await Promise.all([
        fetch('/api/disciplinas', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/cursos', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (disciplinasRes.status === 401) { router.push('/'); return; }
      const disciplinasData = await disciplinasRes.json();
      const cursosData = await cursosRes.json();
      setDisciplinas(Array.isArray(disciplinasData) ? disciplinasData : []);
      setCursos(Array.isArray(cursosData) ? cursosData : []);
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
    setFormNome('');
    setFormIdCurso(cursos[0]?.id_curso?.toString() ?? '');
    setFormCargaHoraria('');
    setFormPeriodoIdeal('');
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(item: Disciplina) {
    setEditingItem(item);
    setFormNome(item.nome);
    setFormIdCurso(item.id_curso.toString());
    setFormCargaHoraria(item.carga_horaria.toString());
    setFormPeriodoIdeal(item.periodo_ideal.toString());
    setFormError('');
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formNome.trim() || !formIdCurso || !formCargaHoraria || !formPeriodoIdeal) {
      setFormError('Todos os campos são obrigatórios.');
      return;
    }
    const token = getToken();
    if (!token) return;

    setFormLoading(true);
    setFormError('');
    try {
      const payload = {
        nome: formNome.trim(),
        id_curso: Number(formIdCurso),
        carga_horaria: Number(formCargaHoraria),
        periodo_ideal: Number(formPeriodoIdeal),
      };
      const url = editingItem ? `/api/disciplinas/${editingItem.id_disciplina}` : '/api/disciplinas';
      const method = editingItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || 'Erro ao salvar.'); return; }

      setModalOpen(false);
      setToast({ message: editingItem ? 'Disciplina atualizada!' : 'Disciplina criada!', type: 'success' });
      fetchData();
    } catch {
      setFormError('Erro de conexão.');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(item: Disciplina) {
    if (!confirm(`Excluir a disciplina "${item.nome}"?`)) return;
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`/api/disciplinas/${item.id_disciplina}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        setToast({ message: data.error || 'Erro ao excluir.', type: 'error' });
        return;
      }
      setToast({ message: 'Disciplina excluída.', type: 'success' });
      fetchData();
    } catch {
      setToast({ message: 'Erro de conexão.', type: 'error' });
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="sticky top-0 z-10 bg-slate-50 py-4 border-b border-slate-200/50 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Disciplinas</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Gerencie as disciplinas dos cursos</p>
        </div>
        <div className="flex items-center gap-3">
          {!loading && (
            <span className="badge" style={{ background: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe' }}>
              {disciplinas.length} disciplinas
            </span>
          )}
          <button onClick={openCreate} className="btn-primary">
            <Plus className="w-4 h-4 inline mr-1" /> Nova Disciplina
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <div className="overflow-x-auto w-full">
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  {['ID', 'Nome', 'Curso', 'Carga Horária', 'Período Ideal', 'Ações'].map(h => (
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
                ) : disciplinas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-4xl"><BookOpen className="w-12 h-12 mb-3 text-slate-300 mx-auto" /></span>
                        <p className="font-medium" style={{ color: 'var(--muted)' }}>Nenhuma disciplina cadastrada</p>
                        <button onClick={openCreate} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                          <Plus className="w-4 h-4 inline mr-1" /> Adicionar disciplina
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  disciplinas.map(item => (
                    <tr key={item.id_disciplina}
                      style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc'}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                    >
                      <td className="px-6 py-4 text-sm font-mono" style={{ color: 'var(--muted)' }}>#{item.id_disciplina}</td>
                      <td className="px-6 py-4 text-sm font-medium">{item.nome}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="badge" style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}>
                          {item.curso?.sigla ?? `#${item.id_curso}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'var(--foreground)' }}>{item.carga_horaria}h</td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'var(--foreground)' }}>{item.periodo_ideal}º</td>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Editar Disciplina' : 'Nova Disciplina'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && (
            <div className="p-3 rounded-lg text-sm"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
              {formError}
            </div>
          )}
          <div>
            <label htmlFor="disc-nome" className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Nome da Disciplina</label>
            <input id="disc-nome" type="text" value={formNome} onChange={e => setFormNome(e.target.value)}
              placeholder="Ex: Cálculo I" className="input-field" required />
          </div>
          <div>
            <label htmlFor="disc-curso" className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Curso</label>
            <select id="disc-curso" value={formIdCurso} onChange={e => setFormIdCurso(e.target.value)}
              className="input-field" style={{ cursor: 'pointer' }} required>
              <option value="" className="bg-white text-slate-800">Selecione um curso...</option>
              {cursos.map(c => (
                <option key={c.id_curso} value={c.id_curso} className="bg-white text-slate-800">{c.nome} ({c.sigla})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="disc-carga" className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Carga Horária (h)</label>
              <input id="disc-carga" type="number" min="1" value={formCargaHoraria} onChange={e => setFormCargaHoraria(e.target.value)}
                placeholder="60" className="input-field" required />
            </div>
            <div>
              <label htmlFor="disc-periodo" className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Período Ideal</label>
              <input id="disc-periodo" type="number" min="1" max="10" value={formPeriodoIdeal} onChange={e => setFormPeriodoIdeal(e.target.value)}
                placeholder="1" className="input-field" required />
            </div>
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
              ) : (editingItem ? 'Salvar' : 'Criar Disciplina')}
            </button>
          </div>
        </form>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
