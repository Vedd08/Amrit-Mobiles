"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import { BrandLogo } from "@/shared/BrandLogo";
import { btn, input } from "@/admin/components/ui";

const initialState: LoginState = {};

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(146,195,24,0.35), transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(85,194,205,0.35), transparent 70%)" }}
      />

      <div className="relative w-full max-w-sm rounded-3xl border border-line bg-white p-8 shadow-[0_30px_60px_-30px_rgba(26,28,25,0.25)]">
        <div className="mb-7 text-center">
          <BrandLogo className="mx-auto h-20 w-auto" />
          <h1 className="mt-5 text-xl font-extrabold text-ink">Admin sign in</h1>
          <p className="mt-1 text-sm text-ink-3">Orders, products and prices for the website.</p>
        </div>

        <form action={formAction} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Email</span>
            <input name="email" type="email" required autoComplete="username" className={input} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Password</span>
            <input name="password" type="password" required autoComplete="current-password" className={input} />
          </label>

          {state.error && (
            <p role="alert" className="rounded-xl bg-danger/8 px-3.5 py-2.5 text-sm font-semibold text-danger">
              {state.error}
            </p>
          )}

          <button type="submit" disabled={pending} className={`${btn.primary} w-full py-3`}>
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
