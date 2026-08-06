import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { exerciseId, studentAnswer } = await request.json();

    if (!exerciseId || studentAnswer === undefined || studentAnswer === null) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const exercise = await db.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercice non trouvé' },
        { status: 404 }
      );
    }

    // Get or create student
    let student = await db.student.findFirst();
    if (!student) {
      student = await db.student.create({ data: { name: 'Étudiant' } });
    }

    // Grade the answer
    const normalizedStudent = String(studentAnswer).trim().toLowerCase();
    const normalizedCorrect = String(exercise.correctAnswer).trim().toLowerCase();
    const isCorrect = normalizedStudent === normalizedCorrect;
    const score = isCorrect ? exercise.points : 0;

    // Save the answer
    await db.studentAnswer.create({
      data: {
        studentId: student.id,
        exerciseId,
        studentAnswer: String(studentAnswer),
        isCorrect,
        score,
      },
    });

    return NextResponse.json({
      isCorrect,
      score,
      maxScore: exercise.points,
      correctAnswer: exercise.correctAnswer,
      solution: exercise.solution,
      questionType: exercise.questionType,
    });
  } catch (error) {
    console.error('Error grading:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la correction' },
      { status: 500 }
    );
  }
}
