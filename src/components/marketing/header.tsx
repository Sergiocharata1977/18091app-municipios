'use client';

import { useLanguage } from '@/components/marketing/language-context';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    if (typeof window !== 'undefined') {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20">
              <span className="font-mono text-xl font-bold text-white">MQ</span>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              MuniQuality
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-slate-600 hover:text-emerald-600 transition-colors text-sm font-medium min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Ir a sección Cómo Funciona"
            >
              {t.nav.howItWorks}
            </button>
            <button
              onClick={() => scrollToSection('benefits')}
              className="text-slate-600 hover:text-emerald-600 transition-colors text-sm font-medium min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Ir a sección Beneficios"
            >
              {t.nav.benefits}
            </button>
            <button
              onClick={() => scrollToSection('demo')}
              className="text-slate-600 hover:text-emerald-600 transition-colors text-sm font-medium min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Ir a sección Contacto"
            >
              {t.nav.contact}
            </button>
          </nav>

          {/* Language Selector & CTA */}
          <div className="flex items-center gap-4">
            <Select
              value={language}
              onValueChange={val => setLanguage(val as 'en' | 'es' | 'pt')}
            >
              <SelectTrigger className="w-32 h-10 text-sm bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 shadow-2xl">
                <SelectItem
                  value="es"
                  className="text-slate-700 hover:bg-slate-50 focus:bg-slate-50 cursor-pointer"
                >
                  🇪🇸 Español
                </SelectItem>
                <SelectItem
                  value="en"
                  className="text-slate-700 hover:bg-slate-50 focus:bg-slate-50 cursor-pointer"
                >
                  🇺🇸 English
                </SelectItem>
                <SelectItem
                  value="pt"
                  className="text-slate-700 hover:bg-slate-50 focus:bg-slate-50 cursor-pointer"
                >
                  🇧🇷 Português
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => scrollToSection('demo')}
              className="hidden sm:inline-flex bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10 font-semibold px-6"
            >
              {t.hero.cta1}
            </Button>

            <button
              className="md:hidden p-2 text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-slate-100 bg-white">
            <nav className="flex flex-col gap-5 text-center">
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-slate-600 hover:text-emerald-600 transition-colors text-base font-medium"
              >
                {t.nav.howItWorks}
              </button>
              <button
                onClick={() => scrollToSection('benefits')}
                className="text-slate-600 hover:text-emerald-600 transition-colors text-base font-medium"
              >
                {t.nav.benefits}
              </button>
              <button
                onClick={() => scrollToSection('demo')}
                className="text-slate-600 hover:text-emerald-600 transition-colors text-base font-medium"
              >
                {t.nav.contact}
              </button>
              <Button
                onClick={() => scrollToSection('demo')}
                className="bg-emerald-600 text-white w-full py-6 text-base font-semibold"
              >
                {t.hero.cta1}
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
