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
    const title = String(body.title || "").trim();
    const type = String(body.type || "").trim();
    const destination = String(body.destination || "").trim();
    const added = Number(body.added || 0);

    const result = await query(
      `UPDATE activities
       SET title = $1, type = $2, destination = $3, added_count = $4
       WHERE id = $5
       RETURNING id, title, type, destination, added_count AS added`,
      [title, type, destination, added, Number(id)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Activity not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, activity: result.rows[0] });
  } catch (error) {
    console.error("Admin activity update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update activity" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await getSessionUser();
  if (!session?.isAdmin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await query("DELETE FROM activities WHERE id = $1", [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin activity delete error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete activity" }, { status: 500 });
  }
}
