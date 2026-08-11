import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const difficulty = searchParams.get('difficulty');
    const topic = searchParams.get('topic');
    const questionType = searchParams.get('questionType');
    const ids = searchParams.get('ids');
    const exam = searchParams.get('exam');
    const search = searchParams.get('search');

    // Fetch specific exercises by IDs
    if (ids) {
      const idList = ids.split(',');
      const exercises = await db.exercise.findMany({
        where: { id: { in: idList } },
        orderBy: { createdAt: 'asc' },
      });
      return NextResponse.json(exercises);
    }

    // Get random exercises for exam
    if (exam === 'true') {
      const allExercises = await db.exercise.findMany();
      // Shuffle and pick 20 exercises (4 per subject)
      const subjects = ['MATHEMATIQUES', 'PHYSIQUE', 'CHIMIE', 'OPTIQUE', 'CULTURE_GENERALE'] as const;
      const selected: typeof allExercises = [];

      for (const subj of subjects) {
        const subjExercises = allExercises
          .filter((e) => e.subject === subj)
          .sort(() => Math.random() - 0.5);
        selected.push(...subjExercises.slice(0, 4));
      }

      // Shuffle final selection
      selected.sort(() => Math.random() - 0.5);
      return NextResponse.json(selected);
    }

    // Standard filtering
    const where: Prisma.ExerciseWhereInput = {};
    if (subject) where.subject = subject;
    if (difficulty) where.difficulty = difficulty;
    if (topic) where.topic = topic;
    if (questionType) where.questionType = questionType;
    if (search) {
      where.question = { contains: search };
    }

    const exercises = await db.exercise.findMany({
      where: where,
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des exercices' },
      { status: 500 }
    );
  }
}
