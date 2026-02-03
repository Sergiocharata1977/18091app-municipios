// API endpoint for creating users (Auth + Firestore + Personnel)

import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Get or create the default organization for new users
 * This ensures we always have a valid organization_id
 */
async function getOrCreateDefaultOrganization(db: FirebaseFirestore.Firestore): Promise<string> {
  // Try to get the first organization
  const orgsSnapshot = await db.collection('organizations').limit(1).get();
  
  if (!orgsSnapshot.empty) {
    return orgsSnapshot.docs[0].id;
  }
  
  // If no organization exists, create a default one
  console.log('[getOrCreateDefaultOrganization] No organization found, creating default...');
  const defaultOrg = await db.collection('organizations').add({
    name: 'Municipio de Prueba',
    type: 'municipio',
    plan: 'premium',
    status: 'active',
    created_at: new Date(),
    updated_at: new Date(),
  });
  
  console.log('[getOrCreateDefaultOrganization] Created default organization:', defaultOrg.id);
  return defaultOrg.id;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getAdminFirestore();

    // Check if this is a simple user record creation (from AuthContext)
    if (body.uid && body.email && Object.keys(body).length === 2) {
      console.log('[API /users/create] Creating simple user record:', {
        uid: body.uid,
        email: body.email,
      });

      // Check if user already exists using Admin SDK
      const userDoc = await db.collection('users').doc(body.uid).get();
      if (userDoc.exists) {
        console.log(
          '[API /users/create] User already exists, skipping creation'
        );
        return NextResponse.json(
          {
            error: 'El usuario ya existe',
            message: 'El registro de usuario ya fue creado previamente',
          },
          { status: 409 }
        );
      }

      // Get or create default organization
      const organizationId = await getOrCreateDefaultOrganization(db);
      
      // Create user record in Firestore using Admin SDK
      await db.collection('users').doc(body.uid).set({
        email: body.email,
        personnel_id: '', // Will be assigned later by admin
        rol: 'operario', // Default role
        activo: true,
        organization_id: organizationId,
        modulos_habilitados: null, // null = acceso completo por defecto
        created_at: new Date(),
        updated_at: new Date(),
      });

      console.log(
        '[API /users/create] User record created successfully:',
        body.uid
      );

      return NextResponse.json({
        user: {
          id: body.uid,
          email: body.email,
          rol: 'operario',
          activo: true,
        },
        message: 'Usuario creado exitosamente',
      });
    }

    // Full user creation from admin panel
    const { email, password, role, createPersonnel, nombres, apellidos } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    if (createPersonnel && (!nombres || !apellidos)) {
      return NextResponse.json(
        {
          error: 'Nombres y apellidos son requeridos cuando se crea personnel',
        },
        { status: 400 }
      );
    }

    console.log('[API /users/create] Creating full user:', {
      email,
      role,
      createPersonnel,
    });

    const auth = getAdminAuth();
    // db ya está declarado arriba

    // ✅ CHECK: Verify email doesn't exist in Firebase Auth BEFORE attempting to create
    try {
      const existingAuthUser = await auth.getUserByEmail(email);
      if (existingAuthUser) {
        console.log(
          '[API /users/create] Email already exists in Firebase Auth:',
          email
        );
        return NextResponse.json(
          {
            error: 'El email ya está en uso',
            message: `Ya existe un usuario con el email ${email}. Por favor, usa otro email o ve a la página de usuarios para editar el existente.`,
            existingUserId: existingAuthUser.uid,
          },
          { status: 409 }
        );
      }
    } catch (authError: unknown) {
      // If error is NOT "user not found", it's a real error
      if (
        authError &&
        typeof authError === 'object' &&
        'errorInfo' in authError &&
        (authError as { errorInfo: { code: string } }).errorInfo.code !==
          'auth/user-not-found'
      ) {
        console.error(
          '[API /users/create] Error checking existing user:',
          authError
        );
        throw authError;
      }
      // If user not found, continue with creation (this is expected)
    }

    // ✅ CHECK: If creating personnel, verify email doesn't exist in personnel collection
    if (createPersonnel) {
      const existingPersonnelQuery = await db
        .collection('personnel')
        .where('email', '==', email)
        .limit(1)
        .get();

      if (!existingPersonnelQuery.empty) {
        const existingPersonnel = existingPersonnelQuery.docs[0];
        console.log(
          '[API /users/create] Email already exists in personnel:',
          email
        );
        return NextResponse.json(
          {
            error: 'El email ya está en uso',
            message: `Ya existe un empleado con el email ${email}. Si deseas crear un usuario para este empleado, usa la opción "Asignar" en la lista de usuarios.`,
            existingPersonnelId: existingPersonnel.id,
          },
          { status: 409 }
        );
      }
    }

    // Create user in Firebase Auth with provided password
    const userRecord = await auth.createUser({
      email,
      emailVerified: false,
      password: password,
    });

    console.log(
      '[API /users/create] Firebase Auth user created:',
      userRecord.uid
    );

    // Set custom claims
    await auth.setCustomUserClaims(userRecord.uid, {
      role: role || 'operario',
    });

    let personnelId = null;

    // Create personnel record if requested
    if (createPersonnel) {
      const personnelData = {
        nombres: nombres,
        apellidos: apellidos,
        email,
        estado: 'Activo' as const,
        tipo_personal:
          role === 'admin'
            ? 'Directivo'
            : role === 'jefe'
              ? 'Supervisor'
              : 'Operativo',
        fecha_ingreso: new Date(),
        tiene_acceso_sistema: true,
        user_id: userRecord.uid,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const personnelRef = await db.collection('personnel').add(personnelData);
      personnelId = personnelRef.id;

      console.log('[API /users/create] Personnel created:', personnelId);

      // Update custom claims with personnelId
      await auth.setCustomUserClaims(userRecord.uid, {
        role: role || 'operario',
        personnelId,
      });
    }

    // Get or create default organization
    const organizationId = await getOrCreateDefaultOrganization(db);

    // Create user record in Firestore
    await db
      .collection('users')
      .doc(userRecord.uid)
      .set({
        email,
        personnel_id: personnelId,
        rol: role || 'operario',
        activo: true,
        organization_id: organizationId,
        modulos_habilitados: null, // null = acceso completo por defecto
        created_at: new Date(),
        updated_at: new Date(),
      });

    console.log('[API /users/create] User created successfully');

    return NextResponse.json({
      success: true,
      message:
        'Usuario creado exitosamente. Ya puede iniciar sesión con su contraseña.',
      user: {
        uid: userRecord.uid,
        email,
        personnelId,
      },
    });
  } catch (error) {
    console.error('[API /users/create] Error:', error);

    // Handle specific Firebase Auth errors
    if (error && typeof error === 'object' && 'errorInfo' in error) {
      const firebaseError = error as {
        errorInfo: { code: string; message: string };
      };

      if (firebaseError.errorInfo.code === 'auth/email-already-exists') {
        return NextResponse.json(
          {
            error: 'El email ya está en uso',
            message:
              'Ya existe un usuario con este email. Por favor, usa otro email o edita el usuario existente.',
          },
          { status: 409 }
        );
      }

      if (firebaseError.errorInfo.code === 'auth/invalid-email') {
        return NextResponse.json(
          {
            error: 'Email inválido',
            message: 'El formato del email no es válido.',
          },
          { status: 400 }
        );
      }

      if (firebaseError.errorInfo.code === 'auth/weak-password') {
        return NextResponse.json(
          {
            error: 'Contraseña débil',
            message: 'La contraseña debe tener al menos 6 caracteres.',
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Error al crear usuario',
        message: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
