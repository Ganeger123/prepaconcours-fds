'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAppStore } from '@/lib/store';
import {
  GraduationCap,
  BookOpen,
  Clock,
  Trophy,
  Target,
  Lightbulb,
  Calculator,
  Atom,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  FileText,
  Brain,
  History,
  MapPin,
} from 'lucide-react';

// ── Real FDS data (from fds.edu.ht, admission.ueh.edu.ht, editions-jpl.com) ──

interface Epreuve {
  nom: string;
  duree: string;
  description: string;
  sujets: string[];
  icon: React.ReactNode;
  couleur: string;
  ponderation: string;
}

interface Filiere {
  nom: string;
  diplome: string;
  duree: string;
  description: string;
  debouches: string[];
}

const EPREUVES: Epreuve[] = [
  {
    nom: 'Mathématiques',
    duree: '3 heures',
    description:
      "Cette épreuve est la plus pondérée du concours. Elle porte sur le programme de mathématiques de la dernière année de secondaire (Terminale/Philo). Les questions exigent une maîtrise solide du calcul algébrique, de l'analyse de fonctions et de la géométrie analytique.",
    sujets: [
      'Algèbre : équations, inéquations, systèmes, polynômes, fractions rationnelles',
      'Géométrie analytique : droite, cercle, parabole, ellipse, hyperbole dans le plan cartésien',
      'Analyse : limites, continuité, dérivées, études de fonctions, intégrales',
      'Trigonométrie : fonctions trigonométriques, identités, équations',
      'Suites numériques : arithmétiques, géométriques, récurrentes',
      'Probabilités et combinatoire : dénombrement, probabilités conditionnelles',
      'Logique et raisonnement : ensembles, applications, preuves',
      'Nombres complexes : opérations, forme trigonométrique et exponentielle',
    ],
    icon: <Calculator className="h-6 w-6" />,
    couleur: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    ponderation: 'Part la plus importante',
  },
  {
    nom: 'Physique-Chimie',
    duree: '2 heures',
    description:
      "Cette épreuve évalue les connaissances en sciences de la matière. Elle couvre la physique et la chimie du programme secondaire. Les exercices nécessitent de savoir appliquer les lois fondamentales et de résoudre des problèmes quantitatifs.",
    sujets: [
      "Mécanique : lois de Newton, énergie cinétique et potentielle, mouvement projectile",
      "Électricité : loi d'Ohm, circuits (série/parallèle), puissance électrique",
      "Thermodynamique : calorimétrie, gaz parfaits, changements d'état",
      'Optique : réflexion, réfraction, lentilles convergentes et divergentes',
      'Chimie générale : atomistique, classification périodique, liaisons chimiques',
      'Chimie organique : hydrocarbures, groupes fonctionnels, nomenclature',
      'Solutions : concentration molaire, dilution, pH',
      'Réactions chimiques : équilibrage, stœchiométrie, oxydoréduction',
    ],
    icon: <Atom className="h-6 w-6" />,
    couleur: 'text-orange-600 bg-orange-50 border-orange-200',
    ponderation: 'Sciences de la Matière',
  },
  {
    nom: 'Analyse de texte et Logique',
    duree: '2 heures',
    description:
      "Cette épreuve teste la capacité de raisonnement, la compréhension de texte et la logique formelle. Elle comprend généralement un texte à analyser suivi de questions, et des exercices de logique mathématique.",
    sujets: [
      "Compréhension et analyse d'un texte en français",
      "Logique formelle : propositions, implications, contraposées, raisonnements par l'absurde",
      'Syllogismes et validité d\'arguments',
      "Culture générale : histoire d'Haïti, géographie, institutions",
      'Français : grammaire, vocabulaire, expression écrite',
    ],
    icon: <Brain className="h-6 w-6" />,
    couleur: 'text-violet-600 bg-violet-50 border-violet-200',
    ponderation: 'Capacités logiques et linguistiques',
  },
];

