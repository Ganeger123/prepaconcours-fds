'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  GraduationCap,
  BookOpen,
  Clock,
  Trophy,
  Target,
  Lightbulb,
  Building2,
  Calculator,
  Atom,
  FlaskConical,
  Eye,
  Globe,
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
    nom: 'Math\u00e9matiques',
    duree: '3 heures',
    description:
      'Cette \u00e9preuve est la plus pond\u00e9r\u00e9e du concours. Elle porte sur le programme de math\u00e9matiques de la derni\u00e8re ann\u00e9e de secondaire (Terminale/Philo). Les questions exigent une ma\u00eetrise solide du calcul alg\u00e9brique, de l\'analyse de fonctions et de la g\u00e9om\u00e9trie analytique.',
    sujets: [
      'Alg\u00e8bre : \u00e9quations, in\u00e9quations, syst\u00e8mes, polyn\u00f4mes, fractions rationnelles',
      'G\u00e9om\u00e9trie analytique : droite, cercle, parabole, ellipse, hyperbole dans le plan cart\u00e9sien',
      'Analyse : limites, continuit\u00e9, d\u00e9riv\u00e9es, \u00e9tudes de fonctions, int\u00e9grales',
      'Trigonom\u00e9trie : fonctions trigonom\u00e9triques, identit\u00e9s, \u00e9quations',
      'Suites num\u00e9riques : arithm\u00e9tiques, g\u00e9om\u00e9triques, r\u00e9currentes',
      'Probabilit\u00e9s et combinatoire : d\u00e9nombrement, probabilit\u00e9s conditionnelles',
      'Logique et raisonnement : ensembles, applications, preuves',
      'Nombres complexes : op\u00e9rations, forme trigonom\u00e9trique et exponentielle',
    ],
    icon: <Calculator className="h-6 w-6" />,
    couleur: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    ponderation: 'Part la plus importante',
  },
  {
    nom: 'Physique-Chimie',
    duree: '2 heures',
    description:
      'Cette \u00e9preuve \u00e9value les connaissances en sciences de la mati\u00e8re. Elle couvre la physique et la chimie du programme secondaire. Les exercices n\u00e9cessitent de savoir appliquer les lois fondamentales et de r\u00e9soudre des probl\u00e8mes quantitatifs.',
    sujets: [
      'M\u00e9canique : lois de Newton, \u00e9nergie cin\u00e9tique et potentielle, mouvement projectile',
      '\u00c9lectricit\u00e9 : loi d\'Ohm, circuits (s\u00e9rie/parall\u00e8le), puissance \u00e9lectrique',
      'Thermodynamique : calorim\u00e9trie, gaz parfaits, changements d\'\u00e9tat',
      'Optique : r\u00e9flexion, r\u00e9fraction, lentilles convergentes et divergentes',
      'Chimie g\u00e9n\u00e9rale : atomistique, classification p\u00e9riodique, liaisons chimiques',
      'Chimie organique : hydrocarbures, groupes fonctionnels, nomenclature',
      'Solutions : concentration molaire, dilution, pH',
      'R\u00e9actions chimiques : \u00e9quilibrage, st\u0153chiom\u00e9trie, oxydor\u00e9duction',
    ],
    icon: <Atom className="h-6 w-6" />,
    couleur: 'text-orange-600 bg-orange-50 border-orange-200',
    ponderation: 'Sciences de la Mati\u00e8re',
  },
  {
    nom: 'Analyse de texte et Logique',
    duree: '2 heures',
    description:
      'Cette \u00e9preuve teste la capacit\u00e9 de raisonnement, la compr\u00e9hension de texte et la logique formelle. Elle comprend g\u00e9n\u00e9ralement un texte \u00e0 analyser suivi de questions, et des exercices de logique math\u00e9matique.',
    sujets: [
      'Compr\u00e9hension et analyse d\'un texte en fran\u00e7ais',
      'Logique formelle : propositions, implications, contrapos\u00e9es, raisonnements par l\'absurde',
      'Syllogismes et validit\u00e9 d\'arguments',
      'Culture g\u00e9n\u00e9rale : histoire d\'Ha\u00efti, g\u00e9ographie, institutions',
      'Fran\u00e7ais : grammaire, vocabulaire, expression \u00e9crite',
    ],
    icon: <Brain className="h-6 w-6" />,
    couleur: 'text-violet-600 bg-violet-50 border-violet-200',
    ponderation: 'Capacit\u00e9s logiques et linguistiques',
  },
];

