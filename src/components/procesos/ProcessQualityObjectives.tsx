'use client';

import { ObjectiveFormDialog } from '@/components/quality/ObjectiveFormDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Measurement,
  QualityIndicator,
  QualityObjective,
} from '@/types/quality';
import {
  AlertTriangle,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Minus,
  Plus,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ProcessQualityObjectivesProps {
  processId: string;
  onNavigateToQuality: () => void;
}

export function ProcessQualityObjectives({
  processId,
  onNavigateToQuality,
}: ProcessQualityObjectivesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [objectives, setObjectives] = useState<QualityObjective[]>([]);
  const [indicators, setIndicators] = useState<QualityIndicator[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [showNewObjectiveDialog, setShowNewObjectiveDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchProcessQualityData();
    }
  }, [isOpen, processId]);

  const fetchProcessQualityData = async () => {
    try {
      setLoading(true);

      // Fetch objectives for this process via API (uses Admin SDK)
      const objectivesResponse = await fetch(
        `/api/quality/objectives?process_definition_id=${processId}`
      );

      if (!objectivesResponse.ok) {
        console.error(
          'Error fetching objectives:',
          await objectivesResponse.text()
        );
        setObjectives([]);
        return;
      }

      const processObjectives = await objectivesResponse.json();
      setObjectives(processObjectives || []);

      // Get all indicators for this process via API
      const indicatorsResponse = await fetch(
        `/api/quality/indicators?process_definition_id=${processId}`
      );

      if (indicatorsResponse.ok) {
        const allIndicators = await indicatorsResponse.json();
        setIndicators(allIndicators || []);

        // Get recent measurements for these indicators
        const indicatorIds = (allIndicators || []).map(
          (ind: QualityIndicator) => ind.id
        );
        const recentMeasurements: Measurement[] = [];
        for (const indId of indicatorIds) {
          try {
            const measResponse = await fetch(
              `/api/quality/measurements?indicator_id=${indId}`
            );
            if (measResponse.ok) {
              const indMeasurements = await measResponse.json();
              recentMeasurements.push(...(indMeasurements || []).slice(0, 3));
            }
          } catch (e) {
            console.error(
              'Error fetching measurements for indicator:',
              indId,
              e
            );
          }
        }
        setMeasurements(recentMeasurements);
      } else {
        setIndicators([]);
        setMeasurements([]);
      }
    } catch (error) {
      console.error('Error fetching process quality data:', error);
      setObjectives([]);
      setIndicators([]);
      setMeasurements([]);
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'ascendente':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'descendente':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getObjectiveIndicators = (objectiveId: string) => {
    return indicators.filter(ind => ind.objective_id === objectiveId);
  };

  const getIndicatorMeasurements = (indicatorId: string) => {
    return measurements.filter(m => m.indicator_id === indicatorId);
  };

  const calculateProcessCompliance = () => {
    if (objectives.length === 0) return 0;
    const completedObjectives = objectives.filter(
      obj => obj.status === 'completado'
    ).length;
    return Math.round((completedObjectives / objectives.length) * 100);
  };

  const getObjectivesAtRisk = () => {
    return objectives.filter(obj => {
      const dueDate = new Date(obj.due_date);
      const now = new Date();
      const daysUntilDue = Math.ceil(
        (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      return (
        obj.status === 'activo' &&
        (obj.progress_percentage < obj.alert_threshold || daysUntilDue < 30) // Less than 30 days until due
      );
    });
  };

  if (loading && isOpen) {
    return (
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-center h-32">
          <div className="text-sm text-gray-500">
            Cargando objetivos de calidad...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <Target className="h-5 w-5 text-blue-600" />
              <div className="text-left">
                <h4 className="font-medium text-gray-900">
                  Objetivos de Calidad ({objectives.length})
                </h4>
                <p className="text-sm text-gray-600">
                  Gestión de objetivos SMART vinculados al proceso
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {objectives.length > 0 && (
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {calculateProcessCompliance()}% Cumplimiento
                  </div>
                  {getObjectivesAtRisk().length > 0 && (
                    <div className="flex items-center text-xs text-red-600">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {getObjectivesAtRisk().length} en riesgo
                    </div>
                  )}
                </div>
              )}
              {isOpen ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            {/* Quick Actions */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => setShowNewObjectiveDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Objetivo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNavigateToQuality}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Gestionar Calidad
                </Button>
              </div>
            </div>

            {/* Objectives List */}
            {objectives.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay objetivos definidos
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Comienza creando objetivos SMART para este proceso
                  </p>
                  <Button
                    onClick={() =>
                      window.open(
                        `/dashboard/quality/objetivos?process_definition_id=${processId}`,
                        '_blank'
                      )
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Objetivo
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {objectives.map(objective => {
                  const objIndicators = getObjectiveIndicators(objective.id);
                  const isAtRisk = getObjectivesAtRisk().includes(objective);

                  return (
                    <Link
                      key={objective.id}
                      href={`/dashboard/quality/objetivos/${objective.id}`}
                      className="block"
                    >
                      <Card
                        className={`border-l-4 ${isAtRisk ? 'border-l-red-500' : 'border-l-blue-500'} hover:shadow-lg transition-shadow cursor-pointer`}
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-medium text-gray-900">
                                  {objective.code}
                                </h4>
                                <Badge
                                  className={getStatusColor(objective.status)}
                                >
                                  {getStatusText(objective.status)}
                                </Badge>
                                {isAtRisk && (
                                  <Badge variant="destructive">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    En Riesgo
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {objective.title}
                              </p>
                              <p className="text-xs text-gray-500 mb-3">
                                {objective.description}
                              </p>
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span>Progreso</span>
                              <span>{objective.progress_percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${objective.progress_percentage}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          {/* Meta Info */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500 mb-4">
                            <div>
                              <span className="font-medium">Meta:</span>
                              <div>
                                {objective.target_value} {objective.unit}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Actual:</span>
                              <div>
                                {objective.current_value} {objective.unit}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Vence:</span>
                              <div>
                                {new Date(
                                  objective.due_date
                                ).toLocaleDateString()}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Tipo:</span>
                              <div className="capitalize">
                                {objective.type || 'Operativo'}
                              </div>
                            </div>
                          </div>

                          {/* Indicators Summary */}
                          {objIndicators.length > 0 && (
                            <div className="border-t pt-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">
                                  Indicadores ({objIndicators.length})
                                </span>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0 h-auto"
                                  asChild
                                >
                                  <Link
                                    href={`/dashboard/quality/indicadores?objective_id=${objective.id}`}
                                  >
                                    Ver todos
                                  </Link>
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {objIndicators.slice(0, 2).map(indicator => {
                                  const recentMeasurements =
                                    getIndicatorMeasurements(indicator.id);
                                  const latestMeasurement =
                                    recentMeasurements[0];

                                  return (
                                    <div
                                      key={indicator.id}
                                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                                    >
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-sm font-medium">
                                            {indicator.code}
                                          </span>
                                          {getTrendIcon(indicator.trend)}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                          {indicator.name}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-sm font-medium">
                                          {latestMeasurement?.value ||
                                            indicator.current_value ||
                                            0}{' '}
                                          {indicator.unit}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {latestMeasurement
                                            ? new Date(
                                                latestMeasurement.measurement_date
                                              ).toLocaleDateString()
                                            : 'Sin mediciones'}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                                {objIndicators.length > 2 && (
                                  <div className="text-center text-sm text-gray-500">
                                    +{objIndicators.length - 2} indicadores más
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Dialog para crear objetivo */}
      <ObjectiveFormDialog
        open={showNewObjectiveDialog}
        onOpenChange={setShowNewObjectiveDialog}
        onSuccess={fetchProcessQualityData}
        processId={processId}
      />
    </div>
  );
}
