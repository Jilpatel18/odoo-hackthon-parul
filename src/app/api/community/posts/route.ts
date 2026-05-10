import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

function timeAgo(dateString: string) {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMinutes = Math.floor((now - then) / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

export async function GET() {
  const session = await getSessionUser();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await query(
      `SELECT
         p.id,
         p.user_id,
         u.name AS user_name,
         p.title,
         p.description,
         p.image_url,
         p.tags,
         p.created_at,
         COALESCE(l.like_count, 0)::int AS likes,
         EXISTS (
           SELECT 1
           FROM community_post_likes cpl
           WHERE cpl.post_id = p.id AND cpl.user_id = $1
         ) AS liked_by_me,
         EXISTS (
           SELECT 1
           FROM community_follows cf
           WHERE cf.follower_id = $1 AND cf.followee_id = p.user_id
         ) AS is_following
       FROM community_posts p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN (
         SELECT post_id, COUNT(*) AS like_count
         FROM community_post_likes
         GROUP BY post_id
       ) l ON l.post_id = p.id
       ORDER BY p.created_at DESC`,
      [session.userId]
    );

    const posts = result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      user: row.user_name,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
      title: row.title,
      description: row.description,
      image: row.image_url || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600&auto=format&fit=crop",
      tags: Array.isArray(row.tags) ? row.tags : [],
      likes: row.likes,
      comments: 0,
      likedByMe: row.liked_by_me,
      isFollowing: row.is_following,
      timeAgo: timeAgo(row.created_at),
    }));

    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error("Community posts fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const image = String(body.image || "").trim();
    const tags = Array.isArray(body.tags) ? body.tags.map(String) : ["Community"];

    if (!title || !description) {
      return NextResponse.json({ success: false, error: "Title and description are required" }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO community_posts (user_id, title, description, image_url, tags)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       RETURNING id, created_at`,
      [session.userId, title, description, image || null, JSON.stringify(tags)]
    );

    return NextResponse.json({
      success: true,
      post: {
        id: result.rows[0].id,
        userId: session.userId,
        user: session.name,
        avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=150&auto=format&fit=crop",
        title,
        description,
        image: image || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600&auto=format&fit=crop",
        tags,
        likes: 0,
        comments: 0,
        likedByMe: false,
        isFollowing: false,
        timeAgo: "Just now",
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Community post create error:", error);
    return NextResponse.json({ success: false, error: "Failed to create post" }, { status: 500 });
  }
}
