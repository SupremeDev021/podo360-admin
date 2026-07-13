export const ADMIN_BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");
const USE_HASH_ROUTING = ADMIN_BASE_PATH.includes("podo360-admin");

export const adminRoutes = {
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
  if (USE_HASH_ROUTING) {
    return `${ADMIN_BASE_PATH}/#${route}`;
  }

  return `${ADMIN_BASE_PATH}${route}`;
}

export function normalizePath(pathname: string) {
  if (USE_HASH_ROUTING && window.location.hash.startsWith("#/")) {
    return window.location.hash.slice(1);
  }

  if (ADMIN_BASE_PATH && pathname.startsWith(ADMIN_BASE_PATH)) {
    return pathname.slice(ADMIN_BASE_PATH.length) || "/";
  }

  return pathname;
}
