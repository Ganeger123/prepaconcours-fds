'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import type { StudentAnswerRecord, Subject } from '@/lib/types';
import { SUBJECT_INFO } from '@/lib/types';
import { History, CheckCircle, XCircle, Filter, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ALL_SUBJECTS } from '@/lib/types';

// ── Helpers ───────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

// ── Loading skeleton ──────────────────────────────────────────
function ResultsSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6 max-w-5xl mx-auto">
      <Skeleton className="h-9 w-56" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────
function EmptyResultsState() {
  const navigateTo = useAppStore((s) => s.navigateTo);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <History className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Aucun historique
      </h2>
      <p className="text-muted-foreground max-w-md mb-6">
        Vous n&apos;avez pas encore complété d&apos;exercices. Commencez à réviser pour voir vos résultats ici !
      </p>
      <Button className="gap-2" onClick={() => navigateTo('exercises')}>
        <Eye className="w-4 h-4" />
        Commencer les exercices
      </Button>
    </div>
  );
}

// ── Score badge ───────────────────────────────────────────────
function ScoreBadge({ score, maxScore = 20 }: { score: number; maxScore?: number }) {
  const normalizedScore = (score / maxScore) * 20;
  let colorClass = 'bg-red-100 text-red-700';
  if (normalizedScore >= 16) colorClass = 'bg-emerald-100 text-emerald-700';
  else if (normalizedScore >= 12) colorClass = 'bg-blue-100 text-blue-700';
  else if (normalizedScore >= 8) colorClass = 'bg-amber-100 text-amber-700';

  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full ${colorClass}`}>
      {normalizedScore.toFixed(1)} / 20
    </span>
  );
}

// ── History card ──────────────────────────────────────────────
function HistoryCard({ record }: { record: StudentAnswerRecord }) {
  const [expanded, setExpanded] = useState(false);
  const subjectInfo = SUBJECT_INFO[record.exercise.subject];

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        {/* Top row: subject badge + date + score */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="outline" className={subjectInfo?.color || ''}>
            {subjectInfo?.label || record.exercise.subject}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDate(record.createdAt)}
          </span>
          <div className="ml-auto flex items-center gap-2">
            {record.isCorrect ? (
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <ScoreBadge score={record.score} maxScore={record.exercise.points} />
          </div>
        </div>

        {/* Topic */}
        <p className="text-sm font-medium text-gray-700 mb-1">
          {record.exercise.topic}
        </p>

        {/* Question (truncated) */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {truncateText(record.exercise.question, 150)}
        </p>

        {/* Student answer hint */}
        <p className="text-xs text-muted-foreground mt-1">
          Votre réponse : <span className="font-medium">{truncateText(record.studentAnswer, 80)}</span>
        </p>

        {/* Expand / collapse solution */}
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setExpanded(!expanded)}
        >
          <Eye className="w-3.5 h-3.5" />
          {expanded ? 'Masquer' : 'Voir'} la solution détaillée
        </Button>

        {/* Expanded solution */}
        {expanded && (
          <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              Solution détaillée
            </p>
            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {record.exercise.solution}
            </div>
            <div className="mt-2 pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Réponse correcte :</span>{' '}
                {record.exercise.correctAnswer}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main component ─────────────────────────────────────────────
export default function ResultsView() {
  const navigateTo = useAppStore((s) => s.navigateTo);
  const [answers, setAnswers] = useState<StudentAnswerRecord[]>([]);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  // ── Fetch results ────────────────────────────────────────────
  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch('/api/results');
        if (res.ok) {
          const data = await res.json();
          setAnswers(data.answers);
          setTotalCompleted(data.totalCompleted);
        }
      } catch {
        // Silently fail — show empty state
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, []);

  // ── Filtered answers ──────────────────────────────────────────
  const filteredAnswers =
    selectedSubject === 'all'
      ? answers
      : answers.filter((a) => a.exercise.subject === selectedSubject);

  // ── Computed stats ───────────────────────────────────────────
  const correctCount = filteredAnswers.filter((a) => a.isCorrect).length;
  const averageScore =
    filteredAnswers.length > 0
      ? filteredAnswers.reduce((sum, a) => sum + (a.score / a.exercise.points) * 20, 0) /
        filteredAnswers.length
      : 0;
  const successRate =
    filteredAnswers.length > 0
      ? (correctCount / filteredAnswers.length) * 100
      : 0;

  // ── Render ──────────────────────────────────────────────────
  if (loading) {
    return <ResultsSkeleton />;
  }

  if (totalCompleted === 0) {
    return <EmptyResultsState />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historique des résultats</h1>
          <p className="text-sm text-muted-foreground">
            Revoyez vos exercices passés et progressez
          </p>
        </div>

        {/* Filter by subject */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrer par matière" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les matières</SelectItem>
              {ALL_SUBJECTS.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {SUBJECT_INFO[subject].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Stats summary cards ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total completed */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Exercices complétés</CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums">
              {filteredAnswers.length}
              {selectedSubject !== 'all' && (
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  / {totalCompleted}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {selectedSubject === 'all'
                ? 'dans toutes les matières'
                : `en ${SUBJECT_INFO[selectedSubject as Subject]?.label || ''}`}
            </p>
          </CardContent>
        </Card>

        {/* Correct count + rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bonnes réponses</CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums text-emerald-600">
              {correctCount}
              <span className="text-lg font-normal text-muted-foreground ml-1">
                ({successRate.toFixed(0)}%)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${successRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Average score */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Note moyenne</CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums">
              {averageScore.toFixed(1)}
              <span className="text-lg font-normal text-muted-foreground"> / 20</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  averageScore >= 12
                    ? 'bg-blue-500'
                    : averageScore >= 8
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${(averageScore / 20) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── History list ─────────────────────────────────────── */}
      {filteredAnswers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Aucun résultat pour cette matière. Essayez de faire quelques exercices !
          </p>
          <Button
            variant="outline"
            className="mt-4 gap-2"
            onClick={() => navigateTo('exercises')}
          >
            <Eye className="w-4 h-4" />
            Voir les exercices
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <History className="w-5 h-5" />
            Détail des exercices
          </h2>

          {filteredAnswers.map((record) => (
            <HistoryCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}
