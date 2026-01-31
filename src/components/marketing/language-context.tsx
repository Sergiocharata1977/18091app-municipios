'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';

type Language = 'en' | 'es' | 'pt';

interface Translations {
  nav: {
    howItWorks: string;
    benefits: string;
    pricing: string;
    contact: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    cta1: string;
    cta2: string;
    trust?: string[];
  };
  howItWorks: {
    title: string;
    subtitle: string;
    features: {
      title: string;
      description: string;
    }[];
  };
  benefits: {
    title: string;
    subtitle: string;
    items: {
      title: string;
      description: string;
    }[];
  };
  demo: {
    title: string;
    subtitle: string;
    form: {
      name: string;
      email: string;
      company: string;
      employees: string;
      message: string;
      submit: string;
      success: string;
    };
  };
  footer: {
    rights: string;
    privacy: string;
    terms: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    nav: {
      howItWorks: 'How It Works',
      benefits: 'Benefits',
      pricing: 'Pricing',
      contact: 'Contact',
    },
    hero: {
      badge: 'ISO 9001 Specialist',
      title: 'The Ultimate AI for Businesses.',
      subtitle:
        'An organizational intelligence that learns from your company to help you organize tasks, measure performance, and achieve international quality standards.',
      cta1: 'Request Demo',
      cta2: 'Watch Live Demo',
      trust: ['No credit card required', 'Setup in 5 minutes'],
    },
    howItWorks: {
      title: 'How It Works',
      subtitle:
        'AI analyzes your company like an auditor, but with a coach mentality.',
      features: [
        {
          title: 'Listen & Learn',
          description:
            'Analyzes the structure, departments, roles, processes, objectives, and goals of your organization.',
        },
        {
          title: 'Identify Gaps',
          description:
            'Detects lack of definitions, evidence, or responsibilities needed in your company.',
        },
        {
          title: 'Suggest Actions',
          description:
            'Defines processes, procedures, and collaborators: quality manual, internal audits, ISO procedures.',
        },
        {
          title: 'Measure Maturity',
          description:
            'Evaluates organization management and proposes improvements based on global frameworks.',
        },
        {
          title: 'Accompany You',
          description:
            'Provides advice, follows up with reminders, alerts, and guidance throughout your journey.',
        },
        {
          title: 'Continuous Improvement',
          description:
            'Monitors KPIs, measures trends, reviews, and updates automatically and systematically.',
        },
      ],
    },
    benefits: {
      title: 'Real Benefits',
      subtitle: 'Transform your company into a world-class organization.',
      items: [
        {
          title: 'Intelligent Organization',
          description:
            'Structure, automate tasks, resources, and processes strategically.',
        },
        {
          title: 'Role Clarity',
          description:
            'Each person knows what they do, why, and how to contribute with clarity.',
        },
        {
          title: 'Continuous Improvement',
          description:
            'AI identifies problems and generates action plans for continuous advancement.',
        },
        {
          title: 'Total Traceability',
          description:
            'Every action is documented according to the full scope of ISO 9001.',
        },
        {
          title: 'Comprehensive Management',
          description:
            'Unifies quality criteria encompassing organizational processes and resources.',
        },
        {
          title: 'International Standard',
          description:
            'Based on ISO 9001:2015, we provide you with everything to certify your company.',
        },
      ],
    },
    demo: {
      title: 'Request a Demo',
      subtitle:
        "Discover how Don Cándido IA can transform your organization's quality management.",
      form: {
        name: 'Full Name',
        email: 'Email Address',
        company: 'Company Name',
        employees: 'Number of Employees',
        message: 'Tell us about your needs',
        submit: 'Request Demo',
        success: "Thank you! We'll contact you soon.",
      },
    },
    footer: {
      rights: 'All rights reserved.',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
    },
  },
  es: {
    nav: {
      howItWorks: 'Cómo Funciona',
      benefits: 'Beneficios',
      pricing: 'Planes',
      contact: 'Contacto',
    },
    hero: {
      badge: 'Sistema ISO 18091 para Municipios',
      title:
        'Gestión de Calidad para Gobiernos Locales: Eficiencia y Transparencia.',
      subtitle:
        'Transforma la gestión municipal con estándares internacionales. Mide el impacto en el ciudadano, organiza tus secretarías y certifica ISO 18091 sin burocracia.',
      cta1: 'Solicitar Demo',
      cta2: 'Ver Recorrido',
      trust: ['Diseñado para sector público', 'Implementación modular'],
    },
    howItWorks: {
      title: 'Cómo Funciona',
      subtitle:
        'MuniQuality adapta la norma a la realidad de tu municipio.',
      features: [
        {
          title: 'Diagnóstico Integral',
          description:
            'Evaluamos el estado actual de los servicios públicos en base a los 4 cuadrantes de la ISO 18091.',
        },
        {
          title: 'Escucha Activa',
          description:
            'Canalizamos reclamos y sugerencias de vecinos directamente hacia los procesos de mejora.',
        },
        {
          title: 'Procesos Claros',
          description:
            'Digitalizamos trámites y procedimientos internos para reducir tiempos y aumentar la transparencia.',
        },
        {
          title: 'Tablero de Control',
          description:
            'El Intendente y Secretarios visualizan en tiempo real el cumplimiento de metas y satisfacción.',
        },
        {
          title: 'Auditoría Continua',
          description:
            'Alertas automáticas sobre desvíos en servicios críticos (Salud, Obras, Seguridad).',
        },
        {
          title: 'Reportes Públicos',
          description:
            'Genera informes de gestión automáticos para rendición de cuentas a la ciudadanía.',
        },
      ],
    },
    benefits: {
      title: 'Para la Gestión Municipal',
      subtitle:
        'Modernice su administración con herramientas de gobierno inteligente.',
      items: [
        {
          title: 'Transparencia Total',
          description:
            'Muestre resultados medibles a la comunidad y aumente la confianza en la gestión.',
        },
        {
          title: 'Eficiencia de Recursos',
          description:
            'Optimice el presupuesto detectando cuellos de botella en Obras y Servicios.',
        },
        {
          title: 'Participación Ciudadana',
          description:
            'Integre al vecino como auditor de la calidad de los servicios.',
        },
        {
          title: 'Legado Institucional',
          description:
            'Deje procesos ordenados y certificados que perduren más allá de su mandato.',
        },
        {
          title: 'Toma de Decisiones',
          description:
            'Base sus políticas públicas en datos reales, no en intuiciones.',
        },
        {
          title: 'Estándar ISO 18091',
          description:
            'La única norma internacional creada específicamente para gobiernos locales confiables.',
        },
      ],
    },
    demo: {
      title: 'Solicita una Demo',
      subtitle:
        'Vea cómo MuniQuality puede modernizar su municipio hoy mismo.',
      form: {
        name: 'Nombre del Funcionario',
        email: 'Email Institucional',
        company: 'Municipio / Organismo',
        employees: 'Habitantes (Aprox)',
        message: 'Desafíos actuales de gestión',
        submit: 'Contactar Asesor',
        success: '¡Gracias! Un especialista en gobierno lo contactará.',
      },
    },
    footer: {
      rights: 'Todos los derechos reservados.',
      privacy: 'Política de Privacidad',
      terms: 'Términos de Servicio',
    },
  },
  pt: {
    nav: {
      howItWorks: 'Como Funciona',
      benefits: 'Benefícios',
      pricing: 'Preços',
      contact: 'Contato',
    },
    hero: {
      badge: 'Especialista em ISO 9001',
      title: 'A IA Definitiva para Empresas.',
      subtitle:
        'Uma inteligência organizacional que aprende com sua empresa para ajudá-lo a organizar tarefas, medir desempenho e alcançar padrões internacionais de qualidade.',
      cta1: 'Solicitar Demo',
      cta2: 'Ver Demo ao Vivo',
      trust: ['Sem cartão de crédito', 'Configuração em 5 minutos'],
    },
    howItWorks: {
      title: 'Como Funciona',
      subtitle:
        'A IA analisa sua empresa como um auditor, mas com mentalidade de coach.',
      features: [
        {
          title: 'Ouve e Aprende',
          description:
            'Analisa a estrutura, departamentos, funções, processos, objetivos e metas da sua organização.',
        },
        {
          title: 'Identifica Lacunas',
          description:
            'Detecta falta de definições, evidências ou responsabilidades difusas na sua empresa.',
        },
        {
          title: 'Sugere Ordem',
          description:
            'Define processos, procedimentos e colaboradores: manual de qualidade, auditorias internas, procedimentos ISO.',
        },
        {
          title: 'Mede Maturidade',
          description:
            'Avalia a gestão da organização e propõe melhorias baseadas em frameworks globais.',
        },
        {
          title: 'Acompanha Você',
          description:
            'Oferece assessoria, acompanhamento com lembretes, alertas e orientação durante toda sua jornada.',
        },
        {
          title: 'Melhoria Contínua',
          description:
            'Monitora KPIs, mede tendências, revisa e atualiza de forma automática e sistemática.',
        },
      ],
    },
    benefits: {
      title: 'Benefícios Reais',
      subtitle: 'Transforme sua empresa em uma organização de classe mundial.',
      items: [
        {
          title: 'Organização Inteligente',
          description:
            'Estrutura, automatiza tarefas, recursos e processos de forma inteligente e estratégica.',
        },
        {
          title: 'Clareza de Funções',
          description:
            'Cada pessoa sabe o que faz, por que e como contribuir com total clareza.',
        },
        {
          title: 'Melhoria Contínua',
          description:
            'A IA detecta lacunas e gera planos de ação para avançar continuamente.',
        },
        {
          title: 'Rastreabilidade Total',
          description:
            'Cada ação fica documentada, desde o escopo da ISO 9001 ao integrar sua empresa.',
        },
        {
          title: 'Gestão Integral',
          description:
            'Consolida os critérios de qualidade com os processos organizacionais e humanos.',
        },
        {
          title: 'Padrão Internacional',
          description:
            'Baseado na ISO 9001:2015, o padrão mais usado e respeitado globalmente.',
        },
      ],
    },
    demo: {
      title: 'Solicite uma Demo',
      subtitle:
        'Descubra como Don Cândido IA pode transformar a gestão de qualidade da sua organização.',
      form: {
        name: 'Nome Completo',
        email: 'Endereço de E-mail',
        company: 'Nome da Empresa',
        employees: 'Número de Funcionários',
        message: 'Conte-nos sobre suas necessidades',
        submit: 'Solicitar Demo',
        success: 'Obrigado! Entraremos em contato em breve.',
      },
    },
    footer: {
      rights: 'Todos os direitos reservados.',
      privacy: 'Política de Privacidade',
      terms: 'Termos de Serviço',
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
