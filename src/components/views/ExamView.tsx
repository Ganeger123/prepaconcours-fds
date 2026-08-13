'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import type { Exercise } from '@/lib/types';
import { SUBJECT_INFO } from '@/lib/types';
import { getExercises, submitExam as submitExamApi, getExercises as getExercisesByIds } from '@/lib/client-api';
import {
  Clock,
  Send,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Home,
  RotateCcw,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// ── Constants ──────────────────────────────────────────────────

const EXAM_DURATION = 3600; // 60 minutes in seconds
const TOTAL_QUESTIONS = 20;
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

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getMotivation(score: number): string {
  if (score >= 18) return 'Excellent travail ! Vous êtes prêt(e) pour l\'examen !';
  if (score >= 14) return 'Très bon résultat ! Continuez sur cette lancée.';
  if (score >= 10) return 'Bon résultat ! Vous avez la moyenne, mais continuez à vous entraîner.';
  if (score >= 7) return 'Résultat moyen. Révisez les chapitres faibles et réessayez.';
  return 'Continuez à étudier et réessayez. La pratique fait la perfection !';
}

// ── Main Component ─────────────────────────────────────────────

export default function ExamView() {
  const isMobile = useIsMobile();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [exerciseDetails, setExerciseDetails] = useState<Map<string, Exercise>>(new Map());

  const {
    examActive,
    setExamActive,
    examExercises,
    setExamExercises,
    examAnswers,
    setExamAnswer,
    examTimeLeft,
    setExamTimeLeft,
    examSubmitted,
    setExamSubmitted,
    examScore,
    setExamScore,
    navigateTo,
  } = useAppStore();

  // ── Start Exam ─────────────────────────────────────────────

  const startExam = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      const examExercisesData = getExercises({ exam: 'true' });

      setExamExercises(examExercisesData as Exercise[]);
      setExamActive(true);
      setExamTimeLeft(EXAM_DURATION);
      setExamSubmitted(false);
      setExamScore(null);
      // Clear answers
      useAppStore.setState({ examAnswers: new Map() });
      setCurrentQuestionIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [setExamExercises, setExamActive, setExamTimeLeft, setExamSubmitted, setExamScore]);

  // ── Submit Exam ────────────────────────────────────────────

  const submitExamHandler = useCallback(() => {
    if (examSubmitted) return;

    // Stop timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setLoading(true);
    setError(null);

    try {
      const duration = EXAM_DURATION - examTimeLeft;
      const answers = examExercises.map((ex) => ({
        exerciseId: ex.id,
        studentAnswer: examAnswers.get(ex.id) ?? '',
      }));

      const data = submitExamApi(answers, duration);

      setExamScore({
        totalPoints: data.totalPoints,
        maxPoints: data.maxPoints,
        results: data.results,
      });
      setExamSubmitted(true);
      setExamActive(false);

      // Get exercise details for results display
      const ids = examExercises.map((e) => e.id).join(',');
      const exData = getExercisesByIds({ ids });
      const detailMap = new Map<string, Exercise>();
      for (const ex of exData) {
        detailMap.set(ex.id, ex as Exercise);
      }
      setExerciseDetails(detailMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [examSubmitted, examExercises, examAnswers, examTimeLeft, setExamScore, setExamSubmitted, setExamActive]);

  // ── Timer (uses ref to submitExam to avoid stale closure) ──

  const submitExamRef = useRef(submitExamHandler);
  submitExamRef.current = submitExamHandler;

  useEffect(() => {
    if (!examActive || examSubmitted) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const current = useAppStore.getState().examTimeLeft;
      if (current <= 1) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setTimeout(() => submitExamRef.current(), 0);
        return;
      }
      setExamTimeLeft(current - 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [examActive, examSubmitted, setExamTimeLeft]);

  // ── Handle Submit with Confirmation ────────────────────────

  const handleSubmitClick = useCallback(() => {
    const unanswered = examExercises.filter((ex) => !examAnswers.has(ex.id)).length;
    let message = 'Êtes-vous sûr(e) de vouloir soumettre l\'examen ?';
    if (unanswered > 0) {
      message = `Vous avez ${unanswered} question(s) sans réponse. Êtes-vous sûr(e) de vouloir soumettre l\'examen ?`;
    }
    if (window.confirm(message)) {
      submitExamHandler();
    }
  }, [examExercises, examAnswers, submitExamHandler]);

  // ── Reset Exam ─────────────────────────────────────────────

  const resetExam = useCallback(() => {
    setExamActive(false);
    setExamSubmitted(false);
    setExamScore(null);
    setExamTimeLeft(0);
    setExamExercises([]);
    useAppStore.setState({ examAnswers: new Map() });
    setExerciseDetails(new Map());
    setCurrentQuestionIndex(0);
    setError(null);
  }, [setExamActive, setExamSubmitted, setExamScore, setExamTimeLeft, setExamExercises]);

  // ── Navigate Question ──────────────────────────────────────

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < examExercises.length) {
      setCurrentQuestionIndex(index);
    }
  }, [examExercises.length]);

  // ── Derived values ─────────────────────────────────────────

  const currentExercise: Exercise | null =
    examActive && examExercises.length > 0 ? examExercises[currentQuestionIndex] ?? null : null;

  const options = currentExercise ? parseOptions(currentExercise.options) : [];

  const answeredCount = examExercises.filter((ex) => examAnswers.has(ex.id)).length;
  const progressPercent = examExercises.length > 0
    ? Math.round((answeredCount / examExercises.length) * 100)
    : 0;

  const isTimeLow = examTimeLeft < 300 && examTimeLeft > 0;

  // ── Phase 1: Setup ─────────────────────────────────────────

  if (!examActive && !examSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Simulateur d&apos;Examen</CardTitle>
            <CardDescription className="text-base">
              Préparez-vous aux conditions réelles de l&apos;examen d&apos;admission.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <span className="font-semibold text-blue-600">{TOTAL_QUESTIONS}</span>
                <span>questions</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <span className="font-semibold text-blue-600">5</span>
                <span>matières</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <span className="font-semibold text-blue-600">60</span>
                <span>minutes</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <span className="font-semibold text-blue-600">/20</span>
                <span>notation</span>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                L&apos;examen comprend 20 questions (4 par matière : Mathématiques, Physique, Chimie, Optique, Culture Générale).
                Une fois commencé, le chronomètre ne peut pas être arrêté. Soyez prêt(e) !
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={startExam}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Chargement des questions...' : 'Commencer l&apos;examen'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Phase 3: Results ───────────────────────────────────────

  if (examSubmitted && examScore) {
    const scoreValue = examScore.totalPoints;
    const passed = scoreValue >= 10;
    const percentage = examScore.maxPoints > 0
      ? Math.round((scoreValue / examScore.maxPoints) * 100)
      : 0;
    const correctCount = examScore.results.filter((r) => r.isCorrect).length;

    return (
      <div className="p-4 max-w-4xl mx-auto space-y-6">
        {/* Score Header */}
        <Card className={passed ? 'border-green-200' : 'border-red-200'}>
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-6xl font-bold" style={{ color: passed ? '#16a34a' : '#dc2626' }}>
              {scoreValue.toFixed(2)}<span className="text-2xl">/{examScore.maxPoints}</span>
            </div>
            <p className="text-lg text-muted-foreground">{getMotivation(scoreValue)}</p>
            <div className="flex justify-center gap-6 text-sm">
              <div className="text-center">
                <div className="font-semibold text-lg">{correctCount}/{examScore.results.length}</div>
                <div className="text-muted-foreground">Réponses correctes</div>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div className="text-center">
                <div className="font-semibold text-lg">{percentage}%</div>
                <div className="text-muted-foreground">Taux de réussite</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Détail des réponses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 font-medium">#</th>
                    <th className="text-left py-2 px-2 font-medium">Matière</th>
                    <th className="text-left py-2 px-2 font-medium hidden sm:table-cell">Sujet</th>
                    <th className="text-center py-2 px-2 font-medium">Statut</th>
                    <th className="text-left py-2 px-2 font-medium">Réponse correcte</th>
                  </tr>
                </thead>
                <tbody>
                  {examExercises.map((exercise, idx) => {
                    const result = examScore.results.find((r) => r.exerciseId === exercise.id);
                    const detail = exerciseDetails.get(exercise.id);
                    const isCorrect = result?.isCorrect ?? false;
                    const correctAnswer = detail?.correctAnswer ?? result?.correctAnswer ?? '—';
                    const subjectInfo = SUBJECT_INFO[exercise.subject];

                    return (
                      <tr key={exercise.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-2 px-2 font-medium">{idx + 1}</td>
                        <td className="py-2 px-2">
                          <Badge variant="outline" className={subjectInfo?.color ?? ''}>
                            {subjectInfo?.label ?? exercise.subject}
                          </Badge>
                        </td>
                        <td className="py-2 px-2 hidden sm:table-cell text-muted-foreground">
                          {exercise.topic}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                          )}
                        </td>
                        <td className="py-2 px-2 font-medium">{correctAnswer}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={resetExam}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Recommencer un examen
          </Button>
          <Button
            className="flex-1"
            onClick={() => navigateTo('dashboard')}
          >
            <Home className="w-4 h-4 mr-2" />
            Tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  // ── Phase 2: Exam in Progress ──────────────────────────────

  return (
    <div className="flex flex-col h-full">
      {/* Timer Bar */}
      <div className={`sticky top-0 z-10 px-4 py-3 border-b ${isTimeLow ? 'bg-red-50 border-red-200' : 'bg-white border-border'}`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Clock className={`w-5 h-5 ${isTimeLow ? 'text-red-600 animate-pulse' : 'text-muted-foreground'}`} />
            <span className={`text-lg font-mono font-bold ${isTimeLow ? 'text-red-600' : ''}`}>
              {formatTime(examTimeLeft)}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-1 max-w-xs">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {answeredCount}/{examExercises.length}
            </span>
            <Progress value={progressPercent} className="h-2" />
          </div>

          <Button
            variant={isTimeLow ? 'destructive' : 'default'}
            size="sm"
            onClick={handleSubmitClick}
            disabled={loading}
          >
            <Send className="w-4 h-4 mr-1" />
            Soumettre
          </Button>
        </div>
      </div>

      <div className={`flex-1 flex ${isMobile ? 'flex-col' : 'flex-row'} max-w-5xl mx-auto w-full gap-4 p-4`}
>
        {/* Question Navigation */}
        {isMobile ? (
          /* Horizontal scrollable row on mobile */
          <div className="flex gap-1.5 overflow-x-auto pb-2 shrink-0">
            {examExercises.map((ex, idx) => {
              const isAnswered = examAnswers.has(ex.id);
              const isCurrent = idx === currentQuestionIndex;

              let btnClass = 'shrink-0 w-9 h-9 text-sm font-medium rounded-md transition-colors ';
              if (isCurrent) {
                btnClass += 'bg-green-500 text-white hover:bg-green-600';
              } else if (isAnswered) {
                btnClass += 'bg-blue-500 text-white hover:bg-blue-600';
              } else {
                btnClass += 'bg-muted text-muted-foreground hover:bg-muted/80';
              }

              return (
                <button
                  key={ex.id}
                  onClick={() => goToQuestion(idx)}
                  className={btnClass}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        ) : (
          /* Sidebar on desktop */
          <Card className="w-48 shrink-0 h-fit p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
              Questions
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {examExercises.map((ex, idx) => {
                const isAnswered = examAnswers.has(ex.id);
                const isCurrent = idx === currentQuestionIndex;

                let btnClass = 'w-full aspect-square text-sm font-medium rounded-md transition-colors ';
                if (isCurrent) {
                  btnClass += 'bg-green-500 text-white hover:bg-green-600';
                } else if (isAnswered) {
                  btnClass += 'bg-blue-500 text-white hover:bg-blue-600';
                } else {
                  btnClass += 'bg-muted text-muted-foreground hover:bg-muted/80';
                }

                return (
                  <button
                    key={ex.id}
                    onClick={() => goToQuestion(idx)}
                    className={btnClass}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-green-500" /> Courante
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-500" /> Répondue
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-muted" /> Non répondues
              </div>
            </div>
          </Card>
        )}

        {/* Question Content */}
        <div className="flex-1 min-w-0">
          {currentExercise ? (
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={SUBJECT_INFO[currentExercise.subject]?.color ?? ''}>
                    {SUBJECT_INFO[currentExercise.subject]?.label ?? currentExercise.subject}
                  </Badge>
                  <Badge variant="secondary">{currentExercise.topic}</Badge>
                  <Badge variant="outline">Question {currentQuestionIndex + 1}/{examExercises.length}</Badge>
                </div>
                <CardTitle className="text-base sm:text-lg mt-3 leading-relaxed">
                  {currentExercise.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentExercise.questionType === 'QCM' && options.length > 0 ? (
                  <RadioGroup
                    value={examAnswers.get(currentExercise.id) ?? ''}
                    onValueChange={(value) => setExamAnswer(currentExercise.id, value)}
                    className="space-y-2"
                  >
                    {options.map((opt, optIdx) => {
                      const letter = OPTION_LETTERS[optIdx] ?? String(optIdx + 1);
                      return (
                        <div
                          key={optIdx}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            examAnswers.get(currentExercise.id) === opt
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-border hover:bg-muted/50'
                          }`}
                          onClick={() => setExamAnswer(currentExercise.id, opt)}
                        >
                          <RadioGroupItem value={opt} id={`option-${optIdx}`} className="mt-0.5" />
                          <Label htmlFor={`option-${optIdx}`} className="flex items-start gap-2 cursor-pointer flex-1">
                            <span className="font-semibold text-muted-foreground shrink-0">{letter}.</span>
                            <span>{opt}</span>
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="calcul-answer" className="text-sm font-medium">
                      Votre réponse (calcul) :
                    </Label>
                    <Input
                      id="calcul-answer"
                      type="text"
                      placeholder="Entrez votre réponse ici..."
                      value={examAnswers.get(currentExercise.id) ?? ''}
                      onChange={(e) => setExamAnswer(currentExercise.id, e.target.value)}
                      className="text-lg"
                    />
                  </div>
                )}

                <Separator />

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => goToQuestion(currentQuestionIndex - 1)}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Précédent
                  </Button>

                  <span className="text-sm text-muted-foreground">
                    {answeredCount}/{examExercises.length} répondues
                  </span>

                  {currentQuestionIndex < examExercises.length - 1 ? (
                    <Button
                      onClick={() => goToQuestion(currentQuestionIndex + 1)}
                    >
                      Suivant
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmitClick}
                      disabled={loading}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Soumettre l&apos;examen
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center text-muted-foreground">
                <p>Chargement de la question...</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 max-w-5xl mx-auto">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
