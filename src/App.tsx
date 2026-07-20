import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Flag,
  Layers3,
  LogOut,
  Mail,
  PackagePlus,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { adminRoutes, normalizePath, toBrowserPath } from "./config";
import { isSupabaseConfigured, supabase } from "./services/supabase";

const ADMIN_UNAVAILABLE_MESSAGE =
  "Nao foi possivel conectar ao servico no momento. Tente novamente em instantes ou entre em contato com o suporte.";
const AUTH_REQUIRED_MESSAGE = "Entre com um usuario Admin Global ativo para gerenciar a plataforma Podo360.";
const PLATFORM_ADMIN_DENIED_MESSAGE =
  "Seu usuario nao possui permissao de Admin Global ativa. Entre em contato com o suporte Podo360.";

type SectionId =
  | "dashboard"
  | "client-registrations"
  | "leads"
  | "companies"
  | "plans"
  | "extras"
  | "subscriptions"
  | "features"
  | "announcements"
  | "audit"
  | "settings";

type CompanyStatus = "active" | "trial" | "inactive" | "suspended" | "cancelled";
type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost" | "spam";
type SubscriptionStatus = "active" | "trial" | "past_due" | "suspended" | "cancelled";
type BillingType = "monthly" | "one_time" | "project";
type AnnouncementSeverity = "info" | "warning" | "maintenance" | "critical";
type ClientRegistrationStatus = "pending" | "in_review" | "approved" | "rejected" | "need_more_info" | "converted";

type AdminUser = {
  user_id: string;
  role: "owner" | "admin" | "support" | "commercial";
  active: boolean;
};

type PlatformPlan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  monthly_price: number | null;
  setup_fee: number | null;
  is_custom_price: boolean;
  max_users: number | null;
  max_professionals: number | null;
  max_patients: number | null;
  active: boolean;
  display_order: number;
};

type PlatformExtra = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  min_price: number | null;
  max_price: number | null;
  is_range_price: boolean;
  billing_type: BillingType;
  active: boolean;
};

type PlatformCompany = {
  id: string;
  clinic_company_id: string | null;
  company_name: string;
  trading_name: string | null;
  cnpj: string | null;
  responsible_name: string | null;
  responsible_email: string | null;
  responsible_phone: string | null;
  status: CompanyStatus;
  plan_id: string | null;
  created_at: string;
  activated_at: string | null;
  suspended_at: string | null;
  cancelled_at: string | null;
};

type PlatformSubscription = {
  id: string;
  company_id: string;
  plan_id: string | null;
  status: SubscriptionStatus;
  monthly_price: number | null;
  setup_fee: number | null;
  max_users?: number | null;
  starts_at: string | null;
  renews_at: string | null;
  contract_min_months: number;
  notes: string | null;
};

type PlatformFeature = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  active: boolean;
};

type PlatformLead = {
  id: string;
  name: string;
  clinic_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  source: string | null;
  message: string | null;
  status: LeadStatus;
  created_at: string;
};

type ClientRegistrationRequest = {
  id: string;
  clinic_name: string;
  document_cnpj: string | null;
  clinic_type: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  website_or_instagram: string | null;
  responsible_name: string;
  responsible_document: string | null;
  responsible_email: string;
  responsible_phone: string | null;
  responsible_role: string | null;
  desired_admin_name: string | null;
  desired_admin_email: string | null;
  interested_plan: string | null;
  estimated_users: number | null;
  estimated_professionals: number | null;
  wants_white_label: boolean;
  source: string | null;
  source_campaign: string | null;
  notes: string | null;
  status: ClientRegistrationStatus;
  admin_notes: string | null;
  approved_company_id: string | null;
  approved_platform_company_id: string | null;
  created_at: string;
  updated_at: string;
};

type PlatformAnnouncement = {
  id: string;
  title: string | null;
  message: string;
  severity: AnnouncementSeverity;
  active: boolean;
  dismissible: boolean;
  target_scope: "all" | "specific_companies";
  starts_at: string | null;
  ends_at: string | null;
};

type PlatformStatusLog = {
  id: string;
  company_id: string;
  previous_status: CompanyStatus | null;
  new_status: CompanyStatus;
  reason: string | null;
  created_at: string;
};

type DashboardData = {
  plans: PlatformPlan[];
  extras: PlatformExtra[];
  companies: PlatformCompany[];
  subscriptions: PlatformSubscription[];
  features: PlatformFeature[];
  leads: PlatformLead[];
  clientRegistrationRequests: ClientRegistrationRequest[];
  announcements: PlatformAnnouncement[];
  statusLogs: PlatformStatusLog[];
  activeUserCounts: Record<string, number>;
};

type CompanyForm = {
  companyName: string;
  tradingName: string;
  responsibleName: string;
  responsibleEmail: string;
  responsiblePhone: string;
  cnpj: string;
  status: CompanyStatus;
  planId: string;
};

type PlanForm = {
  name: string;
  slug: string;
  description: string;
  monthlyPrice: string;
  setupFee: string;
  customPrice: boolean;
};

type AnnouncementForm = {
  title: string;
  message: string;
  severity: AnnouncementSeverity;
  startsAt: string;
  endsAt: string;
  active: boolean;
};

const navigationItems: Array<{ id: SectionId; label: string; icon: typeof BarChart3; route: string }> = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3, route: adminRoutes.dashboard },
  { id: "client-registrations", label: "Solicitacoes de Cadastro", icon: ClipboardList, route: adminRoutes.clientRegistrations },
  { id: "leads", label: "Leads", icon: Mail, route: "/admin/leads" },
  { id: "companies", label: "Empresas", icon: Building2, route: adminRoutes.companies },
  { id: "plans", label: "Planos", icon: Layers3, route: adminRoutes.plans },
  { id: "extras", label: "Extras", icon: PackagePlus, route: adminRoutes.extras },
  { id: "subscriptions", label: "Assinaturas", icon: CreditCard, route: adminRoutes.subscriptions },
  { id: "features", label: "Feature Flags", icon: Flag, route: adminRoutes.features },
  { id: "announcements", label: "Avisos Globais", icon: Bell, route: adminRoutes.announcements },
  { id: "audit", label: "Auditoria", icon: ClipboardList, route: adminRoutes.audit },
  { id: "settings", label: "Configuracoes", icon: Settings, route: adminRoutes.settings }
];

const routeToSection = new Map(navigationItems.map((item) => [item.route, item.id]));

const sectionCopy: Record<SectionId, { title: string; description: string }> = {
  dashboard: {
    title: "Dashboard administrativo da plataforma.",
    description: "Visao executiva de empresas, leads, receita mapeada e pontos de atencao."
  },
  "client-registrations": {
    title: "Solicitacoes de cadastro de clientes.",
    description: "Analise cadastros enviados pelo formulario publico antes de liberar uma nova clinica."
  },
  leads: {
    title: "Leads comerciais.",
    description: "Acompanhe os contatos vindos da landing page e prepare a conversao em empresa contratante."
  },
  companies: {
    title: "Empresas contratantes.",
    description: "Cadastre, acompanhe e altere status comerciais das clinicas vinculadas a plataforma."
  },
  plans: {
    title: "Planos comerciais.",
    description: "Gerencie Start, Clinic, Pro e Master sem misturar regras comerciais no Sistema Clinica."
  },
  extras: {
    title: "Extras comerciais.",
    description: "Controle servicos adicionais, faixas de preco e cobrancas avulsas ou recorrentes."
  },
  subscriptions: {
    title: "Assinaturas e contratos.",
    description: "Organize plano, setup, renovacao e contrato minimo sem cobranca automatica nesta fase."
  },
  features: {
    title: "Feature flags.",
    description: "Prepare recursos liberaveis por plano ou empresa para leitura pelo Sistema Clinica."
  },
  announcements: {
    title: "Avisos globais.",
    description: "Configure mensagens para aparecerem no topo do Sistema Clinica."
  },
  audit: {
    title: "Auditoria administrativa.",
    description: "Historico de alteracoes comerciais e mudancas de status feitas pela equipe Podo360."
  },
  settings: {
    title: "Configuracoes da plataforma.",
    description: "Checklist de seguranca, billing readiness e limites do que ainda nao esta em producao."
  }
};

