import type {
  PlatformAnnouncement,
  PlatformCompany,
  PlatformCompanySubscription,
  PlatformFeature,
  PlatformLead,
  PlatformPlan,
  PlatformPlanExtra,
  StatusLog
} from "../types/platform";

export const platformPlans: PlatformPlan[] = [
  {
    id: "plan-start",
    name: "Start",
    slug: "start",
    description: "Indicado para podólogo individual ou clínica pequena.",
    monthlyPrice: 197,
    setupFee: 497,
    maxUsers: 2,
    maxProfessionals: 1,
    maxPatients: 800,
    features: ["dashboard", "abertura_atendimento", "atendimentos", "pacientes", "anamnese_completa", "relatorios"],
    active: true,
    displayOrder: 1
  },
  {
    id: "plan-clinic",
    name: "Clinic",
    slug: "clinic",
    description: "Indicado para clínica pequena ou em crescimento.",
    monthlyPrice: 397,
    setupFee: 997,
    maxUsers: 5,
    maxProfessionals: 3,
    maxPatients: 2500,
    features: ["agenda_clinica", "pe_3d", "curativo", "evolucao_imagem", "financeiro", "estoque"],
    active: true,
    displayOrder: 2
  },
  {
    id: "plan-pro",
    name: "Pro",
    slug: "pro",
    description: "Indicado para clínicas com equipe e gestão completa.",
    monthlyPrice: 697,
    setupFee: 1497,
    maxUsers: 12,
    maxProfessionals: 8,
    maxPatients: 8000,
    features: ["gerenciamento_atendimento", "comparativo_evolucao", "itb_ihb", "white_label", "relatorio_ia"],
    active: true,
    displayOrder: 3
  },
  {
    id: "plan-master",
    name: "Master",
    slug: "master",
    description: "Indicado para clínicas premium, redes ou white label avançado.",
    monthlyPrice: 997,
    setupFee: 2497,
    isCustomPrice: true,
    maxUsers: 30,
    maxProfessionals: 20,
    maxPatients: 20000,
    features: ["suporte_prioritario", "avisos_globais", "white_label", "relatorio_ia"],
    active: true,
    displayOrder: 4
  }
];

export const platformExtras: PlatformPlanExtra[] = [
  {
    id: "extra-user",
    name: "Usuário adicional",
    slug: "usuario-adicional",
    description: "Acesso adicional para equipe administrativa ou operacional.",
    price: 39,
    billingType: "monthly",
    active: true
  },
  {
    id: "extra-professional",
    name: "Profissional adicional",
    slug: "profissional-adicional",
    description: "Profissional clínico adicional no sistema.",
    price: 59,
    billingType: "monthly",
    active: true
  },
  {
    id: "extra-training",
    name: "Treinamento extra",
    slug: "treinamento-extra",
    description: "Treinamento individual ou para nova equipe.",
    price: 250,
    billingType: "one_time",
    active: true
  },
  {
    id: "extra-report",
    name: "Personalização de relatório/PDF",
    slug: "personalizacao-relatorio-pdf",
    description: "Ajuste visual e campos específicos para documentos da clínica.",
    minPrice: 300,
    maxPrice: 800,
    isRangePrice: true,
    billingType: "range",
    active: true
  },
  {
    id: "extra-implantation",
    name: "Implantação avançada",
    slug: "implantacao-avancada",
    description: "Configuração acompanhada, migração assistida e orientação operacional.",
    minPrice: 1500,
    maxPrice: 3000,
    isRangePrice: true,
    billingType: "range",
    active: true
  },
  {
    id: "extra-white-label",
    name: "White label fora do Master",
    slug: "white-label-fora-master",
    description: "Personalização visual adicional para planos que não incluem Master.",
    minPrice: 700,
    maxPrice: 1500,
    isRangePrice: true,
    billingType: "range",
    active: true
  }
];

export const leads: PlatformLead[] = [
  {
    id: "lead-1",
    name: "Ana Ribeiro",
    clinicName: "Clínica Pé Saudável",
    email: "ana@pesaudavel.com",
    phone: "(11) 99999-0101",
    city: "São Paulo/SP",
    source: "podo360-landing",
    message: "Quero conhecer a plataforma para minha equipe.",
    status: "new",
    createdAt: "2026-06-18T10:00:00.000Z"
  },
  {
    id: "lead-2",
    name: "Marcos Lima",
    clinicName: "Podologia Integrada",
    email: "marcos@integrada.com",
    phone: "(21) 98888-0202",
    city: "Rio de Janeiro/RJ",
    source: "whatsapp",
    message: "Preciso de agenda, estoque e prontuário.",
    status: "qualified",
    createdAt: "2026-06-17T15:30:00.000Z"
  }
];

