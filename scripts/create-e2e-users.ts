import { createClient } from "@supabase/supabase-js";

interface E2EUser {
  email: string;
  password: string;
  name: string;
  role: "customer" | "admin";
}

const USERS: E2EUser[] = [
  {
    email: process.env.E2E_CUSTOMER_EMAIL ?? "e2e.customer@example.com",
    password: process.env.E2E_CUSTOMER_PASSWORD ?? "E2eCustomerPass123!",
    name: process.env.E2E_CUSTOMER_NAME ?? "E2E Customer",
    role: "customer",
  },
  {
    email: process.env.E2E_ADMIN_EMAIL ?? "e2e.admin@example.com",
    password: process.env.E2E_ADMIN_PASSWORD ?? "E2eAdminPass123!",
    name: process.env.E2E_ADMIN_NAME ?? "E2E Admin",
    role: "admin",
  },
];

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required",
    );
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const user of USERS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
    });

    let userId: string | undefined = data?.user?.id;
    if (error) {
      if (error.status === 409 || error.code === "email_exists") {
        const { data: existing, error: listError } =
          await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
        if (listError) throw listError;
        userId = existing?.users.find((item) => item.email === user.email)?.id;
        console.log(`[e2e-users] ${user.email} already exists`);
      } else {
        throw error;
      }
    } else {
      console.log(`[e2e-users] created ${user.role} user ${user.email}`);
    }

    if (!userId) {
      throw new Error(`Could not resolve user id for ${user.email}`);
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: user.role, full_name: user.name })
      .eq("id", userId);
    if (profileError) throw profileError;
    console.log(`[e2e-users] ${user.email} role -> ${user.role}`);
  }

  console.log("[e2e-users] done");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
