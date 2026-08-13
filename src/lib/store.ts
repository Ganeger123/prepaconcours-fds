import { create } from 'zustand';
import type { ViewName, Exercise, SubjectStats, AIChatMessage } from './types';

interface AppState {
  // Navigation
  currentView: ViewName;
  setCurrentView: (view: ViewName) => void;
  previousView: ViewName | null;
  navigateTo: (view: ViewName) => void;

  // Exercise practice
  currentExercise: Exercise | null;
  setCurrentExercise: (exercise: Exercise | null) => void;
  practiceExerciseIds: string[];
  setPracticeExerciseIds: (ids: string[]) => void;
  currentPracticeIndex: number;
  setCurrentPracticeIndex: (index: number) => void;
  showSolution: boolean;
  setShowSolution: (show: boolean) => void;
  lastScore: { score: number; maxScore: number; isCorrect: boolean } | null;
  setLastScore: (score: { score: number; maxScore: number; isCorrect: boolean } | null) => void;

  // Exam
  examActive: boolean;
  setExamActive: (active: boolean) => void;
  examExercises: Exercise[];
  setExamExercises: (exercises: Exercise[]) => void;
  examAnswers: Map<string, string>;
  setExamAnswer: (exerciseId: string, answer: string) => void;
  examTimeLeft: number;
  setExamTimeLeft: (time: number) => void;
  examSubmitted: boolean;
  setExamSubmitted: (submitted: boolean) => void;
  examScore: { totalPoints: number; maxPoints: number; results: { exerciseId: string; isCorrect: boolean; score: number; correctAnswer: string }[] } | null;
  setExamScore: (score: { totalPoints: number; maxPoints: number; results: { exerciseId: string; isCorrect: boolean; score: number; correctAnswer: string }[] } | null) => void;

  // Dashboard
  subjectStats: SubjectStats[];
  setSubjectStats: (stats: SubjectStats[]) => void;
  totalExercisesCompleted: number;
  setTotalExercisesCompleted: (n: number) => void;

  // AI Chat
  aiMessages: AIChatMessage[];
  setAiMessages: (messages: AIChatMessage[]) => void;
  addAiMessage: (message: AIChatMessage) => void;
  aiLoading: boolean;
  setAiLoading: (loading: boolean) => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Auth
  studentName: string;
  setStudentName: (name: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentView: 'dashboard',
  setCurrentView: (view) => set({ currentView: view }),
  previousView: null,
  navigateTo: (view) =>
    set((state) => ({
      previousView: state.currentView,
      currentView: view,
      sidebarOpen: false,
    })),

  // Exercise practice
  currentExercise: null,
  setCurrentExercise: (exercise) => set({ currentExercise: exercise, showSolution: false, lastScore: null }),
  practiceExerciseIds: [],
  setPracticeExerciseIds: (ids) => set({ practiceExerciseIds: ids }),
  currentPracticeIndex: 0,
  setCurrentPracticeIndex: (index) => set({ currentPracticeIndex: index }),
  showSolution: false,
  setShowSolution: (show) => set({ showSolution: show }),
  lastScore: null,
  setLastScore: (score) => set({ lastScore: score }),

  // Exam
  examActive: false,
  setExamActive: (active) => set({ examActive: active }),
  examExercises: [],
  setExamExercises: (exercises) => set({ examExercises: exercises }),
  examAnswers: new Map(),
  setExamAnswer: (exerciseId, answer) =>
    set((state) => {
      const newMap = new Map(state.examAnswers);
      newMap.set(exerciseId, answer);
      return { examAnswers: newMap };
    }),
  examTimeLeft: 0,
  setExamTimeLeft: (time) => set({ examTimeLeft: time }),
  examSubmitted: false,
  setExamSubmitted: (submitted) => set({ examSubmitted: submitted }),
  examScore: null,
  setExamScore: (score) => set({ examScore: score }),

  // Dashboard
  subjectStats: [],
  setSubjectStats: (stats) => set({ subjectStats: stats }),
  totalExercisesCompleted: 0,
  setTotalExercisesCompleted: (n) => set({ totalExercisesCompleted: n }),

  // AI Chat
  aiMessages: [],
  setAiMessages: (messages) => set({ aiMessages: messages }),
  addAiMessage: (message) =>
    set((state) => ({ aiMessages: [...state.aiMessages, message] })),
  aiLoading: false,
  setAiLoading: (loading) => set({ aiLoading: loading }),

  // Sidebar
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Auth
  studentName: typeof window !== 'undefined' ? localStorage.getItem('prepafds_student_name') || '' : '',
  setStudentName: (name) => { localStorage.setItem('prepafds_student_name', name); set({ studentName: name }); },
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('prepafds_student_name') : false,
  setIsAuthenticated: (auth) => set({ isAuthenticated: auth }),
  logout: () => { localStorage.removeItem('prepafds_student_name'); set({ isAuthenticated: false, studentName: '' }); },
}));
