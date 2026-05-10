import { cookies } from "next/headers";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

type CurrentUser = {
  id: number;
  name: string;
  email: string;
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  let currentUser: CurrentUser | null = null;

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      try {
        const result = await query("SELECT id, name, email FROM users WHERE id = $1 LIMIT 1", [payload.userId]);
        const user = result.rows[0];
        if (user) {
          currentUser = {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        } else {
          currentUser = {
            id: payload.userId,
            name: payload.name || payload.email,
            email: payload.email,
          };
        }
      } catch {
        currentUser = {
          id: payload.userId,
          name: payload.name || payload.email,
          email: payload.email,
        };
      }
    }
  }

  return <DashboardLayout currentUser={currentUser}>{children}</DashboardLayout>;
}
