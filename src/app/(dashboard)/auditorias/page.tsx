'use client';

import {
  AuditAdvancedFilters,
  type AuditFiltersState,
} from '@/components/audits/AuditAdvancedFilters';
import { AuditExportButton } from '@/components/audits/AuditExportButton';
import { AuditFormDialog } from '@/components/audits/AuditFormDialog';
import { AuditKanban } from '@/components/audits/AuditKanban';
import { AuditList } from '@/components/audits/AuditList';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import type { Audit, AuditFormData } from '@/types/audits';
import { LayoutGrid, List, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type ViewMode = 'kanban' | 'list';

export default function AuditsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [filteredAudits, setFilteredAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [filters, setFilters] = useState<AuditFiltersState>({});

  useEffect(() => {
    if (user?.organization_id) {
      fetchAudits();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [audits, filters]);

  const fetchAudits = async () => {
    try {
      setLoading(true);

      // MULTI-TENANT: Obtener organization_id del usuario autenticado
      const organizationId = user?.organization_id;
      if (!organizationId) {
        console.error('❌ No organization_id found in user');
        setAudits([]);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `/api/sdk/audits?organization_id=${organizationId}`
      );
      const result = await response.json();

      console.log('📊 Audits API Response:', result);
      console.log('📊 Response success:', result.success);
      console.log('📊 Response data:', result.data);
      console.log('📊 Data length:', result.data?.length);

      if (result.success && result.data && Array.isArray(result.data)) {
        console.log('✅ Setting audits:', result.data);
        setAudits(result.data);
      } else if (result.data && Array.isArray(result.data)) {
        // Fallback: si no hay success pero hay data
        console.log('⚠️ No success flag but data exists, using data anyway');
        setAudits(result.data);
      } else {
        console.log('❌ No valid data received');
        setAudits([]);
      }
    } catch (error) {
      console.error('Error fetching audits:', error);
      setAudits([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...audits];

    // Apply search filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        audit =>
          audit.title.toLowerCase().includes(searchLower) ||
          audit.auditNumber.toLowerCase().includes(searchLower) ||
          audit.scope.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(audit =>
        filters.status?.includes(audit.status)
      );
    }

    // Apply type filter
    if (filters.auditType && filters.auditType.length > 0) {
      filtered = filtered.filter(audit =>
        filters.auditType?.includes(audit.auditType)
      );
    }

    // Apply year filter
    if (filters.year) {
      filtered = filtered.filter(audit => {
        try {
          let auditYear: number;
          const createdAt = audit.createdAt as any;
          if (
            createdAt &&
            typeof createdAt === 'object' &&
            'toDate' in createdAt
          ) {
            // Firestore Timestamp
            auditYear = createdAt.toDate().getFullYear();
          } else if (createdAt instanceof Date) {
            auditYear = createdAt.getFullYear();
          } else if (typeof createdAt === 'string') {
            auditYear = new Date(createdAt).getFullYear();
          } else {
            return false;
          }
          return auditYear === filters.year;
        } catch (e) {
          return false;
        }
      });
    }

    setFilteredAudits(filtered);
  };

  const handleCreateAudit = async (formData: AuditFormData) => {
    try {
      // MULTI-TENANT: Obtener organization_id del usuario autenticado
      const organizationId = user?.organization_id;
      if (!organizationId) {
        throw new Error('No se encontró organization_id en el usuario');
      }

      // Prepare data for API - convert Date to ISO string
      const apiData = {
        ...formData,
        organization_id: organizationId, // ← MULTI-TENANT
        plannedDate:
          formData.plannedDate instanceof Date
            ? formData.plannedDate.toISOString()
            : formData.plannedDate,
      };

      // Call API to create audit
      const response = await fetch('/api/sdk/audits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      const result = await response.json();

      if (result.success && result.data?.id) {
        // Refresh audits list
        await fetchAudits();

        // Redirect to audit detail page
        router.push(`/auditorias/${result.data.id}`);
      } else {
        throw new Error(result.message || 'Error al crear la auditoría');
      }
    } catch (error) {
      console.error('Error creating audit:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando auditorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Auditorías</h1>
          <p className="text-gray-600 mt-1">
            Gestión de auditorías internas ISO 9001
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded ${
                viewMode === 'kanban'
                  ? 'bg-white shadow-sm'
                  : 'hover:bg-gray-200'
              }`}
              title="Vista Kanban"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
              title="Vista Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <AuditExportButton audits={filteredAudits} />

          <Button
            onClick={() => setShowFormDialog(true)}
            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Auditoría
          </Button>
        </div>
      </div>

      {/* Filters */}
      <AuditAdvancedFilters onFiltersChange={setFilters} isLoading={loading} />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">
            {filteredAudits.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Planificadas</p>
          <p className="text-2xl font-bold text-gray-900">
            {filteredAudits.filter(a => a.status === 'planned').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">En Progreso</p>
          <p className="text-2xl font-bold text-emerald-600">
            {filteredAudits.filter(a => a.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Completadas</p>
          <p className="text-2xl font-bold text-green-600">
            {filteredAudits.filter(a => a.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {filteredAudits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              No hay auditorías que coincidan con los filtros
            </p>
          </div>
        ) : viewMode === 'kanban' ? (
          <AuditKanban audits={filteredAudits} />
        ) : (
          <AuditList audits={filteredAudits} />
        )}
      </div>

      {/* Audit Form Dialog */}
      <AuditFormDialog
        open={showFormDialog}
        onClose={() => setShowFormDialog(false)}
        onSubmit={handleCreateAudit}
      />
    </div>
  );
}
