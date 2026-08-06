'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/lib/store';
import type { SubjectStats } from '@/lib/types';
import { SUBJECT_INFO, ALL_SUBJECTS } from '@/lib/types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const SUBJECT_CHART_COLORS: Record<string, string> = {
  MATHEMATIQUES: '#059669',
  PHYSIQUE: '#ea580c',
  CHIMIE: '#7c3aed',
  OPTIQUE: '#0891b2',
  CULTURE_GENERALE: '#d97706',
};

const PIE_COLORS = ['#059669', '#ef4444'];

function getMotivationalMessage(avgScore: number): string {
  if (avgScore >= 18) return '🌟 Excellent ! Vous êtes prêt pour le concours !';
  if (avgScore >= 15) return '👏 Très bon travail ! Continuez sur cette lancée.';
  if (avgScore >= 12) return '💪 Bonne progression ! Quelques efforts encore.';
  if (avgScore >= 8) return '📚 Continuez à réviser, vous progressez !';
  if (avgScore >= 4) return '🎯 Ne baissez pas les bras, la pratique fait la différence !';
  return '🌱 Commencez par les bases, chaque exercice compte !';
}

function generateRecommendations(subjectStats: SubjectStats[]): { emoji: string; text: string; type: 'warning' | 'success' }[] {
  const recommendations: { emoji: string; text: string; type: 'warning' | 'success' }[] = [];

  for (const stat of subjectStats) {
    const info = SUBJECT_INFO[stat.subject];
    if (!info) continue;

    if (stat.averageScore >= 16) {
      recommendations.push({
        emoji: '✅',
        text: `Bon travail en ${info.label} ! Continuez ainsi.`,
        type: 'success',
      });
      continue;
    }

    if (stat.averageScore < 10) {
      const weakTopics = stat.topicBreakdown
        .filter((t) => t.avgScore < 10 && t.total > 0)
        .sort((a, b) => a.avgScore - b.avgScore);

      if (weakTopics.length > 0) {
        recommendations.push({
          emoji: '⚠️',
          text: `Vous devriez réviser la ${weakTopics[0].topic.toLowerCase()} en ${info.label} (${weakTopics[0].avgScore.toFixed(1)}/20).`,
          type: 'warning',
        });
      } else {
        recommendations.push({
          emoji: '⚠️',
          text: `Vous devriez réviser ${info.label} (moyenne ${stat.averageScore.toFixed(1)}/20).`,
          type: 'warning',
        });
      }
    } else {
      const weakTopics = stat.topicBreakdown
        .filter((t) => t.avgScore < 10 && t.total > 0)
        .sort((a, b) => a.avgScore - b.avgScore);

      if (weakTopics.length > 0) {
        recommendations.push({
          emoji: '💡',
          text: `En ${info.label}, concentrez-vous sur la ${weakTopics[0].topic.toLowerCase()}.`,
          type: 'warning',
        });
      }
    }
  }

  if (recommendations.length === 0 && subjectStats.length > 0) {
    recommendations.push({
      emoji: '🎉',
      text: 'Félicitations ! Vos performances sont excellentes dans toutes les matières.',
      type: 'success',
    });
  }

  return recommendations;
}

