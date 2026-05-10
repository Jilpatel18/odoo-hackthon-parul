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
    const status = body.status === "Inactive" ? "Inactive" : "Active";
    const name = body.name || undefined;
    const email = body.email || undefined;

    let result;
    if (name && email) {
      result = await query(
        "UPDATE users SET name = $1, email = $2, status = $3 WHERE id = $4 RETURNING id, name, email, status",
        [name, email, status, Number(id)]
      );
    } else {
      result = await query(
        "UPDATE users SET status = $1 WHERE id = $2 RETURNING id, name, email, status",
        [status, Number(id)]
      );
    }

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await getSessionUser();
  if (!session?.isAdmin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await query("DELETE FROM users WHERE id = $1", [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin user delete error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete user" }, { status: 500 });
  }
}
