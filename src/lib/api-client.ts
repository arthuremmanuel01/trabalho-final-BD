/**
 * Hook utilitário para chamadas API autenticadas no client-side.
 */

export const API_BASE = '';

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null; rule?: string; status: number }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/';
      }
      return { data: null, error: 'Sessão expirada. Faça login novamente.', status: 401 };
    }

    const json = await res.json();

    if (!res.ok) {
      return {
        data: null,
        error: json.error ?? 'Erro desconhecido.',
        rule: json.rule,
        status: res.status,
      };
    }

    return { data: json.data ?? json, error: null, status: res.status };
  } catch (err) {
    console.error('[apiFetch]', err);
    return { data: null, error: 'Erro de conexão com o servidor.', status: 0 };
  }
}
