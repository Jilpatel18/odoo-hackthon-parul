import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function POST(_: Request, { params }: Params) {
  const session = await getSessionUser();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const postId = Number(id);

  try {
    const existing = await query(
      "SELECT 1 FROM community_post_likes WHERE post_id = $1 AND user_id = $2",
      [postId, session.userId]
    );

    let liked = false;
    if (existing.rows.length > 0) {
      await query("DELETE FROM community_post_likes WHERE post_id = $1 AND user_id = $2", [postId, session.userId]);
      liked = false;
    } else {
      try {
        await query("INSERT INTO community_post_likes (post_id, user_id) VALUES ($1, $2)", [postId, session.userId]);
        liked = true;
      } catch (insertError: any) {
        // Handle unique constraint violation (race condition from double clicking)
        if (insertError.code === '23505') {
          liked = true; // It's already liked
        } 
        // Handle foreign key violation (e.g., user or post doesn't exist)
        else if (insertError.code === '23503') {
          return NextResponse.json({ success: false, error: "Post or user not found" }, { status: 404 });
        } else {
          throw insertError;
        }
      }
    }

    const countResult = await query(
      "SELECT COUNT(*)::int AS likes FROM community_post_likes WHERE post_id = $1",
      [postId]
    );

    return NextResponse.json({ success: true, liked, likes: countResult.rows[0]?.likes || 0 });
  } catch (error: any) {
    console.error("Community like toggle error:", error);
    return NextResponse.json({ success: false, error: "Failed to toggle like: " + (error.message || "Unknown error") }, { status: 500 });
  }
}
