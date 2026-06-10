'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [perfil, setPerfil] = useState<'admin' | 'professor'>('professor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!nome.trim()) errors.nome = 'Nome é obrigatório.';
    if (!email.trim()) errors.email = 'E-mail é obrigatório.';
    if (!senha) errors.senha = 'Senha é obrigatória.';
    else if (senha.length < 6) errors.senha = 'Senha deve ter ao menos 6 caracteres.';
    if (!confirmarSenha) errors.confirmarSenha = 'Confirmação de senha é obrigatória.';
    else if (senha !== confirmarSenha) errors.confirmarSenha = 'As senhas não coincidem.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, perfil }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao criar conta.');
        return;
      }

      router.push('/');
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative bg-slate-50 text-slate-800">
      <div className="w-full max-w-md px-6 py-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-red-800 text-white shadow-sm">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-slate-800">PucHub</h1>
          <p className="text-slate-600 text-sm">Criar nova conta</p>
        </div>

        <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-8">
          <h2 className="text-xl font-semibold mb-6 text-slate-800">
            Cadastro de Usuário
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div>
              <label htmlFor="nome" className="block text-sm font-medium mb-2 text-slate-700">
                Nome completo
              </label>
              <input
                id="nome"
                type="text"
                autoComplete="name"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Seu nome completo"
                className="input-field"
                aria-describedby={fieldErrors.nome ? 'nome-error' : undefined}
              />
              {fieldErrors.nome && (
                <p id="nome-error" className="mt-1 text-xs" style={{ color: '#f87171' }}>{fieldErrors.nome}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-slate-700">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.edu.br"
                className="input-field"
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              />
              {fieldErrors.email && (
                <p id="email-error" className="mt-1 text-xs" style={{ color: '#f87171' }}>{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="perfil" className="block text-sm font-medium mb-2 text-slate-700">
                Perfil
              </label>
              <select
                id="perfil"
                value={perfil}
                onChange={e => setPerfil(e.target.value as 'admin' | 'professor')}
                className="input-field"
                style={{ cursor: 'pointer' }}
              >
                <option value="professor">Professor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div>
              <label htmlFor="senha" className="block text-sm font-medium mb-2 text-slate-700">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                autoComplete="new-password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="⬢⬢⬢⬢⬢⬢⬢⬢"
                className="input-field"
                aria-describedby={fieldErrors.senha ? 'senha-error' : undefined}
              />
              {fieldErrors.senha && (
                <p id="senha-error" className="mt-1 text-xs" style={{ color: '#f87171' }}>{fieldErrors.senha}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmarSenha" className="block text-sm font-medium mb-2 text-slate-700">
                Confirmar senha
              </label>
              <input
                id="confirmarSenha"
                type="password"
                autoComplete="new-password"
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
                placeholder="⬢⬢⬢⬢⬢⬢⬢⬢"
                className="input-field"
                aria-describedby={fieldErrors.confirmarSenha ? 'confirmarSenha-error' : undefined}
              />
              {fieldErrors.confirmarSenha && (
                <p id="confirmarSenha-error" className="mt-1 text-xs" style={{ color: '#f87171' }}>{fieldErrors.confirmarSenha}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2 py-3 bg-red-800 hover:bg-red-900 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Criando conta...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                  Criar conta
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-slate-600">
          Já tem uma conta?{' '}
          <a href="/" className="font-medium text-red-800 hover:text-red-900">
            Entrar
          </a>
        </p>
      </div>
    </main>
  );
}
