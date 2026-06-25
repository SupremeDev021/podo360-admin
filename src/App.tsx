import { useEffect, useMemo, useState } from "react";
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
  LockKeyhole,
  Mail,
  PackagePlus,
  Settings,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import {
  announcements,
  companies,
  leads,
  platformExtras,
  platformFeatures,
  platformPlans,
  statusLogs,
  subscriptions
} from "./data/mockData";
import type {
  AnnouncementSeverity,
  CompanyStatus,
  LeadStatus,
  SubscriptionStatus
} from "./types/platform";
import { adminRoutes, normalizePath, toBrowserPath, type AdminRouteKey } from "./config";
import { isSupabaseConfigured } from "./services/supabase";

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
  lost: "Perdido"
};

const subscriptionLabels: Record<SubscriptionStatus, string> = {
  active: "Ativa",
  trial: "Trial",
  past_due: "Em atraso",
  cancelled: "Cancelada"
};

const severityLabels: Record<AnnouncementSeverity, string> = {
  info: "Informativo",
  warning: "Atenção",
  maintenance: "Manutenção",
  critical: "Crítico"
};

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "leads", label: "Leads", icon: Mail },
  { id: "companies", label: "Empresas", icon: Building2 },
  { id: "plans", label: "Planos", icon: Layers3 },
  { id: "extras", label: "Extras", icon: PackagePlus },
  { id: "subscriptions", label: "Assinaturas", icon: CreditCard },
  { id: "features", label: "Feature Flags", icon: Flag },
  { id: "announcements", label: "Avisos Globais", icon: Bell },
  { id: "audit", label: "Auditoria", icon: ClipboardList },
  { id: "settings", label: "Configurações", icon: Settings }
] as const;

type SectionId = (typeof navigationItems)[number]["id"];

const sectionRoutes: Record<SectionId, string> = {
  dashboard: adminRoutes.dashboard,
  leads: adminRoutes.dashboard,
  companies: adminRoutes.companies,
  plans: adminRoutes.plans,
  extras: adminRoutes.extras,
  subscriptions: adminRoutes.subscriptions,
  features: adminRoutes.features,
  announcements: adminRoutes.announcements,
  audit: adminRoutes.audit,
  settings: adminRoutes.settings
};

const routeSections: Partial<Record<string, SectionId>> = {
  "/": "dashboard",
  "/admin": "dashboard",
  [adminRoutes.dashboard]: "dashboard",
  [adminRoutes.companies]: "companies",
  [adminRoutes.plans]: "plans",
  [adminRoutes.extras]: "extras",
  [adminRoutes.subscriptions]: "subscriptions",
  [adminRoutes.features]: "features",
  [adminRoutes.announcements]: "announcements",
  [adminRoutes.audit]: "audit",
  [adminRoutes.settings]: "settings"
};

