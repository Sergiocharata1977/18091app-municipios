'use client';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Building2 } from 'lucide-react';
import { UserMenu } from './UserMenu';

export function DashboardHeader() {
  const { usuario } = useCurrentUser();

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 w-full border-b border-gray-100">
      <div className="w-full h-16 px-6 flex items-center justify-between">
        {/* Left Side: Logo / Title */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent transform hover:scale-105 transition-transform cursor-default select-none">
            Sistema ISO 9001
          </h1>
        </div>

        {/* Right Side: Organization & User */}
        <div className="flex items-center gap-6">
          {/* Organization Badge - Transparent, no border/box look */}
          <div className="hidden md:flex items-center gap-3 px-2 py-1 transition-colors cursor-pointer group">
            <div className="p-1.5 bg-emerald-100/50 group-hover:bg-emerald-100 rounded-full transition-colors">
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold leading-none mb-0.5">
                Organización
              </span>
              <span className="text-sm font-medium text-slate-700 leading-none">
                {usuario?.organization_id
                  ? 'Los Señores del Agro S.A.'
                  : 'Cargando...'}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-200/60 hidden md:block"></div>

          {/* User Menu */}
          <div className="pl-2">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
