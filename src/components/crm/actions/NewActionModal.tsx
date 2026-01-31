'use client';

import { ActionTypeBadge } from '@/components/crm/actions/ActionTypeBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { CRMAccionTipo } from '@/types/crmAcciones';
import { Loader2, Plus } from 'lucide-react';
import { useState } from 'react';

interface NewActionModalProps {
  children?: React.ReactNode;
  clienteId?: string; // Pre-selección opcional
  clienteNombre?: string;
  oportunidadId?: string; // Pre-selección opcional
  oportunidadTitulo?: string; // Para mostrar qué oportunidad es
  onActionCreated?: () => void;
  triggerLabel?: string;
}

export function NewActionModal({
  children,
  clienteId,
  clienteNombre,
  oportunidadId,
  oportunidadTitulo,
  onActionCreated,
  triggerLabel = 'Nueva Acción',
}: NewActionModalProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<{
    tipo: CRMAccionTipo;
    titulo: string;
    descripcion: string;
    fecha: string;
    hora: string;
    estado: 'programada' | 'completada';
  }>({
    tipo: 'llamada',
    titulo: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: '10:00',
    estado: 'programada',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.organization_id) return;

    setLoading(true);
    try {
      // Combinar fecha y hora
      const fechaProgramada = new Date(
        `${formData.fecha}T${formData.hora}:00`
      ).toISOString();

      const res = await fetch('/api/crm/acciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: user.organization_id,
          cliente_id: clienteId || null,
          cliente_nombre: clienteNombre || null,
          oportunidad_id: oportunidadId || null,
          oportunidad_titulo: oportunidadTitulo || null,
          tipo: formData.tipo,
          canal: formData.tipo === 'visita' ? 'presencial' : 'telefono', // Simple default map
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          fecha_programada: fechaProgramada,
          fecha_realizada:
            formData.estado === 'completada' ? new Date().toISOString() : null,
          vendedor_id: user.id,
          vendedor_nombre: user.email || 'Vendedor',
          estado: formData.estado,
          resultado:
            formData.estado === 'completada' ? 'realizada' : 'pendiente',
        }),
      });

      if (res.ok) {
        setOpen(false);
        // Reset form
        setFormData({
          tipo: 'llamada',
          titulo: '',
          descripcion: '',
          fecha: new Date().toISOString().split('T')[0],
          hora: '10:00',
          estado: 'programada',
        });
        if (onActionCreated) onActionCreated();
      }
    } catch (error) {
      console.error('Error creating action:', error);
    } finally {
      setLoading(false);
    }
  };

  const tipos: CRMAccionTipo[] = [
    'llamada',
    'whatsapp',
    'mail',
    'visita',
    'reunion',
    'cotizacion',
    'tarea',
    'seguimiento',
    'otro',
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Acción Comercial</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Contexto (Informativo si viene pre-seleccionado) */}
          {(clienteNombre || oportunidadTitulo) && (
            <div className="bg-gray-50 p-2 rounded text-sm text-gray-600 mb-2">
              {clienteNombre && (
                <p>
                  <span className="font-semibold">Cliente:</span>{' '}
                  {clienteNombre}
                </p>
              )}
              {oportunidadTitulo && (
                <p>
                  <span className="font-semibold">Oportunidad:</span>{' '}
                  {oportunidadTitulo}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1 space-y-2">
              <Label>Tipo de Acción</Label>
              <Select
                value={formData.tipo}
                onValueChange={(v: CRMAccionTipo) =>
                  setFormData({ ...formData, tipo: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tipos.map(t => (
                    <SelectItem key={t} value={t}>
                      <div className="flex items-center gap-2">
                        <ActionTypeBadge
                          tipo={t}
                          showLabel={false}
                          className="w-5 h-5 !p-0"
                        />
                        <span className="capitalize">{t}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-1 space-y-2">
              <Label>Estado Inicial</Label>
              <Select
                value={formData.estado}
                onValueChange={(v: any) =>
                  setFormData({ ...formData, estado: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="programada">
                    📅 Programar para luego
                  </SelectItem>
                  <SelectItem value="completada">✅ Ya realizada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Título / Asunto</Label>
            <Input
              required
              placeholder="Ej: Llamada de seguimiento de presupuesto..."
              value={formData.titulo}
              onChange={e =>
                setFormData({ ...formData, titulo: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {formData.estado === 'programada'
                  ? 'Programar para'
                  : 'Realizada el'}
              </Label>
              <Input
                type="date"
                required
                value={formData.fecha}
                onChange={e =>
                  setFormData({ ...formData, fecha: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Hora</Label>
              <Input
                type="time"
                required
                value={formData.hora}
                onChange={e =>
                  setFormData({ ...formData, hora: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notas / Descripción</Label>
            <Textarea
              placeholder="Detalles de la interacción..."
              className="resize-none"
              rows={3}
              value={formData.descripcion}
              onChange={e =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Guardar Acción
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
