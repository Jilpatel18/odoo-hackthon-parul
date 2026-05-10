import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const session = await getSessionUser();
  if (!session?.isAdmin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await query(
      `SELECT
         u.id,
         u.name,
         u.email,
         COALESCE(u.status, 'Active') AS status,
         COALESCE(COUNT(t.id), 0)::int AS trips,
         TO_CHAR(u.created_at, 'YYYY-MM-DD') AS joined
       FROM users u
       LEFT JOIN trips t ON t.user_id = u.id
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );

    return NextResponse.json({ success: true, users: result.rows });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
  }
}
