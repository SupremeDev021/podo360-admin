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
  { href: "#dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "#leads", label: "Leads", icon: Mail },
  { href: "#companies", label: "Empresas", icon: Building2 },
  { href: "#plans", label: "Planos", icon: Layers3 },
  { href: "#extras", label: "Extras", icon: PackagePlus },
  { href: "#subscriptions", label: "Assinaturas", icon: CreditCard },
  { href: "#features", label: "Feature Flags", icon: Flag },
  { href: "#announcements", label: "Avisos Globais", icon: Bell },
  { href: "#audit", label: "Auditoria", icon: ClipboardList },
  { href: "#settings", label: "Configurações", icon: Settings }
];

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

export function App() {
  const activeCompanies = companies.filter((company) => company.status === "active").length;
  const blockedCompanies = companies.filter((company) => ["inactive", "suspended", "cancelled"].includes(company.status)).length;
  const pendingLeads = leads.filter((lead) => lead.status === "new" || lead.status === "qualified").length;
  const recurringRevenue = subscriptions
    .filter((subscription) => subscription.status === "active" || subscription.status === "trial")
    .reduce((total, subscription) => total + subscription.monthlyPrice, 0);

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
              <a href={item.href} key={item.href}>
                <Icon size={18} />
                {item.label}
              </a>
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
            <h1>Gestão comercial, planos e liberações das clínicas.</h1>
            <p>
              Estrutura preparada para empresas, planos, contratos, feature flags e avisos globais.
              A integração com o Supabase real só deve ocorrer após validação e aprovação explícita.
            </p>
          </div>
          <div className="topbar-actions">
            <button type="button" className="button button--secondary">Exportar visão</button>
            <button type="button" className="button">Nova empresa</button>
          </div>
        </header>

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

        <section className="panel" id="leads">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Leads</span>
              <h2>Interesses vindos da Landing Page</h2>
            </div>
            <button type="button" className="button button--secondary">Criar lead manual</button>
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

        <section className="panel" id="companies">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Empresas</span>
              <h2>Clínicas contratantes</h2>
            </div>
            <button type="button" className="button">Cadastrar empresa</button>
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
                  <button type="button" className="button button--secondary">Ver detalhes</button>
                  <button type="button" className="button">Alterar status</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel" id="plans">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Planos</span>
              <h2>Planos comerciais do Podo360</h2>
            </div>
            <button type="button" className="button">Novo plano</button>
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

        <section className="panel" id="extras">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Extras</span>
              <h2>Serviços e liberações adicionais</h2>
            </div>
            <button type="button" className="button button--secondary">Adicionar extra</button>
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

        <section className="panel" id="subscriptions">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Assinaturas / Contratos</span>
              <h2>Controle comercial sem cobrança automática</h2>
            </div>
            <button type="button" className="button">Nova assinatura</button>
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

        <section className="panel" id="features">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Feature Flags</span>
              <h2>Recursos liberáveis por plano ou empresa</h2>
            </div>
            <button type="button" className="button button--secondary">Nova feature</button>
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

        <section className="panel" id="announcements">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Avisos Globais</span>
              <h2>Mensagens para o topo do Sistema Clínica</h2>
            </div>
            <button type="button" className="button">Criar aviso</button>
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
              <button type="button" className="button">Salvar aviso</button>
            </form>
          </div>
        </section>

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
      </section>
    </main>
  );
}