export const companies: PlatformCompany[] = [
  {
    id: "company-1",
    companyName: "Clínica Pé Saudável LTDA",
    tradingName: "Clínica Pé Saudável",
    cnpj: "00.000.000/0001-00",
    responsibleName: "Ana Ribeiro",
    responsibleEmail: "ana@pesaudavel.com",
    responsiblePhone: "(11) 99999-0101",
    status: "active",
    planSlug: "clinic",
    createdAt: "2026-06-12T12:00:00.000Z",
    activatedAt: "2026-06-13T12:00:00.000Z",
    renewsAt: "2026-07-13T12:00:00.000Z"
  },
  {
    id: "company-2",
    companyName: "Podologia Integrada LTDA",
    tradingName: "Podologia Integrada",
    cnpj: "11.111.111/0001-11",
    responsibleName: "Marcos Lima",
    responsibleEmail: "marcos@integrada.com",
    responsiblePhone: "(21) 98888-0202",
    status: "trial",
    planSlug: "start",
    createdAt: "2026-06-15T09:00:00.000Z",
    renewsAt: "2026-07-15T09:00:00.000Z"
  }
];

export const subscriptions: PlatformCompanySubscription[] = [
  {
    id: "subscription-1",
    companyId: "company-1",
    planSlug: "clinic",
    status: "active",
    monthlyPrice: 397,
    setupFee: 997,
    startsAt: "2026-06-13T12:00:00.000Z",
    renewsAt: "2026-07-13T12:00:00.000Z",
    contractMinMonths: 3,
    extras: ["usuario-adicional"]
  },
  {
    id: "subscription-2",
    companyId: "company-2",
    planSlug: "start",
    status: "trial",
    monthlyPrice: 197,
    setupFee: 497,
    startsAt: "2026-06-15T09:00:00.000Z",
    renewsAt: "2026-07-15T09:00:00.000Z",
    contractMinMonths: 3,
    extras: []
  }
];

export const platformFeatures: PlatformFeature[] = [
  { id: "feature-1", key: "dashboard", name: "Dashboard", description: "Indicadores operacionais da clínica.", active: true },
  { id: "feature-2", key: "abertura_atendimento", name: "Abertura de atendimento", description: "Criação e controle de BA.", active: true },
  { id: "feature-3", key: "atendimentos", name: "Atendimentos", description: "Fluxo clínico completo.", active: true },
  { id: "feature-4", key: "agenda_clinica", name: "Agenda Clínica", description: "Agenda de atendimentos.", active: true },
  { id: "feature-5", key: "pe_3d", name: "Pé 3D", description: "Marcação visual e sensibilidade.", active: true },
  { id: "feature-6", key: "financeiro", name: "Financeiro", description: "Controle financeiro da clínica.", active: true },
  { id: "feature-7", key: "estoque", name: "Estoque", description: "Produtos e materiais.", active: true },
  { id: "feature-8", key: "white_label", name: "White Label", description: "Logo, cores e identidade da clínica.", active: true },
  { id: "feature-9", key: "relatorio_ia", name: "Relatório com IA", description: "Geração assistida de relatório clínico.", active: true },
  { id: "feature-10", key: "avisos_globais", name: "Avisos globais", description: "Avisos enviados pelo Admin para clínicas.", active: true }
];

export const announcements: PlatformAnnouncement[] = [
  {
    id: "announcement-1",
    title: "Janela de atualização",
    message: "A partir das 23:00 o sistema poderá ficar indisponível para manutenção programada.",
    severity: "maintenance",
    active: false,
    startsAt: "2026-06-30T23:00:00.000Z",
    endsAt: "2026-07-01T02:00:00.000Z",
    target: "all"
  }
];

export const statusLogs: StatusLog[] = [
  {
    id: "log-1",
    companyId: "company-1",
    companyName: "Clínica Pé Saudável",
    previousStatus: "trial",
    newStatus: "active",
    reason: "Contrato aprovado e acesso liberado.",
    changedBy: "Admin Podo360",
    createdAt: "2026-06-13T12:00:00.000Z"
  }
];
