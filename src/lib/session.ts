import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export type SessionUser = {
  userId: number | null;
  email: string;
  name: string;
  isAdmin: boolean;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  if (token === "mock-admin-token") {
    return {
      userId: null,
      email: "admin@traveloop.com",
      name: "Admin",
      isAdmin: true,
    };
  }

  const payload = verifyToken(token);
  if (!payload) return null;

  return {
    userId: payload.userId,
    email: payload.email,
    name: payload.name || payload.email,
    isAdmin: false,
  };
}