const FILIERES: Filiere[] = [
  {
    nom: 'G\u00e9nie Civil',
    diplome: 'Ing\u00e9nieur',
    duree: '5 ans',
    description:
      'Formation d\'ing\u00e9nieurs qualifi\u00e9s dans le domaine du b\u00e2timent et des travaux publics. Les deux premi\u00e8res ann\u00e9es fournissent une formation scientifique de base solide en math\u00e9matiques, physique et informatique.',
    debouches: [
      'Ing\u00e9nieur en g\u00e9nie civil',
      'Bureau d\'\u00e9tudes techniques',
      'Entreprise de construction (BTP)',
      'Administration publique (MTPTC)',
      'Enseignement sup\u00e9rieur',
    ],
  },
  {
    nom: 'G\u00e9nie \u00c9lectronique',
    diplome: 'Ing\u00e9nieur',
    duree: '5 ans',
    description:
      'Formation sp\u00e9cialis\u00e9e dans les syst\u00e8mes \u00e9lectroniques, la t\u00e9l\u00e9communication et l\'automatisme. Combine th\u00e9orie et pratique avec des travaux de laboratoire.',
    debouches: [
      'Ing\u00e9nieur en \u00e9lectronique',
      'Industrie des t\u00e9l\u00e9communications',
      'Automatisme et instrumentation',
      'Syst\u00e8mes embarqu\u00e9s',
    ],
  },
  {
    nom: 'G\u00e9nie \u00c9lectrom\u00e9canique',
    diplome: 'Ing\u00e9nieur',
    duree: '5 ans',
    description:
      'Formation d\'ing\u00e9nieurs dans les domaines de l\'\u00e9lectricit\u00e9, de la m\u00e9canique et de l\'\u00e9nergie. Pr\u00e9pare aux d\u00e9fis \u00e9nerg\u00e9tiques d\'Ha\u00efti.',
    debouches: [
      'Ing\u00e9nieur \u00e9lectrom\u00e9canicien',
      'Secteur \u00e9nerg\u00e9tique (EDH)',
      'Maintenance industrielle',
      '\u00c9nergies renouvelables',
    ],
  },
  {
    nom: 'Topographie',
    diplome: 'Technicien sup\u00e9rieur',
    duree: '3 ans',
    description:
      'Formation technique dans les m\u00e9thodes de mesure et de repr\u00e9sentation du territoire. Comp\u00e9tences en lev\u00e9s cadastraux, cartographie et SIG.',
    debouches: [
      'G\u00e9om\u00e8tre-topographe',
      'Cadastre national',
      'Bureaux d\'\u00e9tudes fonci\u00e8res',
      'Am\u00e9nagement du territoire',
    ],
  },
  {
    nom: 'Licence en Chimie',
    diplome: 'Licence',
    duree: '4 ans',
    description:
      'Formation approfondie en chimie g\u00e9n\u00e9rale, organique, min\u00e9rale et analytique. Les deux premi\u00e8res ann\u00e9es offrent une formation g\u00e9n\u00e9rale en math\u00e9matiques, physique, informatique et biologie.',
    debouches: [
      'Industrie chimique et pharmaceutique',
      'Laboratoire d\'analyse',
      'Enseignement',
      'Recherche scientifique',
      'Master en chimie (FDS ou \u00e0 l\'\u00e9tranger)',
    ],
  },
];

