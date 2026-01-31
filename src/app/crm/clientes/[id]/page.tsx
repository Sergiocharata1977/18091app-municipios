'use client';

import { ClientActionTimeline } from '@/components/crm/actions/ClientActionTimeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { ClienteCRM, TipoCliente } from '@/types/crm';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  DollarSign,
  Loader2,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Tipos auxiliares para badges
const TIPO_CLIENTE_LABELS: Record<TipoCliente, string> = {
  posible_cliente: 'Posible Cliente',
  cliente_frecuente: 'Cliente Frecuente',
  cliente_antiguo: 'Cliente Antiguo',
};

const TIPO_CLIENTE_COLORS: Record<TipoCliente, string> = {
  posible_cliente: 'bg-blue-100 text-blue-700',
  cliente_frecuente: 'bg-green-100 text-green-700',
  cliente_antiguo: 'bg-gray-100 text-gray-700',
};

export default function ClienteDetallePage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [cliente, setCliente] = useState<ClienteCRM | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCliente = async () => {
      if (!user?.organization_id) return;
      try {
        setLoading(true);
        // Usamos la API de lista con filtro ID (o idealmente una ruta individual si existiera)
        // Como la ruta api/crm/clientes/[id] SÍ existe según el grep anterior, intentamos usar esa.
        const res = await fetch(
          `/api/crm/clientes/${params.id}?organization_id=${user.organization_id}`
        );
        const data = await res.json();

        if (data.success) {
          setCliente(data.data);
        } else {
          setError(data.error || 'No se encontró el cliente');
        }
      } catch (err) {
        console.error('Error fetching client:', err);
        setError('Error al cargar datos del cliente');
      } finally {
        setLoading(false);
      }
    };

    fetchCliente();
  }, [params.id, user?.organization_id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !cliente) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-600 font-medium">
          {error || 'Cliente no encontrado'}
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/crm/clientes')}
            className="text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2 text-gray-900">
              <Building2 className="text-blue-600 h-6 w-6" />
              {cliente.razon_social}
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              {cliente.nombre_comercial && (
                <span>{cliente.nombre_comercial}</span>
              )}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  TIPO_CLIENTE_COLORS[cliente.tipo_cliente]
                }`}
              >
                {TIPO_CLIENTE_LABELS[cliente.tipo_cliente]}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Aquí podrían ir botones de acción rápida como "Editar" */}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden p-6 grid grid-cols-12 gap-6">
        {/* Left Column: Client Info & Details (4 cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-6 overflow-y-auto pr-2">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium uppercase text-gray-500">
                Información de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cliente.email && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <a
                      href={`mailto:${cliente.email}`}
                      className="text-sm text-blue-600 hover:underline truncate block"
                    >
                      {cliente.email}
                    </a>
                  </div>
                </div>
              )}

              {cliente.telefono && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Teléfono
                    </p>
                    <a
                      href={`tel:${cliente.telefono}`}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      {cliente.telefono}
                    </a>
                  </div>
                </div>
              )}

              {(cliente.direccion || cliente.localidad) && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Ubicación
                    </p>
                    <p className="text-sm text-gray-600">
                      {[cliente.direccion, cliente.localidad, cliente.provincia]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Business Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium uppercase text-gray-500">
                Datos Comerciales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2 text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm">CUIT/CUIL</span>
                </div>
                <span className="text-sm font-medium">{cliente.cuit_cuil}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Monto Estimado</span>
                </div>
                <span className="text-sm font-medium">
                  {cliente.monto_estimado_compra
                    ? `$${cliente.monto_estimado_compra.toLocaleString()}`
                    : '-'}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Creado el</span>
                </div>
                <span className="text-sm font-medium">
                  {new Date(cliente.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Timeline & Activities (8 cols) */}
        <div className="col-span-12 lg:col-span-8 h-full min-h-[500px]">
          <Tabs defaultValue="actividad" className="h-full flex flex-col">
            <TabsList className="w-full justify-start border-b rounded-none p-0 h-auto bg-transparent mb-4">
              <TabsTrigger
                value="actividad"
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4 py-3"
              >
                Historial de Actividad
              </TabsTrigger>
              <TabsTrigger
                value="oportunidades"
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4 py-3"
              >
                Oportunidades
              </TabsTrigger>
              <TabsTrigger
                value="notas"
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4 py-3"
              >
                Notas
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="actividad"
              className="flex-1 min-h-0 data-[state=active]:flex"
            >
              <div className="w-full h-full">
                <ClientActionTimeline
                  clienteId={cliente.id}
                  clienteNombre={cliente.razon_social}
                />
              </div>
            </TabsContent>

            <TabsContent
              value="oportunidades"
              className="p-4 bg-white rounded-lg border"
            >
              <div className="text-center py-10 text-gray-500">
                <p>
                  Próximamente: Historial de oportunidades Kanban de este
                  cliente.
                </p>
              </div>
            </TabsContent>

            <TabsContent
              value="notas"
              className="p-4 bg-white rounded-lg border"
            >
              <div className="whitespace-pre-wrap text-sm text-gray-700">
                {cliente.notas || 'No hay notas registradas.'}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
