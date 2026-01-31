'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProcessKanban } from '@/components/procesos/ProcessKanban';
import { ProcessRecordForm } from '@/components/procesos/ProcessRecordForm';
import { ProcessRecordFormData } from '@/lib/validations/procesos';
import { ProcessRecordService } from '@/services/procesos/ProcessRecordService';
import { ProcessRecord } from '@/types/procesos';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ProcessRecordsPage() {
  const params = useParams();
  const router = useRouter();
  const processId = params.id as string;

  const [showForm, setShowForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ProcessRecord | null>(
    null
  );
  const [processName, setProcessName] = useState('Proceso');
  const [isLoading, setIsLoading] = useState(false);

  // Obtener el nombre del proceso (simplificado)
  React.useEffect(() => {
    // Aquí podríamos hacer una llamada para obtener el nombre del proceso
    // Por ahora usamos un nombre genérico
    setProcessName('Proceso');
  }, [processId]);

  const handleNewRecord = () => {
    setSelectedRecord(null);
    setShowForm(true);
  };

  const handleEditRecord = (record: ProcessRecord) => {
    setSelectedRecord(record);
    setShowForm(true);
  };

  const handleViewRecord = (record: ProcessRecord) => {
    router.push(`/dashboard/procesos/${processId}/registros/${record.id}`);
  };

  const handleFormSubmit = async (data: ProcessRecordFormData) => {
    setIsLoading(true);
    try {
      if (selectedRecord) {
        await ProcessRecordService.update(selectedRecord.id, data);
      } else {
        await ProcessRecordService.create(data);
      }
      setShowForm(false);
      // Recargar la página para actualizar el kanban
      window.location.reload();
    } catch (error) {
      console.error('Error al guardar registro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {showForm ? (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => setShowForm(false)}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                ← Volver al Kanban
              </button>
            </div>
            <ProcessRecordForm
              processId={processId}
              initialData={selectedRecord}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <>
            {/* Header con navegación */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() =>
                    router.push(`/dashboard/procesos/${processId}`)
                  }
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al Proceso
                </Button>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Registros del Proceso
                  </h1>
                  <p className="text-gray-600">{processName}</p>
                </div>
              </div>
            </div>

            <ProcessKanban
              processId={processId}
              processName={processName}
              onNewRecord={handleNewRecord}
              onEditRecord={handleEditRecord}
              onViewRecord={handleViewRecord}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
