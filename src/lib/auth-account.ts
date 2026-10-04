import { normalizeScoutName } from "@/lib/scout-profile";

export interface PreparedSignup {
  email: string;
  username: string;
  password: string;
}

export interface PreparedLogin {
  email: string;
  password: string;
}

function cleanEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return null;
  return email;
}

/** Email, scout name, and password for a new Supabase account. */
export function prepareSignup(input: {
  email: string;
  username: string;
  password: string;
}): { ok: true; account: PreparedSignup } | { ok: false; message: string } {
  const email = cleanEmail(input.email);
  const username = normalizeScoutName(input.username);
  if (!email) return { ok: false, message: "Ange en giltig e-postadress." };
  if (!username) return { ok: false, message: "Välj ett scoutnamn, högst 40 tecken." };
  if (input.password.length < 6) return { ok: false, message: "Lösenordet behöver minst 6 tecken." };
  return { ok: true, account: { email, username, password: input.password } };
}

export function prepareLogin(input: {
  email: string;
  password: string;
}): { ok: true; account: PreparedLogin } | { ok: false; message: string } {
  const email = cleanEmail(input.email);
  if (!email) return { ok: false, message: "Ange en giltig e-postadress." };
  if (!input.password) return { ok: false, message: "Fyll i lösenordet." };
  return { ok: true, account: { email, password: input.password } };
}
