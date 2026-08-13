import { NextResponse } from 'next/server';
import { gradeAnswer, appendStoredAnswers } from '@/lib/cookie-helpers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { exerciseId, studentAnswer } = body;

    if (!exerciseId || studentAnswer === undefined || studentAnswer === null) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const result = gradeAnswer(exerciseId, studentAnswer);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    // Store the answer in cookie
    const { cookieHeader } = appendStoredAnswers(request, [
      {
        exerciseId,
        studentAnswer: String(studentAnswer),
        isCorrect: result.isCorrect,
        score: result.score,
      },
    ]);

    return NextResponse.json(
      {
        isCorrect: result.isCorrect,
        score: result.score,
        maxScore: result.maxScore,
        correctAnswer: result.correctAnswer,
        solution: result.solution,
        questionType: result.questionType,
      },
      {
        headers: {
          'Set-Cookie': cookieHeader,
        },
      }
    );
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
