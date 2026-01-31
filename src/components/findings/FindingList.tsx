import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import type { Finding } from '@/types/findings';
import { FINDING_STATUS_COLORS, FINDING_STATUS_LABELS } from '@/types/findings';
import { Grid, List, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FindingCardCompact } from './FindingCardCompact';
import { FindingFormDialog } from './FindingFormDialog';

interface FindingListProps {
  filters?: {
    status?: string;
    processId?: string;
    year?: number;
    search?: string;
    requiresAction?: boolean;
  };
}

export function FindingList({ filters: initialFilters }: FindingListProps) {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadFindings = async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      if (initialFilters?.processId)
        params.append('processId', initialFilters.processId);
      if (initialFilters?.year)
        params.append('year', initialFilters.year.toString());
      if (initialFilters?.requiresAction !== undefined)
        params.append(
          'requiresAction',
          initialFilters.requiresAction.toString()
        );

      // Apply local filters
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/findings?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Error al cargar hallazgos');
      }

      const data = await response.json();
      const validFindings = data.findings.filter(
        (f: Finding) => f.registration && f.findingNumber
      );
      setFindings(validFindings);
    } catch (error) {
      console.error('Error loading findings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFindings();
  }, [initialFilters, statusFilter, searchTerm]); // Re-load when filters change

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Hallazgos"
        description="Registro y seguimiento de no conformidades y oportunidades de mejora"
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Hallazgos' },
        ]}
        actions={
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Hallazgo
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border-0 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar hallazgos..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 h-10 bg-slate-50 border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] h-10 bg-slate-50 border-slate-200">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {Object.entries(FINDING_STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-1 border border-slate-200 rounded-md p-1 bg-slate-50">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('cards')}
            className={
              viewMode === 'cards'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Cargando hallazgos...</p>
        </div>
      ) : findings.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
          <p className="text-slate-500">No se encontraron hallazgos</p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {findings.map(finding => (
            <FindingCardCompact key={finding.id} finding={finding} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border-0 shadow-sm overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
                <TableHead className="font-semibold text-slate-700">
                  Código
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Nombre
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Estado
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Fecha
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Progreso
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {findings.map(finding => (
                <TableRow
                  key={finding.id}
                  className="hover:bg-slate-50/50 cursor-pointer transition-colors border-b border-slate-100 last:border-0"
                  onClick={() =>
                    (window.location.href = `/hallazgos/${finding.id}`)
                  }
                >
                  <TableCell className="font-medium font-mono text-sm text-slate-600">
                    {finding.findingNumber}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {finding.registration?.name || 'Sin nombre'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${FINDING_STATUS_COLORS[finding.status] || 'bg-slate-100 text-slate-700'}`}
                    >
                      {FINDING_STATUS_LABELS[finding.status] || finding.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {formatDate(finding.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full"
                          style={{ width: `${finding.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">
                        {finding.progress}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <FindingFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => {
          setIsFormOpen(false);
          loadFindings();
        }}
      />
    </div>
  );
}
