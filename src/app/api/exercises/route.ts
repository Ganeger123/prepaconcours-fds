import { NextResponse } from 'next/server';
import { filterExercises } from '@/lib/cookie-helpers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filtered = filterExercises(searchParams);
  return NextResponse.json(filtered);
}
