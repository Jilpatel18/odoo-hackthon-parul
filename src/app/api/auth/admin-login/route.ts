import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    // Hardcoded demo admin
    if (email === 'admin@traveloop.com' && password === 'admin123') {
      const response = NextResponse.json(
        { success: true, message: 'Logged in successfully as admin' },
        { status: 200 }
      );
      
      // Set the HTTP-only cookie for secure session management
      response.cookies.set({
        name: 'auth_token',
        value: 'mock-admin-token',
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      
      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Invalid admin credentials' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
