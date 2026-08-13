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

// Type for stored exam sessions
interface ExamSession {
  id: string;
  totalPoints: number;
  maxPoints: number;
  duration: number;
  startedAt: string;
  completedAt: string;
}

// Type for stored exam answers
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

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
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

// --- Route handlers ---

function handleSetup(): Response {
  return jsonResponse({
    isSeeded: true,
    exerciseCount: exercises.length,
  });
}

function handleExercises(url: string): Response {
  const searchParams = new URL(url).searchParams;
  const subject = searchParams.get('subject');
  const difficulty = searchParams.get('difficulty');
  const topic = searchParams.get('topic');
  const questionType = searchParams.get('questionType');
  const ids = searchParams.get('ids');
  const exam = searchParams.get('exam');
  const search = searchParams.get('search');

  // Fetch specific exercises by IDs
  if (ids) {
    const idList = ids.split(',');
    const matched = exercises.filter((e) => idList.includes(e.id));
    // Return in original order (by index)
    return jsonResponse(matched);
  }

  // Get random exercises for exam
  if (exam === 'true') {
    const selected: typeof exercises = [];
    for (const subj of subjects) {
      const subjExercises = exercises.filter((e) => e.subject === subj);
      const shuffled = shuffle(subjExercises);
      selected.push(...shuffled.slice(0, 4));
    }
    // Shuffle final selection
    return jsonResponse(shuffle(selected));
  }

  // Standard filtering
  let filtered = [...exercises];
  if (subject) filtered = filtered.filter((e) => e.subject === subject);
  if (difficulty) filtered = filtered.filter((e) => e.difficulty === difficulty);
  if (topic) filtered = filtered.filter((e) => e.topic === topic);
  if (questionType) filtered = filtered.filter((e) => e.questionType === questionType);
  if (search) filtered = filtered.filter((e) => e.question.includes(search));

  return jsonResponse(filtered);
}

async function handleGrade(body: { exerciseId: string; studentAnswer: string }): Promise<Response> {
  const { exerciseId, studentAnswer } = body;

  if (!exerciseId || studentAnswer === undefined || studentAnswer === null) {
    return jsonResponse({ error: 'Données manquantes' }, 400);
  }

  const exercise = exercises.find((e) => e.id === exerciseId);
  if (!exercise) {
    return jsonResponse({ error: 'Exercice non trouvé' }, 404);
  }

  // Grade
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

  // Update leaderboard for current student
  try {
    const studentName = typeof localStorage !== 'undefined' ? localStorage.getItem('prepafds_student_name') || '' : '';
    if (studentName) {
      const lbRaw = localStorage.getItem('prepafds_leaderboard');
      const lb = lbRaw ? JSON.parse(lbRaw) : [];
      const existing = lb.find((e: { studentName: string }) => e.studentName === studentName);
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
          totalPracticeCorrect: totalCorrect,
          totalPracticeDone: answers.length,
          practiceRate,
          lastActivity: new Date().toISOString(),
        });
      }
      localStorage.setItem('prepafds_leaderboard', JSON.stringify(lb));
    }
  } catch { /* silently ignore */ }

  return jsonResponse({
    isCorrect,
    score,
    maxScore: exercise.points,
    correctAnswer: exercise.correctAnswer,
    solution: exercise.solution,
    questionType: exercise.questionType,
  });
}

