'use client';

import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { MobileNav } from '@/components/layout/MobileNav';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { DonCandidoFAB } from '@/features/chat';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard content if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop Sidebar - hidden on mobile */}
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Navigation - visible only on mobile */}
        <div className="md:hidden">
          <MobileNav />
        </div>

        {/* Desktop Header - hidden on mobile */}
        <div className="hidden md:flex">
          <DashboardHeader />
        </div>

        <main className="flex-1 overflow-y-auto pb-safe">{children}</main>
      </div>

      {/* FAB - hidden on mobile to avoid conflicts with bottom nav */}
      <div className="hidden md:block">
        <DonCandidoFAB />
      </div>
    </div>
  );
}
