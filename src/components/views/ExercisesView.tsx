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
import { Search, BookOpen, Filter, Play, Youtube, ExternalLink } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { Exercise, Subject, Difficulty } from '@/lib/types';
import { SUBJECT_INFO, DIFFICULTY_INFO, ALL_SUBJECTS, ALL_DIFFICULTIES } from '@/lib/types';
import { getVideosBySubject, getVideosByTopic } from '@/lib/video-resources';
import type { VideoResource } from '@/lib/video-resources';

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
  const [activeTab, setActiveTab] = useState<'exercises' | 'videos'>('exercises');

  // Available topics derived from selected subject
  const availableTopics = useMemo(() => {
    if (!subject) return [];
    return SUBJECT_INFO[subject as Subject]?.topics ?? [];
  }, [subject]);

  // Videos filtered by selected subject and topic
  const filteredVideos = useMemo(() => {
    if (subject && topic) {
      return getVideosByTopic(subject as Subject, topic);
    }
    if (subject) {
      return getVideosBySubject(subject as Subject);
    }
    return [];
  }, [subject, topic]);

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
      {/* Header + Tab switcher */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banque d&apos;exercices</h1>
          <p className="text-gray-500 text-sm mt-1">
            Parcourez et pratiquez les exercices de preparation au concours
          </p>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveTab('exercises')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'exercises'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> Exercices</span>
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'videos'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center gap-1.5"><Youtube className="w-4 h-4" /> Videos</span>
          </button>
        </div>
      </div>

      {/* Filter bar (always visible) */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Subject select */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                Matiere
              </label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Toutes les matieres" />
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
              <label className="text-sm font-medium text-gray-700">Difficulte</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Toutes les difficultes" />
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
              <label className="text-sm font-medium text-gray-700">Theme</label>
              <Select value={topic} onValueChange={setTopic} disabled={!subject}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      subject
                        ? 'Tous les themes'
                        : 'Selectionnez une matiere'
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

      {/* ── Tab content ────────────────────────────────────── */}
      {activeTab === 'exercises' ? (
        <>
          {/* Results summary & start all */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-800">
                {exercises.length}
              </span>{' '}
              {exercises.length <= 1
                ? 'exercice trouve'
                : 'exercices trouves'}
            </p>
            {exercises.length > 0 && (
              <Button
                onClick={handleStartAll}
                disabled={starting}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Tout demarrer
              </Button>
            )}
          </div>

          {/* Exercise cards grid */}
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
        </>
      ) : (
        /* ── Videos Tab ─────────────────────────────────── */
        <>
          {filteredVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Youtube className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {subject ? 'Aucune video pour ce theme' : 'Selectionnez une matiere'}
              </h3>
              <p className="text-gray-500 max-w-md">
                {subject
                  ? 'Essayez de selectionner un theme specifique ou une autre matiere pour voir les videos disponibles.'
                  : 'Utilisez les filtres ci-dessus pour choisir une matiere et voir les videos educatives associees.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-800">{filteredVideos.length}</span>{' '}
                video{filteredVideos.length > 1 ? 's' : ''} disponible{filteredVideos.length > 1 ? 's' : ''}
                {subject && <span> en <strong>{SUBJECT_INFO[subject as Subject]?.label}</strong></span>}
                {topic && <span> - {topic}</span>}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredVideos.map((video) => (
                  <Card key={video.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    {/* YouTube thumbnail */}
                    <a
                      href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative group"
                    >
                      <div className="aspect-video bg-gray-100 relative">
                        <img
                          src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {/* Play overlay */}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="h-6 w-6 text-white ml-1" />
                          </div>
                        </div>
                        {/* Duration badge */}
                        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">
                          {video.duration}
                        </span>
                      </div>
                    </a>
                    <CardContent className="pt-3 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                            {video.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">{video.channel}</p>
                        </div>
                        <a
                          href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                          title="Regarder sur YouTube"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <div className="flex gap-1.5 mt-2">
                        {subject && (
                          <Badge variant="outline" className={SUBJECT_INFO[video.subject]?.color ?? ''}>
                            {SUBJECT_INFO[video.subject]?.label}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">{video.topic}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
