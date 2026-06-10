'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Info } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao realizar login.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      router.push('/dashboard');
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative bg-slate-50 text-slate-800">
      <div className="w-full max-w-md px-6 animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-red-800 text-white shadow-sm">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-slate-800">PucHub</h1>
          <p className="text-slate-600 text-sm">
            Sistema de Gestão de Horários Acadêmicos
          </p>
        </div>

        <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 text-slate-800">
            Entrar no sistema
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-slate-700">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.edu.br"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="senha" className="block text-sm font-medium mb-2 text-slate-700">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                autoComplete="current-password"
                required
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="⬢⬢⬢⬢⬢⬢⬢⬢"
                className="input-field"
              />
            </div>

            <button
              id="btn-login"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2 py-3 bg-red-800 hover:bg-red-900 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Entrando...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Entrar
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
            <p className="text-xs font-semibold mb-2 text-blue-900 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> Credenciais de Demonstração
            </p>
            <div className="flex flex-col gap-1 text-xs text-blue-800">
              <span><strong className="text-slate-800">Admin:</strong> admin@pucminas.com / admin2026</span>
              <span><strong className="text-slate-800">Prof.:</strong> ana@pucminas.com / professor123</span>
            </div>
          </div>
        </div>

        <p className="text-center mt-6 text-xs text-slate-500">
          © 2026 PucHub · Gestão de Horários
        </p>
      </div>
    </main>
  );
}
