'use client';

import { FindingFormDialog } from '@/components/findings/FindingFormDialog';
import { FindingKanban } from '@/components/findings/FindingKanban';
import { FindingList } from '@/components/findings/FindingList';
import { FindingStats } from '@/components/findings/FindingStats';
import { ModuleMaturityButton } from '@/components/shared/ModuleMaturityButton';
import { LayoutGrid, List, Plus } from 'lucide-react';
import { useState } from 'react';

type ViewMode = 'list' | 'kanban';

export default function HallazgosPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setShowDialog(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hallazgos</h1>
            <p className="text-gray-600 mt-1">
              Gestión de hallazgos con 4 fases: Registro, Acción Inmediata,
              Ejecución y Análisis
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
              <button
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4" />
                Lista
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Kanban
              </button>
            </div>

            {/* Maturity Button */}
            <ModuleMaturityButton moduleKey="hallazgos" />

            {/* New Finding Button */}
            <button
              onClick={() => setShowDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Nuevo Hallazgo
            </button>
          </div>
        </div>

        {/* Stats */}
        <FindingStats key={`stats-${refreshKey}`} />

        {/* Content - List or Kanban */}
        {viewMode === 'list' ? (
          <FindingList key={`list-${refreshKey}`} />
        ) : (
          <FindingKanban key={`kanban-${refreshKey}`} />
        )}

        {/* Dialog */}
        <FindingFormDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}
