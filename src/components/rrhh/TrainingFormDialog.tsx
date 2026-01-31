'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Personnel } from '@/types/rrhh';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface TrainingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TrainingFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: TrainingFormDialogProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [systemUsers, setSystemUsers] = useState<Personnel[]>([]);

  const [formData, setFormData] = useState({
    tema: '',
    modalidad: 'presencial' as 'presencial' | 'virtual' | 'mixta',
    fecha_inicio: '',
    fecha_fin: '',
    responsable_id: '',
  });

  const loadSystemUsers = useCallback(async () => {
    try {
      const orgId =
        sessionStorage.getItem('organization_id') ||
        (user as any)?.organization_id;
      if (!orgId) return;

      const response = await fetch(
        `/api/rrhh/personnel?organization_id=${orgId}&tiene_acceso_sistema=true&limit=100`
      );
      if (response.ok) {
        const data = await response.json();
        const personnel = data.data || data;
        setSystemUsers(
          Array.isArray(personnel)
            ? personnel.filter((p: Personnel) => p.estado === 'Activo')
            : []
        );
      }
    } catch (error) {
      console.error('Error loading system users:', error);
    }
  }, [user]);

  useEffect(() => {
    if (open) {
      loadSystemUsers();
    }
  }, [open, loadSystemUsers]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validar que el usuario tenga organization_id
      if (!user?.organization_id) {
        throw new Error('No se pudo obtener la organización del usuario');
      }

      const responsable = systemUsers.find(
        u => u.user_id === formData.responsable_id
      );

      const payload = {
        tema: formData.tema,
        modalidad: formData.modalidad,
        // Convert date strings to Date objects
        fecha_inicio: new Date(formData.fecha_inicio),
        fecha_fin: new Date(formData.fecha_fin),
        organization_id: user.organization_id,
        // Responsable
        responsable_id: formData.responsable_id || null,
        responsable_nombre: responsable
          ? `${responsable.nombres} ${responsable.apellidos}`
          : null,
        // Valores por defecto que se editarán en el Single View
        descripcion: '',
        horas: 0,
        proveedor: '',
        costo: 0,
        estado: 'planificada',
        certificado_url: '',
        participantes: [],
        competenciasDesarrolladas: [],
        evaluacionPosterior: false,
      };

      const response = await fetch('/api/rrhh/trainings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear capacitación');
      }

      const newTraining = await response.json();

      // Show success toast
      toast({
        title: '✅ Capacitación creada',
        description: `"${newTraining.tema}" fue creada exitosamente`,
      });

      // Reset form
      setFormData({
        tema: '',
        modalidad: 'presencial',
        fecha_inicio: '',
        fecha_fin: '',
        responsable_id: '',
      });

      onOpenChange(false);
      onSuccess?.();

      // Navegar al single view
      router.push(`/dashboard/rrhh/trainings/${newTraining.id}`);
    } catch (error: any) {
      console.error('Error creating training:', error);
      toast({
        title: '❌ Error',
        description: error.message || 'No se pudo crear la capacitación',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva Capacitación</DialogTitle>
          <DialogDescription>
            Los participantes y competencias se asignarán después
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Tema */}
          <div className="space-y-2">
            <Label htmlFor="tema">Tema de la Capacitación *</Label>
            <Input
              id="tema"
              placeholder="Ej: Soldadura TIG Avanzada"
              value={formData.tema}
              onChange={e => handleChange('tema', e.target.value)}
              required
              className="focus:ring-emerald-500 focus:border-emerald-500"
              autoFocus
            />
          </div>

          {/* Modalidad */}
          <div className="space-y-2">
            <Label htmlFor="modalidad">Modalidad *</Label>
            <Select
              value={formData.modalidad}
              onValueChange={value => handleChange('modalidad', value)}
            >
              <SelectTrigger className="focus:ring-emerald-500 focus:border-emerald-500">
                <SelectValue placeholder="Seleccionar modalidad..." />
              </SelectTrigger>
              <SelectContent className="z-[9999] bg-white">
                <SelectItem value="presencial">Presencial</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="mixta">Mixta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha_inicio">Fecha de Inicio *</Label>
              <Input
                id="fecha_inicio"
                type="date"
                value={formData.fecha_inicio}
                onChange={e => handleChange('fecha_inicio', e.target.value)}
                required
                className="focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_fin">Fecha de Fin *</Label>
              <Input
                id="fecha_fin"
                type="date"
                value={formData.fecha_fin}
                onChange={e => handleChange('fecha_fin', e.target.value)}
                required
                min={formData.fecha_inicio}
                className="focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Responsable */}
          <div className="space-y-2">
            <Label htmlFor="responsable_id">Responsable *</Label>
            <Select
              value={formData.responsable_id}
              onValueChange={value => handleChange('responsable_id', value)}
            >
              <SelectTrigger className="bg-white focus:ring-emerald-500 focus:border-emerald-500">
                <SelectValue placeholder="Seleccionar responsable..." />
              </SelectTrigger>
              <SelectContent className="z-[9999] bg-white">
                {systemUsers.length === 0 ? (
                  <SelectItem value="_empty" disabled>
                    No hay usuarios disponibles
                  </SelectItem>
                ) : (
                  systemUsers.map(u => (
                    <SelectItem key={u.id} value={u.user_id!}>
                      {u.nombres} {u.apellidos}
                      {u.puesto ? ` - ${u.puesto}` : ''}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Usuario responsable de coordinar la capacitación
            </p>
          </div>

          <p className="text-xs text-gray-500">
            Los detalles (descripción, participantes, competencias, costos) se
            configurarán después
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.tema ||
                !formData.fecha_inicio ||
                !formData.fecha_fin ||
                !formData.responsable_id
              }
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              {isSubmitting ? 'Creando...' : 'Crear Capacitación'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
