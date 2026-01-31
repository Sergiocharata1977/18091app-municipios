'use client';

import { ExportDropdown } from '@/components/mcp/ExportDropdown';
import { ExportToSheetsDialog } from '@/components/mcp/ExportToSheetsDialog';
import { MCPExecutionList } from '@/components/mcp/MCPExecutionList';
import { TaskTemplateSelector } from '@/components/mcp/TaskTemplateSelector';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { MCPTaskExecution } from '@/types/mcp';
import {
  Activity,
  AlertCircle,
  Bot,
  CheckCircle,
  Clock,
  History,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function MCPDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [recentExecutions, setRecentExecutions] = useState<MCPTaskExecution[]>(
    []
  );
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    fail: 0,
    avgDuration: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.organization_id) {
      fetchData(user.organization_id);
    }
  }, [user]);

  const fetchData = async (orgId: string) => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/mcp/ejecuciones?organization_id=${orgId}&limit=10`
      );
      const data = await res.json();

      if (data.success && data.data) {
        setRecentExecutions(data.data);

        const total = data.data.length;
        const success = data.data.filter(
          (e: MCPTaskExecution) => e.estado === 'exitoso'
        ).length;
        const fail = data.data.filter(
          (e: MCPTaskExecution) => e.estado === 'fallido'
        ).length;
        const duration =
          data.data.reduce(
            (acc: number, curr: MCPTaskExecution) =>
              acc + (curr.duracion_ms || 0),
            0
          ) / (total || 1);

        setStats({ total, success, fail, avgDuration: Math.round(duration) });
      }
    } catch (err) {
      console.error('Error loading dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/25">
              <Bot className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Cargando panel MCP...
          </p>
        </div>
      </div>
    );
  }

  const successRate = stats.total
    ? Math.round((stats.success / stats.total) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                Panel MCP
              </h1>
              <p className="text-slate-500 text-sm mt-0.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Monitor de automatización inteligente
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TaskTemplateSelector />
            <ExportDropdown />
            <Link href="/mcp/history">
              <Button
                variant="outline"
                className="bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 border-slate-200/80"
              >
                <History className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Historial</span>
              </Button>
            </Link>
          </div>
          {/* Hidden dialog for Google Sheets - triggered via event */}
          <ExportToSheetsDialog />
        </div>

        {/* KPI Cards - Diseño Premium sin bordes, con sombras */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {/* Card: Ejecuciones Recientes */}
          <div className="group relative bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-0.5">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Ejecuciones
                </span>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                  <Activity className="w-4.5 h-4.5 text-slate-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-800 tracking-tight">
                {stats.total}
              </div>
              <p className="text-xs text-slate-500 mt-1">en la última sesión</p>
            </div>
          </div>

          {/* Card: Tasa de Éxito */}
          <div className="group relative bg-white rounded-2xl p-5 shadow-lg shadow-emerald-100/50 hover:shadow-xl hover:shadow-emerald-100/60 transition-all duration-300 hover:-translate-y-0.5">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600/70">
                  Tasa de Éxito
                </span>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                  <TrendingUp className="w-4.5 h-4.5 text-emerald-600" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-emerald-600 tracking-tight">
                  {successRate}%
                </span>
                {successRate >= 80 && (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {stats.success} exitosos
              </p>
            </div>
          </div>

          {/* Card: Fallos */}
          <div className="group relative bg-white rounded-2xl p-5 shadow-lg shadow-rose-100/50 hover:shadow-xl hover:shadow-rose-100/60 transition-all duration-300 hover:-translate-y-0.5">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-600/70">
                  Fallos
                </span>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-100 to-rose-50 flex items-center justify-center">
                  <AlertCircle className="w-4.5 h-4.5 text-rose-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-rose-600 tracking-tight">
                {stats.fail}
              </div>
              <p className="text-xs text-slate-500 mt-1">requieren atención</p>
            </div>
          </div>

          {/* Card: Duración Promedio */}
          <div className="group relative bg-white rounded-2xl p-5 shadow-lg shadow-blue-100/50 hover:shadow-xl hover:shadow-blue-100/60 transition-all duration-300 hover:-translate-y-0.5">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600/70">
                  Duración Prom.
                </span>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                  <Clock className="w-4.5 h-4.5 text-blue-600" />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-blue-600 tracking-tight">
                  {(stats.avgDuration / 1000).toFixed(1)}
                </span>
                <span className="text-lg font-medium text-blue-400">s</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">por tarea</p>
            </div>
          </div>
        </div>

        {/* Recent Activity - Diseño Premium */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden">
          <div className="p-5 lg:p-6">
            <MCPExecutionList
              executions={recentExecutions}
              title="Última Actividad"
              limit={5}
            />
            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <Link
                href="/mcp/history"
                className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Ver historial completo
                <span className="text-lg">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
