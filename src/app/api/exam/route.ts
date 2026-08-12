import { NextResponse } from 'next/server';

// This route is handled client-side by mock-api.ts
export async function POST() {
  return NextResponse.json({ error: 'Handled client-side' }, { status: 400 });
}
