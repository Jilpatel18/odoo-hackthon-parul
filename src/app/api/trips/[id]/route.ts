import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/session';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSessionUser();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const tripId = params.id;

  try {
    // Check if trip belongs to user
    const tripResult = await query(
      `SELECT id, title, description as destination, cover_image as image, 
              TO_CHAR(start_date, 'Mon DD') || ' - ' || TO_CHAR(end_date, 'Mon DD, YYYY') as date,
              start_date, end_date,
              CASE 
                WHEN end_date < CURRENT_DATE THEN 'Completed'
                WHEN start_date > CURRENT_DATE THEN 'Upcoming'
                ELSE 'Active'
              END as status
       FROM trips WHERE id = $1 AND user_id = $2`,
      [tripId, session.userId]
    );

    if (tripResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });
    }

    const trip = tripResult.rows[0];

    // Fetch itinerary items
    const itemsResult = await query(
      `SELECT id, title, description as location, start_time, end_time, estimated_cost as type 
       FROM itinerary_items WHERE trip_id = $1 ORDER BY start_time ASC`,
      [tripId]
    );

    // Group items by date for the frontend format
    const groupedItems: Record<string, any[]> = {};
    
    itemsResult.rows.forEach((item) => {
      const dateObj = new Date(item.start_time);
      const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      
      const key = `Day - ${dateStr}`;
      if (!groupedItems[key]) groupedItems[key] = [];
      
      groupedItems[key].push({
        id: item.id,
        time: timeStr,
        title: item.title,
        location: item.location,
        type: item.type === 1 ? 'activity' : item.type === 2 ? 'lodging' : 'transport', // Hack to use numeric type
      });
    });

    const itinerary = Object.keys(groupedItems).map((key) => ({
      date: key,
      stops: groupedItems[key],
    }));

    return NextResponse.json({ success: true, trip, itinerary });
  } catch (error) {
    console.error('Fetch trip error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch trip' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSessionUser();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await query(
      'DELETE FROM trips WHERE id = $1 AND user_id = $2 RETURNING id',
      [params.id, session.userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete trip error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete trip' }, { status: 500 });
  }
}
