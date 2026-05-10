import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

const defaultCover = "https://images.unsplash.com/photo-1506744626753-1fa44df14c28?q=80&w=2000&auto=format&fit=crop";
const defaultAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop";

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] || "Traveler",
    lastName: parts.slice(1).join(" "),
  };
}

export async function GET() {
  const session = await getSessionUser();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await query(
      `SELECT u.name, u.email, p.location, p.bio, p.cover_url, p.avatar_url
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       WHERE u.id = $1`,
      [session.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const row = result.rows[0];
    const { firstName, lastName } = splitName(row.name || session.name);

    return NextResponse.json({
      success: true,
      profile: {
        firstName,
        lastName,
        email: row.email || session.email,
        location: row.location || "San Francisco, CA",
        bio: row.bio || "Passionate traveler, food lover, and photography enthusiast.",
        coverUrl: row.cover_url || defaultCover,
        avatarUrl: row.avatar_url || defaultAvatar,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getSessionUser();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const fullName = `${firstName} ${lastName}`.trim() || session.name;
    const email = String(body.email || session.email).trim().toLowerCase();
    const location = String(body.location || "").trim();
    const bio = String(body.bio || "").trim();
    const coverUrl = String(body.coverUrl || "").trim();
    const avatarUrl = String(body.avatarUrl || "").trim();

    await query("UPDATE users SET name = $1, email = $2 WHERE id = $3", [fullName, email, session.userId]);

    await query(
      `INSERT INTO user_profiles (user_id, location, bio, cover_url, avatar_url, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE
       SET location = EXCLUDED.location,
           bio = EXCLUDED.bio,
           cover_url = EXCLUDED.cover_url,
           avatar_url = EXCLUDED.avatar_url,
           updated_at = CURRENT_TIMESTAMP`,
      [session.userId, location || null, bio || null, coverUrl || null, avatarUrl || null]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}
