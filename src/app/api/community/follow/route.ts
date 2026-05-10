import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const followeeId = Number(body.followeeId);

    if (!followeeId || followeeId === session.userId) {
      return NextResponse.json({ success: false, error: "Invalid follow target" }, { status: 400 });
    }

    const existing = await query(
      "SELECT 1 FROM community_follows WHERE follower_id = $1 AND followee_id = $2",
      [session.userId, followeeId]
    );

    let following = false;
    if (existing.rows.length > 0) {
      await query("DELETE FROM community_follows WHERE follower_id = $1 AND followee_id = $2", [session.userId, followeeId]);
      following = false;
    } else {
      await query("INSERT INTO community_follows (follower_id, followee_id) VALUES ($1, $2)", [session.userId, followeeId]);
      following = true;
    }

    return NextResponse.json({ success: true, following });
  } catch (error) {
    console.error("Community follow toggle error:", error);
    return NextResponse.json({ success: false, error: "Failed to toggle follow" }, { status: 500 });
  }
}
