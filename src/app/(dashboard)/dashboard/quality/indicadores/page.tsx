'use client';

import { IndicatorFormDialog } from '@/components/quality/IndicatorFormDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QualityIndicator } from '@/types/quality';
import {
  BarChart3,
  Minus,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function IndicadoresListing() {
  const [indicators, setIndicators] = useState<QualityIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showNewDialog, setShowNewDialog] = useState(false);

  useEffect(() => {
    fetchIndicators();
  }, []);

  const fetchIndicators = async () => {
    try {
      const response = await fetch('/api/quality/indicators');
      if (response.ok) {
        const data = await response.json();
        setIndicators(data);
      }
    } catch (error) {
      console.error('Error fetching indicators:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIndicators = indicators.filter(indicator => {
    const matchesSearch =
      indicator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      indicator.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      indicator.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || indicator.status === statusFilter;
    const matchesType = typeFilter === 'all' || indicator.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'inactivo':
        return 'bg-gray-100 text-gray-800';
      case 'suspendido':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'activo':
        return 'Activo';
      case 'inactivo':
        return 'Inactivo';
      case 'suspendido':
        return 'Suspendido';
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'eficacia':
        return 'Eficacia';
      case 'eficiencia':
        return 'Eficiencia';
      case 'efectividad':
        return 'Efectividad';
      case 'calidad':
        return 'Calidad';
      case 'productividad':
        return 'Productividad';
      default:
        return type;
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

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'ascendente':
        return 'Ascendente';
      case 'descendente':
        return 'Descendente';
      default:
        return 'Estable';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando indicadores...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Indicadores de Calidad
          </h1>
          <p className="text-gray-600 mt-1">
            Métricas y KPIs para monitoreo continuo
          </p>
        </div>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Indicador
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar indicadores..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
                <SelectItem value="suspendido">Suspendido</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="eficacia">Eficacia</SelectItem>
                <SelectItem value="eficiencia">Eficiencia</SelectItem>
                <SelectItem value="efectividad">Efectividad</SelectItem>
                <SelectItem value="calidad">Calidad</SelectItem>
                <SelectItem value="productividad">Productividad</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIndicators.map(indicator => (
          <Link
            key={indicator.id}
            href={`/dashboard/quality/indicadores/${indicator.id}`}
            className="block"
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{indicator.code}</CardTitle>
                    <CardDescription className="mt-1">
                      {getTypeText(indicator.type)}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(indicator.status)}>
                    {getStatusText(indicator.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-medium text-gray-900 mb-2">
                  {indicator.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {indicator.description}
                </p>

                {/* Current Value & Trend */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Valor Actual</span>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(indicator.trend)}
                      <span className="text-sm text-gray-600">
                        {getTrendText(indicator.trend)}
                      </span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {indicator.current_value || 0} {indicator.unit}
                  </div>
                </div>

                {/* Targets */}
                <div className="text-sm text-gray-500 space-y-1 mb-4">
                  <div>
                    Meta Mín: {indicator.target_min} {indicator.unit}
                  </div>
                  <div>
                    Meta Máx: {indicator.target_max} {indicator.unit}
                  </div>
                  <div>Frecuencia: {indicator.measurement_frequency}</div>
                </div>

                {/* Formula */}
                <div className="mb-4">
                  <span className="text-xs text-gray-500">Fórmula:</span>
                  <p className="text-sm font-mono bg-gray-50 p-2 rounded mt-1">
                    {indicator.formula}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredIndicators.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron indicadores
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza creando tu primer indicador de calidad'}
            </p>
            <Button onClick={() => setShowNewDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Indicador
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog for creating new indicator */}
      <IndicatorFormDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSuccess={() => {
          setShowNewDialog(false);
          fetchIndicators();
        }}
      />
    </div>
  );
}
