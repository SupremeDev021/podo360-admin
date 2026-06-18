import type { PlatformCompany, PlatformLead, StatusLog } from "../types/platform";

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
    planName: "Plano futuro",
    createdAt: "2026-06-12T12:00:00.000Z",
    activatedAt: "2026-06-13T12:00:00.000Z"
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
    planName: "Avaliação",
    createdAt: "2026-06-15T09:00:00.000Z"
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
