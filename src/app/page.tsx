'use client';

// Import mock-api to activate client-side fetch override for exercises, grading, etc.
import '@/lib/mock-api';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Clock,
  History,
  Bot,
  Menu,
  GraduationCap,
  X,
  Info,
} from 'lucide-react';
import DashboardView from '@/components/views/DashboardView';
import CursusView from '@/components/views/CursusView';
import ExercisesView from '@/components/views/ExercisesView';
import PracticeView from '@/components/views/PracticeView';
import ExamView from '@/components/views/ExamView';
import ResultsView from '@/components/views/ResultsView';
import AIAssistantView from '@/components/views/AIAssistantView';

type ViewConfig = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: ViewConfig[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: 'cursus', label: 'Le programme FDS', icon: <Info className="h-5 w-5" /> },
  { id: 'exercises', label: 'Banque d\'exercices', icon: <BookOpen className="h-5 w-5" /> },
  { id: 'exam', label: 'Examen simulé', icon: <Clock className="h-5 w-5" /> },
  { id: 'results', label: 'Mes résultats', icon: <History className="h-5 w-5" /> },
  { id: 'ai-assistant', label: 'Assistant IA', icon: <Bot className="h-5 w-5" /> },
];

function SidebarContent({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { currentView, navigateTo } = useAppStore();

  const handleNav = (viewId: string) => {
    navigateTo(viewId as 'dashboard' | 'cursus' | 'exercises' | 'practice' | 'exam' | 'results' | 'ai-assistant');
    onNavigate(viewId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div className="p-4 flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-600 text-white">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-bold text-base leading-tight">PrépaConcours</h1>
          <p className="text-xs text-muted-foreground">Faculté des Sciences d&apos;Haïti</p>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Button
            key={item.id}
            variant={currentView === item.id ? 'secondary' : 'ghost'}
            className={`w-full justify-start gap-3 h-10 px-3 ${
              currentView === item.id
                ? 'bg-emerald-50 text-emerald-700 font-medium hover:bg-emerald-100 hover:text-emerald-700'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => handleNav(item.id)}
          >
            {item.icon}
            <span className="text-sm">{item.label}</span>
          </Button>
        ))}
      </nav>

      <Separator />

      {/* Footer */}
      <div className="p-4">
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
          <p className="text-xs font-medium text-emerald-800">Concours FDS Haïti</p>
          <p className="text-xs text-emerald-600 mt-1">
            Préparez-vous efficacement avec des exercices, des examens simulés et un assistant IA.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { currentView, sidebarOpen, setSidebarOpen, navigateTo } = useAppStore();

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'cursus':
        return <CursusView />;
      case 'exercises':
        return <ExercisesView />;
      case 'practice':
        return <PracticeView />;
      case 'exam':
        return <ExamView />;
      case 'results':
        return <ResultsView />;
      case 'ai-assistant':
        return <AIAssistantView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-border z-30">
        <SidebarContent onNavigate={() => setSidebarOpen(false)} />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
                <SidebarContent onNavigate={() => setSidebarOpen(false)} />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 text-white">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm">PrépaConcours</span>
            </div>
          </div>
          <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
            FDS Haïti
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64">
        {/* Desktop top bar */}
        <header className="hidden lg:flex items-center justify-between h-16 px-6 bg-white border-b border-border sticky top-0 z-20">
          <div>
            <h2 className="text-lg font-semibold">
              {NAV_ITEMS.find((i) => i.id === currentView)?.label || 'Tableau de bord'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Préparation Concours
            </Badge>
          </div>
        </header>

        {/* Mobile spacer */}
        <div className="lg:hidden h-14" />

        {/* View content */}
        <div className="p-4 md:p-6 lg:p-8">
          {renderView()}
        </div>
      </main>

      {/* Footer */}
      <footer className="lg:pl-64 mt-auto">
        <div className="border-t border-border bg-white px-4 py-3 md:px-6 lg:px-8">
          <p className="text-center text-xs text-muted-foreground">
            PrépaConcours FDS — Plateforme de préparation au concours d&apos;entrée de la Faculté des Sciences d&apos;Haïti
          </p>
        </div>
      </footer>
    </div>
  );
}