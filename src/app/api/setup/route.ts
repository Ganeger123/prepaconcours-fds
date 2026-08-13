import { NextResponse } from 'next/server';
import { exercises } from '@/lib/exercises-data';

export async function GET() {
  return NextResponse.json({
    isSeeded: true,
    exerciseCount: exercises.length,
  });
}

export async function POST() {
  return NextResponse.json({
    isSeeded: true,
    exerciseCount: exercises.length,
  });
}