async function handleExam(body: { answers: { exerciseId: string; studentAnswer: string }[]; duration: number }): Promise<Response> {
  const { answers, duration } = body;

  if (!answers || !Array.isArray(answers)) {
    return jsonResponse({ error: 'Données invalides' }, 400);
  }

  const sessionId = generateId();
  let totalScore = 0;
  const maxPoints = answers.length * 4;

  const examAnswers: ExamAnswer[] = [];

  for (const answer of answers) {
    const exercise = exercises.find((e) => e.id === answer.exerciseId);
    if (!exercise) continue;

    const normalizedStudent = String(answer.studentAnswer).trim().toLowerCase();
    const normalizedCorrect = String(exercise.correctAnswer).trim().toLowerCase();
    const isCorrect = normalizedStudent === normalizedCorrect;
    const score = isCorrect ? exercise.points : 0;
    totalScore += score;

    // Save exam answer
    examAnswers.push({
      id: generateId(),
      examSessionId: sessionId,
      exerciseId: answer.exerciseId,
      studentAnswer: String(answer.studentAnswer),
      isCorrect,
      score,
    });

    // Also save as regular student answer for stats tracking
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

  // Calculate score out of 20
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

  // Update leaderboard for current student
  try {
    const studentName = typeof localStorage !== 'undefined' ? localStorage.getItem('prepafds_student_name') || '' : '';
    if (studentName) {
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
    }
  } catch { /* silently ignore */ }

  // Build results
  const results = answers.map((a) => {
    const examAns = examAnswers.find((ea) => ea.exerciseId === a.exerciseId);
    const exercise = exercises.find((e) => e.id === a.exerciseId);
    return {
      exerciseId: a.exerciseId,
      isCorrect: examAns?.isCorrect ?? false,
      score: examAns?.score ?? 0,
      correctAnswer: exercise?.correctAnswer ?? '',
    };
  });

  return jsonResponse({
    sessionId,
    totalPoints: scoreOut20,
    maxPoints: 20,
    results,
    duration,
  });
}

function handleResults(): Response {
  const answers = getStoredAnswers();
  const totalCompleted = answers.length;

  // Include exercise data in each answer (mimicking Prisma include)
  const enriched = answers.slice(-100).reverse().map((a) => {
    const exercise = exercises.find((e) => e.id === a.exerciseId);
    return {
      ...a,
      studentId: 'local-student',
      exercise: exercise || null,
    };
  });

  return jsonResponse({ answers: enriched, totalCompleted });
}

function handleStats(): Response {
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

    // Topic breakdown
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

  return jsonResponse({ subjectStats, totalCompleted });
}

function handleLeaderboard(): Response {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('prepafds_leaderboard') : null;
    const lb = raw ? JSON.parse(raw) : [];
    // Sort by best exam score desc, then practice rate desc
    const sorted = lb.sort((a: { bestExamScore: number; practiceRate: number }, b: { bestExamScore: number; practiceRate: number }) => {
      if (b.bestExamScore !== a.bestExamScore) return b.bestExamScore - a.bestExamScore;
      return b.practiceRate - a.practiceRate;
    });
    return jsonResponse({ leaderboard: sorted });
  } catch {
    return jsonResponse({ leaderboard: [] });
  }
}

// --- Fetch override (client-side only) ---

if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

  // Parse URL path (strip XTransformPort and hash)
  let urlObj: URL;
  try {
    urlObj = new URL(url, window.location.origin);
  } catch {
    return originalFetch(input, init);
  }

  const pathname = urlObj.pathname;

  // Pass through non-/api/ requests
  if (!pathname.startsWith('/api/')) {
    return originalFetch(input, init);
  }

  // Pass through /api/ai requests (needs server-side z-ai-web-dev-sdk)
  if (pathname.startsWith('/api/ai')) {
    return originalFetch(input, init);
  }

  // --- Handle local API routes ---

  // GET /api/setup
  if (pathname === '/api/setup' && (!init?.method || init.method === 'GET')) {
    return handleSetup();
  }

  // GET /api/exercises
  if (pathname === '/api/exercises' && (!init?.method || init.method === 'GET')) {
    return handleExercises(url);
  }

  // POST /api/grade
  if (pathname === '/api/grade' && init?.method === 'POST') {
    const body = init.body ? JSON.parse(init.body as string) : {};
    return handleGrade(body);
  }

  // POST /api/exam
  if (pathname === '/api/exam' && init?.method === 'POST') {
    const body = init.body ? JSON.parse(init.body as string) : {};
    return handleExam(body);
  }

  // GET /api/results
  if (pathname === '/api/results' && (!init?.method || init.method === 'GET')) {
    return handleResults();
  }

  // GET /api/stats
  if (pathname === '/api/stats' && (!init?.method || init.method === 'GET')) {
    return handleStats();
  }

  // GET /api/leaderboard
  if (pathname === '/api/leaderboard' && (!init?.method || init.method === 'GET')) {
    return handleLeaderboard();
  }

  // Fallback: pass through to original fetch
  return originalFetch(input, init);
  };
}