// ── Loading skeleton ──────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header skeleton */}
      <Skeleton className="h-9 w-64" />

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>

      {/* Weak points skeleton */}
      <Skeleton className="h-48 rounded-xl" />

      {/* Recommendations skeleton */}
      <Skeleton className="h-48 rounded-xl" />

      {/* Actions skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────
function EmptyState() {
  const navigateTo = useAppStore((s) => s.navigateTo);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="text-6xl mb-4">📖</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Bienvenue sur PrépaConcours Haïti !
      </h2>
      <p className="text-gray-500 max-w-md mb-8">
        Vous n&apos;avez pas encore commencé à réviser. Commencez par faire des exercices pour
        voir votre tableau de bord s&apos;animer !
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          size="lg"
          className="gap-2"
          onClick={() => navigateTo('exercises')}
        >
          📝 Réviser les exercices
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="gap-2"
          onClick={() => navigateTo('exam')}
        >
          🎯 Passer un examen
        </Button>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────
export default function DashboardView() {
  const {
    subjectStats,
    setSubjectStats,
    totalExercisesCompleted,
    setTotalExercisesCompleted,
    navigateTo,
  } = useAppStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setSubjectStats(data.subjectStats);
          setTotalExercisesCompleted(data.totalCompleted);
        }
      } catch {
        // If fetch fails, we just show empty or cached data
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [setSubjectStats, setTotalExercisesCompleted]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (totalExercisesCompleted === 0) {
    return <EmptyState />;
  }

  // ── Derived data ─────────────────────────────────────────
  const barChartData = ALL_SUBJECTS.map((subject) => {
    const stat = subjectStats.find((s) => s.subject === subject);
    return {
      name: SUBJECT_INFO[subject].label,
      moyenne: stat ? Math.round(stat.averageScore * 10) / 10 : 0,
      fill: SUBJECT_CHART_COLORS[subject],
    };
  });

  const totalCorrect = subjectStats.reduce((sum, s) => sum + s.correctAnswers, 0);
  const totalIncorrect = subjectStats.reduce(
    (sum, s) => sum + (s.totalExercises - s.correctAnswers),
    0,
  );
  const pieData = [
    { name: 'Correctes', value: totalCorrect },
    { name: 'Incorrectes', value: totalIncorrect },
  ];

  const overallAvg =
    subjectStats.length > 0
      ? subjectStats.reduce((sum, s) => sum + s.averageScore, 0) / subjectStats.length
      : 0;

  const weakSubjects = subjectStats.filter((s) => s.averageScore < 10 && s.totalExercises > 0);
  const recommendations = generateRecommendations(subjectStats);

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">
          Vue d&apos;ensemble de vos performances
        </p>
      </div>

      {/* ── Stats overview cards ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total exercises */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Exercices complétés</CardDescription>
            <CardTitle className="text-4xl font-bold tabular-nums">
              {totalExercisesCompleted}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              sur l&apos;ensemble des matières
            </p>
          </CardContent>
        </Card>

        {/* Average score */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Note moyenne</CardDescription>
            <CardTitle className="text-4xl font-bold tabular-nums">
              {overallAvg.toFixed(1)}
              <span className="text-lg font-normal text-muted-foreground"> / 20</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Progress
                value={(overallAvg / 20) * 100}
                className="h-2 flex-1"
              />
              <span className="text-sm text-muted-foreground tabular-nums">
                {((overallAvg / 20) * 100).toFixed(0)}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Motivational message */}
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardDescription>Message motivant</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{getMotivationalMessage(overallAvg)}</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts row ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart – scores by subject */}
        <Card>
          <CardHeader>
            <CardTitle>Note moyenne par matière</CardTitle>
            <CardDescription>Performance sur 20 dans chaque matière</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    domain={[0, 20]}
                    ticks={[0, 5, 10, 15, 20]}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value} / 20`, 'Moyenne']}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Bar dataKey="moyenne" radius={[6, 6, 0, 0]} isAnimationActive>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie chart – correct vs incorrect */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des réponses</CardTitle>
            <CardDescription>Bonnes et mauvaises réponses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    isAnimationActive
                    label={({ name, percent }: { name: string; percent: number }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`pie-${index}`} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" iconType="circle" />
                  <Tooltip
                    formatter={(value: number) => [`${value} réponses`, 'Total']}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Correctness rate summary */}
            <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full bg-emerald-500" />
                {totalCorrect} correctes
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
                {totalIncorrect} incorrectes
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Weak points section ──────────────────────────── */}
      {weakSubjects.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            🔴 Points faibles à améliorer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {weakSubjects.map((stat) => {
              const info = SUBJECT_INFO[stat.subject];
              const weakTopics = stat.topicBreakdown
                .filter((t) => t.avgScore < 10 && t.total > 0)
                .sort((a, b) => a.avgScore - b.avgScore);

              return (
                <Card
                  key={stat.subject}
                  className="border-red-200 bg-red-50/40"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{info.label}</CardTitle>
                      <Badge variant="destructive">
                        {stat.averageScore.toFixed(1)} / 20
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {weakTopics.length > 0 ? (
                      <div className="space-y-3">
                        {weakTopics.map((topic) => (
                          <div key={topic.topic}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-700 font-medium">
                                {topic.topic}
                              </span>
                              <span className="text-red-600 font-semibold tabular-nums">
                                {topic.avgScore.toFixed(1)} / 20
                              </span>
                            </div>
                            <div className="w-full bg-red-100 rounded-full h-1.5">
                              <div
                                className="bg-red-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${(topic.avgScore / 20) * 100}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {topic.correct}/{topic.total} correctes
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Passez plus d&apos;exercices pour identifier vos lacunes.
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Recommendations section ──────────────────────── */}
      {recommendations.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            💡 Recommandations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {recommendations.map((rec, index) => (
              <Card
                key={index}
                className={
                  rec.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-amber-200 bg-amber-50/40'
                }
              >
                <CardContent className="flex items-start gap-3 py-4">
                  <span className="text-2xl leading-none mt-0.5">{rec.emoji}</span>
                  <p className="text-sm text-gray-700">{rec.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick action buttons ─────────────────────────── */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button
            size="lg"
            className="h-20 text-base gap-2 flex flex-col items-center justify-center rounded-xl"
            onClick={() => navigateTo('exam')}
          >
            <span className="text-2xl">🎯</span>
            Commencer un examen
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-20 text-base gap-2 flex flex-col items-center justify-center rounded-xl"
            onClick={() => navigateTo('exercises')}
          >
            <span className="text-2xl">📝</span>
            Réviser les exercices
          </Button>

          <Button
            size="lg"
            variant="secondary"
            className="h-20 text-base gap-2 flex flex-col items-center justify-center rounded-xl"
            onClick={() => navigateTo('ai-assistant')}
          >
            <span className="text-2xl">🤖</span>
            Demander à l&apos;IA
          </Button>
        </div>
      </div>
    </div>
  );
}
