import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const session = await getSessionUser();
  if (!session?.isAdmin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const country = String(body.country || "").trim();
    const trips = Number(body.trips || 0);
    const rating = Number(body.rating || 0);

    const result = await query(
      `UPDATE destinations
       SET name = $1, country = $2, trips_count = $3, rating = $4
       WHERE id = $5
       RETURNING id, name, country, trips_count AS trips, rating::text AS rating`,
      [name, country, trips, rating, Number(id)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Destination not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, destination: result.rows[0] });
  } catch (error) {
    console.error("Admin destination update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update destination" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await getSessionUser();
  if (!session?.isAdmin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await query("DELETE FROM destinations WHERE id = $1", [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin destination delete error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete destination" }, { status: 500 });
  }
}
