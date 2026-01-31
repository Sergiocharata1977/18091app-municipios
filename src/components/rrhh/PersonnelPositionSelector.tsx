'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Position } from '@/types/rrhh';

interface PersonnelPositionSelectorProps {
  value?: string;
  onChange: (positionId: string, replaceAssignments: boolean) => void;
  disabled?: boolean;
  isEditing?: boolean;
  currentPositionId?: string;
}

export function PersonnelPositionSelector({
  value,
  onChange,
  disabled = false,
  isEditing = false,
  currentPositionId,
}: PersonnelPositionSelectorProps) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState(value || '');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingPositionId, setPendingPositionId] = useState('');

  useEffect(() => {
    loadPositions();
  }, []);

  useEffect(() => {
    setSelectedPosition(value || '');
  }, [value]);

  const loadPositions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/positions');
      if (res.ok) {
        const data = await res.json();
        setPositions(data);
      }
    } catch (error) {
      console.error('Error loading positions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePositionChange = (newPositionId: string) => {
    // Si estamos editando y ya había un puesto asignado, mostrar diálogo
    if (isEditing && currentPositionId && currentPositionId !== newPositionId) {
      setPendingPositionId(newPositionId);
      setShowConfirmDialog(true);
    } else {
      // Si es creación o no había puesto previo, copiar asignaciones automáticamente
      setSelectedPosition(newPositionId);
      onChange(newPositionId, true);
    }
  };

  const handleConfirmReplace = (replace: boolean) => {
    setSelectedPosition(pendingPositionId);
    onChange(pendingPositionId, replace);
    setShowConfirmDialog(false);
    setPendingPositionId('');
  };

  const handleCancelChange = () => {
    setShowConfirmDialog(false);
    setPendingPositionId('');
  };

  if (loading) {
    return (
      <div>
        <Label>Puesto</Label>
        <div className="w-full p-3 border rounded-lg bg-gray-50 animate-pulse">
          Cargando puestos...
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <Label htmlFor="position">Puesto</Label>
        <select
          id="position"
          value={selectedPosition}
          onChange={e => handlePositionChange(e.target.value)}
          disabled={disabled}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Seleccionar puesto...</option>
          {positions.map(position => (
            <option key={position.id} value={position.id}>
              {position.nombre}
            </option>
          ))}
        </select>
        {!isEditing && selectedPosition && (
          <p className="text-sm text-gray-600 mt-2">
            Las asignaciones de contexto del puesto se copiarán automáticamente
          </p>
        )}
      </div>

      {/* Diálogo de confirmación */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    ¿Cambiar puesto?
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Estás cambiando el puesto de este empleado. ¿Deseas
                    reemplazar las asignaciones actuales de contexto (procesos,
                    objetivos, indicadores) con las del nuevo puesto?
                  </p>
                  <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Mantener actuales:</strong> Conserva las
                      asignaciones personalizadas del empleado
                    </p>
                    <p className="text-sm text-yellow-800 mt-2">
                      <strong>Reemplazar:</strong> Adopta las asignaciones
                      estándar del nuevo puesto
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancelChange}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleConfirmReplace(false)}
                  className="flex-1"
                >
                  Mantener Actuales
                </Button>
                <Button
                  onClick={() => handleConfirmReplace(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Reemplazar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