const FILIERES: Filiere[] = [
  {
    nom: 'Génie Civil',
    diplome: 'Ingénieur',
    duree: '5 ans',
    description:
      "Formation d'ingénieurs qualifiés dans le domaine du bâtiment et des travaux publics. Les deux premières années fournissent une formation scientifique de base solide en mathématiques, physique et informatique.",
    debouches: [
      'Ingénieur en génie civil',
      "Bureau d'études techniques",
      'Entreprise de construction (BTP)',
      'Administration publique (MTPTC)',
      'Enseignement supérieur',
    ],
  },
  {
    nom: 'Génie Électronique',
    diplome: 'Ingénieur',
    duree: '5 ans',
    description:
      "Formation spécialisée dans les systèmes électroniques, la télécommunication et l'automatisme. Combine théorie et pratique avec des travaux de laboratoire.",
    debouches: [
      'Ingénieur en électronique',
      'Industrie des télécommunications',
      'Automatisme et instrumentation',
      'Systèmes embarqués',
    ],
  },
  {
    nom: 'Génie Électromécanique',
    diplome: 'Ingénieur',
    duree: '5 ans',
    description:
      "Formation d'ingénieurs dans les domaines de l'électricité, de la mécanique et de l'énergie. Prépare aux défis énergétiques d'Haïti.",
    debouches: [
      'Ingénieur électromécanicien',
      'Secteur énergétique (EDH)',
      'Maintenance industrielle',
      'Énergies renouvelables',
    ],
  },
  {
    nom: 'Topographie',
    diplome: 'Technicien supérieur',
    duree: '3 ans',
    description:
      "Formation technique dans les méthodes de mesure et de représentation du territoire. Compétences en levés cadastraux, cartographie et SIG.",
    debouches: [
      'Géomètre-topographe',
      'Cadastre national',
      "Bureaux d'études foncières",
      'Aménagement du territoire',
    ],
  },
  {
    nom: 'Licence en Chimie',
    diplome: 'Licence',
    duree: '4 ans',
    description:
      "Formation approfondie en chimie générale, organique, minérale et analytique. Les deux premières années offrent une formation générale en mathématiques, physique, informatique et biologie.",
    debouches: [
      'Industrie chimique et pharmaceutique',
      "Laboratoire d'analyse",
      'Enseignement',
      'Recherche scientifique',
      "Master en chimie (FDS ou à l'étranger)",
    ],
  },
];

const CONSEILS = [
  {
    titre: 'Maîtrisez les bases en mathématiques',
    description:
      "L'épreuve de mathématiques est déterminante. Concentrez-vous sur l'algèbre, l'analyse de fonctions (limites, dérivées, intégrales) et la géométrie analytique. Pratiquez régulièrement avec des annales des années précédentes.",
    icon: <Target className="h-5 w-5 text-emerald-600" />,
  },
  {
    titre: 'Pratiquez les annales du concours',
    description:
      "Les annales des concours précédents (2004, 2005, 2006, 2007...) sont disponibles en ligne. Elles vous familiariseront avec le style de questions et le niveau attendu. Le concours porte sur le programme du secondaire, donc révisez vos cours de Philo.",
    icon: <FileText className="h-5 w-5 text-orange-600" />,
  },
  {
    titre: 'Ne négligez pas la physique-chimie',
    description:
      "Beaucoup de candidats se concentrent uniquement sur les maths. La physique-chimie compte aussi ! Révisez les lois de Newton, l'électricité, la thermodynamique, l'optique et la chimie générale et organique.",
    icon: <Atom className="h-5 w-5 text-violet-600" />,
  },
  {
    titre: "Préparez votre dossier à l'avance",
    description:
      "Le concours est ouvert aux titulaires du Baccalauréat II (toutes sections). Assurez-vous d'avoir tous les documents requis : extrait de naissance, diplôme du BAC II, copies certifiées, photos d'identité. Le dépôt se fait au Bureau des Mines et Géologie (Delmas 31) ou au campus.",
    icon: <Calendar className="h-5 w-5 text-cyan-600" />,
  },
  {
    titre: 'Entraînez-vous au raisonnement logique',
    description:
      "L'épreuve d'analyse de texte et logique est souvent sous-estimée. Pratiquez les syllogismes, les implications et les contraposées. Améliorez votre compréhension de texte en français et votre culture générale (histoire d'Haïti, géographie).",
    icon: <Brain className="h-5 w-5 text-amber-600" />,
  },
  {
    titre: "Gérez votre temps le jour de l'examen",
    description:
      "L'épreuve de maths dure 3 heures. Commencez par les exercices que vous maîtrisez le mieux pour gagner des points rapidement. Ne restez pas bloqué trop longtemps sur une question difficile. Vérifiez toujours vos calculs si le temps le permet.",
    icon: <Clock className="h-5 w-5 text-red-600" />,
  },
];

