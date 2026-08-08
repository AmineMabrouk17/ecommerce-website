export type Role = "customer" | "admin";

export type RouteGuardReason = "unauthenticated" | "forbidden";

export interface RouteGuardDecision {
  redirectTo: string;
  reason: RouteGuardReason;
}

export interface RouteGuardParams {
  pathname: string;
  isAuthenticated: boolean;
  role?: Role | null;
  loginPath?: string;
  forbiddenPath?: string;
}

const DEFAULT_LOGIN_PATH = "/login";
const DEFAULT_FORBIDDEN_PATH = "/";

const CUSTOMER_ROUTES = ["/checkout", "/account"];
const ADMIN_ROUTES = ["/admin"];

function isUnder(route: string, pathname: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

function buildLoginRedirect(loginPath: string, pathname: string): string {
  return `${loginPath}?next=${encodeURIComponent(pathname)}`;
}

export function guardRoute({
  pathname,
  isAuthenticated,
  role = null,
  loginPath = DEFAULT_LOGIN_PATH,
  forbiddenPath = DEFAULT_FORBIDDEN_PATH,
}: RouteGuardParams): RouteGuardDecision | null {
  const isAdminRoute = ADMIN_ROUTES.some((route) => isUnder(route, pathname));
  const isCustomerRoute = CUSTOMER_ROUTES.some((route) => isUnder(route, pathname));

  if (isAdminRoute && !isAuthenticated) {
    return {
      redirectTo: buildLoginRedirect(loginPath, pathname),
      reason: "unauthenticated",
    };
  }
  if (isAdminRoute && role !== "admin") {
    return { redirectTo: forbiddenPath, reason: "forbidden" };
  }
  if (isCustomerRoute && !isAuthenticated) {
    return {
      redirectTo: buildLoginRedirect(loginPath, pathname),
      reason: "unauthenticated",
    };
  }

  return null;
}
