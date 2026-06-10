'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import { Edit2, Trash2, Plus, Calendar, GraduationCap, BookOpen, Users, UsersRound, School, Clock, FileText, LayoutDashboard, Menu, X, LogOut, Rocket, Hand } from 'lucide-react';

interface Disciplina { id_disciplina: number; nome: string; curso?: { sigla: string }; }
interface Professor { id_professor: number; usuario?: { nome: string }; }
interface Turma { id_turma: number; ano: number; semestre: number; disciplina?: Disciplina; professor?: Professor; }
interface ToastState { message: string; type: 'success' | 'error' | 'warning'; }

const emptyForm = { id_disciplina: '', id_professor: '' };

export default function TurmasPage() {
  const router = useRouter();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Turma | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [t, d, p] = await Promise.all([
      fetch('/api/turmas', { headers }).then(r => r.json()),
      fetch('/api/disciplinas', { headers }).then(r => r.json()),
      fetch('/api/professores', { headers }).then(r => r.json()),
    ]);
    setTurmas(Array.isArray(t) ? t : []);
    setDisciplinas(Array.isArray(d) ? d : []);
    setProfessores(Array.isArray(p) ? p : []);
    setLoading(false);
  }, []);

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
  }, [fetchData, router]);

  function openCreate() { setEditing(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(t: Turma) { setEditing(t); setForm({ id_disciplina: String(t.disciplina?.id_disciplina ?? ''), id_professor: String(t.professor?.id_professor ?? '') }); setModalOpen(true); }

  async function handleSave() {
    if (!form.id_disciplina || !form.id_professor) {
      setToast({ message: 'Preencha todos os campos.', type: 'error' }); return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/turmas/${editing.id_turma}` : '/api/turmas';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify({ id_disciplina: Number(form.id_disciplina), id_professor: Number(form.id_professor), ano: new Date().getFullYear(), semestre: 1 }) });
      const data = await res.json();
      if (!res.ok) { setToast({ message: data.error, type: 'error' }); return; }
      setToast({ message: editing ? 'Turma atualizada!' : 'Turma criada!', type: 'success' });
      setModalOpen(false); fetchData();
    } finally { setSaving(false); }
  }

  async function handleDelete(t: Turma) {
    if (!confirm(`Remover turma #${t.id_turma}? As alocações vinculadas também serão removidas.`)) return;
    const res = await fetch(`/api/turmas/${t.id_turma}`, { method: 'DELETE', headers });
    const data = await res.json();
    if (!res.ok) { setToast({ message: data.error, type: 'error' }); return; }
    setToast({ message: 'Turma removida.', type: 'success' }); fetchData();
  }

  return (
    <div className="animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="sticky top-0 z-10 bg-slate-50 py-4 border-b border-slate-200/50 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Turmas</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{turmas.length} turma(s) cadastrada(s)</p>
        </div>
        <button onClick={openCreate} className="btn-primary" id="btn-nova-turma"><Plus className="w-4 h-4 inline mr-1" /> Nova Turma</button>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex flex-col gap-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'rgba(0,0,0,0.05)' }} />)}</div>
        ) : turmas.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--muted)' }}><p className="text-4xl mb-3"><UsersRound className="w-12 h-12 mb-3 text-slate-300 mx-auto" /></p><p>Nenhuma turma cadastrada</p></div>
        ) : (
          <div className="overflow-x-auto w-full">
<table className="w-full text-sm">
              <thead><tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                {['ID', 'Disciplina', 'Curso', 'Professor', 'Ações'].map(h => <th key={h} className="text-left pb-3 pr-4 font-semibold" style={{ color: 'var(--muted)' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {turmas.map(t => (
                  <tr key={t.id_turma} className="border-b transition-colors" style={{ borderColor: 'rgba(0,0,0,0.04)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td className="py-3 pr-4" style={{ color: 'var(--muted)' }}>#{t.id_turma}</td>
                    <td className="py-3 pr-4 font-medium">{t.disciplina?.nome ?? '—'}</td>
                    <td className="py-3 pr-4"><span className="badge badge-professor">{t.disciplina?.curso?.sigla ?? '—'}</span></td>
                    <td className="py-3 pr-4">{t.professor?.usuario?.nome ?? '—'}</td>

                    <td className="py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(t)} className="px-3 py-1 rounded-lg text-xs" style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}><Edit2 className="w-4 h-4 inline mr-1" /> Editar</button>
                        <button onClick={() => handleDelete(t)} className="px-3 py-1 rounded-lg text-xs" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}><Trash2 className="w-4 h-4 inline mr-1" /> Remover</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Turma' : 'Nova Turma'} size="md">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>Disciplina</label>
            <select className="input-field" value={form.id_disciplina} onChange={e => setForm(f => ({ ...f, id_disciplina: e.target.value }))}>
              <option value="">Selecione a disciplina</option>
              {disciplinas.map(d => <option key={d.id_disciplina} value={d.id_disciplina}>[{d.curso?.sigla}] {d.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>Professor Responsável</label>
            <select className="input-field" value={form.id_professor} onChange={e => setForm(f => ({ ...f, id_professor: e.target.value }))}>
              <option value="">Selecione o professor</option>
              {professores.map(p => <option key={p.id_professor} value={p.id_professor}>{p.usuario?.nome ?? `Prof. #${p.id_professor}`}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
            <button onClick={() => setModalOpen(false)} className="flex-1 py-2 rounded-lg text-sm" style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569' }}>Cancelar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
