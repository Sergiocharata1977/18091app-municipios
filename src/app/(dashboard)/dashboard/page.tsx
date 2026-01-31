'use client';

import { trackError } from '@/lib/monitoring';
import {
  BarChart,
  BarChart3,
  Briefcase,
  CheckCircle,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  // Métricas principales
  const metrics = [
    {
      title: 'Objetivos',
      value: '85%',
      icon: TrendingUp,
      color: 'emerald',
      change: '+5%',
      trend: 'up',
    },
    {
      title: 'Personal',
      value: '24',
      icon: Users,
      color: 'blue',
      change: '+2',
      trend: 'up',
    },
    {
      title: 'Documentos',
      value: '42',
      icon: FileText,
      color: 'purple',
      change: '+8',
      trend: 'up',
    },
    {
      title: 'Conformidad',
      value: '92%',
      icon: CheckCircle,
      color: 'orange',
      change: '+3%',
      trend: 'up',
    },
  ];

  // Módulos del sistema
  const modules = [
    {
      title: 'Recursos Humanos',
      description:
        'Gestión integral de personal, competencias y estructura organizacional.',
      icon: Users,
      color: 'emerald', // Updated to match branding
      href: '/dashboard/rrhh',
      enabled: true,
      stats: { personal: 24, departamentos: 6 },
    },
    {
      title: 'Procesos',
      description: 'Mapeo, definición y control de procesos operativos.',
      icon: Briefcase,
      color: 'teal', // Updated to match branding
      href: '/dashboard/procesos',
      enabled: true,
      stats: { procesos: 12, activos: 8 },
    },
    {
      title: 'Calidad',
      description: 'Seguimiento de objetivos, indicadores y satisfacción.',
      icon: BarChart3,
      color: 'blue',
      href: '/dashboard/calidad',
      enabled: true,
      stats: { objetivos: 15, cumplidos: 13 },
    },
    {
      title: 'Auditorías',
      description: 'Planificación y ejecución de auditorías internas.',
      icon: Shield,
      color: 'indigo',
      href: '/auditorias',
      enabled: true,
      stats: {},
    },
    {
      title: 'Documentos',
      description: 'Control documental y versiones vigentes.',
      icon: FolderOpen,
      color: 'orange',
      href: '/documentos',
      enabled: true,
      stats: {},
    },
    {
      title: 'Reportes',
      description: 'Visualización de KPIs y reportes ejecutivos.',
      icon: BarChart,
      color: 'rose',
      href: '/reportes',
      enabled: true,
      stats: {},
    },
  ];

  const getGradientText = (color: string) => {
    const map: Record<string, string> = {
      emerald: 'text-emerald-600',
      teal: 'text-teal-600',
      blue: 'text-blue-600',
      indigo: 'text-indigo-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600',
      rose: 'text-rose-600',
    };
    return map[color] || 'text-gray-600';
  };

  const getIconBg = (color: string) => {
    const map: Record<string, string> = {
      emerald: 'bg-emerald-100 text-emerald-700',
      teal: 'bg-teal-100 text-teal-700',
      blue: 'bg-blue-100 text-blue-700',
      indigo: 'bg-indigo-100 text-indigo-700',
      purple: 'bg-purple-100 text-purple-700',
      orange: 'bg-orange-100 text-orange-700',
      rose: 'bg-rose-100 text-rose-700',
    };
    return map[color] || 'bg-gray-100 text-gray-700';
  };

  // Test Sentry error tracking
  const testSentry = () => {
    try {
      trackError(new Error('Test error from Sentry Dashboard'), {
        test: true,
        timestamp: new Date().toISOString(),
        user: 'dashboard-test',
        location: 'dashboard-page',
      });
      alert('✅ Error enviado a Sentry');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-emerald-600" />
            Dashboard General
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Visión general del estado de tu Sistema de Gestión de Calidad (SGC).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-semibold uppercase tracking-wide">
            Versión Beta 2.0
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-transparent rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>

            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  {metric.title}
                </p>
                <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
                  {metric.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${getIconBg(metric.color)}`}>
                <metric.icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 flex items-center text-sm relative z-10">
              <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {metric.change}
              </span>
              <span className="text-gray-400 ml-2">vs mes anterior</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modules Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          Accesos Directos
          <span className="h-px w-full bg-gray-100 block flex-1 ml-4"></span>
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module, index) => {
            const CardContent = (
              <div className="h-full bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-100 transition-all duration-300 group cursor-pointer flex flex-col">
                <div className="flex items-start justify-between mb-5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300 ${getIconBg(module.color)} group-hover:bg-gray-900 group-hover:text-white`}
                  >
                    <module.icon className="w-6 h-6" />
                  </div>
                  {module.enabled && (
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                      <TrendingUp className="w-4 h-4 transform rotate-45" />
                    </div>
                  )}
                </div>

                <h3
                  className={`text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors`}
                >
                  {module.title}
                </h3>
                <p className="text-gray-500 text-sm mb-6 flex-1 leading-relaxed">
                  {module.description}
                </p>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-xs font-medium text-gray-400 group-hover:text-gray-500">
                  <span>Ver módulo</span>
                  <span>ISO 9001:2015</span>
                </div>
              </div>
            );

            return module.enabled ? (
              <Link key={index} href={module.href} className="block h-full">
                {CardContent}
              </Link>
            ) : (
              <div
                key={index}
                className="opacity-60 grayscale cursor-not-allowed h-full"
              >
                {CardContent}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
