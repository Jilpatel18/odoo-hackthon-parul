import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/session";



type Params = { params: Promise<{ id: string }> };

export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return NextResponse.json({ success: false, error: "Invalid post ID" }, { status: 400 });
    }

    const result = await query(
      `SELECT c.id, c.content, c.created_at, u.name as user_name, p.avatar_url 
       FROM community_post_comments c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [postId]
    );

    const comments = result.rows.map((row) => ({
      id: row.id,
      content: row.content,
      user: row.user_name,
      avatar: row.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
      createdAt: row.created_at,
      timeAgo: getTimeAgo(new Date(row.created_at)),
    }));

    return NextResponse.json({ success: true, comments });
  } catch (error) {
    console.error("Fetch comments error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: Params
) {
  const session = await getSessionUser();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const postId = parseInt(id);
    const body = await request.json();
    const content = body.content?.trim();

    if (isNaN(postId) || !content) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO community_post_comments (post_id, user_id, content) 
       VALUES ($1, $2, $3) RETURNING id, created_at`,
      [postId, session.userId, content]
    );

    // Fetch user details for the response
    const userRes = await query(
      `SELECT u.name as user_name, p.avatar_url 
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [session.userId]
    );

    const userRow = userRes.rows[0];

    const comment = {
      id: result.rows[0].id,
      content,
      user: userRow.user_name,
      avatar: userRow.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
      createdAt: result.rows[0].created_at,
      timeAgo: "Just now",
    };

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error("Post comment error:", error);
    return NextResponse.json({ success: false, error: "Failed to post comment" }, { status: 500 });
  }
}

function getTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
}
