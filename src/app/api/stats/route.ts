import { NextResponse } from 'next/server';

// This route is handled client-side by mock-api.ts
export async function GET() {
  return NextResponse.json({ subjectStats: [], totalCompleted: 0 });
}
