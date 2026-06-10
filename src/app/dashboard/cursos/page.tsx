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

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'warning';
}

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4].map(i => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 rounded animate-pulse" style={{ background: 'rgba(0,0,0,0.07)', width: i === 4 ? '80px' : '100%' }} />
        </td>
      ))}
    </tr>
  );
}

export default function CursosPage() {
  const router = useRouter();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);
  const [formNome, setFormNome] = useState('');
  const [formSigla, setFormSigla] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState<ToastState | null>(null);

  function getToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/'); return null; }
    return token;
  }

  async function fetchCursos() {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/cursos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { router.push('/'); return; }
      const data = await res.json();
      setCursos(Array.isArray(data) ? data : []);
    } catch {
      setToast({ message: 'Erro ao carregar cursos.', type: 'error' });
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
    fetchCursos(); 
  }, [router]);

  function openCreate() {
    setEditingCurso(null);
    setFormNome('');
    setFormSigla('');
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(curso: Curso) {
    setEditingCurso(curso);
    setFormNome(curso.nome);
    setFormSigla(curso.sigla);
    setFormError('');
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formNome.trim() || !formSigla.trim()) {
      setFormError('Todos os campos são obrigatórios.');
      return;
    }
    const token = getToken();
    if (!token) return;

    setFormLoading(true);
    setFormError('');
    try {
      const url = editingCurso ? `/api/cursos/${editingCurso.id_curso}` : '/api/cursos';
      const method = editingCurso ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: formNome.trim(), sigla: formSigla.trim() }),
      });

      const data = await res.json();
      if (!res.ok) { setFormError(data.error || 'Erro ao salvar curso.'); return; }

      setModalOpen(false);
      setToast({ message: editingCurso ? 'Curso atualizado!' : 'Curso criado com sucesso!', type: 'success' });
      fetchCursos();
    } catch {
      setFormError('Erro de conexão.');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(curso: Curso) {
    if (!confirm(`Excluir o curso "${curso.nome}"? Esta ação não pode ser desfeita.`)) return;
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`/api/cursos/${curso.id_curso}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        setToast({ message: data.error || 'Erro ao excluir curso.', type: 'error' });
        return;
      }
      setToast({ message: 'Curso excluído.', type: 'success' });
      fetchCursos();
    } catch {
      setToast({ message: 'Erro de conexão.', type: 'error' });
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="sticky top-0 z-10 bg-slate-50 py-4 border-b border-slate-200/50 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Cursos</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Gerencie os cursos acadêmicos</p>
        </div>
        <div className="flex items-center gap-3">
          {!loading && (
            <span className="badge" style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}>
              {cursos.length} {cursos.length === 1 ? 'curso' : 'cursos'}
            </span>
          )}
          <button onClick={openCreate} className="btn-primary">
            <span>+</span> Novo Curso
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <div className="overflow-x-auto w-full">
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  {['ID', 'Nome', 'Sigla', 'Ações'].map(h => (
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
                ) : cursos.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-4xl"><GraduationCap className="w-12 h-12 mb-3 text-slate-300 mx-auto" /></span>
                        <p className="font-medium" style={{ color: 'var(--muted)' }}>Nenhum curso cadastrado</p>
                        <button onClick={openCreate} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                          <Plus className="w-4 h-4 inline mr-1" /> Adicionar primeiro curso
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  cursos.map(curso => (
                    <tr key={curso.id_curso} className="transition-colors"
                      style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc'}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                    >
                      <td className="px-6 py-4 text-sm font-mono" style={{ color: 'var(--muted)' }}>#{curso.id_curso}</td>
                      <td className="px-6 py-4 text-sm font-medium">{curso.nome}</td>
                      <td className="px-6 py-4">
                        <span className="badge" style={{ background: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe' }}>
                          {curso.sigla}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(curso)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            title="Editar"
                            style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}
                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#dbeafe'}
                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#eff6ff'}
                          >
                            <Edit2 className="w-4 h-4 inline mr-1" /> Editar
                          </button>
                          <button onClick={() => handleDelete(curso)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            title="Excluir"
                            style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}
                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#fee2e2'}
                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'}
                          >
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCurso ? 'Editar Curso' : 'Novo Curso'} size="sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && (
            <div className="p-3 rounded-lg text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
              {formError}
            </div>
          )}
          <div>
            <label htmlFor="curso-nome" className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Nome do Curso</label>
            <input id="curso-nome" type="text" value={formNome} onChange={e => setFormNome(e.target.value)}
              placeholder="Ex: Engenharia de Software" className="input-field" required />
          </div>
          <div>
            <label htmlFor="curso-sigla" className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Sigla</label>
            <input id="curso-sigla" type="text" value={formSigla} onChange={e => setFormSigla(e.target.value)}
              placeholder="Ex: ES" className="input-field" required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all"
              style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--muted)', border: '1px solid var(--card-border)' }}>
              Cancelar
            </button>
            <button type="submit" disabled={formLoading} className="btn-primary flex-1 justify-center">
              {formLoading ? (
                <><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56" /></svg> Salvando...</>
              ) : (editingCurso ? 'Salvar Alterações' : 'Criar Curso')}
            </button>
          </div>
        </form>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
