import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { answers, duration } = await request.json();

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    // Get or create student
    let student = await db.student.findFirst();
    if (!student) {
      student = await db.student.create({ data: { name: 'Étudiant' } });
    }

    // Create exam session
    const examSession = await db.examSession.create({
      data: {
        studentId: student.id,
        duration,
        maxPoints: 20,
      },
    });

    let totalScore = 0;
    const maxPoints = answers.length * 4;

    for (const answer of answers) {
      const exercise = await db.exercise.findUnique({
        where: { id: answer.exerciseId },
      });
      if (!exercise) continue;

      const normalizedStudent = String(answer.studentAnswer).trim().toLowerCase();
      const normalizedCorrect = String(exercise.correctAnswer).trim().toLowerCase();
      const isCorrect = normalizedStudent === normalizedCorrect;
      const score = isCorrect ? exercise.points : 0;
      totalScore += score;

      // Save exam answer
      await db.examAnswer.create({
        data: {
          examSessionId: examSession.id,
          exerciseId: answer.exerciseId,
          studentAnswer: String(answer.studentAnswer),
          isCorrect,
          score,
        },
      });

      // Also save as regular student answer for stats tracking
      await db.studentAnswer.create({
        data: {
          studentId: student.id,
          exerciseId: answer.exerciseId,
          studentAnswer: String(answer.studentAnswer),
          isCorrect,
          score,
        },
      });
    }

    // Calculate score out of 20
    const scoreOut20 = maxPoints > 0 ? Math.round((totalScore / maxPoints) * 20 * 100) / 100 : 0;

    // Update exam session
    await db.examSession.update({
      where: { id: examSession.id },
      data: {
        totalPoints: scoreOut20,
        completedAt: new Date(),
      },
    });

    // Get detailed results
    const examAnswers = await db.examAnswer.findMany({
      where: { examSessionId: examSession.id },
      include: { examSession: true },
    });

    const results = answers.map((a: { exerciseId: string; studentAnswer: string }) => {
      const examAns = examAnswers.find((ea) => ea.exerciseId === a.exerciseId);
      return {
        exerciseId: a.exerciseId,
        isCorrect: examAns?.isCorrect ?? false,
        score: examAns?.score ?? 0,
        correctAnswer: '', // filled from client-side exercise details
      };
    });

    return NextResponse.json({
      sessionId: examSession.id,
      totalPoints: scoreOut20,
      maxPoints: 20,
      results,
      duration,
    });
  } catch (error) {
    console.error('Error submitting exam:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la soumission de l\'examen' },
      { status: 500 }
    );
  }
}
