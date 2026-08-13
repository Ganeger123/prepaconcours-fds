'use client';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/lib/store';
import { SUBJECT_INFO, ALL_SUBJECTS } from '@/lib/types';
import {
  Trophy,
  Medal,
  Crown,
  Star,
  BarChart3,
  Users,
  Target,
  TrendingUp,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────

interface LeaderboardEntry {
  studentName: string;
  bestExamScore: number;
  examCount: number;
  avgExamScore: number;
  totalPracticeCorrect: number;
  totalPracticeDone: number;
  practiceRate: number;
  lastActivity: string;
}

// ── Helpers ──────────────────────────────────────────────────────

function getStoredEntries(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('prepafds_leaderboard');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredEntries(entries: LeaderboardEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('prepafds_leaderboard', JSON.stringify(entries));
}

function getStudentExamSessions(): { score: number; date: string }[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('prepafds_exam_sessions');
    return raw ? JSON.parse(raw).map((s: { totalPoints: number; completedAt: string }) => ({
      score: s.totalPoints,
      date: s.completedAt,
    })) : [];
  } catch {
    return [];
  }
}

function getStudentAnswers(): { isCorrect: boolean; createdAt: string }[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('prepafds_student_answers');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function updateLeaderboardForStudent(studentName: string): void {
  if (!studentName) return;

  const examSessions = getStudentExamSessions();
  const answers = getStudentAnswers();

  if (examSessions.length === 0 && answers.length === 0) return;

  const bestExamScore = examSessions.length > 0
    ? Math.max(...examSessions.map((s) => s.score))
    : 0;
  const avgExamScore = examSessions.length > 0
    ? examSessions.reduce((sum, s) => sum + s.score, 0) / examSessions.length
    : 0;
  const totalPracticeCorrect = answers.filter((a) => a.isCorrect).length;
  const totalPracticeDone = answers.length;
  const practiceRate = totalPracticeDone > 0
    ? Math.round((totalPracticeCorrect / totalPracticeDone) * 100)
    : 0;
  const allDates = [
    ...examSessions.map((s) => s.date),
    ...answers.map((a) => a.createdAt),
  ];
  const lastActivity = allDates.length > 0
    ? allDates.sort().pop() || ''
    : '';

  const entries = getStoredEntries();
  const existingIndex = entries.findIndex((e) => e.studentName === studentName);

  const entry: LeaderboardEntry = {
    studentName,
    bestExamScore: Math.round(bestExamScore * 100) / 100,
    examCount: examSessions.length,
    avgExamScore: Math.round(avgExamScore * 100) / 100,
    totalPracticeCorrect,
    totalPracticeDone,
    practiceRate,
    lastActivity,
  };

  if (existingIndex >= 0) {
    entries[existingIndex] = entry;
  } else {
    entries.push(entry);
  }

  saveStoredEntries(entries);
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="w-6 h-6 text-amber-500" />;
  if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
  if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />;
  return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>;
}

function getScoreBadge(score: number) {
  if (score >= 16) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (score >= 10) return 'bg-blue-100 text-blue-700 border-blue-200';
  if (score > 0) return 'bg-red-100 text-red-700 border-red-200';
  return 'bg-gray-100 text-gray-500 border-gray-200';
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'Jamais';
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

// ── Loading skeleton ──────────────────────────────────────────
function LeaderboardSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6 max-w-5xl mx-auto">
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-5 w-96" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

// ── Podium Component (top 3) ─────────────────────────────────
function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  const sorted = [...entries].sort((a, b) => b.bestExamScore - a.bestExamScore);
  const top3 = sorted.slice(0, 3);
  if (top3.length === 0) return null;

  const podiumOrder = top3.length >= 3
    ? [top3[1], top3[0], top3[2]]
    : top3.length === 2
      ? [top3[1], top3[0]]
      : [top3[0]];

  const heights = top3.length >= 3
    ? ['h-28', 'h-40', 'h-20']
    : top3.length === 2
      ? ['h-28', 'h-40']
      : ['h-40'];
  const ranks = top3.length >= 3
    ? [2, 1, 3]
    : top3.length === 2
      ? [2, 1]
      : [1];

  return (
    <div className="flex items-end justify-center gap-3 md:gap-6 py-4">
      {podiumOrder.map((entry, i) => (
        <div key={entry.studentName} className="flex flex-col items-center">
          <div className="mb-2 flex flex-col items-center">
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-lg
              ${ranks[i] === 1 ? 'bg-amber-100 text-amber-700 border-2 border-amber-300' : ranks[i] === 2 ? 'bg-gray-100 text-gray-600 border-2 border-gray-300' : 'bg-orange-50 text-orange-700 border-2 border-orange-200'}`}>
              {entry.studentName.charAt(0).toUpperCase()}
            </div>
            <p className="text-sm font-semibold mt-1.5 max-w-[100px] truncate">{entry.studentName}</p>
            <Badge className={`mt-1 ${getScoreBadge(entry.bestExamScore)}`} variant="outline">
              {entry.bestExamScore}/20
            </Badge>
          </div>
          <div className={`w-20 md:w-28 rounded-t-lg flex items-center justify-center ${
            ranks[i] === 1 ? 'bg-gradient-to-t from-amber-300 to-amber-100' : ranks[i] === 2 ? 'bg-gradient-to-t from-gray-300 to-gray-100' : 'bg-gradient-to-t from-orange-300 to-orange-100'
          } ${heights[i]}`}>
            {getRankIcon(ranks[i])}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function LeaderboardView() {
  const { studentName } = useAppStore();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'exam' | 'practice'>('exam');

  // Load and update leaderboard data
  useEffect(() => {
    // Update current student's stats
    updateLeaderboardForStudent(studentName);
    // Load all entries
    const all = getStoredEntries();
    setEntries(all);
    setLoading(false);
  }, [studentName]);

  // Sorted entries
  const sortedByExam = useMemo(() =>
    [...entries].sort((a, b) => b.bestExamScore - a.bestExamScore),
    [entries]
  );

  const sortedByPractice = useMemo(() =>
    [...entries].sort((a, b) => b.practiceRate - a.practiceRate || b.totalPracticeDone - a.totalPracticeDone),
    [entries]
  );

  const currentTabData = tab === 'exam' ? sortedByExam : sortedByPractice;

  // Stats summary
  const totalStudents = entries.length;
  const topScore = entries.length > 0 ? Math.max(...entries.map(e => e.bestExamScore)) : 0;
  const avgScoreAll = entries.length > 0
    ? Math.round(entries.reduce((s, e) => s + e.avgExamScore, 0) / entries.length * 100) / 100
    : 0;

  if (loading) {
    return <LeaderboardSkeleton />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Trophy className="w-7 h-7 text-amber-500" />
          Classement des meilleurs
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Comparez vos performances avec les autres etudiantes
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              Etudiants actifs
            </CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums">{totalStudents}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">ont complete au moins un exercice</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Star className="w-4 h-4" />
              Meilleur score examen
            </CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums">
              {topScore}<span className="text-lg font-normal text-muted-foreground"> /20</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {entries.length > 0 ? sortedByExam[0]?.studentName : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              Moyenne generale
            </CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums">
              {avgScoreAll}<span className="text-lg font-normal text-muted-foreground"> /20</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">tous examens confondus</p>
          </CardContent>
        </Card>
      </div>

      {/* Podium (top 3 by exam score) */}
      {sortedByExam.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              Podium - Examens simules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Podium entries={sortedByExam} />
          </CardContent>
        </Card>
      )}

      {/* Tab switcher */}
      <div className="flex gap-2">
        <Button
          variant={tab === 'exam' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('exam')}
          className="gap-1.5"
        >
          <BarChart3 className="w-4 h-4" />
          Classement Examens
        </Button>
        <Button
          variant={tab === 'practice' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('practice')}
          className="gap-1.5"
        >
          <Target className="w-4 h-4" />
          Classement Exercices
        </Button>
      </div>

      {/* Leaderboard table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {tab === 'exam' ? 'Classement par meilleur score examen' : 'Classement par taux de reussite exercices'}
          </CardTitle>
          <CardDescription>
            {currentTabData.length} etudiant{currentTabData.length > 1 ? 's' : ''} classe{currentTabData.length > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentTabData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">Aucun classement disponible</p>
              <p className="text-sm mt-1">Passez des examens ou faites des exercices pour apparaitre ici !</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-3 font-medium w-12">#</th>
                    <th className="text-left py-3 px-3 font-medium">Etudiant</th>
                    {tab === 'exam' ? (
                      <>
                        <th className="text-center py-3 px-3 font-medium">Meilleur score</th>
                        <th className="text-center py-3 px-3 font-medium hidden sm:table-cell">Moyenne</th>
                        <th className="text-center py-3 px-3 font-medium hidden md:table-cell">Examens</th>
                      </>
                    ) : (
                      <>
                        <th className="text-center py-3 px-3 font-medium">Taux de reussite</th>
                        <th className="text-center py-3 px-3 font-medium hidden sm:table-cell">Exercices</th>
                        <th className="text-center py-3 px-3 font-medium hidden md:table-cell">Correctes</th>
                      </>
                    )}
                    <th className="text-right py-3 px-3 font-medium hidden lg:table-cell">Derniere activite</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTabData.map((entry, idx) => {
                    const isCurrentUser = entry.studentName === studentName;
                    return (
                      <tr
                        key={entry.studentName}
                        className={`border-b last:border-0 transition-colors ${
                          isCurrentUser ? 'bg-emerald-50/60' : 'hover:bg-muted/30'
                        }`}
                      >
                        <td className="py-3 px-3">{getRankIcon(idx + 1)}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              isCurrentUser
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {entry.studentName.charAt(0).toUpperCase()}
                            </div>
                            <span className={`font-medium ${isCurrentUser ? 'text-emerald-700' : ''}`}>
                              {entry.studentName}
                              {isCurrentUser && (
                                <span className="text-xs text-emerald-600 ml-1.5">(vous)</span>
                              )}
                            </span>
                          </div>
                        </td>
                        {tab === 'exam' ? (
                          <>
                            <td className="py-3 px-3 text-center">
                              <Badge className={getScoreBadge(entry.bestExamScore)} variant="outline">
                                {entry.bestExamScore}/20
                              </Badge>
                            </td>
                            <td className="py-3 px-3 text-center hidden sm:table-cell tabular-nums">
                              {entry.avgExamScore}/20
                            </td>
                            <td className="py-3 px-3 text-center hidden md:table-cell">
                              {entry.examCount}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2 justify-center">
                                <Progress value={entry.practiceRate} className="h-2 w-16" />
                                <span className="tabular-nums font-medium text-sm">{entry.practiceRate}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center hidden sm:table-cell tabular-nums">
                              {entry.totalPracticeDone}
                            </td>
                            <td className="py-3 px-3 text-center hidden md:table-cell tabular-nums">
                              <span className="text-emerald-600 font-medium">{entry.totalPracticeCorrect}</span>
                            </td>
                          </>
                        )}
                        <td className="py-3 px-3 text-right hidden lg:table-cell text-muted-foreground text-xs">
                          {formatDate(entry.lastActivity)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
