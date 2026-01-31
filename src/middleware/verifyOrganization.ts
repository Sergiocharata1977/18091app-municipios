/**
 * Middleware para verificar que el usuario pertenece a una organización válida
 * y tiene acceso al contexto solicitado
 */

import { UserService } from '@/services/auth/UserService';

export interface OrganizationVerificationResult {
  valid: boolean;
  organization_id?: string;
  error?: string;
  errorCode?: 'USER_NOT_FOUND' | 'NO_ORGANIZATION' | 'ORGANIZATION_MISMATCH';
}

/**
 * Verifica que un usuario tenga una organización asignada
 * @param userId Firebase Auth UID
 * @returns Resultado de la verificación
 */
export async function verifyUserOrganization(
  userId: string
): Promise<OrganizationVerificationResult> {
  try {
    const user = await UserService.getById(userId);

    if (!user) {
      return {
        valid: false,
        error: 'Usuario no encontrado',
        errorCode: 'USER_NOT_FOUND',
      };
    }

    if (!user.organization_id) {
      return {
        valid: false,
        error:
          'Usuario sin organización asignada. Por favor contacte al administrador.',
        errorCode: 'NO_ORGANIZATION',
      };
    }

    return {
      valid: true,
      organization_id: user.organization_id,
    };
  } catch (error) {
    console.error('[verifyUserOrganization] Error:', error);

    // Si el error es por falta de organization_id, retornar error específico
    if (error instanceof Error && error.message.includes('no organization')) {
      return {
        valid: false,
        error: error.message,
        errorCode: 'NO_ORGANIZATION',
      };
    }

    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      errorCode: 'USER_NOT_FOUND',
    };
  }
}

/**
 * Verifica que un usuario tenga acceso a datos de una organización específica
 * @param userId Firebase Auth UID
 * @param targetOrganizationId ID de la organización objetivo
 * @returns Resultado de la verificación
 */
export async function verifyOrganizationAccess(
  userId: string,
  targetOrganizationId: string
): Promise<OrganizationVerificationResult> {
  try {
    const verification = await verifyUserOrganization(userId);

    if (!verification.valid) {
      return verification;
    }

    // Verificar que el usuario pertenece a la organización objetivo
    if (verification.organization_id !== targetOrganizationId) {
      return {
        valid: false,
        error: 'Acceso denegado: el usuario no pertenece a esta organización',
        errorCode: 'ORGANIZATION_MISMATCH',
      };
    }

    return {
      valid: true,
      organization_id: verification.organization_id,
    };
  } catch (error) {
    console.error('[verifyOrganizationAccess] Error:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