const statusLabels: Record<CompanyStatus, string> = {
  active: "Ativa",
  trial: "Trial",
  inactive: "Inativa",
  suspended: "Suspensa",
  cancelled: "Cancelada"
};

const leadLabels: Record<LeadStatus, string> = {
  new: "Novo",
  contacted: "Contato feito",
  qualified: "Qualificado",
  converted: "Convertido",
  lost: "Perdido",
  spam: "Spam"
};

const subscriptionLabels: Record<SubscriptionStatus, string> = {
  active: "Ativa",
  trial: "Trial",
  past_due: "Em atraso",
  suspended: "Suspensa",
  cancelled: "Cancelada"
};

const severityLabels: Record<AnnouncementSeverity, string> = {
  info: "Informativo",
  warning: "Atencao",
  maintenance: "Manutencao",
  critical: "Critico"
};

const clientRegistrationLabels: Record<ClientRegistrationStatus, string> = {
  pending: "Pendente",
  in_review: "Em analise",
  approved: "Aprovado",
  rejected: "Reprovado",
  need_more_info: "Precisa de ajuste",
  converted: "Convertido"
};

const emptyDashboardData: DashboardData = {
  plans: [],
  extras: [],
  companies: [],
  subscriptions: [],
  features: [],
  leads: [],
  clientRegistrationRequests: [],
  announcements: [],
  statusLogs: [],
  activeUserCounts: {}
};

