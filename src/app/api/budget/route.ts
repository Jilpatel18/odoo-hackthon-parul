import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/session';

export async function GET(request: Request) {
  const session = await getSessionUser();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get('tripId');

    let dbQuery = `
      SELECT e.id, e.description as title, e.category, e.amount, TO_CHAR(e.expense_date, 'Mon DD, YYYY') as date
      FROM expenses e
      JOIN trips t ON e.trip_id = t.id
      WHERE t.user_id = $1
    `;
    const params: any[] = [session.userId];

    if (tripId) {
      dbQuery += ' AND e.trip_id = $2';
      params.push(tripId);
    }
    
    dbQuery += ' ORDER BY e.expense_date DESC';

    const result = await query(dbQuery, params);
    
    return NextResponse.json({ success: true, expenses: result.rows });
  } catch (error) {
    console.error('Fetch expenses error:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, category, amount, date } = body;
    let { trip_id } = body;

    if (!title || !amount || !category) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // If no trip is provided, assign to the user's most recently created trip to prevent orphaned expenses
    if (!trip_id) {
      const tripsResult = await query(
        'SELECT id FROM trips WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [session.userId]
      );
      
      if (tripsResult.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'You must create a trip first before adding expenses.' }, { status: 400 });
      }
      trip_id = tripsResult.rows[0].id;
    } else {
      // Verify the trip belongs to the user
      const tripCheck = await query('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [trip_id, session.userId]);
      if (tripCheck.rows.length === 0) {
         return NextResponse.json({ success: false, error: 'Invalid trip' }, { status: 403 });
      }
    }

    const result = await query(
      `INSERT INTO expenses (trip_id, description, category, amount, expense_date) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, TO_CHAR(expense_date, 'Mon DD, YYYY') as date`,
      [trip_id, title, category, amount, date || new Date().toISOString().split('T')[0]]
    );

    return NextResponse.json({ 
      success: true, 
      expense: {
        id: result.rows[0].id,
        title,
        category,
        amount: parseFloat(amount),
        date: result.rows[0].date
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Create expense error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create expense' }, { status: 500 });
  }
}
