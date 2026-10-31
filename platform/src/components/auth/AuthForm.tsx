"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ar } from "@/lib/i18n/ar";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(ar.auth.invalidCredentials);
        setLoading(false);
        return;
      }
      router.push(params.get("next") ?? "/app");
      router.refresh();
    } else {
      if (password.length < 8) {
        setError(ar.auth.passwordMin);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone },
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message === "User already registered" ? "هذا البريد مسجل مسبقًا" : ar.common.error);
        setLoading(false);
        return;
      }
      if (data.session) {
        router.push("/onboarding");
        router.refresh();
      } else {
        setError(null);
        setLoading(false);
        router.push(`/login?notice=check-email`);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h1 className="font-display text-xl font-semibold text-teal-deep">
        {mode === "login" ? ar.auth.login : ar.auth.signup}
      </h1>

      {mode === "signup" && (
        <>
          <label className="block">
            <span className="text-sm text-muted">{ar.auth.fullName}</span>
            <input
              className="field"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              minLength={2}
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted">{ar.auth.phone}</span>
            <input
              className="field num"
              dir="ltr"
              inputMode="tel"
              placeholder="05xxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
        </>
      )}

      <label className="block">
        <span className="text-sm text-muted">{ar.auth.email}</span>
        <input
          className="field num"
          dir="ltr"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label className="block">
        <span className="text-sm text-muted">{ar.auth.password}</span>
        <input
          className="field num"
          dir="ltr"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      {params.get("notice") === "check-email" && !error && (
        <p className="text-sm text-teal">{ar.auth.checkEmail}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-teal py-3 text-offwhite font-medium transition hover:bg-teal-deep disabled:opacity-50"
      >
        {loading ? ar.common.loading : mode === "login" ? ar.auth.loginCta : ar.auth.signupCta}
      </button>

      <p className="text-center text-sm text-muted">
        <a href={mode === "login" ? "/signup" : "/login"} className="link-underline text-teal">
          {mode === "login" ? ar.auth.noAccount : ar.auth.haveAccount}
        </a>
      </p>
    </form>
  );
}
