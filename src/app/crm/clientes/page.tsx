'use client';

import { ABMHeader, ABMViewMode } from '@/components/abm';
import { ClientesGrid } from '@/components/crm/clientes/ClientesGrid';
import { ClientesList } from '@/components/crm/clientes/ClientesList';
import { NuevoClienteDialog } from '@/components/crm/NuevoClienteDialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import type { ClienteCRM } from '@/types/crm';
import { Building2, Loader2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ClientesPage() {
  const { user, loading: authLoading } = useAuth();
  const [clientes, setClientes] = useState<ClienteCRM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [showNuevoClienteDialog, setShowNuevoClienteDialog] = useState(false);
  const [viewMode, setViewMode] = useState<ABMViewMode>('list');

  const organizationId = user?.organization_id;

  const loadClientes = async () => {
    if (!organizationId) {
      setError('No se encontró la organización');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `/api/crm/clientes?organization_id=${organizationId}`
      );
      const data = await res.json();
      if (data.success) {
        setClientes(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('Error loading clients:', err);
      setError('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (organizationId) {
      loadClientes();
    } else {
      setLoading(false);
    }
  }, [authLoading, organizationId]);

  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch =
      cliente.razon_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cuit_cuil?.includes(searchTerm) ||
      cliente.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTipo =
      filterTipo === 'all' || cliente.tipo_cliente === filterTipo;

    return matchesSearch && matchesTipo;
  });

  const renderView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      );
    }

    if (error) {
      return <div className="text-center py-8 text-red-600">{error}</div>;
    }

    switch (viewMode) {
      case 'grid':
        return <ClientesGrid clientes={filteredClientes} />;
      default:
        return <ClientesList clientes={filteredClientes} />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <ABMHeader
        title="Clientes / Organizaciones"
        subtitle="Gestiona las organizaciones y empresas del CRM"
        icon={<Building2 className="h-6 w-6 text-blue-600" />}
        searchPlaceholder="Buscar por razón social, CUIT o email..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        currentView={viewMode}
        onViewChange={setViewMode}
        hasKanban={false}
        actions={
          <Button
            onClick={() => setShowNuevoClienteDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
        }
        filters={
          <Select value={filterTipo} onValueChange={setFilterTipo}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Tipo de cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="posible_cliente">Posible Cliente</SelectItem>
              <SelectItem value="cliente_frecuente">
                Cliente Frecuente
              </SelectItem>
              <SelectItem value="cliente_antiguo">Cliente Antiguo</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <p className="text-sm text-muted-foreground">
        Mostrando {filteredClientes.length} de {clientes.length} clientes
      </p>

      {renderView()}

      <NuevoClienteDialog
        open={showNuevoClienteDialog}
        onOpenChange={setShowNuevoClienteDialog}
        onSuccess={loadClientes}
      />
    </div>
  );
}
