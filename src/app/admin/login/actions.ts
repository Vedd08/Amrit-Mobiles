"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/backend/lib/prisma";
import { setSessionCookie, clearSessionCookie } from "@/backend/lib/auth";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) {
    return { error: "Invalid email or password." };
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password." };
  }

  await setSessionCookie({ adminId: admin.id, email: admin.email });
  redirect("/admin");
}

export async function logout() {
  "use server";
  await clearSessionCookie();
  redirect("/admin/login");
}
