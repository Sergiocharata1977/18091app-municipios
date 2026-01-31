'use client';

import { ModuleMaturityButton } from '@/components/shared/ModuleMaturityButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Edit,
  Eye,
  FileText,
  Plus,
  Target,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface QualityStats {
  objetivosActivos: number;
  indicadoresMonitoreados: number;
  medicionesMes: number;
  cumplimientoPromedio: number;
  alertasActivas: number;
  procesosMonitoreados: number;
}

interface RecentObjective {
  id: string;
  code: string;
  title: string;
  status: string;
  progress_percentage: number;
  responsible_user_id: string;
}

export default function QualityDashboard() {
  const [stats, setStats] = useState<QualityStats>({
    objetivosActivos: 0,
    indicadoresMonitoreados: 0,
    medicionesMes: 0,
    cumplimientoPromedio: 0,
    alertasActivas: 0,
    procesosMonitoreados: 0,
  });

  const [recentObjectives, setRecentObjectives] = useState<RecentObjective[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentObjectives();
  }, []);

  const fetchStats = async () => {
    try {
      // TODO: Implement API calls to get real stats
      // For now, using mock data
      setStats({
        objetivosActivos: 12,
        indicadoresMonitoreados: 45,
        medicionesMes: 156,
        cumplimientoPromedio: 87,
        alertasActivas: 3,
        procesosMonitoreados: 8,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentObjectives = async () => {
    try {
      // TODO: Implement API call to get recent objectives
      // For now, using mock data
      setRecentObjectives([
        {
          id: '1',
          code: 'OBJ-001',
          title: 'Mejorar eficiencia del proceso de producción',
          status: 'activo',
          progress_percentage: 75,
          responsible_user_id: 'user1',
        },
        {
          id: '2',
          code: 'OBJ-002',
          title: 'Reducir tiempo de respuesta al cliente',
          status: 'activo',
          progress_percentage: 60,
          responsible_user_id: 'user2',
        },
      ]);
    } catch (error) {
      console.error('Error fetching recent objectives:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo':
        return 'bg-blue-100 text-blue-800';
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'atrasado':
        return 'bg-red-100 text-red-800';
      case 'cancelado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'activo':
        return 'Activo';
      case 'completado':
        return 'Completado';
      case 'atrasado':
        return 'Atrasado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard de Calidad
          </h1>
          <p className="text-gray-600 mt-1">
            Monitoreo de objetivos, indicadores y mediciones de calidad
          </p>
        </div>
        <div className="flex gap-2">
          <ModuleMaturityButton moduleKey="calidad" />
          <Button asChild>
            <Link href="/dashboard/quality/objetivos">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Objetivo
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Objetivos Activos
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.objetivosActivos}</div>
            <p className="text-xs text-muted-foreground">
              +2 desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Indicadores Monitoreados
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.indicadoresMonitoreados}
            </div>
            <p className="text-xs text-muted-foreground">
              +5 desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mediciones del Mes
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.medicionesMes}</div>
            <p className="text-xs text-muted-foreground">
              +12% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cumplimiento Promedio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.cumplimientoPromedio}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${stats.cumplimientoPromedio}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alertas Activas
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.alertasActivas}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención inmediata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Procesos Monitoreados
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.procesosMonitoreados}
            </div>
            <p className="text-xs text-muted-foreground">
              Procesos con objetivos activos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Objectives */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Objetivos Recientes</CardTitle>
              <CardDescription>
                Últimos objetivos de calidad creados o actualizados
              </CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/quality/objetivos">Ver Todos</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentObjectives.map(objective => (
              <div
                key={objective.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium">{objective.code}</h3>
                    <Badge className={getStatusColor(objective.status)}>
                      {getStatusText(objective.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {objective.title}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${objective.progress_percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {objective.progress_percentage}%
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/quality/objetivos/${objective.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/quality/objetivos/${objective.id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <Target className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <CardTitle className="text-lg">Gestionar Objetivos</CardTitle>
            <CardDescription>
              Crear y monitorear objetivos de calidad SMART
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/dashboard/quality/objetivos">Ir a Objetivos</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <BarChart3 className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <CardTitle className="text-lg">Configurar Indicadores</CardTitle>
            <CardDescription>
              Definir métricas y fórmulas de cálculo
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/dashboard/quality/indicadores">
                Ir a Indicadores
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <Activity className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <CardTitle className="text-lg">Registrar Mediciones</CardTitle>
            <CardDescription>
              Capturar valores y validar mediciones
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/dashboard/quality/mediciones">Ir a Mediciones</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
