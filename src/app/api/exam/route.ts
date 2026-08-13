import { NextResponse } from 'next/server';
import { gradeAnswer, appendStoredAnswers, getExerciseById } from '@/lib/cookie-helpers';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { answers, duration } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    const sessionId = generateId();
    let totalScore = 0;
    const maxPoints = answers.length * 4;

    const newAnswers: {
      exerciseId: string;
      studentAnswer: string;
      isCorrect: boolean;
      score: number;
    }[] = [];

    const results: {
      exerciseId: string;
      isCorrect: boolean;
      score: number;
      correctAnswer: string;
    }[] = [];

    for (const answer of answers) {
      const exercise = getExerciseById(answer.exerciseId);
      if (!exercise) continue;

      const result = gradeAnswer(answer.exerciseId, answer.studentAnswer);
      if ('error' in result) continue;

      totalScore += result.score;

      newAnswers.push({
        exerciseId: answer.exerciseId,
        studentAnswer: String(answer.studentAnswer),
        isCorrect: result.isCorrect,
        score: result.score,
      });

      results.push({
        exerciseId: answer.exerciseId,
        isCorrect: result.isCorrect,
        score: result.score,
        correctAnswer: exercise.correctAnswer,
      });
    }

    // Calculate score out of 20
    const scoreOut20 =
      maxPoints > 0
        ? Math.round((totalScore / maxPoints) * 20 * 100) / 100
        : 0;

    // Store all exam answers in cookie for persistence/stats
    const { cookieHeader } = appendStoredAnswers(request, newAnswers);

    return NextResponse.json(
      {
        sessionId,
        totalPoints: scoreOut20,
        maxPoints: 20,
        results,
        duration,
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
