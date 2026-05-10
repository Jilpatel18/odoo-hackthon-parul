import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const session = await getSessionUser();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await query(
      `SELECT selected_plan, subscription_active, cardholder_name, card_number_masked, expiry_date
       FROM user_profiles
       WHERE user_id = $1`,
      [session.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        billing: {
          selectedPlan: "Pro Plan",
          subscriptionActive: true,
          cardholderName: session.name,
          cardNumber: "4242 4242 4242 4242",
          expiryDate: "2028-12",
          cvv: "",
        },
      });
    }

    const row = result.rows[0];
    return NextResponse.json({
      success: true,
      billing: {
        selectedPlan: row.selected_plan || "Pro Plan",
        subscriptionActive: row.subscription_active ?? true,
        cardholderName: row.cardholder_name || session.name,
        cardNumber: row.card_number_masked || "4242 4242 4242 4242",
        expiryDate: row.expiry_date || "2028-12",
        cvv: "",
      },
    });
  } catch (error) {
    console.error("Billing fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch billing" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getSessionUser();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const selectedPlan = String(body.selectedPlan || "Pro Plan");
    const subscriptionActive = Boolean(body.subscriptionActive);
    const cardholderName = String(body.cardholderName || session.name);
    const cardNumber = String(body.cardNumber || "").trim();
    const expiryDate = String(body.expiryDate || "").trim();

    const digits = cardNumber.replace(/\D/g, "");
    const maskedCard = digits.length >= 4 ? `•••• •••• •••• ${digits.slice(-4)}` : cardNumber;

    await query(
      `INSERT INTO user_profiles (
         user_id,
         selected_plan,
         subscription_active,
         cardholder_name,
         card_number_masked,
         expiry_date,
         updated_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE
       SET selected_plan = EXCLUDED.selected_plan,
           subscription_active = EXCLUDED.subscription_active,
           cardholder_name = EXCLUDED.cardholder_name,
           card_number_masked = EXCLUDED.card_number_masked,
           expiry_date = EXCLUDED.expiry_date,
           updated_at = CURRENT_TIMESTAMP`,
      [session.userId, selectedPlan, subscriptionActive, cardholderName, maskedCard || null, expiryDate || null]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Billing update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update billing" }, { status: 500 });
  }
}
