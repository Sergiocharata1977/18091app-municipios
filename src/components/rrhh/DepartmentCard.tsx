import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Users,
  UserCheck,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  Target,
} from 'lucide-react';
import { Department } from '@/types/rrhh';

interface DepartmentCardProps {
  department: Department;
  onView: (department: Department) => void;
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
  onCardClick?: (department: Department) => void;
}

export function DepartmentCard({
  department,
  onView,
  onEdit,
  onDelete,
  onCardClick,
}: DepartmentCardProps) {
  // Función para obtener iniciales del departamento
  const getInitials = (nombre: string) => {
    if (!nombre) return 'DP';
    return nombre
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Función para obtener color del estado
  const getEstadoColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  const handleCardClick = () => {
    onCardClick?.(department);
  };

  return (
    <Card
      className="bg-white shadow-md p-6 hover:shadow-lg hover:scale-[1.02] cursor-pointer transition-all duration-200 rounded-xl border-0"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Ver detalles de ${department.nombre}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Icono del departamento */}
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
            {getInitials(department.nombre)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{department.nombre}</h3>
            <p className="text-sm text-gray-600">
              {department.responsable_id || 'Sin responsable asignado'}
            </p>
            <p className="text-xs text-gray-500 font-mono">
              ID: {department.id}
            </p>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {department.descripcion || 'Sin descripción'}
      </p>

      <div className="space-y-2 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>0 empleados</span>
        </div>
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4" />
          <span>Responsable: {department.responsable_id || 'Sin asignar'}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge className={getEstadoColor(department.is_active)}>
          {department.is_active ? 'Activo' : 'Inactivo'}
        </Badge>
        <Badge variant="outline">0 empleados</Badge>
      </div>

      <div className="mt-4 pt-4">
        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          <Button
            size="sm"
            className="flex-1 flex items-center justify-center gap-2"
            onClick={() => onView(department)}
            aria-label={`Ver detalles de ${department.nombre}`}
          >
            <Eye className="h-4 w-4" />
            Ver Detalles
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(department)}
            aria-label={`Editar ${department.nombre}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(department)}
            aria-label={`Eliminar ${department.nombre}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
