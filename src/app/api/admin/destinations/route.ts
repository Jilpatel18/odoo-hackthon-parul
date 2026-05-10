import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

const seedDestinations = [
  ["Kyoto", "Japan", 145, 4.9],
  ["Zermatt", "Switzerland", 89, 4.8],
  ["Rome", "Italy", 230, 4.7],
  ["Reykjavik", "Iceland", 56, 4.9],
];

async function ensureSeedData() {
  const countResult = await query("SELECT COUNT(*)::int AS count FROM destinations");
  if ((countResult.rows[0]?.count || 0) > 0) return;

  for (const destination of seedDestinations) {
    await query(
      `INSERT INTO destinations (name, country, trips_count, rating)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (name, country) DO NOTHING`,
      destination
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
      `SELECT id, name, country, trips_count AS trips, rating::text AS rating
       FROM destinations
       ORDER BY id DESC`
    );

    return NextResponse.json({ success: true, destinations: result.rows });
  } catch (error) {
    console.error("Admin destinations fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch destinations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session?.isAdmin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const country = String(body.country || "").trim();
    const trips = Number(body.trips || 0);
    const rating = Number(body.rating || 0);

    if (!name || !country) {
      return NextResponse.json({ success: false, error: "Name and country are required" }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO destinations (name, country, trips_count, rating)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, country, trips_count AS trips, rating::text AS rating`,
      [name, country, trips, rating]
    );

    return NextResponse.json({ success: true, destination: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Admin destination create error:", error);
    return NextResponse.json({ success: false, error: "Failed to create destination" }, { status: 500 });
  }
}
