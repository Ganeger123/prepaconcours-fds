import { NextResponse } from 'next/server';

// This route is handled client-side by mock-api.ts
export async function GET() {
  return NextResponse.json({ isSeeded: true, exerciseCount: 45 });
}

export async function POST() {
  return NextResponse.json({ isSeeded: true, exerciseCount: 45 });
}
