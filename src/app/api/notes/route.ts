import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Helper to get user from token
async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
  } catch (e) {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get('tripId');

    let dbQuery = 'SELECT * FROM notes';
    const params: any[] = [];

    if (tripId) {
      dbQuery += ' WHERE trip_id = $1';
      params.push(tripId);
    }
    dbQuery += ' ORDER BY created_at DESC';

    const result = await query(dbQuery, params);
    
    // Parse the JSON string stored in content
    const notes = result.rows.map(row => {
      try {
        const parsedContent = JSON.parse(row.content);
        return {
          id: row.id,
          trip_id: row.trip_id,
          ...parsedContent,
          created_at: row.created_at
        };
      } catch (e) {
        // Fallback for non-JSON content
        return {
          id: row.id,
          trip_id: row.trip_id,
          content: row.content,
          title: 'Untitled Note',
          type: 'general',
          date: new Date(row.created_at).toLocaleDateString(),
          created_at: row.created_at
        };
      }
    });

    return NextResponse.json({ success: true, notes });
  } catch (error) {
    console.error('Fetch notes error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { trip_id, title, content, type, date } = body;

    // We store the UI fields inside a JSON string in the 'content' column to bypass schema limitations
    const jsonContent = JSON.stringify({ title, content, type, date });

    const result = await query(
      'INSERT INTO notes (trip_id, content) VALUES ($1, $2) RETURNING id, created_at',
      [trip_id || null, jsonContent]
    );

    return NextResponse.json({ success: true, note: { id: result.rows[0].id, ...body } }, { status: 201 });
  } catch (error) {
    console.error('Create note error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create note' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, title, content, type, date } = body;

    if (!id) return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });

    const jsonContent = JSON.stringify({ title, content, type, date });

    await query(
      'UPDATE notes SET content = $1 WHERE id = $2',
      [jsonContent, id]
    );

    return NextResponse.json({ success: true, note: body }, { status: 200 });
  } catch (error) {
    console.error('Update note error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });

    await query('DELETE FROM notes WHERE id = $1', [id]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Delete note error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete note' }, { status: 500 });
  }
}
