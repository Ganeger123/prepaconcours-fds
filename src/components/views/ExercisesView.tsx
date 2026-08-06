'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, BookOpen, Filter, Play } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { Exercise, Subject, Difficulty } from '@/lib/types';
import { SUBJECT_INFO, DIFFICULTY_INFO, ALL_SUBJECTS, ALL_DIFFICULTIES } from '@/lib/types';

// ── Helpers ───────────────────────────────────────────────────

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + '…';
}

function buildQueryParams(
  subject: string,
  difficulty: string,
  topic: string,
  search: string,
): string {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (difficulty) params.set('difficulty', difficulty);
  if (topic) params.set('topic', topic);
  if (search) params.set('search', search);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

// ── Loading skeleton ──────────────────────────────────────────

function ExercisesSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Filter bar skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
      </div>

      {/* Results count skeleton */}
      <Skeleton className="h-6 w-48" />

      {/* Cards grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-56 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  const navigateTo = useAppStore((s) => s.navigateTo);

  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Aucun exercice trouvé
        </h3>
        <p className="text-gray-500 max-w-md">
          Essayez de modifier vos critères de recherche pour trouver des exercices.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <BookOpen className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Aucun exercice disponible
      </h3>
      <p className="text-gray-500 max-w-md mb-6">
        Il n&apos;y a pas encore d&apos;exercices dans la base de données.
      </p>
      <Button variant="outline" onClick={() => navigateTo('dashboard')}>
        Retour au tableau de bord
      </Button>
    </div>
  );
}

// ── Exercise card ─────────────────────────────────────────────

function ExerciseCard({
  exercise,
  onStart,
}: {
  exercise: Exercise;
  onStart: (exercise: Exercise) => void;
}) {
  const subjectInfo = SUBJECT_INFO[exercise.subject];
  const difficultyInfo = DIFFICULTY_INFO[exercise.difficulty];

  return (
    <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Badge variant="outline" className={subjectInfo.color}>
            {subjectInfo.label}
          </Badge>
          <Badge className={difficultyInfo.color}>
            {difficultyInfo.label}
          </Badge>
        </div>
        <CardTitle className="text-base font-semibold mt-2 leading-snug">
          {truncate(exercise.question, 90)}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">Thème :</span>
            <span>{exercise.topic}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">Type :</span>
            <span>{exercise.questionType}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          {exercise.points} pt{exercise.points > 1 ? 's' : ''}
        </span>
        <Button size="sm" className="gap-1.5" onClick={() => onStart(exercise)}>
          <Play className="h-3.5 w-3.5" />
          Commencer
        </Button>
      </CardFooter>
    </Card>
  );
}

// ── Main view ─────────────────────────────────────────────────

export default function ExercisesView() {
  const {
    setPracticeExerciseIds,
    setCurrentPracticeIndex,
    navigateTo,
  } = useAppStore();

  // Filter state
  const [subject, setSubject] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [search, setSearch] = useState('');

  // Data state
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  // Available topics derived from selected subject
  const availableTopics = useMemo(() => {
    if (!subject) return [];
    return SUBJECT_INFO[subject as Subject]?.topics ?? [];
  }, [subject]);

  // Reset topic when subject changes
  useEffect(() => {
    setTopic('');
  }, [subject]);

  // Fetch exercises when filters change
  const fetchExercises = useCallback(async () => {
    setLoading(true);
    try {
      const qs = buildQueryParams(subject, difficulty, topic, search);
      const res = await fetch(`/api/exercises${qs}`);
      if (res.ok) {
        const data: Exercise[] = await res.json();
        setExercises(data);
      } else {
        setExercises([]);
      }
    } catch {
      setExercises([]);
    } finally {
      setLoading(false);
    }
  }, [subject, difficulty, topic, search]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  // Determine if any filter is active (for empty state messaging)
  const hasFilters = !!(subject || difficulty || topic || search);

  // Start a single exercise: fetch all matching, find its index, navigate
  const handleStartExercise = useCallback(
    async (exercise: Exercise) => {
      setStarting(true);
      try {
        const qs = buildQueryParams(subject, difficulty, topic, search);
        const res = await fetch(`/api/exercises${qs}`);
        if (!res.ok) return;
        const allExercises: Exercise[] = await res.json();
        const ids = allExercises.map((e) => e.id);
        const index = ids.indexOf(exercise.id);
        setPracticeExerciseIds(ids);
        setCurrentPracticeIndex(index >= 0 ? index : 0);
        navigateTo('practice');
      } catch {
        // Silently fail – user stays on the page
      } finally {
        setStarting(false);
      }
    },
    [subject, difficulty, topic, search, setPracticeExerciseIds, setCurrentPracticeIndex, navigateTo],
  );

  // Start all filtered exercises from index 0
  const handleStartAll = useCallback(async () => {
    setStarting(true);
    try {
      const ids = exercises.map((e) => e.id);
      if (ids.length === 0) return;
      setPracticeExerciseIds(ids);
      setCurrentPracticeIndex(0);
      navigateTo('practice');
    } finally {
      setStarting(false);
    }
  }, [exercises, setPracticeExerciseIds, setCurrentPracticeIndex, navigateTo]);

  // ── Render ───────────────────────────────────────────────

  if (loading) {
    return <ExercisesSkeleton />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Banque d&apos;exercices</h1>
        <p className="text-gray-500 text-sm mt-1">
          Parcourez et pratiquez les exercices de préparation au concours
        </p>
      </div>

      {/* ── Filter bar ────────────────────────────────────── */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Subject select */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                Matière
              </label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Toutes les matières" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {SUBJECT_INFO[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty select */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Difficulté</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Toutes les difficultés" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_DIFFICULTIES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {DIFFICULTY_INFO[d].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Topic select (depends on subject) */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Thème</label>
              <Select value={topic} onValueChange={setTopic} disabled={!subject}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      subject
                        ? 'Tous les thèmes'
                        : 'Sélectionnez une matière'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableTopics.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Text search */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Recherche</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Chercher un exercice..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Results summary & start all ───────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-800">
            {exercises.length}
          </span>{' '}
          {exercises.length === 0
            ? 'exercice trouvé'
            : exercises.length === 1
              ? 'exercice trouvé'
              : 'exercices trouvés'}
        </p>
        {exercises.length > 0 && (
          <Button
            onClick={handleStartAll}
            disabled={starting}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Tout démarrer
          </Button>
        )}
      </div>

      {/* ── Exercise cards grid ───────────────────────────── */}
      {exercises.length === 0 ? (
        <EmptyState hasFilters={hasFilters} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onStart={handleStartExercise}
            />
          ))}
        </div>
      )}
    </div>
  );
}
