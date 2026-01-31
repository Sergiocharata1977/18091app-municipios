'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProcessRecordForm } from '@/components/procesos/ProcessRecordForm';
import { ProcessRecordFormData } from '@/lib/validations/procesos';
import { ProcessRecordService } from '@/services/procesos/ProcessRecordService';
import { ProcessRecord } from '@/types/procesos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Edit,
  FileText,
  Calendar,
  User,
  AlertTriangle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ProcessRecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const processId = params.id as string;
  const recordId = params.recordId as string;

  const [record, setRecord] = useState<ProcessRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const data = await ProcessRecordService.getById(recordId);
        setRecord(data);
      } catch (error) {
        console.error('Error al cargar registro:', error);
      } finally {
        setLoading(false);
      }
    };

    if (recordId) {
      fetchRecord();
    }
  }, [recordId]);

  const handleFormSubmit = async (data: ProcessRecordFormData) => {
    setIsLoading(true);
    try {
      await ProcessRecordService.update(recordId, data);
      const updatedRecord = await ProcessRecordService.getById(recordId);
      setRecord(updatedRecord);
      setEditing(false);
    } catch (error) {
      console.error('Error al actualizar registro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormCancel = () => {
    setEditing(false);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en-progreso':
        return 'bg-blue-100 text-blue-800';
      case 'completado':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta':
        return 'bg-red-100 text-red-800';
      case 'media':
        return 'bg-orange-100 text-orange-800';
      case 'baja':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!record) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Registro no encontrado
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            El registro que buscas no existe o ha sido eliminado.
          </p>
          <Button
            onClick={() =>
              router.push(`/dashboard/procesos/${processId}/registros`)
            }
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Registros
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (editing) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => setEditing(false)}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                ← Volver al detalle
              </button>
            </div>
            <ProcessRecordForm
              processId={processId}
              initialData={record}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isLoading={isLoading}
            />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const daysUntilDue = getDaysUntilDue(record.fecha_vencimiento);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header con navegación */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() =>
                router.push(`/dashboard/procesos/${processId}/registros`)
              }
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Registros
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {record.titulo}
              </h1>
              <p className="text-gray-600">Registro de proceso</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getEstadoColor(record.estado)}>
              {record.estado === 'pendiente'
                ? 'Pendiente'
                : record.estado === 'en-progreso'
                  ? 'En Progreso'
                  : 'Completado'}
            </Badge>
            <Badge className={getPrioridadColor(record.prioridad)}>
              {record.prioridad.charAt(0).toUpperCase() +
                record.prioridad.slice(1)}
            </Badge>
            <Button onClick={() => setEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        </div>

        {/* Contenido del registro */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {record.descripcion}
                </p>
              </CardContent>
            </Card>

            {/* Información adicional */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Responsable:</span>
                    <span className="font-medium">{record.responsable}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Fecha de vencimiento:
                    </span>
                    <span
                      className={`font-medium ${daysUntilDue < 0 ? 'text-red-600' : daysUntilDue <= 3 ? 'text-orange-600' : 'text-gray-900'}`}
                    >
                      {new Date(record.fecha_vencimiento).toLocaleDateString(
                        'es-ES'
                      )}
                      {daysUntilDue < 0 && (
                        <span className="ml-1">
                          ({Math.abs(daysUntilDue)} días vencida)
                        </span>
                      )}
                      {daysUntilDue === 0 && (
                        <span className="ml-1">(Vence hoy)</span>
                      )}
                      {daysUntilDue > 0 && daysUntilDue <= 3 && (
                        <span className="ml-1">({daysUntilDue} días)</span>
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Estado del Registro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Estado actual</p>
                  <Badge
                    className={`${getEstadoColor(record.estado)} text-sm px-3 py-1`}
                  >
                    {record.estado === 'pendiente'
                      ? 'Pendiente'
                      : record.estado === 'en-progreso'
                        ? 'En Progreso'
                        : 'Completado'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Prioridad</p>
                  <Badge
                    className={`${getPrioridadColor(record.prioridad)} text-sm px-3 py-1`}
                  >
                    {record.prioridad.charAt(0).toUpperCase() +
                      record.prioridad.slice(1)}
                  </Badge>
                </div>
                {daysUntilDue < 0 && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-md">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-700">
                      Registro vencido
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información del Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Creado</p>
                  <p className="text-sm font-medium">
                    {new Date(record.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Última actualización</p>
                  <p className="text-sm font-medium">
                    {new Date(record.updatedAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ID</p>
                  <p className="text-sm font-mono break-all">{record.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ID del Proceso</p>
                  <p className="text-sm font-mono break-all">
                    {record.processId}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
