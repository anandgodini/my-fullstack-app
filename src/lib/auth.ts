import { cookies } from "next/headers";
import { verifySessionToken, type SessionPayload } from "./session";
import { prisma } from "../prisma";

export async function getCurrentAdmin(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload || !payload.userId) return null;

  return payload;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error("UNAUTHORIZED");
  }
  return admin;
}
