'use client';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/store';
import type { Exercise } from '@/lib/types';
import { SUBJECT_INFO, DIFFICULTY_INFO } from '@/lib/types';
import { getExercises, gradeExercise } from '@/lib/client-api';
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Send,
  Lightbulb,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────

interface GradeResult {
  isCorrect: boolean;
  score: number;
  maxScore: number;
  correctAnswer: string;
  solution: string;
  questionType: string;
}

interface SessionSummary {
  totalCompleted: number;
  totalScore: number;
  totalMaxScore: number;
}

// ── Constants ──────────────────────────────────────────────────

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;

// ── Helpers ────────────────────────────────────────────────────

function parseOptions(optionsJson: string | null): string[] {
  if (!optionsJson) return [];
  try {
    const parsed = JSON.parse(optionsJson);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

// ── Main Component ─────────────────────────────────────────────

export default function PracticeView() {
  const {
    practiceExerciseIds,
    currentPracticeIndex,
    setCurrentPracticeIndex,
    showSolution,
    setShowSolution,
    lastScore,
    setLastScore,
    navigateTo,
    setCurrentExercise,
  } = useAppStore();

  // Local state
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [sessionResults, setSessionResults] = useState<
    Record<string, { isCorrect: boolean; score: number; maxScore: number }>
  >({});

  // ── Fetch exercises on mount ──────────────────────────────

  const fetchExercises = useCallback(() => {
    if (practiceExerciseIds.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchError(null);

    try {
      const idsParam = practiceExerciseIds.join(',');
      const data = getExercises({ ids: idsParam });
      setExercises(data as Exercise[]);
    } catch {
      setFetchError('Erreur lors du chargement des exercices.');
      setExercises([]);
    } finally {
      setLoading(false);
    }
  }, [practiceExerciseIds]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  // ── Set current exercise when index/exercises change ─────

  const currentExercise = exercises[currentPracticeIndex] ?? null;

  useEffect(() => {
    if (exercises.length > 0 && currentExercise) {
      setCurrentExercise(currentExercise);
    }
    // Reset form state on exercise change
    setCurrentAnswer('');
    setGradeResult(null);
    setShowSolution(false);
    setLastScore(null);
  }, [currentPracticeIndex, exercises.length, setCurrentExercise, setShowSolution, setLastScore]);

  // ── Submit answer ─────────────────────────────────────────

  const handleSubmit = useCallback(() => {
    if (!currentExercise || submitting || gradeResult) return;

    const trimmed = currentAnswer.trim();
    if (!trimmed) return;

    setSubmitting(true);

    try {
      const data = gradeExercise(currentExercise.id, trimmed);
      setGradeResult(data);
      setLastScore({
        isCorrect: data.isCorrect,
        score: data.score,
        maxScore: data.maxScore,
      });

      // Track for session summary
      setSessionResults((prev) => ({
        ...prev,
        [currentExercise.id]: {
          isCorrect: data.isCorrect,
          score: data.score,
          maxScore: data.maxScore,
        },
      }));
    } catch {
      setGradeResult({
        isCorrect: false,
        score: 0,
        maxScore: currentExercise.points,
        correctAnswer: currentExercise.correctAnswer,
        solution: currentExercise.solution,
        questionType: currentExercise.questionType,
      });
    } finally {
      setSubmitting(false);
    }
  }, [currentExercise, submitting, gradeResult, currentAnswer, setLastScore]);

  // ── Navigation ───────────────────────────────────────────

  const goToNext = useCallback(() => {
    if (currentPracticeIndex >= exercises.length - 1) {
      // Show session summary
      const results = Object.values(sessionResults);
      const totalCompleted = results.length;
      const totalScore = results.reduce((sum, r) => sum + r.score, 0);
      const totalMaxScore = results.reduce((sum, r) => sum + r.maxScore, 0);
      setSessionSummary({ totalCompleted, totalScore, totalMaxScore });
      return;
    }
    setCurrentPracticeIndex(currentPracticeIndex + 1);
  }, [currentPracticeIndex, exercises.length, setCurrentPracticeIndex, sessionResults]);

  const goToPrev = useCallback(() => {
    if (currentPracticeIndex > 0) {
      setCurrentPracticeIndex(currentPracticeIndex - 1);
      setSessionSummary(null);
    }
  }, [currentPracticeIndex, setCurrentPracticeIndex]);

  const resetSession = useCallback(() => {
    setSessionSummary(null);
    setSessionResults({});
    setCurrentPracticeIndex(0);
  }, [setCurrentPracticeIndex]);

  // ── Derived values ───────────────────────────────────────

  const totalExercises = exercises.length;
  const progressPercent =
    totalExercises > 0 ? ((currentPracticeIndex + 1) / totalExercises) * 100 : 0;
  const subjectInfo = currentExercise
    ? SUBJECT_INFO[currentExercise.subject]
    : null;
  const difficultyInfo = currentExercise
    ? DIFFICULTY_INFO[currentExercise.difficulty]
    : null;
  const options = currentExercise ? parseOptions(currentExercise.options) : [];
  const isSubmitted = !!gradeResult;

  // ── Empty state: no exercise IDs ─────────────────────────

  if (!loading && practiceExerciseIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Aucun exercice sélectionné
        </h2>
        <p className="text-gray-500 max-w-md mb-6">
          Veuillez d&apos;abord sélectionner des exercices depuis la banque
          d&apos;exercices pour commencer la pratique.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigateTo('exercises')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Aller aux exercices
          </Button>
          <Button variant="outline" onClick={() => navigateTo('dashboard')}>
            <BookOpen className="h-4 w-4 mr-2" />
            Tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  // ── Loading state ────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6 max-w-3xl mx-auto">
        <div className="h-8 w-64 animate-pulse bg-muted rounded" />
        <div className="h-3 w-full animate-pulse bg-muted rounded" />
        <Card className="mt-6">
          <CardContent className="p-8 space-y-4">
            <div className="h-6 w-3/4 animate-pulse bg-muted rounded" />
            <div className="h-6 w-1/2 animate-pulse bg-muted rounded" />
            <div className="space-y-3 mt-6">
              <div className="h-10 w-full animate-pulse bg-muted rounded" />
              <div className="h-10 w-full animate-pulse bg-muted rounded" />
              <div className="h-10 w-full animate-pulse bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="rounded-full bg-red-50 p-4 mb-4">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Erreur de chargement
        </h2>
        <p className="text-gray-500 max-w-md mb-6">{fetchError}</p>
        <div className="flex gap-3">
          <Button onClick={fetchExercises} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
          <Button variant="outline" onClick={() => navigateTo('exercises')}>
            Retour aux exercices
          </Button>
        </div>
      </div>
    );
  }

  // ── Session summary ───────────────────────────────────────

  if (sessionSummary) {
    const percentage =
      sessionSummary.totalMaxScore > 0
        ? Math.round(
            (sessionSummary.totalScore / sessionSummary.totalMaxScore) * 100
          )
        : 0;

    return (
      <div className="space-y-6 p-4 md:p-6 max-w-3xl mx-auto">
        <Card className="border-none shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">
              🎉 Session terminée !
            </CardTitle>
            <p className="text-gray-500 mt-1">
              Voici le résumé de votre session de pratique
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score display */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-6xl font-bold text-primary">{percentage}%</div>
              <p className="text-gray-500">
                {sessionSummary.totalScore} points sur{' '}
                {sessionSummary.totalMaxScore} possibles
              </p>
            </div>

            <Separator />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {sessionSummary.totalCompleted}
                </div>
                <div className="text-sm text-gray-500">Exercices complétés</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {
                    Object.values(sessionResults).filter((r) => r.isCorrect)
                      .length
                  }
                </div>
                <div className="text-sm text-gray-500">Réponses correctes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {
                    Object.values(sessionResults).filter((r) => !r.isCorrect)
                      .length
                  }
                </div>
                <div className="text-sm text-gray-500">Réponses incorrectes</div>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button onClick={resetSession} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Recommencer
              </Button>
              <Button
                variant="outline"
                onClick={() => navigateTo('exercises')}
                className="gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Autres exercices
              </Button>
              <Button
                variant="outline"
                onClick={() => navigateTo('dashboard')}
                className="gap-2"
              >
                Tableau de bord
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Exercise not found ────────────────────────────────────

  if (!currentExercise) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="rounded-full bg-yellow-50 p-4 mb-4">
          <BookOpen className="h-8 w-8 text-yellow-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Exercice introuvable
        </h2>
        <p className="text-gray-500 max-w-md mb-6">
          L&apos;exercice demandé n&apos;a pas pu être chargé.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigateTo('exercises')}>
            Retour aux exercices
          </Button>
          <Button variant="outline" onClick={() => navigateTo('dashboard')}>
            Tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  // ── Main practice UI ─────────────────────────────────────

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-3xl mx-auto">
      {/* ── Top bar: progress + navigation ────────────────── */}
      <div className="space-y-3">
        {/* Header row */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTo('exercises')}
              className="text-gray-500 hover:text-gray-800 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour
            </Button>
            <span className="text-sm text-gray-500 font-medium">
              Exercice {currentPracticeIndex + 1} sur {totalExercises}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {subjectInfo && (
              <Badge variant="outline" className={subjectInfo.color}>
                {subjectInfo.label}
              </Badge>
            )}
            {difficultyInfo && (
              <Badge className={difficultyInfo.color}>
                {difficultyInfo.label}
              </Badge>
            )}
            <Badge variant="secondary">{currentExercise.points} pt{currentExercise.points > 1 ? 's' : ''}</Badge>
          </div>
        </div>

        {/* Progress bar */}
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* ── Question card ─────────────────────────────────── */}
      <Card className="shadow-md border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              {currentExercise.questionType === 'QCM' ? 'QCM' : 'Calcul'}
            </Badge>
            <span className="text-xs text-gray-400">{currentExercise.topic}</span>
          </div>
          <CardTitle className="text-xl leading-relaxed font-semibold text-gray-900 whitespace-pre-wrap">
            {currentExercise.question}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ── MCQ: Radio options ─────────────────────── */}
          {currentExercise.questionType === 'QCM' && options.length > 0 && (
            <RadioGroup
              value={currentAnswer}
              onValueChange={setCurrentAnswer}
              disabled={isSubmitted}
              className="space-y-3"
            >
              {options.map((option, idx) => {
                const letter = OPTION_LETTERS[idx] ?? String(idx + 1);
                return (
                  <Label
                    key={idx}
                    htmlFor={`option-${idx}`}
                    className={`
                      flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer
                      transition-all hover:bg-gray-50
                      ${currentAnswer === option ? 'border-primary bg-primary/5' : 'border-gray-200'}
                      ${isSubmitted ? 'pointer-events-none opacity-80' : ''}
                    `}
                  >
                    <RadioGroupItem
                      value={option}
                      id={`option-${idx}`}
                      disabled={isSubmitted}
                      className="mt-0.5"
                    />
                    <span className="font-semibold text-primary min-w-[1.5rem]">
                      {letter}.
                    </span>
                    <span className="text-gray-800 leading-relaxed">{option}</span>
                  </Label>
                );
              })}
            </RadioGroup>
          )}

          {/* ── CALCUL: Text input ───────────────────────── */}
          {currentExercise.questionType === 'CALCUL' && (
            <div className="space-y-2">
              <Label htmlFor="calcul-answer" className="text-sm font-medium text-gray-700">
                Votre réponse
              </Label>
              <Input
                id="calcul-answer"
                type="text"
                placeholder="Tapez votre réponse ici..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                disabled={isSubmitted}
                className="text-lg h-14"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isSubmitted && currentAnswer.trim()) {
                    handleSubmit();
                  }
                }}
              />
            </div>
          )}

          {/* ── Submit button ────────────────────────────── */}
          {!isSubmitted && (
            <Button
              onClick={handleSubmit}
              disabled={submitting || !currentAnswer.trim()}
              className="w-full gap-2 h-12 text-base font-semibold"
              size="lg"
            >
              {submitting ? (
                <>
                  <RotateCcw className="h-4 w-4 animate-spin" />
                  Correction en cours...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Soumettre
                </>
              )}
            </Button>
          )}

          {/* ── Result alert ─────────────────────────────── */}
          {gradeResult && (
            <Alert
              className={
                gradeResult.isCorrect
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : 'border-red-200 bg-red-50 text-red-800'
              }
            >
              {gradeResult.isCorrect ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <AlertDescription className="text-base">
                {gradeResult.isCorrect ? (
                  <span>
                    Correct !{' '}
                    <span className="font-bold">
                      +{gradeResult.score} pt{gradeResult.score > 1 ? 's' : ''}
                    </span>
                  </span>
                ) : (
                  <span>
                    Incorrect. La bonne réponse est :{' '}
                    <span className="font-bold">{gradeResult.correctAnswer}</span>
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* ── Show solution button ────────────────────── */}
          {gradeResult && !showSolution && (
            <Button
              variant="outline"
              onClick={() => setShowSolution(true)}
              className="w-full gap-2"
            >
              <Lightbulb className="h-4 w-4" />
              Voir la solution
            </Button>
          )}

          {/* ── Solution panel ───────────────────────────── */}
          {showSolution && (
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-amber-800">
                  <Lightbulb className="h-5 w-5" />
                  Solution détaillée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                  {gradeResult?.solution ?? currentExercise.solution}
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* ── Navigation buttons ───────────────────────── */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              onClick={goToPrev}
              disabled={currentPracticeIndex === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Précédent
            </Button>

            <Button
              variant="outline"
              onClick={() => navigateTo('dashboard')}
              className="gap-2 text-gray-500"
              size="sm"
            >
              <BookOpen className="h-4 w-4" />
              Tableau de bord
            </Button>

            <Button
              variant={currentPracticeIndex >= exercises.length - 1 ? 'default' : 'outline'}
              onClick={goToNext}
              className="gap-2"
            >
              {currentPracticeIndex >= exercises.length - 1 ? (
                <>
                  Terminer la session
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Suivant
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
