export type CompanyStatus = "active" | "trial" | "inactive" | "suspended" | "cancelled";

export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

export type PlatformLead = {
  id: string;
  name: string;
  clinicName: string;
  email: string;
  phone: string;
  city: string;
  source: string;
  message: string;
  status: LeadStatus;
  createdAt: string;
};

export type PlatformCompany = {
  id: string;
  companyName: string;
  tradingName: string;
  cnpj: string;
  responsibleName: string;
  responsibleEmail: string;
  responsiblePhone: string;
  status: CompanyStatus;
  planName?: string;
  createdAt: string;
  activatedAt?: string;
  suspendedAt?: string;
};

export type StatusLog = {
  id: string;
  companyId: string;
  companyName: string;
  previousStatus: CompanyStatus;
  newStatus: CompanyStatus;
  reason: string;
  changedBy: string;
  createdAt: string;
};
