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
  } catch {
    return null;
  }
}

type NoteRow = {
  id: number;
  trip_id: number | null;
  content: string;
  created_at: string;
};

function parseNoteRow(row: NoteRow) {
  const fallbackDate = new Date(row.created_at).toISOString().slice(0, 10);

  try {
    const parsedContent = JSON.parse(row.content);
    return {
      id: row.id,
      trip_id: row.trip_id,
      title: parsedContent.title || 'Untitled Note',
      content: parsedContent.content || '',
      type: parsedContent.type || 'general',
      date: parsedContent.date || fallbackDate,
      created_at: row.created_at,
    };
  } catch {
    return {
      id: row.id,
      trip_id: row.trip_id,
      title: 'Untitled Note',
      content: row.content,
      type: 'general',
      date: fallbackDate,
      created_at: row.created_at,
    };
  }
}

export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get('tripId');

    let dbQuery = 'SELECT * FROM notes';
    const params: Array<string | number> = [];

    if (tripId) {
      dbQuery += ' WHERE trip_id = $1';
      params.push(tripId);
    }
    dbQuery += ' ORDER BY created_at DESC';

    const result = await query(dbQuery, params);
    
    // Parse the JSON string stored in content
    const notes = result.rows.map(parseNoteRow);

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

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Title and content are required' }, { status: 400 });
    }

    const jsonContent = JSON.stringify({ title, content, type, date });

    const result = await query(
      'INSERT INTO notes (trip_id, content) VALUES ($1, $2) RETURNING id, created_at',
      [trip_id || null, jsonContent]
    );

    return NextResponse.json({
      success: true,
      note: {
        id: result.rows[0].id,
        trip_id: trip_id || null,
        title,
        content,
        type,
        date,
        created_at: result.rows[0].created_at,
      },
    }, { status: 201 });
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
    if (!title || !content) return NextResponse.json({ success: false, error: 'Title and content are required' }, { status: 400 });

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
