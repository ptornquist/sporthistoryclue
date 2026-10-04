"use client";

import { useState, type FormEvent } from "react";
import { prepareLogin, prepareSignup } from "@/lib/auth-account";
import { CAREER_UPDATED_EVENT } from "@/lib/career-ledger";
import { oauthCallbackUrl } from "@/lib/oauth-return";
import { isSupabaseConfigured, supabaseClient } from "@/lib/supabase/client";

const FIELD_CLASS =
  "w-full px-4 py-2.5 rounded-xl text-zinc-900 font-medium bg-white border border-zinc-300 !border-zinc-300 focus:border-blue-600 focus:!border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none placeholder:text-zinc-400 [&:-webkit-autofill]:[text-fill-color:#18181b] [&:-webkit-autofill]:[-webkit-text-fill-color:#18181b] [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0px_1000px_white_inset]";

function swedishAuthError(message: string): string {
  const text = message.toLowerCase();
  if (text.includes("invalid login") || text.includes("invalid credentials")) {
    return "Fel e-post eller lösenord.";
  }
  if (text.includes("already registered") || text.includes("already been registered")) {
    return "Den e-posten har redan ett konto. Logga in i stället.";
  }
  if (text.includes("password")) return "Lösenordet behöver minst 6 tecken.";
  return "Kontot kunde inte sparas just nu. Försök igen om en stund.";
}

function swedishOAuthError(message: string): string {
  const text = message.toLowerCase();
  if (text.includes("provider") || text.includes("not enabled") || text.includes("unsupported")) {
    return "Inloggningen är inte aktiverad ännu. Försök med e-post under tiden.";
  }
  return "Inloggningen gick inte igenom. Försök igen om en stund.";
}

export function AuthForm({
  initialMode = "signup",
  onAuthenticated,
  returnPath,
}: {
  initialMode?: "login" | "signup";
  onAuthenticated?: () => void;
  returnPath?: string;
}) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!isSupabaseConfigured) {
      setErrorMsg("Kontot kan inte sparas just nu. Försök igen om en stund.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const prepared = prepareSignup({ email, username, password });
        if (!prepared.ok) {
          setErrorMsg(prepared.message);
          return;
        }
        const { data, error } = await supabaseClient.auth.signUp({
          email: prepared.account.email,
          password: prepared.account.password,
          options: { data: { username: prepared.account.username } },
        });
        if (error) throw error;
        if (data.session && data.user) {
          await supabaseClient.from("profiles").upsert({
            id: data.user.id,
            username: prepared.account.username,
          });
          localStorage.setItem("shc_handle", prepared.account.username);
          window.dispatchEvent(new Event(CAREER_UPDATED_EVENT));
          setSuccessMsg("Konto skapat. Sviten och medaljerna sparas på kontot.");
          onAuthenticated?.();
          return;
        }
        localStorage.setItem("shc_handle", prepared.account.username);
        setSuccessMsg("Konto skapat. Bekräfta e-posten, så kan du logga in och spara svit och medaljer.");
        return;
      }

      const prepared = prepareLogin({ email, password });
      if (!prepared.ok) {
        setErrorMsg(prepared.message);
        return;
      }
      const { error } = await supabaseClient.auth.signInWithPassword({
        email: prepared.account.email,
        password: prepared.account.password,
      });
      if (error) throw error;
      window.dispatchEvent(new Event(CAREER_UPDATED_EVENT));
      onAuthenticated?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      setErrorMsg(swedishAuthError(message));
    } finally {
      setLoading(false);
    }
  };

  const signInWithProvider = async (provider: "apple" | "google") => {
    setErrorMsg("");
    setSuccessMsg("");
    if (!isSupabaseConfigured) {
      setErrorMsg("Kontot kan inte sparas just nu. Försök igen om en stund.");
      return;
    }

    setLoading(true);
    try {
      const redirectTo = oauthCallbackUrl(
        window.location.origin,
        returnPath ?? `${window.location.pathname}${window.location.search}`,
      );
      const { error } =
        provider === "apple"
          ? await supabaseClient.auth.signInWithOAuth({
              provider: "apple",
              options: { redirectTo },
            })
          : await supabaseClient.auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo },
            });
      if (error) throw error;
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      setErrorMsg(swedishOAuthError(message));
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex p-1 bg-zinc-100 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setErrorMsg("");
          }}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            mode === "login" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-black"
          }`}
        >
          Logga in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setErrorMsg("");
          }}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            mode === "signup" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-black"
          }`}
        >
          Gå med gratis
        </button>
      </div>

      <p className="text-xs text-zinc-500 mb-4">
        {mode === "login"
          ? "Logga in för att spara svit, poäng och medaljer."
          : "Registrera e-post och scoutnamn för dagens kluring, svit och medaljer."}
      </p>

      {errorMsg ? (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
          {errorMsg}
        </div>
      ) : null}
      {successMsg ? (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-xl">
          {successMsg}
        </div>
      ) : null}

      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => void signInWithProvider("apple")}
          disabled={loading}
          className="w-full py-3 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50"
        >
          Logga in med Apple
        </button>
        <button
          type="button"
          onClick={() => void signInWithProvider("google")}
          disabled={loading}
          className="w-full py-3 bg-white hover:bg-zinc-50 text-zinc-900 font-bold rounded-xl text-sm border border-zinc-300 transition-all disabled:opacity-50"
        >
          Logga in med Google
        </button>
      </div>

      <div className="flex items-center gap-3 my-4">
        <div className="h-px flex-1 bg-zinc-200" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">eller e-post</span>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {mode === "signup" ? (
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5 block" htmlFor="scout-name">
              Scoutnamn
            </label>
            <input
              id="scout-name"
              type="text"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="t.ex. PuckScout"
              autoComplete="nickname"
              className={FIELD_CLASS}
            />
          </div>
        ) : null}

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5 block" htmlFor="scout-email">
            E-post
          </label>
          <input
            id="scout-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="scout@sportshistoryclue.com"
            autoComplete="email"
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5 block" htmlFor="scout-password">
            Lösenord
          </label>
          <input
            id="scout-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className={FIELD_CLASS}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-sm"
        >
          {loading ? "Sparar..." : mode === "login" ? "Logga in" : "Skapa konto"}
        </button>
      </form>
    </div>
  );
}
