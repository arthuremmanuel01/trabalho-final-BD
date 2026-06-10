'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, Plus, Calendar, GraduationCap, BookOpen, Users, UsersRound, School, Clock, FileText, LayoutDashboard, Menu, X, LogOut, Rocket, Hand } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

interface Stats {
  isProfessor?: boolean;
  cursos?: number;
  disciplinas?: number;
  professores?: number;
  turmas?: number;
  salas?: number;
  alocacoes?: number;
  cargaHoraria?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [relatorios, setRelatorios] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioStr = localStorage.getItem('usuario');

    if (!token || !usuarioStr) {
      router.push('/');
      return;
    }

    const user = JSON.parse(usuarioStr);
    setUsuario(user);

    fetch('/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {});

    if (user.perfil === 'admin') {
      fetch('/api/relatorios', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => setRelatorios(data))
        .catch(() => {});
    }
  }, [router]);

  const pieData = useMemo(() => {
    if (!relatorios?.turmasPorPeriodo) return [];
    return relatorios.turmasPorPeriodo.reduce((acc: any[], curr: any) => {
      const period = curr.periodo_ideal + 'º Período';
      const existing = acc.find((item: any) => item.name === period);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: period, value: 1 });
      }
      return acc;
    }, []);
  }, [relatorios?.turmasPorPeriodo]);

  const COLORS = ['#1e40af', '#047857', '#b45309', '#7e22ce', '#991b1b', '#0e7490', '#4338ca', '#a16207', '#166534', '#6d28d9'];

  function formatarNomeProfessor(nome: string) {
    if (nome.includes('A Definir')) return 'A Definir';
    const partes = nome.split(' ');
    if (partes.length === 1) return partes[0];
    return `${partes[0]} ${partes[partes.length - 1]}`;
  }

  const professoresData = useMemo(() => {
    if (!relatorios?.professoresMaisDe40Horas) return [];
    return relatorios.professoresMaisDe40Horas.map((p: any) => ({
      ...p,
      nome_curto: formatarNomeProfessor(p.nome)
    }));
  }, [relatorios?.professoresMaisDe40Horas]);

  if (!usuario) return null;

  const cards = stats?.isProfessor ? [
    { label: 'Minhas Turmas', value: stats?.turmas ?? '—', icon: <UsersRound className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Minhas Disciplinas', value: stats?.disciplinas ?? '—', icon: <BookOpen className="w-5 h-5" />, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Minhas Alocações/Aulas', value: stats?.alocacoes ?? '—', icon: <Calendar className="w-5 h-5" />, color: 'text-rose-600', bg: 'bg-rose-100' },
    { label: 'Carga Horária Semanal', value: stats?.cargaHoraria !== undefined ? `${stats.cargaHoraria} horas` : '—', icon: <Clock className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-100' },
  ] : [
    { label: 'Cursos', value: stats?.cursos ?? '—', icon: <GraduationCap className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Disciplinas', value: stats?.disciplinas ?? '—', icon: <BookOpen className="w-5 h-5" />, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Professores', value: stats?.professores ?? '—', icon: <Users className="w-5 h-5" />, color: 'text-cyan-600', bg: 'bg-cyan-100' },
    { label: 'Turmas', value: stats?.turmas ?? '—', icon: <UsersRound className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Salas', value: stats?.salas ?? '—', icon: <School className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Alocações', value: stats?.alocacoes ?? '—', icon: <Calendar className="w-5 h-5" />, color: 'text-rose-600', bg: 'bg-rose-100' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1 text-slate-800">
          Olá, <span className="text-red-800">{usuario.nome.split(' ')[0]}</span> 
        </h1>
        <p className="text-slate-600 text-sm">
          Aqui está um resumo do sistema acadêmico.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card, i) => (
          <div key={i} className="card animate-fade-in flex flex-col justify-between" style={{ animationDelay: `${i * 0.07}s` }}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${card.bg}`}>
                {card.icon}
              </div>
            </div>
            <div>
              <p className={`text-3xl font-bold mb-1 ${card.color}`}>{card.value}</p>
              <p className="text-sm text-slate-500 font-medium">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {usuario.perfil === 'admin' && relatorios && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="card shadow-sm border-gray-200">
            <h2 className="text-base font-bold mb-4 text-[#991b1b] border-b pb-2">Oferta de Turmas por Curso (Apenas Cursos com mais de 2 Turmas Ativas)</h2>
            <div className="w-full h-64 mt-4">
              {relatorios.cursosMaisDeDuasTurmas?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={relatorios.cursosMaisDeDuasTurmas} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="sigla" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="total_turmas" fill="#991b1b" radius={[4, 4, 0, 0]} name="Total de Turmas" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-center py-4 text-gray-500">Nenhum resultado</p>}
            </div>
          </div>

          <div className="card shadow-sm border-gray-200">
            <h2 className="text-base font-bold mb-4 text-[#1e3a8a] border-b pb-2">Professores com Maior Carga Horária Alocada (Acima de 40 Horas Semanais)</h2>
            <div className="w-full h-64 mt-4">
              {professoresData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={professoresData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="nome_curto" type="category" tick={{ fontSize: 12 }} width={140} />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="total_horas" fill="#1e3a8a" radius={[0, 4, 4, 0]} name="Total de Horas" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-center py-4 text-gray-500">Nenhum resultado</p>}
            </div>
          </div>

          <div className="card shadow-sm border-gray-200 lg:col-span-2">
            <h2 className="text-base font-bold mb-4 text-[#991b1b] border-b pb-2">Proporção de Turmas Ofertadas por Período Ideal</h2>
            <div className="w-full h-56">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}>
                      {pieData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-center py-4 text-gray-500">Nenhum resultado</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
