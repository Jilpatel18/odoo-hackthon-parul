import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

const seedActivities = [
  ["Fushimi Inari Taisha", "Culture", "Kyoto", 312],
  ["Universal Studios Japan", "Entertainment", "Osaka", 289],
  ["Colosseum Tour", "History", "Rome", 420],
];

async function ensureSeedData() {
  const countResult = await query("SELECT COUNT(*)::int AS count FROM activities");
  if ((countResult.rows[0]?.count || 0) > 0) return;

  for (const activity of seedActivities) {
    await query(
      `INSERT INTO activities (title, type, destination, added_count)
       VALUES ($1, $2, $3, $4)`,
      activity
    );
  }
}

export async function GET() {
  const session = await getSessionUser();
  if (!session?.isAdmin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureSeedData();

    const result = await query(
      `SELECT id, title, type, destination, added_count AS added
       FROM activities
       ORDER BY id DESC`
    );

    return NextResponse.json({ success: true, activities: result.rows });
  } catch (error) {
    console.error("Admin activities fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session?.isAdmin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const title = String(body.title || "").trim();
    const type = String(body.type || "").trim();
    const destination = String(body.destination || "").trim();
    const added = Number(body.added || 0);

    if (!title || !type || !destination) {
      return NextResponse.json({ success: false, error: "Title, type and destination are required" }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO activities (title, type, destination, added_count)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, type, destination, added_count AS added`,
      [title, type, destination, added]
    );

    return NextResponse.json({ success: true, activity: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Admin activity create error:", error);
    return NextResponse.json({ success: false, error: "Failed to create activity" }, { status: 500 });
  }
}
