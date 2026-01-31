'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Target,
  BarChart3,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
} from 'lucide-react';
import {
  QualityObjective,
  QualityIndicator,
  Measurement,
} from '@/types/quality';

interface ProcessQualityMetricsProps {
  objectives: QualityObjective[];
  indicators: QualityIndicator[];
  measurements: Measurement[];
}

export function ProcessQualityMetrics({
  objectives,
  indicators,
  measurements,
}: ProcessQualityMetricsProps) {
  // Calculate metrics
  const totalObjectives = objectives.length;
  const completedObjectives = objectives.filter(
    obj => obj.status === 'completado'
  ).length;
  const activeObjectives = objectives.filter(
    obj => obj.status === 'activo'
  ).length;
  const overdueObjectives = objectives.filter(obj => {
    const dueDate = new Date(obj.due_date);
    const now = new Date();
    return obj.status === 'activo' && dueDate < now;
  }).length;

  const complianceRate =
    totalObjectives > 0
      ? Math.round((completedObjectives / totalObjectives) * 100)
      : 0;

  const totalIndicators = indicators.length;
  const activeIndicators = indicators.filter(
    ind => ind.status === 'activo'
  ).length;

  const totalMeasurements = measurements.length;
  const recentMeasurements = measurements.filter(m => {
    const measurementDate = new Date(m.measurement_date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return measurementDate >= thirtyDaysAgo;
  }).length;

  const objectivesAtRisk = objectives.filter(obj => {
    const dueDate = new Date(obj.due_date);
    const now = new Date();
    const daysUntilDue = Math.ceil(
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
      obj.status === 'activo' &&
      (obj.progress_percentage < obj.alert_threshold || daysUntilDue < 30)
    );
  }).length;

  const avgProgress =
    totalObjectives > 0
      ? Math.round(
          objectives.reduce((sum, obj) => sum + obj.progress_percentage, 0) /
            totalObjectives
        )
      : 0;

  const metrics = [
    {
      title: 'Cumplimiento de Objetivos',
      value: `${complianceRate}%`,
      description: `${completedObjectives} de ${totalObjectives} completados`,
      icon: Target,
      color:
        complianceRate >= 80
          ? 'text-green-600'
          : complianceRate >= 60
            ? 'text-yellow-600'
            : 'text-red-600',
      bgColor:
        complianceRate >= 80
          ? 'bg-green-100'
          : complianceRate >= 60
            ? 'bg-yellow-100'
            : 'bg-red-100',
    },
    {
      title: 'Objetivos Activos',
      value: activeObjectives.toString(),
      description: `${overdueObjectives} vencidos`,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Indicadores Monitoreados',
      value: activeIndicators.toString(),
      description: `de ${totalIndicators} totales`,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Mediciones Recientes',
      value: recentMeasurements.toString(),
      description: 'últimos 30 días',
      icon: Activity,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'Progreso Promedio',
      value: `${avgProgress}%`,
      description: 'de todos los objetivos',
      icon: TrendingUp,
      color:
        avgProgress >= 70
          ? 'text-green-600'
          : avgProgress >= 50
            ? 'text-yellow-600'
            : 'text-red-600',
      bgColor:
        avgProgress >= 70
          ? 'bg-green-100'
          : avgProgress >= 50
            ? 'bg-yellow-100'
            : 'bg-red-100',
    },
    {
      title: 'Objetivos en Riesgo',
      value: objectivesAtRisk.toString(),
      description: 'requieren atención',
      icon: AlertTriangle,
      color: objectivesAtRisk > 0 ? 'text-red-600' : 'text-green-600',
      bgColor: objectivesAtRisk > 0 ? 'bg-red-100' : 'bg-green-100',
    },
  ];

  const getStatusSummary = () => {
    const statusCounts = objectives.reduce(
      (acc, obj) => {
        acc[obj.status] = (acc[obj.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage:
        totalObjectives > 0 ? Math.round((count / totalObjectives) * 100) : 0,
    }));
  };

  const statusSummary = getStatusSummary();

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <Card
            key={index}
            className="border-0 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {metric.value}
                  </p>
                  <p className="text-xs text-gray-500">{metric.description}</p>
                </div>
                <div
                  className={`p-2 rounded-lg ${metric.bgColor} flex-shrink-0`}
                >
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Summary */}
      {statusSummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estado de Objetivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statusSummary.map(({ status, count, percentage }) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge
                      className={
                        status === 'completado'
                          ? 'bg-green-100 text-green-800'
                          : status === 'activo'
                            ? 'bg-blue-100 text-blue-800'
                            : status === 'atrasado'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {status === 'completado'
                        ? 'Completado'
                        : status === 'activo'
                          ? 'Activo'
                          : status === 'atrasado'
                            ? 'Atrasado'
                            : status === 'cancelado'
                              ? 'Cancelado'
                              : status}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {count} objetivos
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          status === 'completado'
                            ? 'bg-green-600'
                            : status === 'activo'
                              ? 'bg-blue-600'
                              : status === 'atrasado'
                                ? 'bg-red-600'
                                : 'bg-gray-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Insights Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {complianceRate >= 80 && (
              <div className="flex items-center space-x-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">
                  Excelente cumplimiento de objetivos
                </span>
              </div>
            )}

            {objectivesAtRisk > 0 && (
              <div className="flex items-center space-x-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm">
                  {objectivesAtRisk} objetivos requieren atención inmediata
                </span>
              </div>
            )}

            {recentMeasurements === 0 && totalIndicators > 0 && (
              <div className="flex items-center space-x-2 text-yellow-700">
                <Clock className="h-5 w-5" />
                <span className="text-sm">
                  No hay mediciones recientes en los indicadores
                </span>
              </div>
            )}

            {totalObjectives === 0 && (
              <div className="flex items-center space-x-2 text-blue-700">
                <Target className="h-5 w-5" />
                <span className="text-sm">
                  Define objetivos SMART para este proceso
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
