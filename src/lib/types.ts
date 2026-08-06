// ===================== Type Definitions =====================

export type Subject =
  | 'MATHEMATIQUES'
  | 'PHYSIQUE'
  | 'CHIMIE'
  | 'OPTIQUE'
  | 'CULTURE_GENERALE';

export type Difficulty = 'FACILE' | 'MOYEN' | 'DIFFICILE';

export type QuestionType = 'QCM' | 'CALCUL';

export type ViewName =
  | 'dashboard'
  | 'cursus'
  | 'exercises'
  | 'practice'
  | 'exam'
  | 'results'
  | 'ai-assistant';

export interface Exercise {
  id: string;
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  questionType: QuestionType;
  question: string;
  options: string | null;
  correctAnswer: string;
  solution: string;
  points: number;
}

export interface StudentAnswerRecord {
  id: string;
  studentId: string;
  exerciseId: string;
  studentAnswer: string;
  isCorrect: boolean;
  score: number;
  createdAt: string;
  exercise: Exercise;
}

export interface ExamSession {
  id: string;
  studentId: string;
  totalPoints: number;
  maxPoints: number;
  duration: number;
  startedAt: string;
  completedAt: string | null;
  answers: ExamAnswerRecord[];
}

export interface ExamAnswerRecord {
  id: string;
  examSessionId: string;
  exerciseId: string;
  studentAnswer: string;
  isCorrect: boolean;
  score: number;
}

export interface SubjectStats {
  subject: Subject;
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

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Subject display info
export const SUBJECT_INFO: Record<
  Subject,
  { label: string; icon: string; color: string; topics: string[] }
> = {
  MATHEMATIQUES: {
    label: 'Mathématiques',
    icon: 'Calculator',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    topics: ['Algèbre', 'Géométrie', 'Géométrie analytique', 'Trigonométrie', 'Analyse', 'Limites', 'Probabilités', 'Suites numériques', 'Nombres complexes'],
  },
  PHYSIQUE: {
    label: 'Physique',
    icon: 'Atom',
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    topics: ['Mécanique', 'Électricité', 'Thermodynamique'],
  },
  CHIMIE: {
    label: 'Chimie',
    icon: 'FlaskConical',
    color: 'text-violet-600 bg-violet-50 border-violet-200',
    topics: ['Atomistique', 'Chimie organique', 'Solutions', 'Réactions chimiques'],
  },
  OPTIQUE: {
    label: 'Optique',
    icon: 'Eye',
    color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    topics: ['Réflexion', 'Réfraction', 'Lentilles'],
  },
  CULTURE_GENERALE: {
    label: 'Culture Générale',
    icon: 'Globe',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    topics: ['Histoire d\'Haïti', 'Géographie', 'Culture générale'],
  },
};

export const DIFFICULTY_INFO: Record<
  Difficulty,
  { label: string; color: string; stars: number }
> = {
  FACILE: { label: 'Facile', color: 'bg-green-100 text-green-700', stars: 1 },
  MOYEN: { label: 'Moyen', color: 'bg-yellow-100 text-yellow-700', stars: 2 },
  DIFFICILE: { label: 'Difficile', color: 'bg-red-100 text-red-700', stars: 3 },
};

export const ALL_SUBJECTS: Subject[] = [
  'MATHEMATIQUES',
  'PHYSIQUE',
  'CHIMIE',
  'OPTIQUE',
  'CULTURE_GENERALE',
];

export const ALL_DIFFICULTIES: Difficulty[] = ['FACILE', 'MOYEN', 'DIFFICILE'];
