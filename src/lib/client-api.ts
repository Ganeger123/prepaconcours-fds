'use client';

import { exercises, subjects } from './exercises-data';

// Type for stored student answers
interface StoredAnswer {
  id: string;
  exerciseId: string;
  studentAnswer: string;
  isCorrect: boolean;
  score: number;
  createdAt: string;
}

interface ExamSession {
  id: string;
  totalPoints: number;
  maxPoints: number;
  duration: number;
  startedAt: string;
  completedAt: string;
}

interface ExamAnswer {
  id: string;
  examSessionId: string;
  exerciseId: string;
  studentAnswer: string;
  isCorrect: boolean;
  score: number;
}

// localStorage helpers
function getStoredAnswers(): StoredAnswer[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('prepafds_student_answers');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredAnswers(answers: StoredAnswer[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('prepafds_student_answers', JSON.stringify(answers));
}

function getExamSessions(): ExamSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('prepafds_exam_sessions');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveExamSessions(sessions: ExamSession[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('prepafds_exam_sessions', JSON.stringify(sessions));
}

function getExamAnswers(): ExamAnswer[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('prepafds_exam_answers');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveExamAnswers(answers: ExamAnswer[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('prepafds_exam_answers', JSON.stringify(answers));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

// Shuffle helper (Fisher-Yates)
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Update leaderboard helper
function updateLeaderboard(scoreOut20: number, sessions: ExamSession[]): void {
  try {
    const studentName = typeof localStorage !== 'undefined' ? localStorage.getItem('prepafds_student_name') || '' : '';
    if (!studentName) return;
    const lbRaw = localStorage.getItem('prepafds_leaderboard');
    const lb = lbRaw ? JSON.parse(lbRaw) : [];
    const existing = lb.find((e: { studentName: string }) => e.studentName === studentName);
    const allAnswers = getStoredAnswers();
    const totalCorrect = allAnswers.filter((a) => a.isCorrect).length;
    const bestExam = sessions.length > 0 ? Math.max(...sessions.map((s: { totalPoints: number }) => s.totalPoints)) : scoreOut20;
    const avgExam = sessions.length > 0 ? sessions.reduce((sum: number, s: { totalPoints: number }) => sum + s.totalPoints, 0) / sessions.length : scoreOut20;
    const practiceRate = allAnswers.length > 0 ? Math.round((totalCorrect / allAnswers.length) * 100) : 0;
    if (existing) {
      existing.bestExamScore = Math.max(existing.bestExamScore, scoreOut20);
      existing.examCount = sessions.length;
      existing.avgExamScore = Math.round(avgExam * 100) / 100;
      existing.totalPracticeCorrect = totalCorrect;
      existing.totalPracticeDone = allAnswers.length;
      existing.practiceRate = practiceRate;
      existing.lastActivity = new Date().toISOString();
    } else {
      lb.push({
        studentName,
        bestExamScore: scoreOut20,
        examCount: sessions.length,
        avgExamScore: Math.round(avgExam * 100) / 100,
        totalPracticeCorrect: totalCorrect,
        totalPracticeDone: allAnswers.length,
        practiceRate,
        lastActivity: new Date().toISOString(),
      });
    }
    localStorage.setItem('prepafds_leaderboard', JSON.stringify(lb));
  } catch { /* silently ignore */ }
}

function updateLeaderboardForPractice(): void {
  try {
    const studentName = typeof localStorage !== 'undefined' ? localStorage.getItem('prepafds_student_name') || '' : '';
    if (!studentName) return;
    const lbRaw = localStorage.getItem('prepafds_leaderboard');
    const lb = lbRaw ? JSON.parse(lbRaw) : [];
    const existing = lb.find((e: { studentName: string }) => e.studentName === studentName);
    const answers = getStoredAnswers();
    const totalCorrect = answers.filter((a) => a.isCorrect).length;
    const practiceRate = answers.length > 0 ? Math.round((totalCorrect / answers.length) * 100) : 0;
    if (existing) {
      existing.totalPracticeCorrect = totalCorrect;
      existing.totalPracticeDone = answers.length;
      existing.practiceRate = practiceRate;
      existing.lastActivity = new Date().toISOString();
    } else {
      lb.push({
        studentName,
        bestExamScore: 0,
        examCount: 0,
        avgExamScore: 0,
        totalPracticeCorrect,
        totalPracticeDone: answers.length,
        practiceRate,
        lastActivity: new Date().toISOString(),
      });
    }
    localStorage.setItem('prepafds_leaderboard', JSON.stringify(lb));
  } catch { /* silently ignore */ }
}

// ===================== PUBLIC API =====================

export function getSetup() {
  return {
    isSeeded: true,
    exerciseCount: exercises.length,
  };
}

export interface GetExercisesParams {
  subject?: string;
  difficulty?: string;
  topic?: string;
  questionType?: string;
  ids?: string;
  exam?: string;
  search?: string;
}

export function getExercises(params: GetExercisesParams = {}) {
  const { subject, difficulty, topic, questionType, ids, exam, search } = params;

  // Fetch specific exercises by IDs
  if (ids) {
    const idList = ids.split(',');
    return exercises.filter((e) => idList.includes(e.id));
  }

  // Get random exercises for exam
  if (exam === 'true') {
    const selected: typeof exercises = [];
    for (const subj of subjects) {
      const subjExercises = exercises.filter((e) => e.subject === subj);
      const shuffled = shuffle(subjExercises);
      selected.push(...shuffled.slice(0, 4));
    }
    return shuffle(selected);
  }

  // Standard filtering
  let filtered = [...exercises];
  if (subject) filtered = filtered.filter((e) => e.subject === subject);
  if (difficulty) filtered = filtered.filter((e) => e.difficulty === difficulty);
  if (topic) filtered = filtered.filter((e) => e.topic === topic);
  if (questionType) filtered = filtered.filter((e) => e.questionType === questionType);
  if (search) filtered = filtered.filter((e) => e.question.includes(search));

  return filtered;
}

export interface GradeResult {
  isCorrect: boolean;
  score: number;
  maxScore: number;
  correctAnswer: string;
  solution: string;
  questionType: string;
}

export function gradeExercise(exerciseId: string, studentAnswer: string): GradeResult {
  const exercise = exercises.find((e) => e.id === exerciseId);
  if (!exercise) {
    throw new Error('Exercice non trouvé');
  }

  const normalizedStudent = String(studentAnswer).trim().toLowerCase();
  const normalizedCorrect = String(exercise.correctAnswer).trim().toLowerCase();
  const isCorrect = normalizedStudent === normalizedCorrect;
  const score = isCorrect ? exercise.points : 0;

  // Save to localStorage
  const answers = getStoredAnswers();
  answers.push({
    id: generateId(),
    exerciseId,
    studentAnswer: String(studentAnswer),
    isCorrect,
    score,
    createdAt: new Date().toISOString(),
  });
  saveStoredAnswers(answers);

  // Update leaderboard
  updateLeaderboardForPractice();

  return {
    isCorrect,
    score,
    maxScore: exercise.points,
    correctAnswer: exercise.correctAnswer,
    solution: exercise.solution,
    questionType: exercise.questionType,
  };
}

export interface ExamResult {
  sessionId: string;
  totalPoints: number;
  maxPoints: number;
  results: {
    exerciseId: string;
    isCorrect: boolean;
    score: number;
    correctAnswer: string;
  }[];
  duration: number;
}

export function submitExam(
  answersList: { exerciseId: string; studentAnswer: string }[],
  duration: number
): ExamResult {
  if (!answersList || !Array.isArray(answersList)) {
    throw new Error('Données invalides');
  }

  const sessionId = generateId();
  let totalScore = 0;
  const maxPoints = answersList.length * 4;

  const examAnswers: ExamAnswer[] = [];

  for (const answer of answersList) {
    const exercise = exercises.find((e) => e.id === answer.exerciseId);
    if (!exercise) continue;

    const normalizedStudent = String(answer.studentAnswer).trim().toLowerCase();
    const normalizedCorrect = String(exercise.correctAnswer).trim().toLowerCase();
    const isCorrect = normalizedStudent === normalizedCorrect;
    const score = isCorrect ? exercise.points : 0;
    totalScore += score;

    examAnswers.push({
      id: generateId(),
      examSessionId: sessionId,
      exerciseId: answer.exerciseId,
      studentAnswer: String(answer.studentAnswer),
      isCorrect,
      score,
    });

    // Also save as regular student answer
    const storedAnswers = getStoredAnswers();
    storedAnswers.push({
      id: generateId(),
      exerciseId: answer.exerciseId,
      studentAnswer: String(answer.studentAnswer),
      isCorrect,
      score,
      createdAt: new Date().toISOString(),
    });
    saveStoredAnswers(storedAnswers);
  }

  const scoreOut20 = maxPoints > 0 ? Math.round((totalScore / maxPoints) * 20 * 100) / 100 : 0;

  // Save exam session
  const sessions = getExamSessions();
  sessions.push({
    id: sessionId,
    totalPoints: scoreOut20,
    maxPoints: 20,
    duration,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  });
  saveExamSessions(sessions);

  // Save exam answers
  const allExamAnswers = getExamAnswers();
  allExamAnswers.push(...examAnswers);
  saveExamAnswers(allExamAnswers);

  // Update leaderboard
  updateLeaderboard(scoreOut20, sessions);

  // Build results
  const results = answersList.map((a) => {
    const examAns = examAnswers.find((ea) => ea.exerciseId === a.exerciseId);
    const exercise = exercises.find((e) => e.id === a.exerciseId);
    return {
      exerciseId: a.exerciseId,
      isCorrect: examAns?.isCorrect ?? false,
      score: examAns?.score ?? 0,
      correctAnswer: exercise?.correctAnswer ?? '',
    };
  });

  return {
    sessionId,
    totalPoints: scoreOut20,
    maxPoints: 20,
    results,
    duration,
  };
}

export interface ResultRecord {
  id: string;
  exerciseId: string;
  studentAnswer: string;
  isCorrect: boolean;
  score: number;
  createdAt: string;
  studentId: string;
  exercise: (typeof exercises)[0] | null;
}

export function getResults(): { answers: ResultRecord[]; totalCompleted: number } {
  const answers = getStoredAnswers();
  const totalCompleted = answers.length;

  const enriched: ResultRecord[] = answers.slice(-100).reverse().map((a) => {
    const exercise = exercises.find((e) => e.id === a.exerciseId);
    return {
      ...a,
      studentId: 'local-student',
      exercise: exercise || null,
    };
  });

  return { answers: enriched, totalCompleted };
}

export interface SubjectStat {
  subject: string;
  totalExercises: number;
  correctAnswers: number;
  averageScore: number;
  topicBreakdown: {
    topic: string;
    total: number;
    correct: number;
    avgScore: number;
  }[];
}

export function getStats(): { subjectStats: SubjectStat[]; totalCompleted: number } {
  const answers = getStoredAnswers();
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

    const topicMap = new Map<string, { total: number; correct: number; score: number; maxScore: number }>();
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

    const topicBreakdown = Array.from(topicMap.entries()).map(([topic, data]) => ({
      topic,
      total: data.total,
      correct: data.correct,
      avgScore: data.maxScore > 0 ? Math.round((data.score / data.maxScore) * 20 * 100) / 100 : 0,
    }));

    return {
      subject,
      totalExercises,
      correctAnswers,
      averageScore: Math.round(averageScore * 100) / 100,
      topicBreakdown,
    };
  });

  return { subjectStats, totalCompleted };
}
