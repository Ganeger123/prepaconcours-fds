import { exercises, type Exercise } from './exercises-data';

export interface StoredAnswer {
  id: string;
  exerciseId: string;
  studentAnswer: string;
  isCorrect: boolean;
  score: number;
  createdAt: string;
}

const COOKIE_NAME = 'prepafds_data';
const MAX_ANSWERS = 100;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find((e) => e.id === id);
}

function parseCookieHeader(cookieHeader: string | null): StoredAnswer[] {
  if (!cookieHeader) return [];
  try {
    const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    if (!match) return [];
    const raw = decodeURIComponent(match[1]);
    return JSON.parse(raw) as StoredAnswer[];
  } catch {
    return [];
  }
}

function buildCookieValue(answers: StoredAnswer[]): string {
  // Keep only last MAX_ANSWERS to stay within ~4KB cookie limit
  const trimmed = answers.slice(-MAX_ANSWERS);
  return `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(trimmed))}; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365}`; // 1 year
}

export function readStoredAnswers(request: Request): StoredAnswer[] {
  const cookieHeader = request.headers.get('cookie');
  return parseCookieHeader(cookieHeader);
}

export function appendStoredAnswers(
  request: Request,
  newAnswers: Omit<StoredAnswer, 'id' | 'createdAt'>[]
): { updatedAnswers: StoredAnswer[]; cookieHeader: string } {
  const existing = readStoredAnswers(request);
  const now = new Date().toISOString();
  const withIds = newAnswers.map((a) => ({
    ...a,
    id: generateId(),
    createdAt: now,
  }));
  const merged = [...existing, ...withIds];
  const trimmed = merged.slice(-MAX_ANSWERS);
  return {
    updatedAnswers: trimmed,
    cookieHeader: buildCookieValue(trimmed),
  };
}

export function gradeAnswer(exerciseId: string, studentAnswer: string): {
  isCorrect: boolean;
  score: number;
  maxScore: number;
  correctAnswer: string;
  solution: string;
  questionType: string;
} | { error: string; status: number } {
  const exercise = exercises.find((e) => e.id === exerciseId);
  if (!exercise) {
    return { error: 'Exercice non trouvé', status: 404 };
  }

  const normalizedStudent = String(studentAnswer).trim().toLowerCase();
  const normalizedCorrect = String(exercise.correctAnswer).trim().toLowerCase();
  const isCorrect = normalizedStudent === normalizedCorrect;
  const score = isCorrect ? exercise.points : 0;

  return {
    isCorrect,
    score,
    maxScore: exercise.points,
    correctAnswer: exercise.correctAnswer,
    solution: exercise.solution,
    questionType: exercise.questionType,
  };
}

export function filterExercises(params: URLSearchParams): Exercise[] {
  const ids = params.get('ids');
  const exam = params.get('exam');
  const subject = params.get('subject');
  const difficulty = params.get('difficulty');
  const topic = params.get('topic');
  const questionType = params.get('questionType');
  const search = params.get('search');

  // Fetch specific exercises by IDs
  if (ids) {
    const idList = ids.split(',');
    return exercises.filter((e) => idList.includes(e.id));
  }

  // Get random exercises for exam mode (4 per subject, 20 total)
  if (exam === 'true') {
    const selected: Exercise[] = [];
    for (const subj of ['MATHEMATIQUES', 'PHYSIQUE', 'CHIMIE', 'OPTIQUE', 'CULTURE_GENERALE'] as const) {
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