const CONSEILS = [
  {
    titre: 'Ma\u00eetrisez les bases en math\u00e9matiques',
    description:
      'L\'\u00e9preuve de math\u00e9matiques est d\u00e9terminante. Concentrez-vous sur l\'alg\u00e8bre, l\'analyse de fonctions (limites, d\u00e9riv\u00e9es, int\u00e9grales) et la g\u00e9om\u00e9trie analytique. Pratiquez r\u00e9guli\u00e8rement avec des annales des ann\u00e9es pr\u00e9c\u00e9dentes.',
    icon: <Target className="h-5 w-5 text-emerald-600" />,
  },
  {
    titre: 'Pratiquez les annales du concours',
    description:
      'Les annales des concours pr\u00e9c\u00e9dents (2004, 2005, 2006, 2007...) sont disponibles en ligne. Elles vous familiariseront avec le style de questions et le niveau attendu. Le concours porte sur le programme du secondaire, donc r\u00e9visez vos cours de Philo.',
    icon: <FileText className="h-5 w-5 text-orange-600" />,
  },
  {
    titre: 'Ne n\u00e9gligez pas la physique-chimie',
    description:
      'Beaucoup de candidats se concentrent uniquement sur les maths. La physique-chimie compte aussi ! R\u00e9visez les lois de Newton, l\'\u00e9lectricit\u00e9, la thermodynamique, l\'optique et la chimie g\u00e9n\u00e9rale et organique.',
    icon: <Atom className="h-5 w-5 text-violet-600" />,
  },
  {
    titre: 'Pr\u00e9parez votre dossier \u00e0 l\'avance',
    description:
      'Le concours est ouvert aux titulaires du Baccalaur\u00e9at II (toutes sections). Assurez-vous d\'avoir tous les documents requis : extrait de naissance, dipl\u00f4me du BAC II, copies certifi\u00e9es, photos d\'identit\u00e9. Le d\u00e9p\u00f4t se fait au Bureau des Mines et G\u00e9ologie (Delmas 31) ou au campus.',
    icon: <Calendar className="h-5 w-5 text-cyan-600" />,
  },
  {
    titre: 'Entra\u00eenez-vous au raisonnement logique',
    description:
      'L\'\u00e9preuve d\'analyse de texte et logique est souvent sous-estim\u00e9e. Pratiquez les syllogismes, les implications et les contrapos\u00e9es. Am\u00e9liorez votre compr\u00e9hension de texte en fran\u00e7ais et votre culture g\u00e9n\u00e9rale (histoire d\'Ha\u00efti, g\u00e9ographie).',
    icon: <Brain className="h-5 w-5 text-amber-600" />,
  },
  {
    titre: 'G\u00e9rez votre temps le jour de l\'examen',
    description:
      'L\'\u00e9preuve de maths dure 3 heures. Commencez par les exercices que vous ma\u00eetrisez le mieux pour gagner des points rapidement. Ne restez pas bloqu\u00e9 trop longtemps sur une question difficile. V\u00e9rifiez toujours vos calculs si le temps le permet.',
    icon: <Clock className="h-5 w-5 text-red-600" />,
  },
];

// ── Tabs ──

