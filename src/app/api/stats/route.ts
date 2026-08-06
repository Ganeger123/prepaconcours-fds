import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    let student = await db.student.findFirst();
    if (!student) {
      return NextResponse.json({ subjectStats: [], totalCompleted: 0 });
    }

    const subjects = ['MATHEMATIQUES', 'PHYSIQUE', 'CHIMIE', 'OPTIQUE', 'CULTURE_GENERALE'] as const;

    const subjectStats = await Promise.all(
      subjects.map(async (subject) => {
        const exercises = await db.exercise.findMany({ where: { subject } });
        const exerciseIds = exercises.map((e) => e.id);

        const answers = await db.studentAnswer.findMany({
          where: { studentId: student.id, exerciseId: { in: exerciseIds } },
          include: { exercise: true },
        });

        const totalExercises = exercises.length;
        const correctAnswers = answers.filter((a) => a.isCorrect).length;
        const totalScore = answers.reduce((sum, a) => sum + a.score, 0);
        const maxScore = answers.reduce((sum, a) => sum + a.exercise.points, 0);
        const averageScore = maxScore > 0 ? (totalScore / maxScore) * 20 : 0;

        // Topic breakdown
        const topicMap = new Map<string, { total: number; correct: number; score: number; maxScore: number }>();
        for (const answer of answers) {
          const topic = answer.exercise.topic;
          if (!topicMap.has(topic)) {
            topicMap.set(topic, { total: 0, correct: 0, score: 0, maxScore: 0 });
          }
          const entry = topicMap.get(topic)!;
          entry.total++;
          if (answer.isCorrect) entry.correct++;
          entry.score += answer.score;
          entry.maxScore += answer.exercise.points;
        }

        const topicBreakdown = Array.from(topicMap.entries()).map(([topic, data]) => ({
          topic,
          total: data.total,
          correct: data.correct,
          avgScore: data.maxScore > 0 ? (data.score / data.maxScore) * 20 : 0,
        }));

        return {
          subject,
          totalExercises,
          correctAnswers,
          averageScore: Math.round(averageScore * 100) / 100,
          topicBreakdown,
        };
      })
    );

    const totalCompleted = await db.studentAnswer.count({
      where: { studentId: student.id },
    });

    return NextResponse.json({ subjectStats, totalCompleted });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des statistiques' },
      { status: 500 }
    );
  }
}
