"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import { BrandLogo } from "@/shared/BrandLogo";

const initialState: LoginState = {};

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper px-4">
      <div
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-primary), transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-secondary), transparent 70%)" }}
      />

      <div className="relative w-full max-w-sm rounded-lg border border-line bg-paper p-8 shadow-lg">
        <div className="mb-6 text-center">
          <BrandLogo className="mx-auto h-16 w-auto" />
          <h1 className="mt-3 text-xl font-bold text-ink">Admin</h1>
          <p className="mt-1 text-sm text-ink-3">Sign in to manage products and orders.</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-lime"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-lime"
            />
          </div>

          {state.error && <p className="text-sm text-danger">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-lime py-2.5 text-sm font-semibold text-ink shadow-sm transition-colors hover:hover:bg-lime-ink disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
