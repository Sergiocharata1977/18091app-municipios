'use client';

import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  BarChart3,
  Bot,
  CheckCircle,
  ChevronLeft,
  Compass,
  LayoutDashboard,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const menuItems: MenuItem[] = [
  {
    name: 'Madurez',
    href: '/mi-sgc/madurez',
    icon: BarChart3,
    description: 'Diagnóstico organizacional',
  },
  {
    name: 'Cumplimiento',
    href: '/mi-sgc/cumplimiento',
    icon: CheckCircle,
    description: 'Estado por capítulo ISO',
  },
  {
    name: 'Gaps',
    href: '/mi-sgc/gaps',
    icon: AlertTriangle,
    description: 'Análisis de brechas',
  },
  {
    name: 'Roadmap',
    href: '/mi-sgc/roadmap',
    icon: Compass,
    description: 'Camino a certificación',
  },
  {
    name: 'Automatización',
    href: '/mi-sgc/automatizacion',
    icon: Bot,
    description: 'Panel MCP',
  },
];

export function MiSGCSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-slate-50 dark:bg-slate-800 shadow-sm">
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center h-16 flex-shrink-0 px-4">
          <button
            onClick={() => router.push('/noticias')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Menú Principal</span>
          </button>
        </div>

        {/* Title */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Mi SGC
              </h2>
              <p className="text-xs text-slate-500">Sistema de Gestión</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group',
                  active
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                )}
              >
                <div
                  className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center transition-all',
                    active
                      ? 'bg-emerald-100 dark:bg-emerald-800/50'
                      : 'bg-slate-100 dark:bg-slate-700 group-hover:bg-slate-200 dark:group-hover:bg-slate-600'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5',
                      active
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-500 dark:text-slate-400'
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm font-medium truncate',
                      active ? 'text-emerald-700 dark:text-emerald-400' : ''
                    )}
                  >
                    {item.name}
                  </p>
                  {item.description && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                      {item.description}
                    </p>
                  )}
                </div>
                {active && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg p-3">
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              ISO 9001:2015
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sistema de Gestión de Calidad
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
