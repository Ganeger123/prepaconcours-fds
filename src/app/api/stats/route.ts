import { NextResponse } from 'next/server';
import { readStoredAnswers } from '@/lib/cookie-helpers';
import { exercises, subjects } from '@/lib/exercises-data';

export async function GET(request: Request) {
  const answers = readStoredAnswers(request);
  const totalCompleted = answers.length;

  const subjectStats = subjects.map((subject) => {
    const subjectExercises = exercises.filter((e) => e.subject === subject);
    const subjectAnswers = answers.filter((a) =>
      subjectExercises.some((e) => e.id === a.exerciseId)
    );

    const totalExercises = subjectExercises.length;
    const correctAnswers = subjectAnswers.filter((a) => a.isCorrect).length;
    const totalScore = subjectAnswers.reduce((sum, a) => sum + a.score, 0);
    const maxScore = subjectAnswers.reduce((sum, a) => {
      const ex = subjectExercises.find((e) => e.id === a.exerciseId);
      return sum + (ex ? ex.points : 0);
    }, 0);
    const averageScore = maxScore > 0 ? (totalScore / maxScore) * 20 : 0;

    // Topic breakdown
    const topicMap = new Map<
      string,
      { total: number; correct: number; score: number; maxScore: number }
    >();
    for (const answer of subjectAnswers) {
      const ex = subjectExercises.find((e) => e.id === answer.exerciseId);
      const topic = ex?.topic || 'Autre';
      if (!topicMap.has(topic)) {
        topicMap.set(topic, { total: 0, correct: 0, score: 0, maxScore: 0 });
      }
      const entry = topicMap.get(topic)!;
      entry.total++;
      if (answer.isCorrect) entry.correct++;
      entry.score += answer.score;
      entry.maxScore += ex ? ex.points : 0;
    }

    const topicBreakdown = Array.from(topicMap.entries()).map(
      ([topic, data]) => ({
        topic,
        total: data.total,
        correct: data.correct,
        avgScore:
          data.maxScore > 0
            ? Math.round((data.score / data.maxScore) * 20 * 100) / 100
            : 0,
      })
    );

    return {
      subject,
      totalExercises,
      correctAnswers,
      averageScore: Math.round(averageScore * 100) / 100,
      topicBreakdown,
    };
  });

  return NextResponse.json({ subjectStats, totalCompleted });
}