// ── Tabs ──

type Tab = 'presentation' | 'epreuves' | 'filieres' | 'conseils';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'presentation', label: 'La FDS', icon: <GraduationCap className="h-4 w-4" /> },
  { id: 'epreuves', label: 'Épreuves', icon: <FileText className="h-4 w-4" /> },
  { id: 'filieres', label: 'Filières', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'conseils', label: 'Conseils', icon: <Lightbulb className="h-4 w-4" /> },
];

export default function CursusView() {
  const [activeTab, setActiveTab] = useState<Tab>('presentation');

  return (
    <div className="space-y-6">
      {/* Tab navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            size="sm"
            className={`whitespace-nowrap gap-2 ${activeTab === tab.id ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'presentation' && <PresentationTab />}
      {activeTab === 'epreuves' && <EpreuvesTab />}
      {activeTab === 'filieres' && <FiliereTab />}
      {activeTab === 'conseils' && <ConseilsTab />}
    </div>
  );
}

// ── Presentation Tab ──

function PresentationTab() {
  return (
    <div className="space-y-6">
      {/* Hero card */}
      <Card className="border-none shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 p-6 md:p-8 text-white">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20">
              <GraduationCap className="h-9 w-9" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Faculté des Sciences (FDS)</h2>
              <p className="text-emerald-100 mt-1">Université d'État d'Haïti (UEH)</p>
              <p className="text-emerald-200/80 text-sm mt-2">
                Fondée en 1902 — L'un des plus anciens établissements d'enseignement supérieur en Haïti
              </p>
            </div>
          </div>
        </div>
        <CardContent className="p-6 md:p-8 space-y-4">
          <p className="text-gray-700 leading-relaxed">
            La Faculté des Sciences (FDS) de l'UEH est un pilier de l'enseignement scientifique en Haïti. Créée en 1902 par un groupe de six professionnels haïtiens sous le nom d'«École des Sciences Appliquées», elle a grandement contribué au développement des infrastructures du pays par la formation d'ingénieurs hautement qualifiés qui ont servi à plusieurs niveaux, tant dans l'administration publique que dans le secteur privé.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Aujourd'hui, la FDS offre des formations d'ingénieurs et de licence dans plusieurs domaines scientifiques et techniques. Le concours d'admission est ouvert à tous les titulaires du Baccalauréat II (toutes sections) et se déroule annuellement, généralement entre décembre et janvier.
          </p>
        </CardContent>
      </Card>

      {/* Key facts grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <History className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">1902</div>
          <div className="text-xs text-gray-500 mt-1">Année de fondation</div>
        </Card>
        <Card className="text-center p-4">
          <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">~100</div>
          <div className="text-xs text-gray-500 mt-1">Places par année</div>
        </Card>
        <Card className="text-center p-4">
          <FileText className="h-8 w-8 text-violet-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">3</div>
          <div className="text-xs text-gray-500 mt-1">Épreuves écrites</div>
        </Card>
        <Card className="text-center p-4">
          <BookOpen className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">5</div>
          <div className="text-xs text-gray-500 mt-1">Filières proposées</div>
        </Card>
      </div>

      {/* Admission conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            Conditions d'admission
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-gray-700">
              <strong>Être titulaire du Baccalauréat II</strong> (toutes sections : Sciences, Philo, etc.)
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-gray-700">
              <strong>Faire partie des 100 meilleurs candidats</strong> aux résultats du concours d'admission
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-gray-700">
              <strong>Préparer un dossier complet</strong> : extrait de naissance, diplôme BAC II, copies certifiées, photos d'identité
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-gray-700">
              <strong>Déposer le dossier</strong> au Bureau des Mines et Géologie (Delmas 31) ou au campus de la FDS durant la période d'inscription
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="bg-gray-50">
        <CardContent className="p-6 flex items-start gap-4">
          <MapPin className="h-6 w-6 text-red-500 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900">Campus de la FDS</h3>
            <p className="text-gray-600 text-sm mt-1">
              Rue Rivière, Port-au-Prince, Haïti
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Source : fds.edu.ht — admission.ueh.edu.ht
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Épreuves Tab ──

function EpreuvesTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Structure du concours d'admission</h2>
        <p className="text-gray-500 mt-1">
          Le concours comprend trois épreuves écrites, portant sur le programme du secondaire (niveau Terminale/Philo). Source officielle : fds.edu.ht
        </p>
      </div>

      <Accordion type="multiple" defaultValue={['epreuve-0', 'epreuve-1', 'epreuve-2']}>
        {EPREUVES.map((epreuve, index) => (
          <AccordionItem key={index} value={`epreuve-${index}`}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <div className={`p-2 rounded-xl border ${epreuve.couleur}`}>
                  {epreuve.icon}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{epreuve.nom}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" /> {epreuve.duree}
                    <span className="text-gray-300">|</span>
                    <Badge variant="outline" className="text-xs font-normal">
                      {epreuve.ponderation}
                    </Badge>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-2 space-y-4">
                <p className="text-gray-700 leading-relaxed">{epreuve.description}</p>
                <Separator />
                <div>
                  <h4 className="font-semibold text-sm text-gray-800 mb-3">
                    Sujets et thèmes à maîtriser :
                  </h4>
                  <ul className="space-y-2">
                    {epreuve.sujets.map((sujet, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <ChevronRight className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                        {sujet}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Info box */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800">
            <strong>Important :</strong> Le programme du concours porte sur les connaissances du niveau secondaire (BAC II). Les annales des années précédentes (2004-2007 et plus récentes) constituent la meilleure ressource de préparation.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Filières Tab ──

function FiliereTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Filières et programmes d'études</h2>
        <p className="text-gray-500 mt-1">
          Les formations proposées après réussite au concours d'admission. Source : fds.edu.ht
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {FILIERES.map((filiere, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{filiere.nom}</CardTitle>
                <Badge variant="outline" className="text-xs shrink-0">{filiere.duree}</Badge>
              </div>
              <CardDescription className="text-xs">
                Diplôme : {filiere.diplome}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">{filiere.description}</p>
              <Separator />
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Débouchés professionnels :</p>
                <div className="flex flex-wrap gap-1.5">
                  {filiere.debouches.map((d, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="text-xs font-normal bg-emerald-50 text-emerald-700"
                    >
                      {d}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Master */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Cycle 2 : Masters
          </CardTitle>
          <CardDescription>
            La FDS propose également des programmes de Master pour approfondir les compétences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3">
              <h4 className="font-semibold text-sm">Master en Géosciences</h4>
              <p className="text-xs text-gray-500 mt-1">
                Géologie appliquée, ressources naturelles, risques géologiques
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <h4 className="font-semibold text-sm">Master en Informatique</h4>
              <p className="text-xs text-gray-500 mt-1">
                Génie logiciel, intelligence artificielle, systèmes d'information
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Conseils Tab ──

function ConseilsTab() {
  const navigateTo = useAppStore((s) => s.navigateTo);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Conseils pour réussir le concours</h2>
        <p className="text-gray-500 mt-1">
          Stratégies et recommandations basées sur l'expérience des candidats des années précédentes
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {CONSEILS.map((conseil, index) => (
          <Card key={index}>
            <CardContent className="p-5 flex items-start gap-4">
              <div className="p-2 rounded-xl bg-gray-50 shrink-0">{conseil.icon}</div>
              <div>
                <h3 className="font-semibold text-gray-900">{conseil.titre}</h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  {conseil.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <Card className="bg-emerald-50 border-emerald-200">
        <CardContent className="p-6 text-center space-y-3">
          <Lightbulb className="h-8 w-8 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-gray-900">Prêt à vous entraîner ?</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Commencez par les exercices de notre banque ou passez un examen simulé pour évaluer votre niveau.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
            <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2" onClick={() => navigateTo('exercises')}>
              <BookOpen className="h-4 w-4" />
              Banque d'exercices
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => navigateTo('exam')}>
              <Clock className="h-4 w-4" />
              Examen simulé
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
