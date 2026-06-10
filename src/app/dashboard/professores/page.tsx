'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import { Edit2, Trash2, Plus, Calendar, GraduationCap, BookOpen, Users, UsersRound, School, Clock, FileText, LayoutDashboard, Menu, X, LogOut, Rocket, Hand } from 'lucide-react';

interface Usuario { id_usuario: number; nome: string; email: string; perfil: string; }
interface Professor { id_professor: number; matricula: string; titulacao: string; usuario?: Usuario; }
interface ToastState { message: string; type: 'success' | 'error' | 'warning'; }

const titulacoes = ['Especialista', 'Mestre', 'Doutor', 'Pós-Doutor'];
const emptyForm = { id_usuario: '', matricula: '', titulacao: '', novoNome: '', novoEmail: '' };

export default function ProfessoresPage() {
  const router = useRouter();
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Professor | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [createMode, setCreateMode] = useState<'existing'|'new'>('existing');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [p, u] = await Promise.all([
      fetch('/api/professores', { headers }).then(r => r.json()),
      fetch('/api/usuarios', { headers }).then(r => r.json()),
    ]);
    setProfessores(Array.isArray(p) ? p : []);
    setUsuarios(Array.isArray(u) ? u : []);
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

  // Only show users that are professors and don't already have a professor record
  const professorUserIds = professores.map(p => p.usuario?.id_usuario);
  const availableUsers = usuarios.filter(u => u.perfil === 'professor' && !professorUserIds.includes(u.id_usuario));

  function openCreate() { setEditing(null); setCreateMode('existing'); setForm(emptyForm); setModalOpen(true); }
  function openEdit(p: Professor) { setEditing(p); setForm({ id_usuario: String(p.usuario?.id_usuario ?? ''), matricula: p.matricula, titulacao: p.titulacao, novoNome: '', novoEmail: '' }); setModalOpen(true); }

  async function handleSave() {
    if (!form.matricula || !form.titulacao) {
      setToast({ message: 'Preencha todos os campos obrigatórios.', type: 'error' }); return;
    }
    if (!editing) {
      if (createMode === 'existing' && !form.id_usuario) { setToast({ message: 'Selecione um usuário.', type: 'error' }); return; }
      if (createMode === 'new' && (!form.novoNome || !form.novoEmail)) { setToast({ message: 'Preencha nome e email do novo usuário.', type: 'error' }); return; }
    }
    setSaving(true);
    try {
      let finalUserId = Number(form.id_usuario);
      if (!editing && createMode === 'new') {
        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: form.novoNome, email: form.novoEmail, senha: 'professor123', perfil: 'professor' })
        });
        const regData = await regRes.json();
        if (!regRes.ok) { setToast({ message: regData.error || 'Erro ao criar usuário.', type: 'error' }); setSaving(false); return; }
        finalUserId = regData.usuario.id_usuario;
      }

      const url = editing ? `/api/professores/${editing.id_professor}` : '/api/professores';
      const method = editing ? 'PUT' : 'POST';
      const body = editing ? { matricula: form.matricula, titulacao: form.titulacao } : { matricula: form.matricula, titulacao: form.titulacao, id_usuario: finalUserId };
      const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setToast({ message: data.error, type: 'error' }); return; }
      setToast({ message: editing ? 'Professor atualizado!' : 'Professor criado!', type: 'success' });
      setModalOpen(false); fetchData();
    } finally { setSaving(false); }
  }

  async function handleDelete(p: Professor) {
    if (!confirm(`Remover professor "${p.usuario?.nome}"?`)) return;
    const res = await fetch(`/api/professores/${p.id_professor}`, { method: 'DELETE', headers });
    const data = await res.json();
    if (!res.ok) { setToast({ message: data.error, type: 'error' }); return; }
    setToast({ message: 'Professor removido.', type: 'success' }); fetchData();
  }

  return (
    <div className="animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="sticky top-0 z-10 bg-slate-50 py-4 border-b border-slate-200/50 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Professores</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{professores.length} professor(es) cadastrado(s)</p>
        </div>
        <button onClick={openCreate} className="btn-primary" id="btn-novo-professor"><Plus className="w-4 h-4 inline mr-1" /> Novo Professor</button>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex flex-col gap-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'rgba(0,0,0,0.05)' }} />)}</div>
        ) : professores.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--muted)' }}><p className="text-4xl mb-3"><Users className="w-12 h-12 mb-3 text-slate-300 mx-auto" /></p><p>Nenhum professor cadastrado</p></div>
        ) : (
          <div className="overflow-x-auto w-full">
<table className="w-full text-sm">
              <thead><tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                {['ID', 'Nome', 'Email', 'Matrícula', 'Titulação', 'Ações'].map(h => <th key={h} className="text-left pb-3 pr-4 font-semibold" style={{ color: 'var(--muted)' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {professores.map(p => (
                  <tr key={p.id_professor} className="border-b transition-colors" style={{ borderColor: 'rgba(0,0,0,0.04)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td className="py-3 pr-4" style={{ color: 'var(--muted)' }}>#{p.id_professor}</td>
                    <td className="py-3 pr-4 font-medium">{p.usuario?.nome ?? '—'}</td>
                    <td className="py-3 pr-4" style={{ color: 'var(--muted)' }}>{p.usuario?.email ?? '—'}</td>
                    <td className="py-3 pr-4"><code className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.07)' }}>{p.matricula}</code></td>
                    <td className="py-3 pr-4"><span className="badge badge-professor">{p.titulacao}</span></td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="px-3 py-1 rounded-lg text-xs" style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}><Edit2 className="w-4 h-4 inline mr-1" /> Editar</button>
                        <button onClick={() => handleDelete(p)} className="px-3 py-1 rounded-lg text-xs" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}><Trash2 className="w-4 h-4 inline mr-1" /> Remover</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Professor' : 'Novo Professor'}>
        <div className="flex flex-col gap-4">
          {!editing && (
            <div className="flex flex-col gap-3">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${createMode === 'existing' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setCreateMode('existing')}
                >Selecionar Existente</button>
                <button
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${createMode === 'new' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setCreateMode('new')}
                >Criar Novo Usuário</button>
              </div>

              {createMode === 'existing' ? (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>Usuário (Perfil: Professor)</label>
                  <select className="input-field" value={form.id_usuario} onChange={e => setForm(f => ({ ...f, id_usuario: e.target.value }))}>
                    <option value="">Selecione um usuário</option>
                    {availableUsers.map(u => <option key={u.id_usuario} value={u.id_usuario}>{u.nome} — {u.email}</option>)}
                  </select>
                  {availableUsers.length === 0 && <p className="text-xs mt-1" style={{ color: 'var(--warning)' }}>Todos os usuários com perfil professor já têm registro.</p>}
                </div>
              ) : (
                <div className="grid gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>Nome Completo</label>
                    <input className="input-field" placeholder="Ex: João da Silva" value={form.novoNome} onChange={e => setForm(f => ({ ...f, novoNome: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>E-mail</label>
                    <input type="email" className="input-field" placeholder="Ex: joao@pucminas.com" value={form.novoEmail} onChange={e => setForm(f => ({ ...f, novoEmail: e.target.value }))} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">A senha padrão "professor123" será definida para o novo usuário.</p>
                </div>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>Matrícula</label>
            <input className="input-field" placeholder="Ex: MAT006" value={form.matricula} onChange={e => setForm(f => ({ ...f, matricula: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>Titulação</label>
            <select className="input-field" value={form.titulacao} onChange={e => setForm(f => ({ ...f, titulacao: e.target.value }))}>
              <option value="">Selecione</option>
              {titulacoes.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
            <button onClick={() => setModalOpen(false)} className="flex-1 py-2 rounded-lg text-sm" style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid var(--card-border)', color: 'var(--muted)' }}>Cancelar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
