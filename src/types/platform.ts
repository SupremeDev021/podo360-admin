export type CompanyStatus = "active" | "trial" | "inactive" | "suspended" | "cancelled";

export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

export type SubscriptionStatus = "active" | "trial" | "past_due" | "cancelled";

export type BillingType = "monthly" | "one_time" | "range";

export type AnnouncementSeverity = "info" | "warning" | "maintenance" | "critical";

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

export type PlatformPlan = {
  id: string;
  name: string;
  slug: string;
  description: string;
  monthlyPrice: number;
  setupFee: number;
  isCustomPrice?: boolean;
  maxUsers?: number;
  maxProfessionals?: number;
  maxPatients?: number;
  features: string[];
  active: boolean;
  displayOrder: number;
};

export type PlatformPlanExtra = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price?: number;
  minPrice?: number;
  maxPrice?: number;
  isRangePrice?: boolean;
  billingType: BillingType;
  active: boolean;
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
  planSlug?: string;
  createdAt: string;
  activatedAt?: string;
  suspendedAt?: string;
  renewsAt?: string;
};

export type PlatformCompanySubscription = {
  id: string;
  companyId: string;
  planSlug: string;
  status: SubscriptionStatus;
  monthlyPrice: number;
  setupFee: number;
  startsAt: string;
  renewsAt?: string;
  contractMinMonths: number;
  extras: string[];
  notes?: string;
};

export type PlatformFeature = {
  id: string;
  key: string;
  name: string;
  description: string;
  active: boolean;
};

export type PlatformAnnouncement = {
  id: string;
  title: string;
  message: string;
  severity: AnnouncementSeverity;
  active: boolean;
  startsAt: string;
  endsAt: string;
  target: "all" | "selected_companies";
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
