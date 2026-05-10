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
      SELECT p.id, p.item_name as name, p.category, p.is_packed as packed 
      FROM packing_items p
      JOIN trips t ON p.trip_id = t.id
      WHERE t.user_id = $1
    `;
    const params: any[] = [session.userId];

    if (tripId) {
      dbQuery += ' AND p.trip_id = $2';
      params.push(tripId);
    }
    
    dbQuery += ' ORDER BY p.category, p.item_name ASC';

    const result = await query(dbQuery, params);
    
    return NextResponse.json({ success: true, items: result.rows });
  } catch (error) {
    console.error('Fetch packing items error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, category } = body;
    let { trip_id } = body;

    if (!name || !category) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (!trip_id) {
      const tripsResult = await query(
        'SELECT id FROM trips WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [session.userId]
      );
      
      if (tripsResult.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'You must create a trip first.' }, { status: 400 });
      }
      trip_id = tripsResult.rows[0].id;
    }

    const result = await query(
      `INSERT INTO packing_items (trip_id, item_name, category) 
       VALUES ($1, $2, $3) 
       RETURNING id`,
      [trip_id, name, category]
    );

    return NextResponse.json({ 
      success: true, 
      item: { id: result.rows[0].id, name, category, packed: false }
    }, { status: 201 });
  } catch (error) {
    console.error('Create packing item error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create item' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getSessionUser();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, packed } = body;

    if (!id || packed === undefined) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Verify ownership implicitly via JOIN or assume ID is unguessable enough/we trust user session
    // For complete security, we verify it belongs to user's trip
    const result = await query(
      `UPDATE packing_items p 
       SET is_packed = $1 
       FROM trips t
       WHERE p.id = $2 AND p.trip_id = t.id AND t.user_id = $3
       RETURNING p.id`,
      [packed, id, session.userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Item not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update packing item error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSessionUser();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });
    }

    const result = await query(
      `DELETE FROM packing_items p 
       USING trips t
       WHERE p.id = $1 AND p.trip_id = t.id AND t.user_id = $2
       RETURNING p.id`,
      [id, session.userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Item not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete packing item error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete item' }, { status: 500 });
  }
}
