import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Rutas que requieren autenticación
  const protectedRoutes = [
    '/dashboard',
    '/rrhh',
    '/procesos',
    '/calidad',
    '/auditorias',
    '/reportes',
    '/admin',
    '/documentos',
    '/hallazgos',
    '/acciones',
    '/contexto',
    '/noticias',
    '/calendario',
    '/indicadores',
  ];

  // Rutas de autenticación (públicas)
  const authRoutes = ['/login', '/register'];

  const { pathname } = request.nextUrl;

  // Verificar si es una ruta protegida
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Obtener la cookie de sesión de Firebase
  // Firebase Auth usa cookies para mantener la sesión
  const sessionCookie = request.cookies.get('__session');
  const firebaseAuthToken = request.cookies.get('firebase-auth-token');

  // También verificar localStorage token via cookie (set by client)
  const authToken = request.cookies.get('auth-token');

  // Verificar si hay algún indicador de autenticación
  const hasAuthIndicator = sessionCookie || firebaseAuthToken || authToken;

  // Si es una ruta protegida y no hay indicador de autenticación
  if (isProtectedRoute && !hasAuthIndicator) {
    // Crear URL de redirección con el returnUrl para volver después del login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);

    // Redirigir al login
    return NextResponse.redirect(loginUrl);
  }

  // Si el usuario está autenticado y trata de acceder a rutas de auth, redirigir a noticias (NUEVO DEFAULT)
  if (isAuthRoute && hasAuthIndicator) {
    return NextResponse.redirect(new URL('/noticias', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
