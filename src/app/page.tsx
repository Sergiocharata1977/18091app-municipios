'use client';

import { ChatWidget } from '@/components/landing/ChatWidget';
import { Benefits } from '@/components/marketing/benefits';
import { DemoForm } from '@/components/marketing/demo-form';
import { Footer } from '@/components/marketing/footer';
import { Header } from '@/components/marketing/header';
import { HeroSection } from '@/components/marketing/hero-section';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { LanguageProvider } from '@/components/marketing/language-context';
import { VideoSection } from '@/components/marketing/video-section';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Solo redirigir usuarios autenticados AL NUEVO DEFAULT: /noticias
  useEffect(() => {
    if (!loading && user) {
      router.push('/noticias');
    }
  }, [user, loading, router]);

  // Mostrar loading solo mientras verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Renderizar landing directamente con LanguageProvider
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <HeroSection />
          <VideoSection />
          <HowItWorks />
          <Benefits />
          <DemoForm />
        </main>
        <Footer />

        {/* Chat Widget Don Cándido - Solo para visitantes */}
        {!user && <ChatWidget position="bottom-right" />}
      </div>
    </LanguageProvider>
  );
}
