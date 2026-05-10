import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/session';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSessionUser();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const tripId = params.id;

  try {
    const body = await request.json();
    const { title, description, start_time, estimated_cost } = body;

    if (!title || !start_time) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO itinerary_items (trip_id, title, description, start_time, estimated_cost) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, title, description as location, start_time, estimated_cost as type`,
      [tripId, title, description || '', start_time, estimated_cost || 0]
    );

    return NextResponse.json({ success: true, item: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Create itinerary item error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create item' }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSessionUser();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const tripId = params.id;

  try {
    const body = await request.json();
    const { id, title, description, start_time, estimated_cost } = body;

    if (!id || !title || !start_time) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const result = await query(
      `UPDATE itinerary_items 
       SET title = $1, description = $2, start_time = $3, estimated_cost = $4 
       WHERE id = $5 AND trip_id = $6 
       RETURNING id`,
      [title, description || '', start_time, estimated_cost || 0, id, tripId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update itinerary item error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSessionUser();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const tripId = params.id;
  const url = new URL(request.url);
  const itemId = url.searchParams.get('itemId');

  if (!itemId) {
    return NextResponse.json({ success: false, error: 'Missing item ID' }, { status: 400 });
  }

  try {
    const result = await query(
      `DELETE FROM itinerary_items WHERE id = $1 AND trip_id = $2 RETURNING id`,
      [itemId, tripId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete itinerary item error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete item' }, { status: 500 });
  }
}
