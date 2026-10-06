import { PrismaClient } from "@/backend/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

declare global {
  var __prisma: PrismaClient | undefined;
}

function createClient() {
  // Local dev: a SQLite file (file:./dev.db). Production (e.g. Vercel): a
  // hosted libSQL database such as Turso — libsql://<db>.turso.io plus an
  // auth token — because serverless hosts have no writable local disk.
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalThis.__prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
