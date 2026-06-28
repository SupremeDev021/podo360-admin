import { useMemo, useState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { adminRoutes, normalizePath, toBrowserPath } from "./config";
import { isSupabaseConfigured } from "./services/supabase";

const ADMIN_UNAVAILABLE_MESSAGE = "Nao foi possivel conectar ao servico no momento. Tente novamente em instantes ou entre em contato com o suporte.";

function escapeSql(value: string) {
  return value.trim().replace(/'/g, "''");
}

function AdminLogin() {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <span className="eyebrow">Podo360 Admin</span>
        <h1>Admin Global separado</h1>
        <p>
          Este repositorio esta limpo para producao e nao exibe dados mockados. O Admin Global real validado para
          producao esta integrado ao sistema principal Podo360 em <strong>/admin</strong>.
        </p>

        <div className="setup-status">
          <strong>Ambiente</strong>
          <span>{isSupabaseConfigured ? "Servico de autenticacao disponivel." : import.meta.env.DEV ? "Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY." : ADMIN_UNAVAILABLE_MESSAGE}</span>
        </div>

        <a className="button" href={toBrowserPath(adminRoutes.setup)}>
          Abrir setup do primeiro admin
        </a>
      </section>
    </main>
  );
}

function InitialSetup() {
  const [authUserId, setAuthUserId] = useState("");
  const [fullName, setFullName] = useState("Administrador da Clinica");
  const [email, setEmail] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [platformOwner, setPlatformOwner] = useState(false);

  const profileSql = useMemo(() => {
    const safeUserId = escapeSql(authUserId) || "<auth_user_id>";
    const safeCompanyId = escapeSql(companyId) || "<company_id>";
    const safeName = escapeSql(fullName) || "Administrador da Clinica";
    const safeEmail = escapeSql(email) || "<email_do_usuario>";

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
        <h1>Primeiro usuario administrador</h1>
        <p>
          Crie o usuario no painel de autenticacao, copie o ID gerado e use este assistente apenas para montar o
          vinculo em <code>profiles</code>. Nenhuma senha deve ser colocada no codigo, em migration ou em documento.
        </p>

        <div className="setup-grid">
          <label>
            Auth user ID
            <input value={authUserId} onChange={(event) => setAuthUserId(event.target.value)} placeholder="UUID do usuario criado no Auth" />
          </label>
          <label>
            Nome completo
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </label>
          <label>
            E-mail
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@clinica.com" />
          </label>
          <label>
            Company ID
            <input value={companyId} onChange={(event) => setCompanyId(event.target.value)} placeholder="UUID da empresa" />
          </label>
          <label className="check-row">
            <input type="checkbox" checked={platformOwner} onChange={(event) => setPlatformOwner(event.target.checked)} />
            Tambem criar registro owner em platform_admin_users
          </label>
        </div>

        <pre className="sql-preview">{profileSql}</pre>

        <div className="setup-warning">
          <LockKeyhole size={18} />
          <span>Use este SQL somente no projeto correto. Nunca coloque senha neste arquivo ou no Git.</span>
        </div>

        <a className="button button--secondary" href={toBrowserPath(adminRoutes.login)}>
          Voltar
        </a>
      </section>
    </main>
  );
}

export function App() {
  const currentPath = normalizePath(window.location.pathname);

  if (currentPath === adminRoutes.setup) {
    return <InitialSetup />;
  }

  return (
    <>
      <AdminLogin />
      <div className="production-note" aria-label="Estado de producao">
        <ShieldCheck size={16} />
        <span>Sem modo demo, sem dados mockados e sem service_role no frontend.</span>
      </div>
    </>
  );
}
