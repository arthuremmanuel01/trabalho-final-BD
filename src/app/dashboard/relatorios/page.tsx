'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronUp, ChevronDown, ArrowUpDown, SortAsc, SortDesc } from 'lucide-react';

type SortDir = 'asc' | 'desc';
interface SortState { col: string; dir: SortDir; }

function sortData<T>(items: T[], col: string, dir: SortDir): T[] {
  if (!col) return items;
  return [...items].sort((a: any, b: any) => {
    const va = a[col];
    const vb = b[col];
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === 'number' && typeof vb === 'number') {
      return dir === 'asc' ? va - vb : vb - va;
    }
    const sa = String(va).toLowerCase();
    const sb = String(vb).toLowerCase();
    return dir === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa);
  });
}



function SortDropdown({
  options,
  currentSort,
  onSort,
}: {
  options: { label: string; value: string }[];
  currentSort: SortState;
  onSort: (col: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:border-slate-300"
      >
        <ArrowUpDown className="w-4 h-4 text-slate-500" />
        <span className="font-medium text-slate-700">Ordenar</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-100 z-50 overflow-hidden">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onSort(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors flex items-center justify-between ${
                  currentSort.col === opt.value ? 'bg-slate-50 text-slate-900 font-medium' : 'text-slate-600'
                }`}
              >
                {opt.label}
                {currentSort.col === opt.value && (
                  currentSort.dir === 'asc' ? <SortAsc className="w-4 h-4 text-slate-700" /> : <SortDesc className="w-4 h-4 text-slate-700" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function RelatoriosPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filtro1, setFiltro1] = useState('');
  const [filtro2, setFiltro2] = useState('');
  const [filtro5, setFiltro5] = useState('');
  const [filtro6, setFiltro6] = useState('');
  const [filtroV1, setFiltroV1] = useState('');
  const [filtroV2, setFiltroV2] = useState('');
  
  const [diaSelecionado, setDiaSelecionado] = useState('Segunda-feira');

  const [sort1, setSort1] = useState<SortState>({ col: '', dir: 'asc' });
  const [sort2, setSort2] = useState<SortState>({ col: '', dir: 'asc' });
  const [sort5, setSort5] = useState<SortState>({ col: '', dir: 'asc' });
  const [sort6, setSort6] = useState<SortState>({ col: '', dir: 'asc' });
  const [sortV1, setSortV1] = useState<SortState>({ col: '', dir: 'asc' });
  const [sortV2, setSortV2] = useState<SortState>({ col: '', dir: 'asc' });

  const toggleSort = useCallback((setter: React.Dispatch<React.SetStateAction<SortState>>) => {
    return (col: string) => {
      setter(prev => prev.col === col
        ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { col, dir: 'asc' }
      );
    };
  }, []);

  useEffect(() => {
    async function fetchRelatorios() {
      const usuarioStr = localStorage.getItem('usuario');
      if (usuarioStr) {
        try {
          const u = JSON.parse(usuarioStr);
          if (u.perfil === 'professor') {
            router.push('/dashboard');
            return;
          }
        } catch {}
      }

      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/relatorios', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Erro ao carregar relatórios');
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRelatorios();
  }, [router]);

  const f1Filtered = useMemo(() => {
    if (!data?.cursosMaisDeDuasTurmas) return [];
    return data.cursosMaisDeDuasTurmas.filter((item: any) =>
      item.nome?.toLowerCase().includes(filtro1.toLowerCase()) ||
      item.sigla?.toLowerCase().includes(filtro1.toLowerCase())
    );
  }, [data, filtro1]);

  const f2Filtered = useMemo(() => {
    if (!data?.professoresMaisDe40Horas) return [];
    return data.professoresMaisDe40Horas.filter((item: any) =>
      item.nome?.toLowerCase().includes(filtro2.toLowerCase()) ||
      item.matricula?.toLowerCase().includes(filtro2.toLowerCase())
    );
  }, [data, filtro2]);

  const f5Filtered = useMemo(() => {
    if (!data?.salasOcupadas30a50) return [];
    return data.salasOcupadas30a50.filter((item: any) =>
      item.numero?.toLowerCase().includes(filtro5.toLowerCase())
    );
  }, [data, filtro5]);

  const f6Filtered = useMemo(() => {
    if (!data?.turmasPorPeriodo) return [];
    return data.turmasPorPeriodo.filter((item: any) =>
      item.nome?.toLowerCase().includes(filtro6.toLowerCase()) ||
      item.periodo_ideal?.toString().includes(filtro6)
    );
  }, [data, filtro6]);

  const fV1Filtered = useMemo(() => {
    if (!data?.viewTurmasCurso) return [];
    return data.viewTurmasCurso.filter((v: any) => 
      v.curso?.toLowerCase().includes(filtroV1.toLowerCase()) || 
      v.disciplina?.toLowerCase().includes(filtroV1.toLowerCase())
    );
  }, [data, filtroV1]);

  const fV2Filtered = useMemo(() => {
    if (!data?.viewSalasTipo) return [];
    return data.viewSalasTipo.filter((v: any) => 
      v.numero?.toLowerCase().includes(filtroV2.toLowerCase()) || 
      v.tipo?.toLowerCase().includes(filtroV2.toLowerCase())
    );
  }, [data, filtroV2]);

  const f1 = useMemo(() => sortData(f1Filtered, sort1.col, sort1.dir), [f1Filtered, sort1]);
  const f2 = useMemo(() => sortData(f2Filtered, sort2.col, sort2.dir), [f2Filtered, sort2]);
  const f5 = useMemo(() => sortData(f5Filtered, sort5.col, sort5.dir), [f5Filtered, sort5]);
  const f6 = useMemo(() => sortData(f6Filtered, sort6.col, sort6.dir), [f6Filtered, sort6]);
  const fV1 = useMemo(() => sortData(fV1Filtered, sortV1.col, sortV1.dir), [fV1Filtered, sortV1]);
  const fV2 = useMemo(() => sortData(fV2Filtered, sortV2.col, sortV2.dir), [fV2Filtered, sortV2]);

  const statsDia = useMemo(() => {
    if (!data?.maiorMenorSalaPorDia) return { maior: 0, menor: 0 };
    const diaEncontrado = data.maiorMenorSalaPorDia.find((d: any) => d.nome_dia === diaSelecionado);
    return diaEncontrado ? { maior: diaEncontrado.maior_capacidade, menor: diaEncontrado.menor_capacidade } : { maior: 0, menor: 0 };
  }, [data, diaSelecionado]);

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <h1 className="text-3xl font-bold text-slate-800">Relatórios Administrativos</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl animate-pulse" style={{ background: '#f1f5f9' }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 font-bold p-4 card">{error}</div>;
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="sticky top-0 z-10 bg-slate-50 py-4 border-b border-slate-200/50 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Relatórios Administrativos</h1>
          <p className="text-sm text-gray-500">Visão consolidada e tabelas de informações do sistema acadêmico.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="card shadow-sm border-gray-200">
          <h2 className="text-base font-bold mb-4 text-[#991b1b] border-b pb-2">Cursos de Graduação com Maior Volume de Oferta de Turmas Ativas</h2>
          <div className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Filtrar cursos..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg w-full text-sm focus:outline-none focus:border-[#991b1b]" value={filtro1} onChange={e => setFiltro1(e.target.value)} />
            </div>
            <SortDropdown
              currentSort={sort1}
              onSort={toggleSort(setSort1)}
              options={[
                { label: 'Sigla', value: 'sigla' },
                { label: 'Curso', value: 'nome' },
                { label: 'Total Turmas', value: 'total_turmas' }
              ]}
            />
          </div>
          <div className="overflow-x-auto h-48 overflow-y-auto w-full">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-white shadow-sm">
                <tr className="text-gray-600 bg-gray-50">
                  <th className="py-2 px-3 font-semibold">Sigla</th>
                  <th className="py-2 px-3 font-semibold">Curso</th>
                  <th className="py-2 px-3 font-semibold text-center">Total Turmas</th>
                </tr>
              </thead>
              <tbody>
                {f1.length ? f1.map((c: any, i: number) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 font-semibold">{c.sigla}</td>
                    <td className="py-2 px-3">{c.nome}</td>
                    <td className="py-2 px-3 text-center font-bold text-slate-700">{c.total_turmas}</td>
                  </tr>
                )) : <tr><td colSpan={3} className="text-center py-4 text-gray-500">Nenhum resultado</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card shadow-sm border-gray-200">
          <h2 className="text-base font-bold mb-4 text-[#1e3a8a] border-b pb-2">Carga Horária Docente Excedente (Professores com mais de 40 Horas de Aula)</h2>
          <div className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Filtrar professores..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg w-full text-sm focus:outline-none focus:border-[#1e3a8a]" value={filtro2} onChange={e => setFiltro2(e.target.value)} />
            </div>
            <SortDropdown
              currentSort={sort2}
              onSort={toggleSort(setSort2)}
              options={[
                { label: 'Matrícula', value: 'matricula' },
                { label: 'Professor', value: 'nome' },
                { label: 'Horas', value: 'total_horas' }
              ]}
            />
          </div>
          <div className="overflow-x-auto h-48 overflow-y-auto w-full">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-white shadow-sm">
                <tr className="text-gray-600 bg-gray-50">
                  <th className="py-2 px-3 font-semibold">Matrícula</th>
                  <th className="py-2 px-3 font-semibold">Professor</th>
                  <th className="py-2 px-3 font-semibold text-center">Horas</th>
                </tr>
              </thead>
              <tbody>
                {f2.length ? f2.map((p: any, i: number) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 font-mono text-xs">{p.matricula}</td>
                    <td className="py-2 px-3">{p.nome}</td>
                    <td className="py-2 px-3 text-center font-bold text-[#1e3a8a]">{p.total_horas}h</td>
                  </tr>
                )) : <tr><td colSpan={3} className="text-center py-4 text-gray-500">Nenhum resultado</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card shadow-sm border-gray-200 flex flex-col">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-sm font-bold text-slate-800">Análise de Limite de Capacidade das Salas Utilizadas (Maior vs Menor Sala)</h2>
            <select 
              className="border border-slate-200 rounded-lg text-sm p-1 focus:outline-none focus:border-slate-800 bg-white text-slate-800"
              value={diaSelecionado}
              onChange={e => setDiaSelecionado(e.target.value)}
            >
              <option value="Segunda-feira">Segunda-feira</option>
              <option value="Terça-feira">Terça-feira</option>
              <option value="Quarta-feira">Quarta-feira</option>
              <option value="Quinta-feira">Quinta-feira</option>
              <option value="Sexta-feira">Sexta-feira</option>
              <option value="Sábado">Sábado</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-around flex-1 items-center">
            <div className="text-center p-4 rounded-lg bg-red-50 border border-red-100 flex-1">
              <p className="text-xs text-red-600 uppercase font-bold">Maior Sala</p>
              <p className="text-3xl font-black text-red-800 mt-1">{statsDia.maior}</p>
              <p className="text-xs text-gray-500">lugares</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-100 flex-1">
              <p className="text-xs text-blue-600 uppercase font-bold">Menor Sala</p>
              <p className="text-3xl font-black text-blue-800 mt-1">{statsDia.menor}</p>
              <p className="text-xs text-gray-500">lugares</p>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-gray-200 flex flex-col">
          <h2 className="text-base font-bold mb-4 text-slate-800 border-b pb-2">Média da Capacidade de Assentos dos Laboratórios de Informática com Aulas Ativas</h2>
          <div className="text-center p-6 rounded-lg bg-slate-50 border border-slate-200 flex-1 flex flex-col justify-center">
            <p className="text-4xl font-black text-slate-800">
              {data?.mediaLugaresLabs?.[0]?.media_capacidade ? Number(data.mediaLugaresLabs[0].media_capacidade).toFixed(1) : 0}
            </p>
            <p className="text-sm font-semibold text-slate-500 mt-1">lugares por laboratório em média</p>
          </div>
        </div>

        <div className="card shadow-sm border-gray-200">
          <h2 className="text-base font-bold mb-4 text-emerald-700 border-b pb-2">Salas de Aula e Laboratórios de Médio Porte (30 a 50 Vagas) Atualmente Alocados</h2>
          <div className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Filtrar salas..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg w-full text-sm focus:outline-none focus:border-emerald-700" value={filtro5} onChange={e => setFiltro5(e.target.value)} />
            </div>
            <SortDropdown
              currentSort={sort5}
              onSort={toggleSort(setSort5)}
              options={[
                { label: 'Sala', value: 'numero' },
                { label: 'Capacidade', value: 'capacidade' }
              ]}
            />
          </div>
          <div className="flex flex-wrap gap-2 h-40 overflow-y-auto items-start content-start">
            {f5.length ? f5.map((s: any, i: number) => (
              <div key={i} className="px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-sm text-sm hover:border-emerald-300 transition-colors">
                <span className="font-bold mr-2 text-slate-700">Sala {s.numero}</span>
                <span className="text-slate-500 text-xs">({s.capacidade} vagas)</span>
              </div>
            )) : <p className="text-gray-500 text-sm">Nenhuma sala alocada nesta faixa.</p>}
          </div>
        </div>

        <div className="card shadow-sm border-gray-200">
          <h2 className="text-base font-bold mb-4 text-purple-700 border-b pb-2">Relação Geral de Disciplinas Ofertadas por Período Letivo</h2>
          <div className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Filtrar disciplinas ou período..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg w-full text-sm focus:outline-none focus:border-purple-700" value={filtro6} onChange={e => setFiltro6(e.target.value)} />
            </div>
            <SortDropdown
              currentSort={sort6}
              onSort={toggleSort(setSort6)}
              options={[
                { label: 'Disciplina', value: 'nome' },
                { label: 'Período', value: 'periodo_ideal' }
              ]}
            />
          </div>
          <div className="overflow-x-auto h-40 overflow-y-auto w-full">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-white shadow-sm">
                <tr className="text-gray-600 bg-gray-50">
                  <th className="py-2 px-3 font-semibold">Disciplina</th>
                  <th className="py-2 px-3 font-semibold text-center">Período</th>
                </tr>
              </thead>
              <tbody>
                {f6.length ? f6.map((t: any, i: number) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium">{t.nome}</td>
                    <td className="py-2 px-3 text-center"><span className="bg-purple-100 text-purple-800 border border-purple-200 px-2 py-1 rounded-full text-xs font-semibold">{t.periodo_ideal}º</span></td>
                  </tr>
                )) : <tr><td colSpan={2} className="text-center py-4 text-gray-500">Nenhum resultado</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card shadow-sm border-gray-200">
          <h2 className="text-base font-bold mb-4 text-slate-800 border-b pb-2">Consulta Consolidada: Relação Geral de Cursos, Disciplinas e Turmas por Semestre</h2>
          
          <div className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Filtrar turmas e cursos..." 
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg w-full text-sm focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                value={filtroV1}
                onChange={(e) => setFiltroV1(e.target.value)}
              />
            </div>
            <SortDropdown
              currentSort={sortV1}
              onSort={toggleSort(setSortV1)}
              options={[
                { label: 'ID Turma', value: 'id_turma' },
                { label: 'Curso', value: 'curso' },
                { label: 'Disciplina', value: 'disciplina' },
                { label: 'Semestre', value: 'semestre' }
              ]}
            />
          </div>

          <div className="overflow-x-auto h-64 overflow-y-auto">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr className="text-gray-600 bg-gray-50">
                    <th className="py-2 px-3 font-semibold">ID</th>
                    <th className="py-2 px-3 font-semibold">Curso</th>
                    <th className="py-2 px-3 font-semibold">Disciplina</th>
                    <th className="py-2 px-3 font-semibold">Semestre</th>
                  </tr>
                </thead>
                <tbody>
                  {fV1.length ? fV1.map((v: any, i: number) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3 text-xs text-gray-500">{v.id_turma}</td>
                      <td className="py-2 px-3 font-semibold">{v.curso}</td>
                      <td className="py-2 px-3">{v.disciplina}</td>
                      <td className="py-2 px-3 text-xs">{v.ano}/{v.semestre}º</td>
                    </tr>
                  )) : <tr><td colSpan={4} className="text-center py-4 text-gray-500">Nenhum resultado encontrado.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-gray-200">
          <h2 className="text-base font-bold mb-4 text-slate-800 border-b pb-2">Consulta Consolidada: Capacidade e Distribuição Geral de Salas por Tipo e Bloco</h2>
          
          <div className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Filtrar salas..." 
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg w-full text-sm focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                value={filtroV2}
                onChange={(e) => setFiltroV2(e.target.value)}
              />
            </div>
            <SortDropdown
              currentSort={sortV2}
              onSort={toggleSort(setSortV2)}
              options={[
                { label: 'Sala', value: 'numero' },
                { label: 'Tipo', value: 'tipo' },
                { label: 'Vagas', value: 'capacidade' }
              ]}
            />
          </div>

          <div className="overflow-x-auto h-64 overflow-y-auto">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr className="text-gray-600 bg-gray-50">
                    <th className="py-2 px-3 font-semibold">Sala</th>
                    <th className="py-2 px-3 font-semibold">Tipo</th>
                    <th className="py-2 px-3 font-semibold text-center">Vagas</th>
                  </tr>
                </thead>
                <tbody>
                  {fV2.length ? fV2.map((v: any, i: number) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3 font-bold">{v.numero}</td>
                      <td className="py-2 px-3">{v.tipo}</td>
                      <td className="py-2 px-3 text-center">
                        <span className="bg-[#f1f5f9] text-[#334155] border border-[#cbd5e1] px-2 py-1 rounded-full text-xs font-medium">
                          {v.capacidade}
                        </span>
                      </td>
                    </tr>
                  )) : <tr><td colSpan={3} className="text-center py-4 text-gray-500">Nenhum resultado encontrado.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
