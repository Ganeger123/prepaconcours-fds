import { NextResponse } from 'next/server';
import { readStoredAnswers, getExerciseById } from '@/lib/cookie-helpers';

export async function GET(request: Request) {
  const answers = readStoredAnswers(request);
  const totalCompleted = answers.length;

  // Enrich each answer with exercise details, newest first, max 100
  const enriched = answers
    .slice(-100)
    .reverse()
    .map((a) => {
      const exercise = getExerciseById(a.exerciseId);
      return {
        ...a,
        studentId: 'local-student',
        exercise: exercise || null,
      };
    });

  return NextResponse.json({ answers: enriched, totalCompleted });
}