function formatDate(value: string | null) {
  if (!value) return "A definir";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatCurrency(value: number | null | undefined) {
  if (value == null) return "Sob consulta";
  return `R$ ${Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function toNumberOrNull(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return ADMIN_UNAVAILABLE_MESSAGE;
}

function getAdminActionErrorMessage(error: unknown) {
  const record = error && typeof error === "object" ? error as Record<string, unknown> : {};
  const message = getErrorMessage(error);
  const normalized = message.toLowerCase();
  const status = record.status ?? record.code;

  if (
    status === 401 ||
    status === 403 ||
    normalized.includes("jwt") ||
    normalized.includes("permission denied") ||
    normalized.includes("row-level security") ||
    normalized.includes("violates row-level security")
  ) {
    return "Sua sessão administrativa expirou ou não possui permissão para esta ação. Saia e entre novamente com um usuário Admin Global ativo.";
  }

  return import.meta.env.DEV ? message : ADMIN_UNAVAILABLE_MESSAGE;
}

async function getFunctionErrorMessage(error: unknown) {
  const fallback = getErrorMessage(error);
  const context = (error as { context?: unknown })?.context;

  if (context && typeof (context as Response).clone === "function") {
    try {
      const body = await (context as Response).clone().json() as { error?: unknown; message?: unknown };
      const message = body.error ?? body.message;
      if (typeof message === "string" && message.trim()) return message.trim();
    } catch {
      // Keep the fallback message when the function response is not JSON.
    }
  }

  return fallback;
}

function getPlanName(plans: PlatformPlan[], planId: string | null) {
  return plans.find((plan) => plan.id === planId)?.name ?? "A definir";
}

function getCompanyName(companies: PlatformCompany[], companyId: string) {
  const company = companies.find((item) => item.id === companyId);
  return company?.trading_name || company?.company_name || "Empresa nao vinculada";
}

function getActiveSubscription(subscriptions: PlatformSubscription[], companyId: string) {
  return subscriptions.find((subscription) => subscription.company_id === companyId && ["active", "trial"].includes(subscription.status))
    ?? subscriptions.find((subscription) => subscription.company_id === companyId)
    ?? null;
}

function getCompanyUserLimit(company: PlatformCompany, plans: PlatformPlan[], subscriptions: PlatformSubscription[]) {
  const subscription = getActiveSubscription(subscriptions, company.id);
  if (subscription?.max_users !== undefined && subscription.max_users !== null) return subscription.max_users;
  return plans.find((plan) => plan.id === company.plan_id)?.max_users ?? null;
}

const clinicAdminDefaultModules = [
  "dashboard",
  "ba-opening",
  "attendances",
  "attendance-management",
  "patients",
  "patient-profile",
  "schedule",
  "reports",
  "settings"
];

function navigateTo(route: string) {
  window.history.pushState(null, "", toBrowserPath(route));
  window.dispatchEvent(new PopStateEvent("popstate"));
}

async function requireSupabase() {
  if (!supabase) {
    throw new Error(ADMIN_UNAVAILABLE_MESSAGE);
  }

  return supabase;
}

async function fetchAdminUser(client: SupabaseClient, userId: string): Promise<AdminUser | null> {
  const { data, error } = await client
    .from("platform_admin_users")
    .select("user_id, role, active")
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();

  if (error) throw error;
  return data as AdminUser | null;
}

async function fetchDashboardData(client: SupabaseClient): Promise<DashboardData> {
  const [
    plans,
    extras,
    companies,
    subscriptions,
    features,
    leads,
    clientRegistrationRequests,
    announcements,
    statusLogs,
    profiles
  ] = await Promise.all([
    client.from("platform_plans").select("*").order("display_order", { ascending: true }),
    client.from("platform_plan_extras").select("*").order("created_at", { ascending: false }),
    client.from("platform_companies").select("*").order("created_at", { ascending: false }),
    client.from("platform_company_subscriptions").select("*").order("created_at", { ascending: false }),
    client.from("platform_features").select("*").order("key", { ascending: true }),
    client.from("platform_leads").select("*").order("created_at", { ascending: false }),
    client.from("platform_client_registration_requests").select("*").order("created_at", { ascending: false }),
    client.from("platform_announcements").select("*").order("created_at", { ascending: false }),
    client.from("platform_company_status_logs").select("*").order("created_at", { ascending: false }).limit(50),
    client.from("profiles").select("company_id,active").eq("active", true)
  ]);

  const responses = [plans, extras, companies, subscriptions, features, leads, clientRegistrationRequests, announcements, statusLogs, profiles];
  const firstError = responses.find((response) => response.error)?.error;
  if (firstError) throw firstError;

  const activeUserCounts = (profiles.data ?? []).reduce<Record<string, number>>((counts, profile) => {
    const companyId = String(profile.company_id ?? "");
    if (!companyId) return counts;
    counts[companyId] = (counts[companyId] ?? 0) + 1;
    return counts;
  }, {});

  return {
    plans: (plans.data ?? []) as PlatformPlan[],
    extras: (extras.data ?? []) as PlatformExtra[],
    companies: (companies.data ?? []) as PlatformCompany[],
    subscriptions: (subscriptions.data ?? []) as PlatformSubscription[],
    features: (features.data ?? []) as PlatformFeature[],
    leads: (leads.data ?? []) as PlatformLead[],
    clientRegistrationRequests: (clientRegistrationRequests.data ?? []) as ClientRegistrationRequest[],
    announcements: (announcements.data ?? []) as PlatformAnnouncement[],
    statusLogs: (statusLogs.data ?? []) as PlatformStatusLog[],
    activeUserCounts
  };
}

function LoginScreen({ onAuthenticated }: { onAuthenticated: (session: Session, user: User, adminUser: AdminUser) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!email.trim() || !password.trim()) {
      setMessage("Informe e-mail e senha para acessar o Admin Global.");
      return;
    }

    if (!isSupabaseConfigured) {
      setMessage(ADMIN_UNAVAILABLE_MESSAGE);
      return;
    }

    setLoading(true);
    try {
      const client = await requireSupabase();
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error || !data.session || !data.user) {
        setMessage("E-mail ou senha invalidos.");
        return;
      }

      const adminUser = await fetchAdminUser(client, data.user.id);
      if (!adminUser) {
        await client.auth.signOut();
        setMessage(PLATFORM_ADMIN_DENIED_MESSAGE);
        return;
      }

      onAuthenticated(data.session, data.user, adminUser);
      navigateTo(adminRoutes.dashboard);
    } catch (error) {
      setMessage(import.meta.env.DEV ? getErrorMessage(error) : ADMIN_UNAVAILABLE_MESSAGE);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <span className="eyebrow">Podo360 Admin</span>
        <h1>Admin Global separado</h1>
        <p>{AUTH_REQUIRED_MESSAGE}</p>

        <label>
          E-mail
          <input value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" type="email" />
        </label>

        <label>
          Senha
          <input value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" type="password" />
        </label>

        {message && <div className="setup-status setup-status--danger">{message}</div>}

        <button type="submit" className="button" disabled={loading}>
          {loading ? "Validando..." : "Entrar"}
        </button>

      </form>
    </main>
  );
}

function LoadingScreen() {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <span className="eyebrow">Podo360 Admin</span>
        <h1>Validando acesso...</h1>
        <p>Estamos conferindo sua sessao e permissao de Admin Global.</p>
      </section>
    </main>
  );
}

function DeniedScreen({ message, onLogout }: { message: string; onLogout: () => void }) {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <span className="eyebrow">Acesso bloqueado</span>
        <h1>Nao foi possivel abrir o Admin Global.</h1>
        <p>{message}</p>
        <button type="button" className="button" onClick={onLogout}>
          Voltar ao login
        </button>
      </section>
    </main>
  );
}

function DashboardApp({
  user,
  adminUser,
  onLogout
}: {
  user: User;
  adminUser: AdminUser;
  onLogout: () => void;
}) {
  const [activeSection, setActiveSection] = useState<SectionId>(() => routeToSection.get(normalizePath(window.location.pathname)) ?? "dashboard");
  const [data, setData] = useState<DashboardData>(emptyDashboardData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState("Admin Global conectado. Escolha uma tela do menu.");
  const [companyForm, setCompanyForm] = useState<CompanyForm>({
    companyName: "",
    tradingName: "",
    responsibleName: "",
    responsibleEmail: "",
    responsiblePhone: "",
    cnpj: "",
    status: "trial",
    planId: ""
  });
  const [planForm, setPlanForm] = useState<PlanForm>({
    name: "",
    slug: "",
    description: "",
    monthlyPrice: "",
    setupFee: "",
    customPrice: false
  });
  const [announcementForm, setAnnouncementForm] = useState<AnnouncementForm>({
    title: "",
    message: "",
    severity: "info",
    startsAt: "",
    endsAt: "",
    active: false
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const client = await requireSupabase();
      const nextData = await fetchDashboardData(client);
      setData(nextData);
      setActionMessage("Dados reais carregados com sucesso.");
    } catch (error) {
      setActionMessage(getAdminActionErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const syncRoute = () => setActiveSection(routeToSection.get(normalizePath(window.location.pathname)) ?? "dashboard");
    window.addEventListener("popstate", syncRoute);
    window.addEventListener("hashchange", syncRoute);
    return () => {
      window.removeEventListener("popstate", syncRoute);
      window.removeEventListener("hashchange", syncRoute);
    };
  }, []);

  const activeCompanies = data.companies.filter((company) => company.status === "active").length;
  const blockedCompanies = data.companies.filter((company) => ["inactive", "suspended", "cancelled"].includes(company.status)).length;
  const pendingLeads = data.leads.filter((lead) => lead.status === "new" || lead.status === "qualified").length;
  const pendingRegistrations = data.clientRegistrationRequests.filter((request) => ["pending", "in_review", "need_more_info"].includes(request.status)).length;
  const recurringRevenue = data.subscriptions
    .filter((subscription) => subscription.status === "active" || subscription.status === "trial")
    .reduce((total, subscription) => total + Number(subscription.monthly_price ?? 0), 0);
  const currentSection = sectionCopy[activeSection];

  function openSection(section: SectionId) {
    const route = navigationItems.find((item) => item.id === section)?.route ?? adminRoutes.dashboard;
    navigateTo(route);
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function createCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!companyForm.companyName.trim()) {
      setActionMessage("Informe o nome da empresa antes de salvar.");
      return;
    }

    setSaving(true);
    try {
      const client = await requireSupabase();
      const { error } = await client.from("platform_companies").insert({
        company_name: companyForm.companyName.trim(),
        trading_name: companyForm.tradingName.trim() || null,
        responsible_name: companyForm.responsibleName.trim() || null,
        responsible_email: companyForm.responsibleEmail.trim() || null,
        responsible_phone: companyForm.responsiblePhone.trim() || null,
        cnpj: companyForm.cnpj.trim() || null,
        status: companyForm.status,
        plan_id: companyForm.planId || null,
        activated_at: companyForm.status === "active" ? new Date().toISOString() : null
      });

      if (error) throw error;
      setActionMessage("Empresa criada no Admin Global.");
      setCompanyForm({ companyName: "", tradingName: "", responsibleName: "", responsibleEmail: "", responsiblePhone: "", cnpj: "", status: "trial", planId: "" });
      await loadData();
    } catch (error) {
      setActionMessage(getAdminActionErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function updateCompanyStatus(company: PlatformCompany, status: CompanyStatus) {
    setSaving(true);
    try {
      const client = await requireSupabase();
      const { error } = await client
        .from("platform_companies")
        .update({
          status,
          activated_at: status === "active" ? new Date().toISOString() : company.activated_at,
          suspended_at: status === "suspended" ? new Date().toISOString() : company.suspended_at
        })
        .eq("id", company.id);

      if (error) throw error;

      await client.from("platform_company_status_logs").insert({
        company_id: company.id,
        previous_status: company.status,
        new_status: status,
        reason: `Alteracao feita pelo Admin Global (${adminUser.role}).`,
        changed_by: user.id
      });

      setActionMessage(`Status de ${company.trading_name || company.company_name} alterado para ${statusLabels[status]}.`);
      await loadData();
    } catch (error) {
      setActionMessage(getAdminActionErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function updateCompanyUserLimit(company: PlatformCompany, rawValue: string) {
    const trimmedValue = rawValue.trim();
    const nextLimit = trimmedValue === "" ? null : Number(trimmedValue);
    if (nextLimit !== null && (!Number.isInteger(nextLimit) || nextLimit < 0)) {
      setActionMessage("Informe um limite de usuarios inteiro maior ou igual a zero, ou deixe vazio para ilimitado.");
      return;
    }

    setSaving(true);
    try {
      const client = await requireSupabase();
      const subscription = getActiveSubscription(data.subscriptions, company.id);
      const previousLimit = getCompanyUserLimit(company, data.plans, data.subscriptions);

      if (subscription) {
        const { error } = await client
          .from("platform_company_subscriptions")
          .update({ max_users: nextLimit, updated_at: new Date().toISOString() })
          .eq("id", subscription.id);
        if (error) throw error;
      } else {
        const { error } = await client.from("platform_company_subscriptions").insert({
          company_id: company.id,
          plan_id: company.plan_id,
          status: company.status === "active" ? "active" : "trial",
          monthly_price: null,
          setup_fee: null,
          max_users: nextLimit,
          contract_min_months: 3
        });
        if (error) throw error;
      }

      await client.from("platform_admin_audit_logs").insert({
        actor_user_id: user.id,
        action: "company_user_limit_updated",
        entity_type: "platform_company",
        entity_id: company.id,
        company_id: company.id,
        metadata: {
          previousLimit,
          nextLimit,
          clinicCompanyId: company.clinic_company_id
        }
      });

      setActionMessage(`Limite de usuarios de ${company.trading_name || company.company_name} atualizado.`);
      await loadData();
    } catch (error) {
      setActionMessage(getAdminActionErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function updateCompanyDetails(company: PlatformCompany, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const companyName = String(form.get("companyName") ?? "").trim();
    const tradingName = String(form.get("tradingName") ?? "").trim();
    const responsibleName = String(form.get("responsibleName") ?? "").trim();
    const responsibleEmail = String(form.get("responsibleEmail") ?? "").trim();
    const responsiblePhone = String(form.get("responsiblePhone") ?? "").trim();
    const cnpj = String(form.get("cnpj") ?? "").trim();
    const status = String(form.get("status") ?? company.status) as CompanyStatus;
    const planId = String(form.get("planId") ?? "").trim();

    if (!companyName) {
      setActionMessage("Informe a razao social da empresa antes de salvar.");
      return;
    }

    setSaving(true);
    try {
      const client = await requireSupabase();
      const timestamp = new Date().toISOString();
      const { error: platformError } = await client
        .from("platform_companies")
        .update({
          company_name: companyName,
          trading_name: tradingName || null,
          responsible_name: responsibleName || null,
          responsible_email: responsibleEmail || null,
          responsible_phone: responsiblePhone || null,
          cnpj: cnpj || null,
          status,
          plan_id: planId || null,
          updated_at: timestamp,
          activated_at: status === "active" ? (company.activated_at ?? timestamp) : company.activated_at,
          suspended_at: status === "suspended" ? timestamp : company.suspended_at,
          cancelled_at: status === "cancelled" ? timestamp : company.cancelled_at
        })
        .eq("id", company.id);

      if (platformError) throw platformError;

      if (company.clinic_company_id) {
        const planStatus = status === "active" ? "active" : status === "trial" ? "trial" : "suspended";
        const { error: clinicError } = await client
          .from("companies")
          .update({
            legal_name: companyName,
            document: cnpj || null,
            contact_email: responsibleEmail || null,
            contact_phone: responsiblePhone || null,
            plan_status: planStatus,
            blocked_at: ["inactive", "suspended", "cancelled"].includes(status) ? timestamp : null,
            updated_at: timestamp
          })
          .eq("id", company.clinic_company_id);
        if (clinicError) throw clinicError;

        const { error: settingsError } = await client
          .from("company_settings")
          .update({
            display_name: tradingName || companyName,
            updated_at: timestamp
          })
          .eq("company_id", company.clinic_company_id);
        if (settingsError) throw settingsError;
      }

      await client.from("platform_admin_audit_logs").insert({
        actor_user_id: user.id,
        action: "company_details_updated",
        entity_type: "platform_company",
        entity_id: company.id,
        company_id: company.id,
        metadata: {
          clinicCompanyId: company.clinic_company_id,
          previousStatus: company.status,
          nextStatus: status
        }
      });

      setActionMessage(`Dados de ${tradingName || companyName} atualizados.`);
      await loadData();
    } catch (error) {
      setActionMessage(import.meta.env.DEV ? getErrorMessage(error) : ADMIN_UNAVAILABLE_MESSAGE);
    } finally {
      setSaving(false);
    }
  }

  async function createClinicAdminUser(company: PlatformCompany, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const fullName = String(form.get("fullName") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();

    if (!company.clinic_company_id) {
      setActionMessage("Vincule a empresa a uma Company clinica antes de criar usuario.");
      return;
    }
    if (!fullName || !email) {
      setActionMessage("Informe nome e e-mail para convidar o admin da clinica.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setActionMessage("Informe um e-mail valido para convidar o admin da clinica.");
      return;
    }

    setSaving(true);
    try {
      const client = await requireSupabase();
      const { data: result, error } = await client.functions.invoke("admin-create-company-user", {
        body: {
          companyId: company.clinic_company_id,
          fullName,
          email,
          role: "company_admin",
          active: true,
          modules: clinicAdminDefaultModules,
          sendInviteEmail: true
        }
      });
      if (error) throw new Error(await getFunctionErrorMessage(error));
      if (result?.error) throw new Error(String(result.error));

      await client.from("platform_admin_audit_logs").insert({
        actor_user_id: user.id,
        action: "clinic_admin_user_created",
        entity_type: "platform_company",
        entity_id: company.id,
        company_id: company.id,
        metadata: {
          clinicCompanyId: company.clinic_company_id,
          createdUserId: result?.userId ?? null,
          email
        }
      });

      if (formElement.isConnected) formElement.reset();
      setActionMessage(`Convite de admin da clinica enviado para ${company.trading_name || company.company_name}.`);
      await loadData();
    } catch (error) {
      const message = getErrorMessage(error);
      setActionMessage(message || "Nao foi possivel criar o admin da clinica. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function updateClientRegistrationStatus(request: ClientRegistrationRequest, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const status = String(form.get("status") ?? request.status) as ClientRegistrationStatus;
    const adminNotes = String(form.get("adminNotes") ?? "").trim();

    setSaving(true);
    try {
      const client = await requireSupabase();
      const { error } = await client
        .from("platform_client_registration_requests")
        .update({
          status,
          admin_notes: adminNotes || null,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", request.id);
      if (error) throw error;

      await client.from("platform_admin_audit_logs").insert({
        actor_user_id: user.id,
        action: "client_registration_status_updated",
        entity_type: "platform_client_registration_request",
        entity_id: request.id,
        metadata: {
          previousStatus: request.status,
          nextStatus: status,
          clinicName: request.clinic_name
        }
      });

      setActionMessage(`Solicitacao de ${request.clinic_name} atualizada para ${clientRegistrationLabels[status]}.`);
      await loadData();
    } catch (error) {
      setActionMessage(getAdminActionErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function convertClientRegistration(request: ClientRegistrationRequest, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (request.approved_company_id || request.approved_platform_company_id || request.status === "converted") {
      setActionMessage("Esta solicitacao ja foi convertida em clinica.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const planId = String(form.get("planId") ?? "").trim();
    const status = String(form.get("status") ?? "trial") as CompanyStatus;
    const maxUsersValue = String(form.get("maxUsers") ?? "").trim();
    const maxUsers = maxUsersValue === "" ? null : Number(maxUsersValue);
    const adminName = String(form.get("adminName") ?? "").trim();
    const adminEmail = String(form.get("adminEmail") ?? "").trim();
    const adminNotes = String(form.get("adminNotes") ?? "").trim();

    if (maxUsers !== null && (!Number.isInteger(maxUsers) || maxUsers < 0)) {
      setActionMessage("Informe um limite de usuarios inteiro maior ou igual a zero, ou deixe vazio para ilimitado.");
      return;
    }
    if (adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
      setActionMessage("Informe um e-mail valido para convidar o admin da clinica.");
      return;
    }

    setSaving(true);
    try {
      const client = await requireSupabase();
      const timestamp = new Date().toISOString();
      const plan = data.plans.find((item) => item.id === planId) ?? null;
      const planStatus = status === "active" ? "active" : status === "trial" ? "trial" : "suspended";

      const { data: clinicCompany, error: clinicError } = await client
        .from("companies")
        .insert({
          name: request.clinic_name,
          legal_name: request.clinic_name,
          document: request.document_cnpj,
          contact_email: request.email ?? request.responsible_email,
          contact_phone: request.phone ?? request.responsible_phone,
          plan_id: planId || null,
          plan_status: planStatus,
          blocked_at: ["inactive", "suspended", "cancelled"].includes(status) ? timestamp : null
        })
        .select("id")
        .single();
      if (clinicError) throw clinicError;

      const clinicCompanyId = String(clinicCompany.id);

      const { error: settingsError } = await client.from("company_settings").insert({
        company_id: clinicCompanyId,
        display_name: request.clinic_name,
        commercial_data: {
          registrationRequestId: request.id,
          clinicType: request.clinic_type,
          address: request.address,
          city: request.city,
          state: request.state,
          zipCode: request.zip_code,
          websiteOrInstagram: request.website_or_instagram,
          source: request.source,
          sourceCampaign: request.source_campaign
        }
      });
      if (settingsError) throw settingsError;

      const { data: platformCompany, error: platformError } = await client
        .from("platform_companies")
        .insert({
          clinic_company_id: clinicCompanyId,
          company_name: request.clinic_name,
          trading_name: request.clinic_name,
          cnpj: request.document_cnpj,
          responsible_name: request.responsible_name,
          responsible_email: request.responsible_email,
          responsible_phone: request.responsible_phone,
          status,
          plan_id: planId || null,
          activated_at: status === "active" ? timestamp : null,
          suspended_at: status === "suspended" ? timestamp : null,
          cancelled_at: status === "cancelled" ? timestamp : null
        })
        .select("id")
        .single();
      if (platformError) throw platformError;

      const platformCompanyId = String(platformCompany.id);

      const { error: subscriptionError } = await client.from("platform_company_subscriptions").insert({
        company_id: platformCompanyId,
        plan_id: planId || null,
        status: status === "active" ? "active" : status === "trial" ? "trial" : "suspended",
        monthly_price: plan?.monthly_price ?? null,
        setup_fee: plan?.setup_fee ?? null,
        max_users: maxUsers,
        starts_at: new Date().toISOString().slice(0, 10),
        contract_min_months: 3,
        notes: `Criada a partir da solicitacao publica ${request.id}.`
      });
      if (subscriptionError) throw subscriptionError;

      await client
        .from("platform_client_registration_requests")
        .update({
          status: "converted",
          admin_notes: adminNotes || request.admin_notes,
          reviewed_by: user.id,
          reviewed_at: timestamp,
          approved_company_id: clinicCompanyId,
          approved_platform_company_id: platformCompanyId
        })
        .eq("id", request.id);

      if (adminName && adminEmail) {
        const { data: result, error } = await client.functions.invoke("admin-create-company-user", {
          body: {
            companyId: clinicCompanyId,
            fullName: adminName,
            email: adminEmail,
            role: "company_admin",
            active: true,
            modules: clinicAdminDefaultModules,
            sendInviteEmail: true
          }
        });
        if (error) throw new Error(await getFunctionErrorMessage(error));
        if (result?.error) throw new Error(String(result.error));
      }

      await client.from("platform_admin_audit_logs").insert({
        actor_user_id: user.id,
        action: "client_registration_converted",
        entity_type: "platform_client_registration_request",
        entity_id: request.id,
        company_id: platformCompanyId,
        metadata: {
          clinicCompanyId,
          platformCompanyId,
          planId: planId || null,
          maxUsers,
          invitedClinicAdmin: Boolean(adminName && adminEmail)
        }
      });

      setActionMessage(`Solicitacao de ${request.clinic_name} convertida em clinica.`);
      await loadData();
    } catch (error) {
      setActionMessage(getAdminActionErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function createPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!planForm.name.trim() || !planForm.slug.trim()) {
      setActionMessage("Informe nome e slug do plano.");
      return;
    }

    setSaving(true);
    try {
      const client = await requireSupabase();
      const { error } = await client.from("platform_plans").insert({
        name: planForm.name.trim(),
        slug: planForm.slug.trim().toLowerCase(),
        description: planForm.description.trim() || null,
        monthly_price: toNumberOrNull(planForm.monthlyPrice),
        setup_fee: toNumberOrNull(planForm.setupFee),
        is_custom_price: planForm.customPrice,
        active: true,
        display_order: data.plans.length * 10 + 10
      });

      if (error) throw error;
      setActionMessage("Plano criado no Admin Global.");
      setPlanForm({ name: "", slug: "", description: "", monthlyPrice: "", setupFee: "", customPrice: false });
      await loadData();
    } catch (error) {
      setActionMessage(import.meta.env.DEV ? getErrorMessage(error) : ADMIN_UNAVAILABLE_MESSAGE);
    } finally {
      setSaving(false);
    }
  }

  async function togglePlan(plan: PlatformPlan) {
    setSaving(true);
    try {
      const client = await requireSupabase();
      const { error } = await client.from("platform_plans").update({ active: !plan.active }).eq("id", plan.id);
      if (error) throw error;
      setActionMessage(`Plano ${plan.name} ${plan.active ? "desativado" : "ativado"}.`);
      await loadData();
    } catch (error) {
      setActionMessage(import.meta.env.DEV ? getErrorMessage(error) : ADMIN_UNAVAILABLE_MESSAGE);
    } finally {
      setSaving(false);
    }
  }

  async function createAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!announcementForm.message.trim()) {
      setActionMessage("Informe a mensagem do aviso.");
      return;
    }

    setSaving(true);
    try {
      const client = await requireSupabase();
      const { error } = await client.from("platform_announcements").insert({
        title: announcementForm.title.trim() || null,
        message: announcementForm.message.trim(),
        severity: announcementForm.severity,
        active: announcementForm.active,
        target_scope: "all",
        starts_at: announcementForm.startsAt ? new Date(announcementForm.startsAt).toISOString() : null,
        ends_at: announcementForm.endsAt ? new Date(announcementForm.endsAt).toISOString() : null,
        created_by: user.id
      });

      if (error) throw error;
      setActionMessage("Aviso global criado.");
      setAnnouncementForm({ title: "", message: "", severity: "info", startsAt: "", endsAt: "", active: false });
      await loadData();
    } catch (error) {
      setActionMessage(getAdminActionErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function toggleAnnouncement(announcement: PlatformAnnouncement) {
    setSaving(true);
    try {
      const client = await requireSupabase();
      const { error } = await client.from("platform_announcements").update({ active: !announcement.active }).eq("id", announcement.id);
      if (error) throw error;
      setActionMessage(`Aviso ${announcement.active ? "desativado" : "ativado"}.`);
      await loadData();
    } catch (error) {
      setActionMessage(getAdminActionErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="admin-shell">
      <aside className="sidebar">
        <div className="brand">
          <span><ShieldCheck size={23} /></span>
          <div>
            <strong>Podo360 Admin</strong>
            <small>Admin Global separado</small>
          </div>
        </div>

        <nav aria-label="Administracao Podo360">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                className={activeSection === item.id ? "sidebar-link sidebar-link--active" : "sidebar-link"}
                key={item.id}
                onClick={() => openSection(item.id)}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="security-note">
          <ShieldCheck size={17} />
          <span>Ambiente administrativo separado, com dados reais e acesso protegido por permissoes.</span>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <span className="eyebrow">Plataforma Podo360</span>
            <h1>{currentSection.title}</h1>
            <p>{currentSection.description}</p>
            <small>Logado como {user.email} • Perfil Admin Global: {adminUser.role}</small>
          </div>
          <div className="topbar-actions">
            <button type="button" className="button button--secondary" onClick={() => void loadData()} disabled={loading}>
              <RefreshCw size={16} />
              Atualizar
            </button>
            <button type="button" className="button button--secondary" onClick={onLogout}>
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </header>

        <div className="action-banner" role="status">
          {loading ? "Carregando dados reais..." : actionMessage}
        </div>

        {activeSection === "dashboard" && (
          <section className="metric-grid" id="dashboard">
            <article className="metric-card">
              <span><Building2 size={20} /></span>
              <strong>{data.companies.length}</strong>
              <small>Empresas cadastradas</small>
            </article>
            <article className="metric-card">
              <span><CheckCircle2 size={20} /></span>
              <strong>{activeCompanies}</strong>
              <small>Empresas ativas</small>
            </article>
            <article className="metric-card">
              <span><AlertTriangle size={20} /></span>
              <strong>{blockedCompanies}</strong>
              <small>Bloqueadas/inativas</small>
            </article>
            <article className="metric-card">
              <span><Users size={20} /></span>
              <strong>{pendingRegistrations}</strong>
              <small>Cadastros para analisar</small>
            </article>
            <article className="metric-card metric-card--wide">
              <span><CreditCard size={20} /></span>
              <strong>{formatCurrency(recurringRevenue)}</strong>
              <small>Receita mensal mapeada</small>
            </article>
          </section>
        )}

        {activeSection === "client-registrations" && (
          <section className="panel" id="client-registrations">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Cadastro Cliente</span>
                <h2>Solicitacoes enviadas pelo formulario publico</h2>
              </div>
            </div>

            <div className="request-grid">
              {data.clientRegistrationRequests.map((request) => (
                <article className="company-card" key={request.id}>
                  <div className="card-title-row">
                    <span className={`badge badge--${request.status}`}>{clientRegistrationLabels[request.status]}</span>
                    <small>{formatDate(request.created_at)}</small>
                  </div>
                  <div>
                    <h3>{request.clinic_name}</h3>
                    <p>{request.responsible_name} - {request.responsible_email}</p>
                  </div>
                  <dl>
                    <div><dt>CNPJ</dt><dd>{request.document_cnpj || "Nao informado"}</dd></div>
                    <div><dt>Telefone</dt><dd>{request.phone || request.responsible_phone || "Nao informado"}</dd></div>
                    <div><dt>Cidade/UF</dt><dd>{[request.city, request.state].filter(Boolean).join(" / ") || "Nao informado"}</dd></div>
                    <div><dt>Plano de interesse</dt><dd>{request.interested_plan || "Nao informado"}</dd></div>
                    <div><dt>Usuarios estimados</dt><dd>{request.estimated_users ?? "Nao informado"}</dd></div>
                    <div><dt>Profissionais</dt><dd>{request.estimated_professionals ?? "Nao informado"}</dd></div>
                    <div><dt>Origem</dt><dd>{request.source || "Direto"}</dd></div>
                    <div><dt>Campanha</dt><dd>{request.source_campaign || "Nao informada"}</dd></div>
                  </dl>
                  {request.notes && <p className="form-helper">{request.notes}</p>}
                  {request.admin_notes && <p className="form-helper"><strong>Nota interna:</strong> {request.admin_notes}</p>}

                  <details className="embedded-form">
                    <summary>Analisar solicitacao</summary>
                    <form className="form-grid form-grid--compact" onSubmit={(event) => void updateClientRegistrationStatus(request, event)}>
                      <label>Status
                        <select defaultValue={request.status} name="status">
                          {Object.entries(clientRegistrationLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                        </select>
                      </label>
                      <label className="form-grid--span">Observacao interna
                        <textarea defaultValue={request.admin_notes ?? ""} name="adminNotes" rows={3} />
                      </label>
                      <button type="submit" className="button button--secondary" disabled={saving}>Salvar analise</button>
                    </form>
                  </details>

                  <details className="embedded-form">
                    <summary>Converter em clinica</summary>
                    <form className="form-grid form-grid--compact" onSubmit={(event) => void convertClientRegistration(request, event)}>
                      <label>Status inicial
                        <select defaultValue="trial" name="status">
                          <option value="trial">Trial</option>
                          <option value="active">Ativa</option>
                          <option value="suspended">Suspensa</option>
                        </select>
                      </label>
                      <label>Plano
                        <select defaultValue={data.plans.find((plan) => plan.slug === request.interested_plan)?.id ?? ""} name="planId">
                          <option value="">Sem plano</option>
                          {data.plans.map((plan) => <option value={plan.id} key={plan.id}>{plan.name}</option>)}
                        </select>
                      </label>
                      <label>Limite de usuarios
                        <input defaultValue={request.estimated_users ?? ""} min={0} name="maxUsers" placeholder="Vazio = ilimitado" type="number" />
                      </label>
                      <label>Nome do admin
                        <input defaultValue={request.desired_admin_name ?? request.responsible_name} name="adminName" />
                      </label>
                      <label>E-mail do admin
                        <input defaultValue={request.desired_admin_email ?? request.responsible_email} name="adminEmail" type="email" />
                      </label>
                      <label className="form-grid--span">Observacao da conversao
                        <textarea defaultValue={request.admin_notes ?? ""} name="adminNotes" rows={3} />
                      </label>
                      <p className="form-helper form-grid--span">
                        A conversao cria a clinica, configura a assinatura e envia convite seguro para o admin informado.
                      </p>
                      <button
                        type="submit"
                        className="button"
                        disabled={saving || request.status === "converted" || Boolean(request.approved_company_id)}
                      >
                        Converter em clinica
                      </button>
                    </form>
                  </details>
                </article>
              ))}
              {!data.clientRegistrationRequests.length && <p>Nenhuma solicitacao de cadastro recebida ainda.</p>}
            </div>
          </section>
        )}

        {activeSection === "leads" && (
          <section className="panel" id="leads">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Leads</span>
                <h2>Interesses vindos da Landing Page</h2>
              </div>
            </div>
            <div className="responsive-list responsive-list--leads">
              {data.leads.map((lead) => (
                <article className="list-card" key={lead.id}>
                  <div><strong>{lead.name}</strong><small>{lead.email || "Sem e-mail"} • {lead.phone || "Sem telefone"}</small></div>
                  <div><span className="field-label">Clinica</span><span>{lead.clinic_name || "Nao informado"}</span></div>
                  <div><span className="field-label">Cidade</span><span>{lead.city || "Nao informado"}</span></div>
                  <div><span className={`badge badge--${lead.status}`}>{leadLabels[lead.status]}</span></div>
                  <div><span className="field-label">Origem</span><span>{lead.source || "Manual"}</span></div>
                </article>
              ))}
              {!data.leads.length && <p>Nenhum lead cadastrado ainda.</p>}
            </div>
          </section>
        )}

        {activeSection === "companies" && (
          <section className="panel" id="companies">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Empresas</span>
                <h2>Clinicas contratantes</h2>
              </div>
            </div>

            <form className="form-grid form-grid--compact" onSubmit={(event) => void createCompany(event)}>
              <label>Razao social<input value={companyForm.companyName} onChange={(event) => setCompanyForm((form) => ({ ...form, companyName: event.target.value }))} placeholder="Nome da empresa" /></label>
              <label>Nome fantasia<input value={companyForm.tradingName} onChange={(event) => setCompanyForm((form) => ({ ...form, tradingName: event.target.value }))} placeholder="Clinica" /></label>
              <label>Responsavel<input value={companyForm.responsibleName} onChange={(event) => setCompanyForm((form) => ({ ...form, responsibleName: event.target.value }))} /></label>
              <label>E-mail<input type="email" value={companyForm.responsibleEmail} onChange={(event) => setCompanyForm((form) => ({ ...form, responsibleEmail: event.target.value }))} /></label>
              <label>Telefone<input value={companyForm.responsiblePhone} onChange={(event) => setCompanyForm((form) => ({ ...form, responsiblePhone: event.target.value }))} /></label>
              <label>CNPJ<input value={companyForm.cnpj} onChange={(event) => setCompanyForm((form) => ({ ...form, cnpj: event.target.value }))} /></label>
              <label>Status
                <select value={companyForm.status} onChange={(event) => setCompanyForm((form) => ({ ...form, status: event.target.value as CompanyStatus }))}>
                  {Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                </select>
              </label>
              <label>Plano
                <select value={companyForm.planId} onChange={(event) => setCompanyForm((form) => ({ ...form, planId: event.target.value }))}>
                  <option value="">Sem plano</option>
                  {data.plans.map((plan) => <option value={plan.id} key={plan.id}>{plan.name}</option>)}
                </select>
              </label>
              <button type="submit" className="button" disabled={saving}>Cadastrar empresa</button>
            </form>

            <div className="company-grid">
              {data.companies.map((company) => (
                <article className="company-card" key={company.id}>
                  <div className="card-title-row">
                    <span className={`status-pill status-pill--${company.status}`}>{statusLabels[company.status]}</span>
                    <span className="plan-chip">{getPlanName(data.plans, company.plan_id)}</span>
                  </div>
                  <div><h3>{company.trading_name || company.company_name}</h3><p>{company.company_name}</p></div>
                  <dl>
                    <div><dt>CNPJ</dt><dd>{company.cnpj || "Nao informado"}</dd></div>
                    <div><dt>Responsavel</dt><dd>{company.responsible_name || "Nao informado"}</dd></div>
                    <div><dt>E-mail</dt><dd>{company.responsible_email || "Nao informado"}</dd></div>
                    <div><dt>Telefone</dt><dd>{company.responsible_phone || "Nao informado"}</dd></div>
                    <div><dt>Company clinica</dt><dd>{company.clinic_company_id || "Nao vinculada"}</dd></div>
                    <div><dt>Criada em</dt><dd>{formatDate(company.created_at)}</dd></div>
                    <div><dt>Usuarios ativos</dt><dd>{company.clinic_company_id ? (data.activeUserCounts[company.clinic_company_id] ?? 0) : 0} / {getCompanyUserLimit(company, data.plans, data.subscriptions) ?? "Ilimitado"}</dd></div>
                  </dl>
                  <details className="embedded-form">
                    <summary>Editar dados da empresa</summary>
                    <form className="form-grid form-grid--compact" onSubmit={(event) => void updateCompanyDetails(company, event)}>
                      <label>Razao social<input defaultValue={company.company_name} name="companyName" /></label>
                      <label>Nome fantasia<input defaultValue={company.trading_name ?? ""} name="tradingName" /></label>
                      <label>Responsavel<input defaultValue={company.responsible_name ?? ""} name="responsibleName" /></label>
                      <label>E-mail<input defaultValue={company.responsible_email ?? ""} name="responsibleEmail" type="email" /></label>
                      <label>Telefone<input defaultValue={company.responsible_phone ?? ""} name="responsiblePhone" /></label>
                      <label>CNPJ<input defaultValue={company.cnpj ?? ""} name="cnpj" /></label>
                      <label>Status
                        <select defaultValue={company.status} name="status">
                          {Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                        </select>
                      </label>
                      <label>Plano
                        <select defaultValue={company.plan_id ?? ""} name="planId">
                          <option value="">Sem plano</option>
                          {data.plans.map((plan) => <option value={plan.id} key={plan.id}>{plan.name}</option>)}
                        </select>
                      </label>
                      <button type="submit" className="button button--secondary" disabled={saving}>Salvar dados</button>
                    </form>
                  </details>
                  <form className="inline-limit-form" onSubmit={(event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    void updateCompanyUserLimit(company, String(form.get("maxUsers") ?? ""));
                  }}>
                    <label>
                      Limite de usuarios da clinica
                      <input
                        defaultValue={getCompanyUserLimit(company, data.plans, data.subscriptions) ?? ""}
                        min={0}
                        name="maxUsers"
                        placeholder="Vazio = ilimitado"
                        type="number"
                      />
                    </label>
                    <button type="submit" className="button button--secondary" disabled={saving}>Salvar limite</button>
                  </form>
                  <details className="embedded-form">
                    <summary>Criar admin da clinica</summary>
                    <form className="form-grid form-grid--compact" onSubmit={(event) => void createClinicAdminUser(company, event)}>
                      <label>Nome completo<input name="fullName" placeholder="Administrador da clinica" /></label>
                      <label>E-mail de login<input name="email" placeholder="admin@clinica.com" type="email" /></label>
                      <p className="form-helper">
                        O usuario recebera um convite seguro por e-mail e ficara vinculado a clinica {company.clinic_company_id || "nao vinculada"}.
                      </p>
                      <button type="submit" className="button button--secondary" disabled={saving || !company.clinic_company_id}>{saving ? "Enviando convite..." : "Convidar admin da clinica"}</button>
                    </form>
                  </details>
                  <div className="card-actions">
                    <button type="button" className="button button--secondary" disabled={saving || company.status === "active"} onClick={() => void updateCompanyStatus(company, "active")}>Ativar</button>
                    <button type="button" className="button button--secondary" disabled={saving || company.status === "suspended"} onClick={() => void updateCompanyStatus(company, "suspended")}>Suspender</button>
                    <button type="button" className="button button--secondary" disabled={saving || company.status === "cancelled"} onClick={() => void updateCompanyStatus(company, "cancelled")}>Cancelar</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeSection === "plans" && (
          <section className="panel" id="plans">
            <div className="panel-heading"><div><span className="eyebrow">Planos</span><h2>Planos comerciais do Podo360</h2></div></div>
            <form className="form-grid form-grid--compact" onSubmit={(event) => void createPlan(event)}>
              <label>Nome<input value={planForm.name} onChange={(event) => setPlanForm((form) => ({ ...form, name: event.target.value }))} /></label>
              <label>Slug<input value={planForm.slug} onChange={(event) => setPlanForm((form) => ({ ...form, slug: event.target.value }))} /></label>
              <label>Mensalidade<input inputMode="decimal" value={planForm.monthlyPrice} onChange={(event) => setPlanForm((form) => ({ ...form, monthlyPrice: event.target.value }))} /></label>
              <label>Setup<input inputMode="decimal" value={planForm.setupFee} onChange={(event) => setPlanForm((form) => ({ ...form, setupFee: event.target.value }))} /></label>
              <label className="form-grid--span">Descricao<input value={planForm.description} onChange={(event) => setPlanForm((form) => ({ ...form, description: event.target.value }))} /></label>
              <label className="checkbox-row"><input type="checkbox" checked={planForm.customPrice} onChange={(event) => setPlanForm((form) => ({ ...form, customPrice: event.target.checked }))} /> Preco sob consulta/a partir de</label>
              <button type="submit" className="button" disabled={saving}>Criar plano</button>
            </form>
            <div className="plan-grid">
              {data.plans.map((plan) => (
                <article className="plan-card" key={plan.id}>
                  <div className="card-title-row">
                    <span className="plan-chip">#{plan.display_order}</span>
                    <span className={plan.active ? "status-pill status-pill--active" : "status-pill status-pill--inactive"}>{plan.active ? "Ativo" : "Inativo"}</span>
                  </div>
                  <h3>{plan.name}</h3>
                  <p>{plan.description || "Sem descricao"}</p>
                  <div className="price-row"><strong>{plan.is_custom_price ? `A partir de ${formatCurrency(plan.monthly_price)}` : formatCurrency(plan.monthly_price)}</strong><small>mensalidade</small></div>
                  <div className="price-row price-row--setup"><strong>{plan.is_custom_price ? `A partir de ${formatCurrency(plan.setup_fee)}` : formatCurrency(plan.setup_fee)}</strong><small>setup</small></div>
                  <div className="limit-grid"><span>{plan.max_users ?? "Ilimitado"} usuarios</span><span>{plan.max_professionals ?? "Ilimitado"} profissionais</span><span>{plan.max_patients ?? "Ilimitado"} pacientes</span></div>
                  <button type="button" className="button button--secondary" disabled={saving} onClick={() => void togglePlan(plan)}>{plan.active ? "Desativar" : "Ativar"}</button>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeSection === "extras" && (
          <section className="panel" id="extras">
            <div className="panel-heading"><div><span className="eyebrow">Extras</span><h2>Servicos e liberacoes adicionais</h2></div></div>
            <div className="extras-grid">
              {data.extras.map((extra) => (
                <article className="compact-card" key={extra.id}>
                  <div className="card-title-row"><strong>{extra.name}</strong><span className={extra.active ? "status-dot status-dot--active" : "status-dot"} /></div>
                  <p>{extra.description || "Sem descricao"}</p>
                  <strong className="compact-price">{extra.is_range_price ? `${formatCurrency(extra.min_price)} a ${formatCurrency(extra.max_price)}` : formatCurrency(extra.price)}</strong>
                  <small>{extra.billing_type === "monthly" ? "recorrente mensal" : extra.billing_type === "one_time" ? "cobranca unica" : "projeto/faixa comercial"}</small>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeSection === "subscriptions" && (
          <section className="panel" id="subscriptions">
            <div className="panel-heading"><div><span className="eyebrow">Assinaturas / Contratos</span><h2>Controle comercial sem cobranca automatica</h2></div></div>
            <div className="responsive-list">
              {data.subscriptions.map((subscription) => (
                <article className="list-card list-card--subscription" key={subscription.id}>
                  <div><strong>{getCompanyName(data.companies, subscription.company_id)}</strong><small>Contrato minimo: {subscription.contract_min_months} meses</small></div>
                  <div><span className="field-label">Plano</span><span>{getPlanName(data.plans, subscription.plan_id)}</span></div>
                  <div><span className="field-label">Mensalidade</span><span>{formatCurrency(subscription.monthly_price)}</span></div>
                  <div><span className="field-label">Setup</span><span>{formatCurrency(subscription.setup_fee)}</span></div>
                  <div><span className={`status-pill status-pill--${subscription.status === "active" ? "active" : subscription.status === "trial" ? "trial" : "suspended"}`}>{subscriptionLabels[subscription.status]}</span></div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeSection === "features" && (
          <section className="panel" id="features">
            <div className="panel-heading"><div><span className="eyebrow">Feature Flags</span><h2>Recursos liberaveis por plano ou empresa</h2></div></div>
            <div className="feature-grid">
              {data.features.map((feature) => (
                <article className="compact-card" key={feature.id}>
                  <div className="card-title-row"><strong>{feature.name}</strong><span className={feature.active ? "status-dot status-dot--active" : "status-dot"} /></div>
                  <code>{feature.key}</code>
                  <p>{feature.description || "Sem descricao"}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeSection === "announcements" && (
          <section className="panel" id="announcements">
            <div className="panel-heading"><div><span className="eyebrow">Avisos Globais</span><h2>Mensagens para o topo do Sistema Clinica</h2></div></div>
            <div className="announcement-layout">
              <div className="responsive-list">
                {data.announcements.map((announcement) => (
                  <article className={`announcement-card announcement-card--${announcement.severity}`} key={announcement.id}>
                    <div className="card-title-row">
                      <span className="badge badge--announcement">{severityLabels[announcement.severity]}</span>
                      <span className={announcement.active ? "status-pill status-pill--active" : "status-pill status-pill--inactive"}>{announcement.active ? "Ativo" : "Inativo"}</span>
                    </div>
                    <h3>{announcement.title || "Aviso"}</h3>
                    <p>{announcement.message}</p>
                    <small>{formatDate(announcement.starts_at)} ate {formatDate(announcement.ends_at)}</small>
                    <button type="button" className="button button--secondary" disabled={saving} onClick={() => void toggleAnnouncement(announcement)}>{announcement.active ? "Desativar" : "Ativar"}</button>
                  </article>
                ))}
              </div>
              <form className="form-card" onSubmit={(event) => void createAnnouncement(event)}>
                <span className="eyebrow">Configurar aviso</span>
                <label>Titulo<input value={announcementForm.title} onChange={(event) => setAnnouncementForm((form) => ({ ...form, title: event.target.value }))} placeholder="Ex.: Manutencao programada" /></label>
                <label>Mensagem<textarea rows={4} value={announcementForm.message} onChange={(event) => setAnnouncementForm((form) => ({ ...form, message: event.target.value }))} /></label>
                <div className="form-grid form-grid--two">
                  <label>Inicio<input type="datetime-local" value={announcementForm.startsAt} onChange={(event) => setAnnouncementForm((form) => ({ ...form, startsAt: event.target.value }))} /></label>
                  <label>Fim<input type="datetime-local" value={announcementForm.endsAt} onChange={(event) => setAnnouncementForm((form) => ({ ...form, endsAt: event.target.value }))} /></label>
                </div>
                <label>Severidade<select value={announcementForm.severity} onChange={(event) => setAnnouncementForm((form) => ({ ...form, severity: event.target.value as AnnouncementSeverity }))}>{Object.entries(severityLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                <label className="checkbox-row"><input type="checkbox" checked={announcementForm.active} onChange={(event) => setAnnouncementForm((form) => ({ ...form, active: event.target.checked }))} /> Publicar aviso ativo</label>
                <button type="submit" className="button" disabled={saving}>Salvar aviso</button>
              </form>
            </div>
          </section>
        )}

        {activeSection === "audit" && (
          <section className="panel" id="audit">
            <div className="panel-heading"><div><span className="eyebrow">Auditoria Administrativa</span><h2>Historico de alteracoes comerciais</h2></div></div>
            <div className="audit-list">
              {data.statusLogs.map((log) => (
                <article key={log.id}>
                  <span><Activity size={18} /></span>
                  <div>
                    <strong>{getCompanyName(data.companies, log.company_id)}: {log.previous_status ? statusLabels[log.previous_status] : "Novo"} - {statusLabels[log.new_status]}</strong>
                    <p>{log.reason || "Sem justificativa registrada"}</p>
                    <small>{formatDate(log.created_at)}</small>
                  </div>
                </article>
              ))}
              {!data.statusLogs.length && <p>Nenhum log administrativo registrado ainda.</p>}
            </div>
          </section>
        )}

        {activeSection === "settings" && (
          <section className="panel" id="settings">
            <div className="panel-heading"><div><span className="eyebrow">Configuracoes da Plataforma</span><h2>Preparacao segura para producao</h2></div></div>
            <div className="settings-grid">
              <article className="compact-card"><Sparkles size={22} /><strong>Billing readiness</strong><p>Valores, setup, extras e contratos estao modelados. Gateway de pagamento ainda nao foi integrado.</p></article>
            <article className="compact-card"><ShieldCheck size={22} /><strong>Seguranca</strong><p>Admin separado usa autenticacao real e permissoes administrativas, sem expor credenciais no navegador.</p></article>
              <article className="compact-card"><Flag size={22} /><strong>Features futuras</strong><p>Features prontas para liberacao por plano ou empresa, sem bloquear modulo clinico automaticamente nesta etapa.</p></article>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

export function App() {
  const [currentPath, setCurrentPath] = useState(() => normalizePath(window.location.pathname));
  const [checking, setChecking] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [blockMessage, setBlockMessage] = useState("");

  const bootstrapAuth = useCallback(async () => {
    if (!supabase) {
      setChecking(false);
      return;
    }

    setChecking(true);
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (!data.session?.user) {
        setSession(null);
        setUser(null);
        setAdminUser(null);
        setBlockMessage("");
        return;
      }

      const admin = await fetchAdminUser(supabase, data.session.user.id);
      if (!admin) {
        setBlockMessage(PLATFORM_ADMIN_DENIED_MESSAGE);
        setSession(null);
        setUser(null);
        setAdminUser(null);
        return;
      }

      setSession(data.session);
      setUser(data.session.user);
      setAdminUser(admin);
      setBlockMessage("");
    } catch (error) {
      setBlockMessage(import.meta.env.DEV ? getErrorMessage(error) : ADMIN_UNAVAILABLE_MESSAGE);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    const syncRoute = () => setCurrentPath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", syncRoute);
    window.addEventListener("hashchange", syncRoute);
    return () => {
      window.removeEventListener("popstate", syncRoute);
      window.removeEventListener("hashchange", syncRoute);
    };
  }, []);

  useEffect(() => {
    void bootstrapAuth();
  }, [bootstrapAuth]);

  useEffect(() => {
    if (!supabase) return undefined;

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!nextSession?.user) {
        setSession(null);
        setUser(null);
        setAdminUser(null);
        setBlockMessage("");
        return;
      }

      void bootstrapAuth();
    });

    return () => data.subscription.unsubscribe();
  }, [bootstrapAuth]);

  async function handleLogout() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
    setAdminUser(null);
    setBlockMessage("");
    navigateTo(adminRoutes.login);
  }

  function handleAuthenticated(nextSession: Session, nextUser: User, nextAdminUser: AdminUser) {
    setSession(nextSession);
    setUser(nextUser);
    setAdminUser(nextAdminUser);
    setBlockMessage("");
  }

  if (checking) {
    return <LoadingScreen />;
  }

  if (blockMessage) {
    return <DeniedScreen message={blockMessage} onLogout={() => void handleLogout()} />;
  }

  if (!session || !user || !adminUser || currentPath === "/" || currentPath === adminRoutes.login) {
    return <LoginScreen onAuthenticated={handleAuthenticated} />;
  }

  return <DashboardApp user={user} adminUser={adminUser} onLogout={() => void handleLogout()} />;
}
