'use client';

import { useLanguage } from '@/components/marketing/language-context';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export function HeroSection() {
  const { t } = useLanguage();

  const scrollToSection = (id: string) => {
    if (typeof window !== 'undefined') {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-50 pt-32 pb-20 lg:pt-48 lg:pb-32">
      {/* Background Graphic */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              {t.hero.badge}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
              {t.hero.title.split(':')[0]}:{' '}
              <span className="text-primary font-extrabold">
                {t.hero.title.split(':')[1]?.trim().split(',')[0]}
              </span>
              , {t.hero.title.split(':')[1]?.trim().split(',')[1]}
            </h1>

            <p className="text-lg md:text-xl text-slate-600 leading-relaxed text-pretty max-w-xl">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button
                size="lg"
                onClick={() => scrollToSection('demo')}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg shadow-lg shadow-primary/20 font-semibold"
              >
                {t.hero.cta1}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection('how-it-works')}
                className="w-full sm:w-auto px-8 py-6 text-lg border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all font-semibold"
              >
                {t.hero.cta2}
              </Button>
            </div>

            {t.hero.trust && (
              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                {t.hero.trust.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-sm text-slate-500"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Software Preview */}
          <div className="relative lg:h-[600px] flex items-center justify-center lg:justify-end">
            {/* Browser Window Mockup */}
            <div className="relative w-full max-w-[600px] rounded-2xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-200 bg-white group">
              {/* Browser Header */}
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white px-3 py-0.5 rounded border border-slate-100 text-[10px] text-slate-400 font-mono">
                    muniquality.gob
                  </div>
                </div>
              </div>

              {/* Software Interface - Actual Screenshot */}
              <div className="bg-white relative aspect-[4/3] overflow-hidden">
                <img
                  src="/images/image.png"
                  alt="MuniQuality Interface"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            {/* Floating Stats */}
            <div className="absolute -bottom-6 -left-6 bg-white border border-slate-100 rounded-2xl shadow-xl p-5 hidden xl:block animate-bounce-subtle">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">50+</div>
                  <div className="text-sm text-slate-500 font-medium">
                    Municipios Activos
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