const sectionCopy: Record<SectionId, { title: string; description: string }> = {
  dashboard: {
    title: "Dashboard administrativo da plataforma.",
    description: "Visão executiva de empresas, leads, receita mapeada e pontos de atenção."
  },
  leads: {
    title: "Leads comerciais.",
    description: "Acompanhe os contatos vindos da Landing Page e prepare a conversão em empresa contratante."
  },
  companies: {
    title: "Empresas contratantes.",
    description: "Cadastre, acompanhe e altere status comerciais das clínicas vinculadas à plataforma."
  },
  plans: {
    title: "Planos comerciais.",
    description: "Gerencie Start, Clinic, Pro e Master sem misturar regras comerciais dentro do Sistema Clínica."
  },
  extras: {
    title: "Extras comerciais.",
    description: "Controle serviços adicionais, faixas de preço e cobranças avulsas ou recorrentes."
  },
  subscriptions: {
    title: "Assinaturas e contratos.",
    description: "Organize plano, setup, renovação e contrato mínimo sem cobrança automática nesta fase."
  },
  features: {
    title: "Feature flags.",
    description: "Prepare recursos liberáveis por plano ou empresa para leitura futura pelo Sistema Clínica."
  },
  announcements: {
    title: "Avisos globais.",
    description: "Configure mensagens para aparecerem no topo do Sistema Clínica quando a integração estiver ativa."
  },
  audit: {
    title: "Auditoria administrativa.",
    description: "Histórico de alterações comerciais e mudanças de status feitas pela equipe Podo360."
  },
  settings: {
    title: "Configurações da plataforma.",
    description: "Checklist de segurança, billing readiness e limites do que ainda não está em produção."
  }
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatCurrency(value: number, prefix = "R$") {
  return `${prefix} ${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function getPlanName(slug?: string) {
  return platformPlans.find((plan) => plan.slug === slug)?.name ?? "A definir";
}

function getCompanyName(companyId: string) {
  return companies.find((company) => company.id === companyId)?.tradingName ?? "Empresa não vinculada";
}

function priceLabel(minPrice?: number, maxPrice?: number, price?: number) {
  if (minPrice && maxPrice) {
    return `${formatCurrency(minPrice)} a ${formatCurrency(maxPrice)}`;
  }

  return price ? formatCurrency(price) : "Sob consulta";
}

function AdminLogin() {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <span className="eyebrow">Podo360 Admin</span>
        <h1>Login administrativo</h1>
        <p>
          A autenticação real será feita pelo Supabase Auth. Se ainda não existe usuário, use o setup inicial.
        </p>

        <div className="setup-status">
          <strong>Supabase</strong>
          <span>{isSupabaseConfigured ? "Variáveis públicas configuradas." : "Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY."}</span>
        </div>

        <a className="button" href={toBrowserPath(adminRoutes.setup)}>
          Abrir setup do primeiro admin
        </a>
        <a className="button button--secondary" href={toBrowserPath(adminRoutes.dashboard)}>
          Ver painel em modo leitura
        </a>
      </section>
    </main>
  );
}

function InitialSetup() {
  const [authUserId, setAuthUserId] = useState("");
  const [fullName, setFullName] = useState("Administrador da Clínica");
  const [email, setEmail] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [platformOwner, setPlatformOwner] = useState(false);

  const profileSql = useMemo(() => {
    const safeUserId = authUserId.trim() || "<auth_user_id>";
    const safeCompanyId = companyId.trim() || "<company_id>";
    const safeName = fullName.trim().replace(/'/g, "''") || "Administrador da Clínica";
    const safeEmail = email.trim().replace(/'/g, "''") || "<email_do_usuario>";

    const profile = `insert into public.profiles (id, company_id, full_name, email, role, active)
values ('${safeUserId}', '${safeCompanyId}', '${safeName}', '${safeEmail}', 'company_admin', true)
on conflict (id) do update set
  company_id = excluded.company_id,
  full_name = excluded.full_name,
  email = excluded.email,
  role = excluded.role,
  active = true,
  updated_at = now();`;

    if (!platformOwner) return profile;

    return `${profile}

insert into public.platform_admin_users (user_id, role, active)
values ('${safeUserId}', 'owner', true)
on conflict (user_id) do update set
  role = excluded.role,
  active = true,
  updated_at = now();`;
  }, [authUserId, companyId, email, fullName, platformOwner]);

  return (
    <main className="auth-shell">
      <section className="auth-card auth-card--wide">
        <span className="eyebrow">Setup seguro</span>
        <h1>Primeiro usuário administrador</h1>
        <p>
          Crie o usuário no Supabase Auth pelo painel, copie o ID gerado e use este assistente para montar o vínculo
          em `profiles`. Nenhuma senha deve ser colocada no código ou em migration.
        </p>

        <div className="setup-grid">
          <label>
            Auth user ID
            <input value={authUserId} onChange={(event) => setAuthUserId(event.target.value)} placeholder="UUID do usuário criado no Auth" />
          </label>
          <label>
            Nome completo
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </label>
          <label>
            E-mail
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email do usuário" />
          </label>
          <label>
            Company ID
            <input value={companyId} onChange={(event) => setCompanyId(event.target.value)} placeholder="company_id da clínica" />
          </label>
        </div>

        <label className="checkbox-row">
          <input type="checkbox" checked={platformOwner} onChange={(event) => setPlatformOwner(event.target.checked)} />
          Também criar como owner do Podo360 Admin
        </label>

        <div className="setup-status">
          <strong>Regra de segurança</strong>
          <span>Use este SQL manualmente no Supabase SQL Editor. Não cole senha aqui e não versione scripts locais.</span>
        </div>

        <pre className="sql-box">{profileSql}</pre>

        <div className="card-actions">
          <a className="button" href="https://supabase.com/dashboard/project/xnntitaajweajashzgtk/auth/users" target="_blank" rel="noreferrer">
            Abrir Supabase Auth
          </a>
          <a className="button button--secondary" href={toBrowserPath(adminRoutes.login)}>
            Voltar para login
          </a>
        </div>
      </section>
    </main>
  );
}

export function App() {
  const getCurrentPath = () => normalizePath(window.location.pathname);
  const [currentPath, setCurrentPath] = useState(getCurrentPath);
  const [activeSection, setActiveSection] = useState<SectionId>(() => routeSections[getCurrentPath()] ?? "dashboard");
  const [actionMessage, setActionMessage] = useState("Escolha uma opção do menu para trabalhar em uma tela separada.");

  const activeCompanies = companies.filter((company) => company.status === "active").length;
  const blockedCompanies = companies.filter((company) => ["inactive", "suspended", "cancelled"].includes(company.status)).length;
  const pendingLeads = leads.filter((lead) => lead.status === "new" || lead.status === "qualified").length;
  const recurringRevenue = subscriptions
    .filter((subscription) => subscription.status === "active" || subscription.status === "trial")
    .reduce((total, subscription) => total + subscription.monthlyPrice, 0);
  const currentSection = sectionCopy[activeSection];

  useEffect(() => {
    function handlePopState() {
      const nextPath = getCurrentPath();
      setCurrentPath(nextPath);
      setActiveSection(routeSections[nextPath] ?? "dashboard");
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function openSection(section: SectionId, message?: string) {
    setActiveSection(section);
    const nextRoute = sectionRoutes[section];
    setCurrentPath(nextRoute);
    window.history.pushState({}, "", toBrowserPath(nextRoute));
    setActionMessage(message ?? `Tela "${sectionCopy[section].title}" aberta.`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showPreparedAction(message: string) {
    setActionMessage(message);
  }

  if (currentPath === adminRoutes.setup) {
    return <InitialSetup />;
  }

  if (currentPath === adminRoutes.login) {
    return <AdminLogin />;
  }

  return (
    <main className="admin-shell">
      <aside className="sidebar">
        <div className="brand">
          <span><ShieldCheck size={23} /></span>
          <div>
            <strong>Podo360 Admin</strong>
            <small>Gestão da plataforma</small>
          </div>
        </div>

        <nav aria-label="Administração Podo360">
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
          <LockKeyhole size={17} />
          <span>Admin separado do sistema clínico. Sem service_role no frontend e sem cobrança automática nesta fase.</span>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <span className="eyebrow">Plataforma Podo360</span>
            <h1>{currentSection.title}</h1>
            <p>{currentSection.description}</p>
          </div>
          <div className="topbar-actions">
            <button
              type="button"
              className="button button--secondary"
              onClick={() => showPreparedAction("Exportação preparada para a tela atual. A geração real será conectada ao Supabase após aprovação.")}
            >
              Exportar visão
            </button>
            <button
              type="button"
              className="button"
              onClick={() => openSection("companies", "Formulário de cadastro de empresa aberto.")}
            >
              Nova empresa
            </button>
          </div>
        </header>

        <div className="action-banner" role="status">
          {actionMessage}
        </div>

        {activeSection === "dashboard" && (
        <section className="metric-grid" id="dashboard">
          <article className="metric-card">
            <span><Building2 size={20} /></span>
            <strong>{companies.length}</strong>
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
            <strong>{pendingLeads}</strong>
            <small>Leads para acompanhar</small>
          </article>
          <article className="metric-card metric-card--wide">
            <span><CreditCard size={20} /></span>
            <strong>{formatCurrency(recurringRevenue)}</strong>
            <small>Receita mensal mapeada</small>
          </article>
        </section>
        )}

        {activeSection === "leads" && (
        <section className="panel" id="leads">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Leads</span>
              <h2>Interesses vindos da Landing Page</h2>
            </div>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => showPreparedAction("Cadastro manual de lead preparado. A gravação real será conectada após Supabase aprovado.")}
            >
              Criar lead manual
            </button>
          </div>
          <div className="responsive-list responsive-list--leads">
            {leads.map((lead) => (
              <article className="list-card" key={lead.id}>
                <div>
                  <strong>{lead.name}</strong>
                  <small>{lead.email} • {lead.phone}</small>
                </div>
                <div>
                  <span className="field-label">Clínica</span>
                  <span>{lead.clinicName}</span>
                </div>
                <div>
                  <span className="field-label">Cidade</span>
                  <span>{lead.city}</span>
                </div>
                <div>
                  <span className={`badge badge--${lead.status}`}>{leadLabels[lead.status]}</span>
                </div>
                <div>
                  <span className="field-label">Origem</span>
                  <span>{lead.source}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
        )}

        {activeSection === "companies" && (
        <section className="panel" id="companies">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Empresas</span>
              <h2>Clínicas contratantes</h2>
            </div>
            <button
              type="button"
              className="button"
              onClick={() => showPreparedAction("Preencha os campos compactos abaixo para cadastrar uma empresa quando o backend estiver conectado.")}
            >
              Cadastrar empresa
            </button>
          </div>

          <div className="form-grid form-grid--compact">
            <label>
              Nome fantasia
              <input type="text" placeholder="Ex.: Clínica Pé Saudável" />
            </label>
            <label>
              Responsável
              <input type="text" placeholder="Nome do responsável" />
            </label>
            <label>
              Status
              <select defaultValue="">
                <option value="">Selecione</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option value={value} key={value}>{label}</option>
                ))}
              </select>
            </label>
            <label>
              Plano
              <select defaultValue="">
                <option value="">Selecione</option>
                {platformPlans.map((plan) => (
                  <option value={plan.slug} key={plan.slug}>{plan.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="company-grid">
            {companies.map((company) => (
              <article className="company-card" key={company.id}>
                <div className="card-title-row">
                  <span className={`status-pill status-pill--${company.status}`}>{statusLabels[company.status]}</span>
                  <span className="plan-chip">{getPlanName(company.planSlug)}</span>
                </div>
                <div>
                  <h3>{company.tradingName}</h3>
                  <p>{company.companyName}</p>
                </div>
                <dl>
                  <div><dt>CNPJ</dt><dd>{company.cnpj}</dd></div>
                  <div><dt>Responsável</dt><dd>{company.responsibleName}</dd></div>
                  <div><dt>E-mail</dt><dd>{company.responsibleEmail}</dd></div>
                  <div><dt>Telefone</dt><dd>{company.responsiblePhone}</dd></div>
                  <div><dt>Renovação</dt><dd>{company.renewsAt ? formatDate(company.renewsAt) : "A definir"}</dd></div>
                </dl>
                <div className="card-actions">
                  <button
                    type="button"
                    className="button button--secondary"
                    onClick={() => showPreparedAction(`Detalhes de ${company.tradingName} selecionados.`)}
                  >
                    Ver detalhes
                  </button>
                  <button
                    type="button"
                    className="button"
                    onClick={() => showPreparedAction(`Alteração de status de ${company.tradingName} preparada para auditoria.`)}
                  >
                    Alterar status
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
        )}

        {activeSection === "plans" && (
        <section className="panel" id="plans">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Planos</span>
              <h2>Planos comerciais do Podo360</h2>
            </div>
            <button
              type="button"
              className="button"
              onClick={() => showPreparedAction("Criação de plano preparada. Os planos atuais já refletem Start, Clinic, Pro e Master.")}
            >
              Novo plano
            </button>
          </div>

          <div className="plan-grid">
            {platformPlans.map((plan) => (
              <article className="plan-card" key={plan.id}>
                <div className="card-title-row">
                  <span className="plan-chip">#{plan.displayOrder}</span>
                  <span className={plan.active ? "status-pill status-pill--active" : "status-pill status-pill--inactive"}>
                    {plan.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <h3>{plan.name}</h3>
                <p>{plan.description}</p>
                <div className="price-row">
                  <strong>{plan.isCustomPrice ? `A partir de ${formatCurrency(plan.monthlyPrice)}` : formatCurrency(plan.monthlyPrice)}</strong>
                  <small>mensalidade</small>
                </div>
                <div className="price-row price-row--setup">
                  <strong>{plan.isCustomPrice ? `A partir de ${formatCurrency(plan.setupFee)}` : formatCurrency(plan.setupFee)}</strong>
                  <small>setup</small>
                </div>
                <div className="limit-grid">
                  <span>{plan.maxUsers ?? "Ilimitado"} usuários</span>
                  <span>{plan.maxProfessionals ?? "Ilimitado"} profissionais</span>
                  <span>{plan.maxPatients ?? "Ilimitado"} pacientes</span>
                </div>
                <div className="feature-tags">
                  {plan.features.slice(0, 5).map((feature) => (
                    <span key={feature}>{feature.replace(/_/g, " ")}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
        )}

        {activeSection === "extras" && (
        <section className="panel" id="extras">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Extras</span>
              <h2>Serviços e liberações adicionais</h2>
            </div>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => showPreparedAction("Cadastro de extra preparado com suporte a valor fixo, mensal e faixa comercial.")}
            >
              Adicionar extra
            </button>
          </div>

          <div className="extras-grid">
            {platformExtras.map((extra) => (
              <article className="compact-card" key={extra.id}>
                <div className="card-title-row">
                  <strong>{extra.name}</strong>
                  <span className={extra.active ? "status-dot status-dot--active" : "status-dot"} />
                </div>
                <p>{extra.description}</p>
                <strong className="compact-price">{priceLabel(extra.minPrice, extra.maxPrice, extra.price)}</strong>
                <small>{extra.billingType === "monthly" ? "recorrente mensal" : extra.billingType === "one_time" ? "cobrança única" : "faixa comercial"}</small>
              </article>
            ))}
          </div>
        </section>
        )}

        {activeSection === "subscriptions" && (
        <section className="panel" id="subscriptions">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Assinaturas / Contratos</span>
              <h2>Controle comercial sem cobrança automática</h2>
            </div>
            <button
              type="button"
              className="button"
              onClick={() => showPreparedAction("Nova assinatura preparada. Cobrança automática continua fora do escopo desta fase.")}
            >
              Nova assinatura
            </button>
          </div>

          <div className="responsive-list">
            {subscriptions.map((subscription) => (
              <article className="list-card list-card--subscription" key={subscription.id}>
                <div>
                  <strong>{getCompanyName(subscription.companyId)}</strong>
                  <small>Contrato mínimo: {subscription.contractMinMonths} meses</small>
                </div>
                <div>
                  <span className="field-label">Plano</span>
                  <span>{getPlanName(subscription.planSlug)}</span>
                </div>
                <div>
                  <span className="field-label">Mensalidade</span>
                  <span>{formatCurrency(subscription.monthlyPrice)}</span>
                </div>
                <div>
                  <span className="field-label">Setup</span>
                  <span>{formatCurrency(subscription.setupFee)}</span>
                </div>
                <div>
                  <span className={`status-pill status-pill--${subscription.status === "active" ? "active" : subscription.status === "trial" ? "trial" : "suspended"}`}>
                    {subscriptionLabels[subscription.status]}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
        )}

        {activeSection === "features" && (
        <section className="panel" id="features">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Feature Flags</span>
              <h2>Recursos liberáveis por plano ou empresa</h2>
            </div>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => showPreparedAction("Cadastro de feature preparado. O Sistema Clínica ainda não bloqueia módulos por plano.")}
            >
              Nova feature
            </button>
          </div>

          <div className="feature-grid">
            {platformFeatures.map((feature) => (
              <article className="compact-card" key={feature.id}>
                <div className="card-title-row">
                  <strong>{feature.name}</strong>
                  <span className={feature.active ? "status-dot status-dot--active" : "status-dot"} />
                </div>
                <code>{feature.key}</code>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>
        )}

        {activeSection === "announcements" && (
        <section className="panel" id="announcements">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Avisos Globais</span>
              <h2>Mensagens para o topo do Sistema Clínica</h2>
            </div>
            <button
              type="button"
              className="button"
              onClick={() => showPreparedAction("Formulário de aviso global aberto. A publicação real depende da tabela platform_announcements.")}
            >
              Criar aviso
            </button>
          </div>

          <div className="announcement-layout">
            {announcements.map((announcement) => (
              <article className={`announcement-card announcement-card--${announcement.severity}`} key={announcement.id}>
                <div className="card-title-row">
                  <span className="badge badge--announcement">{severityLabels[announcement.severity]}</span>
                  <span className={announcement.active ? "status-pill status-pill--active" : "status-pill status-pill--inactive"}>
                    {announcement.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <h3>{announcement.title}</h3>
                <p>{announcement.message}</p>
                <small>{formatDate(announcement.startsAt)} até {formatDate(announcement.endsAt)}</small>
              </article>
            ))}

            <form className="form-card">
              <span className="eyebrow">Configurar aviso</span>
              <label>
                Título
                <input type="text" placeholder="Ex.: Manutenção programada" />
              </label>
              <label>
                Mensagem
                <textarea rows={4} placeholder="Escreva a mensagem que aparecerá no sistema clínica." />
              </label>
              <div className="form-grid form-grid--two">
                <label>
                  Início
                  <input type="datetime-local" />
                </label>
                <label>
                  Fim
                  <input type="datetime-local" />
                </label>
              </div>
              <button
                type="button"
                className="button"
                onClick={() => showPreparedAction("Aviso validado localmente. Salvamento real será ativado após integração Supabase.")}
              >
                Salvar aviso
              </button>
            </form>
          </div>
        </section>
        )}

        {activeSection === "audit" && (
        <section className="panel" id="audit">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Auditoria Administrativa</span>
              <h2>Histórico de alterações comerciais</h2>
            </div>
          </div>
          <div className="audit-list">
            {statusLogs.map((log) => (
              <article key={log.id}>
                <span><Activity size={18} /></span>
                <div>
                  <strong>{log.companyName}: {statusLabels[log.previousStatus]} → {statusLabels[log.newStatus]}</strong>
                  <p>{log.reason}</p>
                  <small>{log.changedBy} • {formatDate(log.createdAt)}</small>
                </div>
              </article>
            ))}
          </div>
        </section>
        )}

        {activeSection === "settings" && (
        <section className="panel" id="settings">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Configurações da Plataforma</span>
              <h2>Preparação segura para produção</h2>
            </div>
          </div>
          <div className="settings-grid">
            <article className="compact-card">
              <Sparkles size={22} />
              <strong>Billing readiness</strong>
              <p>Valores, setup, extras e contratos estão modelados, mas gateway de pagamento ainda não foi integrado.</p>
            </article>
            <article className="compact-card">
              <ShieldCheck size={22} />
              <strong>Segurança</strong>
              <p>O Admin não executa fluxo clínico e não deve expor service_role no navegador.</p>
            </article>
            <article className="compact-card">
              <Flag size={22} />
              <strong>Features futuras</strong>
              <p>As features são preparadas para leitura pelo Sistema Clínica, sem bloqueio automático nesta fase.</p>
            </article>
          </div>
        </section>
        )}
      </section>
    </main>
  );
}
