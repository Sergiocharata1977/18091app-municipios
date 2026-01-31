import { syncUserRoleFromPersonnel } from '@/lib/utils/user-personnel-sync';
import { personnelSchema } from '@/lib/validations/rrhh';
import { PersonnelService } from '@/services/rrhh/PersonnelService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const personnel = await PersonnelService.getById(id);

    if (!personnel) {
      return NextResponse.json(
        { error: 'Personal no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(personnel);
  } catch (error) {
    console.error('Error in personnel GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener personal' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = personnelSchema.parse(body);

    console.log('[API /personnel/[id]] Actualizando personal:', id);

    // Actualizar personal
    const personnel = await PersonnelService.update(id, validatedData);

    console.log('[API /personnel/[id]] Personal actualizado exitosamente');

    // Sincronizar rol del usuario si cambió tipo_personal
    if (validatedData.tipo_personal) {
      console.log(
        '[API /personnel/[id]] Sincronizando rol de usuario para tipo_personal:',
        validatedData.tipo_personal
      );

      // Ejecutar sincronización en background (no bloquear respuesta)
      syncUserRoleFromPersonnel(id, validatedData.tipo_personal).catch(
        error => {
          console.error(
            '[API /personnel/[id]] Error en sincronización de rol:',
            error
          );
          // No lanzar error, la actualización del personal ya se completó
        }
      );
    }

    return NextResponse.json(personnel);
  } catch (error) {
    console.error('Error in personnel PUT:', error);

    if (
      error &&
      typeof error === 'object' &&
      'name' in error &&
      error.name === 'ZodError'
    ) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: (error as any).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar personal' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await PersonnelService.delete(id);

    return NextResponse.json({ message: 'Personal eliminado exitosamente' });
  } catch (error) {
    console.error('Error in personnel DELETE:', error);
    return NextResponse.json(
      { error: 'Error al eliminar personal' },
      { status: 500 }
    );
  }
}

// PATCH for toggling status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === 'toggle_status') {
      const personnel = await PersonnelService.toggleStatus(id);
      return NextResponse.json(personnel);
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    console.error('Error in personnel PATCH:', error);
    return NextResponse.json(
      { error: 'Error al actualizar personal' },
      { status: 500 }
    );
  }
}
