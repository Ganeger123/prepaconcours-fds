import { NextResponse } from 'next/server';

// This route is handled client-side by mock-api.ts
// Server-side stub for Vercel compatibility (no database needed)
export async function GET() {
  return NextResponse.json([]);
}
