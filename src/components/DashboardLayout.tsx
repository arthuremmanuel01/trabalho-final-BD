'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, GraduationCap, BookOpen, Users, UsersRound, 
  School, Clock, Calendar, FileText, Menu, X, LogOut 
} from 'lucide-react';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/cursos', label: 'Cursos', icon: GraduationCap },
  { href: '/dashboard/disciplinas', label: 'Disciplinas', icon: BookOpen },
  { href: '/dashboard/professores', label: 'Professores', icon: Users },
  { href: '/dashboard/turmas', label: 'Turmas', icon: UsersRound },
  { href: '/dashboard/salas', label: 'Salas', icon: School },
  { href: '/dashboard/horarios', label: 'Horários', icon: Clock },
  { href: '/dashboard/alocacoes', label: 'Alocações', icon: Calendar },
  { href: '/dashboard/relatorios', label: 'Relatórios', icon: FileText },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioStr = localStorage.getItem('usuario');

    if (!token || !usuarioStr) {
      router.push('/');
      return;
    }

    try {
      setUsuario(JSON.parse(usuarioStr));
    } catch {
      router.push('/');
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.push('/');
  }

  if (!usuario) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row">
      <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 p-4 sticky top-0 z-40">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-red-800 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
           </div>
           <span className="font-bold text-slate-800">PucHub</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`fixed md:sticky left-0 top-0 h-full md:h-screen w-64 bg-white border-r border-slate-200 z-50 transform transition-transform duration-200 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 flex items-center justify-between">
           <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-800">
               <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-800">PucHub</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-1 text-slate-500 hover:bg-slate-100 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <nav className="flex flex-col gap-1" aria-label="Navegação principal">
            {navItems.filter(item => usuario.perfil === 'admin' || ['Dashboard', 'Alocações'].includes(item.label)).map(item => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-red-50 text-red-800 border-l-4 border-red-800' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-l-4 border-transparent'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-red-800' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 text-white bg-blue-900 shadow-sm">
              {usuario.nome.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-slate-800">{usuario.nome}</p>
              <span className={`badge badge-${usuario.perfil}`}>{usuario.perfil}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            id="btn-logout"
            className="w-full text-sm py-2 px-3 rounded-lg transition-colors text-left text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 flex items-center gap-2 justify-center font-medium"
          >
            <LogOut className="w-4 h-4" /> Sair do sistema
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-4 md:p-8 min-h-[calc(100vh-64px)] md:min-h-screen">
        {children}
      </main>
    </div>
  );
}
