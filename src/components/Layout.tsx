import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Smartphone, GitCompare, MessageSquare, Vote, HelpCircle, Settings,
} from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '首页看板' },
  { path: '/brands', icon: Smartphone, label: '品牌板块' },
  { path: '/compare', icon: GitCompare, label: '机型对比' },
  { path: '/vote', icon: Vote, label: '现场投票' },
  { path: '/questions', icon: HelpCircle, label: '提问墙' },
  { path: '/admin', icon: Settings, label: '管理面板' },
];

export default function Layout() {
  const theme = useStore((s) => s.theme);

  const bgClass =
    theme === 'light'
      ? 'bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50'
      : theme === 'cyber'
      ? 'bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950'
      : 'bg-gradient-to-br from-slate-950 via-tech-950 to-slate-950';

  const textClass = theme === 'light' ? 'text-slate-800' : 'text-white';
  const navBgClass =
    theme === 'light'
      ? 'bg-white/80 border-slate-200'
      : theme === 'cyber'
      ? 'bg-purple-950/50 border-purple-500/20'
      : 'bg-slate-900/80 border-white/10';

  return (
    <div className={cn('min-h-screen', bgClass, textClass, 'bg-grid-pattern')}>
      <header
        className={cn(
          'sticky top-0 z-50 backdrop-blur-xl border-b',
          navBgClass
        )}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tech-500 to-cyber-500 flex items-center justify-center text-2xl shadow-lg shadow-cyber-500/30">
                📱
              </div>
              <div>
                <h1 className="font-display text-xl font-bold gradient-text text-shadow-glow">
                  PHONE FORUM
                </h1>
                <p className={cn('text-xs', theme === 'light' ? 'text-slate-500' : 'text-slate-400')}>
                  手机交流论坛 · 现场互动大屏
                </p>
              </div>
            </div>

            <nav className="flex items-center gap-2">
              {navItems.map(({ path, icon: Icon, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === '/'}
                  className={({ isActive }) =>
                    cn(
                      'nav-item flex items-center gap-2',
                      isActive ? 'nav-item-active' : theme === 'light' ? 'text-slate-600 hover:text-tech-600 hover:bg-tech-50' : 'nav-item-inactive'
                    )
                  }
                >
                  <Icon size={18} />
                  <span className="hidden md:inline">{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Outlet />
      </main>

      <footer
        className={cn(
          'mt-12 py-6 border-t backdrop-blur-xl',
          navBgClass
        )}
      >
        <div className="container mx-auto px-6 text-center">
          <p className={cn('text-sm', theme === 'light' ? 'text-slate-500' : 'text-slate-400')}>
            © 2024 Phone Forum · 手机交流论坛展示系统 · Powered by React & Vite
          </p>
        </div>
      </footer>
    </div>
  );
}
