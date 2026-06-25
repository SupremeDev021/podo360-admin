export const ADMIN_BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");

export const adminRoutes = {
  setup: "/admin/setup",
  login: "/admin/login",
  dashboard: "/admin/dashboard",
  companies: "/admin/empresas",
  plans: "/admin/planos",
  extras: "/admin/extras",
  subscriptions: "/admin/assinaturas",
  features: "/admin/feature-flags",
  announcements: "/admin/avisos",
  audit: "/admin/auditoria",
  settings: "/admin/configuracoes"
} as const;

export type AdminRouteKey = keyof typeof adminRoutes;

export function toBrowserPath(route: string) {
  return `${ADMIN_BASE_PATH}${route}`;
}

export function normalizePath(pathname: string) {
  if (ADMIN_BASE_PATH && pathname.startsWith(ADMIN_BASE_PATH)) {
    return pathname.slice(ADMIN_BASE_PATH.length) || "/";
  }

  return pathname;
}
