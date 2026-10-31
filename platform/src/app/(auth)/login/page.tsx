import type { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "تسجيل الدخول" };

export default function LoginPage() {
  return (
    <main className="min-h-dvh grid place-items-center bg-mist px-4">
      <div className="w-full max-w-md">
        <a
          href="/"
          className="flex items-center justify-center gap-3 mb-8"
          aria-label="رواق"
        >
          <span className="font-display text-3xl font-semibold text-teal-deep">رواق</span>
          <span className="text-sm text-muted">منصة إدارة الضيافة</span>
        </a>
        <div className="rounded-2xl border border-line bg-offwhite p-8 shadow-sm">
          <Suspense>
            <AuthForm mode="login" />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
