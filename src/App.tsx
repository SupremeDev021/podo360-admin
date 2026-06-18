import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardList,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Users
} from "lucide-react";
import { companies, leads, statusLogs } from "./data/mockData";
import type { CompanyStatus, LeadStatus } from "./types/platform";

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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

export function App() {
  const activeCompanies = companies.filter((company) => company.status === "active").length;
  const blockedCompanies = companies.filter((company) => ["inactive", "suspended", "cancelled"].includes(company.status)).length;
  const pendingLeads = leads.filter((lead) => lead.status === "new" || lead.status === "qualified").length;

  return (
    <main className="admin-shell">
      <aside className="sidebar">
        <div className="brand">
          <span><ShieldCheck size={23} /></span>
          <div>
            <strong>Podo360 Admin</strong>
            <small>Gestão interna</small>
          </div>
        </div>
        <nav aria-label="Administração">
          <a href="#dashboard"><BarChart3 size={18} /> Dashboard</a>
          <a href="#leads"><Mail size={18} /> Leads</a>
          <a href="#companies"><Building2 size={18} /> Empresas</a>
          <a href="#audit"><ClipboardList size={18} /> Auditoria</a>
        </nav>
        <div className="security-note">
          <LockKeyhole size={17} />
          <span>Sem service_role no frontend. Integração real será feita com RLS e APIs seguras.</span>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <span className="eyebrow">Plataforma Podo360</span>
            <h1>Gestão de empresas, leads e status de acesso.</h1>
            <p>Base inicial do sistema interno da Podo360. Os dados desta tela são locais até a integração Supabase ser validada.</p>
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
        </section>

        <section className="panel" id="leads">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Leads</span>
              <h2>Interesses vindos da Landing Page</h2>
            </div>
            <button type="button">Criar lead manual</button>
          </div>
          <div className="table">
            <div className="table-row table-row--head">
              <span>Contato</span>
              <span>Clínica</span>
              <span>Cidade</span>
              <span>Status</span>
              <span>Origem</span>
            </div>
            {leads.map((lead) => (
              <div className="table-row" key={lead.id}>
                <span><strong>{lead.name}</strong><small>{lead.email}<br />{lead.phone}</small></span>
                <span>{lead.clinicName}</span>
                <span>{lead.city}</span>
                <span><i className={`badge badge--${lead.status}`}>{leadLabels[lead.status]}</i></span>
                <span>{lead.source}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel" id="companies">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Empresas</span>
              <h2>Clínicas contratantes</h2>
            </div>
            <button type="button">Cadastrar empresa</button>
          </div>
          <div className="company-grid">
            {companies.map((company) => (
              <article className="company-card" key={company.id}>
                <div>
                  <span className={`status-pill status-pill--${company.status}`}>{statusLabels[company.status]}</span>
                  <h3>{company.tradingName}</h3>
                  <p>{company.companyName}</p>
                </div>
                <dl>
                  <div><dt>Responsável</dt><dd>{company.responsibleName}</dd></div>
                  <div><dt>E-mail</dt><dd>{company.responsibleEmail}</dd></div>
                  <div><dt>Telefone</dt><dd>{company.responsiblePhone}</dd></div>
                  <div><dt>Plano</dt><dd>{company.planName ?? "A definir"}</dd></div>
                </dl>
                <div className="card-actions">
                  <button type="button">Ver detalhes</button>
                  <button type="button">Alterar status</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel" id="audit">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Auditoria</span>
              <h2>Histórico administrativo</h2>
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
      </section>
    </main>
  );
}