type Tab = 'presentation' | 'epreuves' | 'filiieres' | 'conseils';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'presentation', label: 'La FDS', icon: <GraduationCap className="h-4 w-4" /> },
  { id: 'epreuves', label: '\u00c9preuves', icon: <FileText className="h-4 w-4" /> },
  { id: 'filieres', label: 'Fili\u00e8res', icon: <BookOpen className="h-4 w-4" /> },
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
              <h2 className="text-2xl font-bold">Facult\u00e9 des Sciences (FDS)</h2>
              <p className="text-emerald-100 mt-1">Universit\u00e9 d\'\u00c9tat d\'Ha\u00efti (UEH)</p>
              <p className="text-emerald-200/80 text-sm mt-2">
                Fond\u00e9e en 1902 \u2014 L\'un des plus anciens \u00e9tablissements d\'enseignement sup\u00e9rieur en Ha\u00efti
              </p>
            </div>
          </div>
        </div>
        <CardContent className="p-6 md:p-8 space-y-4">
          <p className="text-gray-700 leading-relaxed">
            La Facult\u00e9 des Sciences (FDS) de l\'UEH est un pilier de l\'enseignement scientifique en Ha\u00efti. Cr\u00e9\u00e9e en 1902 par un groupe de six professionnels ha\u00eftiens sous le nom d\'\u00ab\u00c9cole des Sciences Appliqu\u00e9es\u00bb, elle a grandement contribu\u00e9 au d\u00e9veloppement des infrastructures du pays par la formation d\'ing\u00e9nieurs hautement qualifi\u00e9s qui ont servi \u00e0 plusieurs niveaux, tant dans l\'administration publique que dans le secteur priv\u00e9.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Aujourd\'hui, la FDS offre des formations d\'ing\u00e9nieurs et de licence dans plusieurs domaines scientifiques et techniques. Le concours d\'admission est ouvert \u00e0 tous les titulaires du Baccalaur\u00e9at II (toutes sections) et se d\u00e9roule annuellement, g\u00e9n\u00e9ralement entre d\u00e9cembre et janvier.
          </p>
        </CardContent>
      </Card>

      {/* Key facts grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <History className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">1902</div>
          <div className="text-xs text-gray-500 mt-1">Ann\u00e9e de fondation</div>
        </Card>
        <Card className="text-center p-4">
          <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">~100</div>
          <div className="text-xs text-gray-500 mt-1">Places par ann\u00e9e</div>
        </Card>
        <Card className="text-center p-4">
          <FileText className="h-8 w-8 text-violet-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">3</div>
          <div className="text-xs text-gray-500 mt-1">\u00c9preuves \u00e9crites</div>
        </Card>
        <Card className="text-center p-4">
          <BookOpen className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">5</div>
          <div className="text-xs text-gray-500 mt-1">Fili\u00e8res propos\u00e9es</div>
        </Card>
      </div>

      {/* Admission conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            Conditions d\'admission
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-gray-700">
              <strong>Etre titulaire du Baccalaur\u00e9at II</strong> (toutes sections : Sciences, Philo, etc.)
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-gray-700">
              <strong>Faire partie des 100 meilleurs candidats</strong> aux r\u00e9sultats du concours d\'admission
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-gray-700">
              <strong>Pr\u00e9parer un dossier complet</strong> : extrait de naissance, dipl\u00f4me BAC II, copies certifi\u00e9es, photos d\'identit\u00e9
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-gray-700">
              <strong>D\u00e9poser le dossier</strong> au Bureau des Mines et G\u00e9ologie (Delmas 31) ou au campus de la FDS durant la p\u00e9riode d\'inscription
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
              Rue Rivi\u00e8re, Port-au-Prince, Ha\u00efti
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Source : fds.edu.ht \u2014 admission.ueh.edu.ht
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Epreuves Tab ──

function EpreuvesTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Structure du concours d\'admission</h2>
        <p className="text-gray-500 mt-1">
          Le concours comprend trois \u00e9preuves \u00e9crites, portant sur le programme du secondaire (niveau Terminale/Philo). Source officielle : fds.edu.ht
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
                    Sujets et th\u00e8mes \u00e0 ma\u00eetriser :
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
            <strong>Important :</strong> Le programme du concours porte sur les connaissances du niveau secondaire (BAC II). Les annales des ann\u00e9es pr\u00e9c\u00e9dentes (2004-2007 et plus r\u00e9centes) constituent la meilleure ressource de pr\u00e9paration.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Fili\u00e8res Tab ──

function FiliereTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Fili\u00e8res et programmes d\'\u00e9tudes</h2>
        <p className="text-gray-500 mt-1">
          Les formations propos\u00e9es apr\u00e8s r\u00e9ussite au concours d\'admission. Source : fds.edu.ht
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
                Dipl\u00f4me : {filiere.diplome}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">{filiere.description}</p>
              <Separator />
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">D\u00e9bouch\u00e9s professionnels :</p>
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
            La FDS propose \u00e9galement des programmes de Master pour approfondir les comp\u00e9tences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3">
              <h4 className="font-semibold text-sm">Master en G\u00e9osciences</h4>
              <p className="text-xs text-gray-500 mt-1">
                G\u00e9ologie appliqu\u00e9e, ressources naturelles, risques g\u00e9ologiques
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <h4 className="font-semibold text-sm">Master en Informatique</h4>
              <p className="text-xs text-gray-500 mt-1">
                G\u00e9nie logiciel, intelligence artificielle, syst\u00e8mes d\'information
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
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Conseils pour r\u00e9ussir le concours</h2>
        <p className="text-gray-500 mt-1">
          Strat\u00e9gies et recommandations bas\u00e9es sur l\'exp\u00e9rience des candidats des ann\u00e9es pr\u00e9c\u00e9dentes
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
          <h3 className="font-bold text-gray-900">Pr\u00eat \u00e0 vous entra\u00eener ?</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Commencez par les exercices de notre banque ou passez un examen simulé pour évaluer votre niveau.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
            <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
              <BookOpen className="h-4 w-4" />
              Banque d\'exercices
            </Button>
            <Button variant="outline" className="gap-2">
              <Clock className="h-4 w-4" />
              Examen simulé
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
