export interface E2EAccount {
  email: string;
  password: string;
  name: string;
}

function account(
  kind: "customer" | "admin",
  email: string,
  name: string,
): E2EAccount {
  return {
    email: process.env[`E2E_${kind.toUpperCase()}_EMAIL`] ?? email,
    password:
      process.env[`E2E_${kind.toUpperCase()}_PASSWORD`] ??
      (kind === "customer" ? "E2eCustomerPass123!" : "E2eAdminPass123!"),
    name: process.env[`E2E_${kind.toUpperCase()}_NAME`] ?? name,
  };
}

export const CUSTOMER = account(
  "customer",
  "e2e.customer@example.com",
  "E2E Customer",
);

export const ADMIN = account(
  "admin",
  "e2e.admin@example.com",
  "E2E Admin",
);
