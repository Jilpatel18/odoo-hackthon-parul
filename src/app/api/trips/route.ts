import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/session';

export async function GET() {
  const session = await getSessionUser();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await query(
      `SELECT id, title, description, cover_image as image, 
              TO_CHAR(start_date, 'Mon DD') || ' - ' || TO_CHAR(end_date, 'Mon DD, YYYY') as date,
              start_date, end_date, budget,
              CASE 
                WHEN end_date < CURRENT_DATE THEN 'Completed'
                WHEN start_date > CURRENT_DATE THEN 'Upcoming'
                ELSE 'Active'
              END as status,
              description as destination
       FROM trips 
       WHERE user_id = $1 
       ORDER BY start_date ASC`,
      [session.userId]
    );

    return NextResponse.json({ success: true, trips: result.rows });
  } catch (error) {
    console.error('Fetch trips error:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Failed to fetch trips' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, destination, startDate, endDate, coverImage } = body;

    if (!title || !destination || !startDate || !endDate) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO trips (user_id, title, description, cover_image, start_date, end_date) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id`,
      [session.userId, title, destination, coverImage || null, startDate, endDate]
    );

    return NextResponse.json({ success: true, tripId: result.rows[0].id }, { status: 201 });
  } catch (error) {
    console.error('Create trip error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create trip' }, { status: 500 });
  }
}
