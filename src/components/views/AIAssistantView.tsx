'use client';
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import type { AIChatMessage } from '@/lib/types';
import { Send, Bot, User, Sparkles, Trash2 } from 'lucide-react';

const QUICK_SUGGESTIONS = [
  "Génère un exercice d'algèbre",
  "Explique-moi la loi d'Ohm",
  'Quelles sont les causes de la Révolution haïtienne?',
  'Donne-moi des conseils pour réussir le concours',
];

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
  }).format(date);
}

// ── Knowledge-based response generator ───────────────────────
function generateResponse(question: string): string {
  const q = question.toLowerCase();

  // ── Mathematics ──
  if (q.includes('algèbre') || q.includes('algebre')) {
    if (q.includes('exercice') || q.includes('génère') || q.includes('genere')) {
      return `Voici un exercice d'algèbre typique du concours FDS :

**Exercice :**
Résolvez le système d'équations suivant :
  2x + 3y = 12
  x - y = 1

**Solution détaillée :**
1. De la deuxième équation : x = y + 1
2. Substituons dans la première : 2(y + 1) + 3y = 12
   2y + 2 + 3y = 12
   5y = 10
   y = 2
3. x = 2 + 1 = 3

Vérification : 2(3) + 3(2) = 6 + 6 = 12 ✓
            3 - 2 = 1 ✓

Solution : (x, y) = (3, 2)

💡 **Conseil :** Au concours, les systèmes d'équations reviennent très souvent. Maîtrisez bien la méthode de substitution et la méthode de combinaison (addition).`;
    }
    return `**L'algèbre** est la partie la plus importante du concours de mathématiques FDS.

Les thèmes clés à maîtriser :

1. **Équations du second degré** : ax² + bx + c = 0
   - Calcul du discriminant Δ = b² - 4ac
   - Si Δ > 0 : deux racines x₁ = (-b-√Δ)/(2a), x₂ = (-b+√Δ)/(2a)
   - Si Δ = 0 : une racine double x = -b/(2a)
   - Si Δ < 0 : pas de racine réelle

2. **Systèmes d'équations** : Méthodes de substitution et de combinaison

3. **Polynômes** : Factorisation, division euclidienne, théorème des restes

4. **Inéquations** : Tableaux de signes

5. **Fractions rationnelles** : Décomposition en éléments simples

📌 Pour réviser efficacement : commencez par les bases (équations du 1er et 2nd degré), puis passez aux systèmes et aux polynômes. Faites au moins 5 exercices par jour !`;
  }

  if (q.includes('dérivé') || q.includes('deriv') || q.includes('limite') || q.includes('analyse') || q.includes('fonction')) {
    return `**L'analyse de fonctions** est un pilier du concours.

**Les dérivées essentielles à connaître :**
- (xⁿ)' = nxⁿ⁻¹
- (1/x)' = -1/x²
- (√x)' = 1/(2√x)
- (eˣ)' = eˣ
- (ln x)' = 1/x
- (sin x)' = cos x
- (cos x)' = -sin x

**Étude complète d'une fonction f(x) :**
1. Domaine de définition
2. Limites aux bornes du domaine
3. Dérivée f'(x) et signe
4. Tableau de variations
5. Représentation graphique

**Les limites importantes :**
- lim(x→0) sin(x)/x = 1
- lim(x→∞) (1 + 1/x)ˣ = e
- lim(x→0) (eˣ - 1)/x = 1

💡 Au concours, on vous demande souvent l'étude complète d'une fonction rationnelle ou avec racine carrée. Entraînez-vous avec les annales !`;
  }

  if (q.includes('trigonométri') || q.includes('trigono') || q.includes('sinus') || q.includes('cosinus')) {
    return `**La trigonométrie** au concours FDS :

**Formules fondamentales :**
- cos²(a) + sin²(a) = 1
- tan(a) = sin(a)/cos(a)
- 1 + tan²(a) = 1/cos²(a)

**Formules d'addition :**
- cos(a+b) = cos(a)cos(b) - sin(a)sin(b)
- sin(a+b) = sin(a)cos(b) + cos(a)sin(b)

**Valeurs remarquables à connaître par cœur :**
- sin(0°) = 0, cos(0°) = 1
- sin(30°) = 1/2, cos(30°) = √3/2
- sin(45°) = √2/2, cos(45°) = √2/2
- sin(60°) = √3/2, cos(60°) = 1/2
- sin(90°) = 1, cos(90°) = 0

**Équations trigonométriques :**
- sin(x) = sin(a) → x = a + 2kπ ou x = π - a + 2kπ
- cos(x) = cos(a) → x = ±a + 2kπ

💡 Conseil : apprenez le cercle trigonométrique par cœur, c'est indispensable !`;
  }

  if (q.includes('géométri') || q.includes('geometri') || q.includes('vecteur') || q.includes('droite') || q.includes('cercle')) {
    return `**La géométrie** au concours FDS comprend deux volets :

**1. Géométrie plane classique :**
- Théorème de Pythagore : a² + b² = c²
- Théorème de Thalès : proportionnalité des segments
- Aire des figures : triangle (bh/2), cercle (πr²), trapèze ((B+b)h/2)

**2. Géométrie analytique (très important !) :**
- Équation de droite : y = mx + p (m = pente)
- Distance entre deux points A(x₁,y₁) et B(x₂,y₂) : AB = √((x₂-x₁)² + (y₂-y₁)²)
- Équation du cercle de centre (a,b) et rayon r : (x-a)² + (y-b)² = r²
- Parabole, ellipse, hyperbole (coniques)

**Exemple type concours :**
Trouver l'équation de la médiatrice du segment AB avec A(2,3) et B(6,1).
→ Milieu M(4,2), pente AB = (1-3)/(6-2) = -1/2
→ Médiatrice perpendiculaire : pente = 2
→ y - 2 = 2(x - 4) → y = 2x - 6

📌 La géométrie analytique représente souvent 30-40% des points de maths !`;
  }

  if (q.includes('probabilité') || q.includes('probabilite') || q.includes('combinatoir') || q.includes('dénombrement')) {
    return `**Probabilités et dénombrement** au concours FDS :

**Dénombrement :**
- Permutations : n! = n × (n-1) × ... × 1
- Arrangements : A(n,p) = n!/(n-p)!
- Combinaisons : C(n,p) = n!/(p!(n-p)!)

**Probabilités :**
- P(A) = nombre de cas favorables / nombre de cas possibles
- P(A∪B) = P(A) + P(B) - P(A∩B)
- P(Ā) = 1 - P(A)
- Probabilités conditionnelles : P(A|B) = P(A∩B) / P(B)

**Exemple type :**
On tire 3 cartes d'un jeu de 32. Quelle est la probabilité d'obtenir exactement 2 rois ?
→ C(4,2) × C(28,1) / C(32,3) = 6 × 28 / 4960 = 168/4960 ≈ 0,034

💡 Le dénombrement est souvent testé avec des situations concrètes. Entraînez-vous avec les annales !`;
  }

  // ── Physics ──
  if (q.includes('loi d\'ohm') || q.includes('ohm') || q.includes('électricité') || q.includes('electricité') || q.includes('electricite') || q.includes('tension') || q.includes('résistance') || q.includes('resistance') || q.includes('courant')) {
    return `**La loi d'Ohm** est fondamentale en électricité.

**Formule : U = R × I**
- U = tension (en volts, V)
- R = résistance (en ohms, Ω)
- I = intensité du courant (en ampères, A)

**Applications au concours :**

1. **Circuit série** : R_eq = R₁ + R₂ + R₃ + ...
   Le courant est le même partout.

2. **Circuit parallèle** : 1/R_eq = 1/R₁ + 1/R₂ + 1/R₃ + ...
   La tension est la même aux bornes de chaque branche.

3. **Puissance** : P = U × I = R × I² = U²/R

4. **Loi de Pouillet** (circuit avec générateur) :
   I = E / (R + r)
   où E = force électromotrice, r = résistance interne

**Exercice type :**
Un générateur (E = 12V, r = 1Ω) alimente deux résistances en série (R₁ = 4Ω, R₂ = 5Ω).
I = 12 / (4 + 5 + 1) = 12/10 = 1,2 A
U(R₁) = 1,2 × 4 = 4,8 V
U(R₂) = 1,2 × 5 = 6,0 V

💡 Au concours, l'électricité représente environ 40% de l'épreuve de physique !`;
  }

  if (q.includes('newton') || q.includes('mécanique') || q.includes('mecanique') || q.includes('force') || q.includes('accélér') || q.includes('vitesse') || q.includes('mouvement')) {
    return `**La mécanique** est essentielle au concours de physique.

**Les 3 lois de Newton :**
1. **Principe d'inertie** : Si ΣF = 0, alors v = constante (repos ou mouvement rectiligne uniforme)
2. **Principe fondamental** : ΣF = m × a
3. **Action-réaction** : F(A→B) = -F(B→A)

**Formules clés :**
- Poids : P = mg (g ≈ 10 m/s² au concours)
- Travail : W = F × d × cos(α)
- Énergie cinétique : Ec = ½mv²
- Énergie potentielle : Ep = mgh
- Théorème de l'énergie cinétique : ΔEc = ΣW

**Mouvement projectile :**
- x(t) = v₀ cos(α) × t
- y(t) = v₀ sin(α) × t - ½gt²
- Portée : R = v₀² sin(2α) / g
- Hauteur max : H = v₀² sin²(α) / (2g)

**Exercice type :**
Une balle est lancée à v₀ = 20 m/s sous un angle de 45°.
Portée R = 400 × sin(90°) / 10 = 40 m
Hauteur H = 400 × 0,5 / 20 = 10 m

💡 La mécanique représente environ 30% de l'épreuve de physique. Maîtrisez les lois de Newton et le mouvement projectile !`;
  }

  if (q.includes('thermodynam') || q.includes('chaleur') || q.includes('température') || q.includes('gaz') || q.includes('calorimétri')) {
    return `**La thermodynamique** au concours FDS :

**Lois fondamentales :**

1. **Dilatation** : ΔL = αL₀ΔT (solides)

2. **Quantité de chaleur** : Q = mcΔT
   - m = masse, c = chaleur massique, ΔT = variation de température
   - Pour l'eau : c = 4,18 J/(g·°C)

3. **Gaz parfaits** : PV = nRT
   - P en Pa, V en m³, n en mol, R = 8,314 J/(mol·K), T en K

4. **Transformations** :
   - Isotherme (T constante) : PV = constante
   - Isobare (P constante) : V/T = constante (loi de Charles)
   - Isochore (V constante) : P/T = constante (loi de Gay-Lussac)

5. **Rendement de Carnot** : η = 1 - T_froide/T_chaude

**Exercice type :**
Q = mcΔT = 200 × 4,18 × 50 = 41 800 J pour chauffer 200g d'eau de 20°C à 70°C.

💡 La thermodynamique est souvent le 3ème thème de physique. Ne la négligez pas !`;
  }

  // ── Chemistry ──
  if (q.includes('atomist') || q.includes('atome') || q.includes('électron') || q.includes('electron') || q.includes('orbitale') || q.includes('configuration')) {
    return `**L'atomistique** est la base de la chimie au concours.

**Structure de l'atome :**
- Atome = noyau (protons + neutrons) + électrons
- Numéro atomique Z = nombre de protons
- Nombre de masse A = protons + neutrons
- Neutrons = A - Z

**Configuration électronique :**
- Règle de Klechkowski : on remplit par ordre d'énergie croissante
  1s → 2s → 2p → 3s → 3p → 4s → 3d → 4p...
- Règle de Hund : maximum d'électrons célibataires
- Principe de Pauli : 2 électrons max par case quantique (spins opposés)

**Exemples :**
- Carbone (Z=6) : 1s² 2s² 2p²
- Oxygène (Z=8) : 1s² 2s² 2p⁴
- Potassium (Z=19) : 1s² 2s² 2p⁶ 3s² 3p⁶ 4s¹ (4s avant 3d !)
- Fer (Z=26) : 1s² 2s² 2p⁶ 3s² 3p⁶ 3d⁶ 4s²

**Classification périodique :**
- Les éléments sont classés par Z croissant
- Les colonnes = familles (propriétés chimiques similaires)
- Période = nombre de couches électroniques

💡 L'atomistique est presque toujours au concours. Apprenez les 20 premiers éléments par cœur !`;
  }

  if (q.includes('chimie organique') || q.includes('organique') || q.includes('alcane') || q.includes('alcène') || q.includes('alcool') || q.includes('fonction')) {
    return `**La chimie organique** au concours FDS :

**Les familles principales :**

1. **Hydrocarbures** : CₙH₂ₙ₊₂ (alcane), CₙH₂ₙ (alcène), CₙH₂ₙ₋₂ (alcyne)
   - Méthane CH₄, Éthane C₂H₆, Propane C₃H₈, Butane C₄H₁₀

2. **Groupes fonctionnels** :
   - -OH → Alcool (méthanol, éthanol)
   - -CHO → Aldéhyde
   - -CO- → Cétone
   - -COOH → Acide carboxylique
   - -COO- → Ester
   - -NH₂ → Amine

3. **Nomenclature** :
   - Préfixe = nombre de carbones (meth=1, eth=2, prop=3, but=4, pent=5)
   - Suffixe = fonction (-ane, -ène, -ol, -al, -oïque)

**Exercice type :**
Nommez CH₃-CH₂-CH₂-OH → Propan-1-ol (alcool primaire)
Nommez CH₃-COOH → Acide éthanoïque (acide acétique)

💡 Connaître les groupes fonctionnels et la nomenclature est indispensable !`;
  }

  if (q.includes('solution') || q.includes('concentr') || q.includes('mol/l') || q.includes('molaire') || q.includes('dilution') || q.includes('ph')) {
    return `**Les solutions** au concours FDS :

**Concentration molaire** : C = n/V (en mol/L)
- n = m/M (nombre de moles = masse / masse molaire)

**Concentration massique** : Cm = m/V (en g/L)

**Dilution** : C₁V₁ = C₂V₂

**Exemple type :**
On prépare 250 mL de HCl à 0,5 mol/L à partir d'une solution mère à 2 mol/L.
V₁ = C₂V₂/C₁ = (0,5 × 250)/2 = 62,5 mL

**pH des solutions aqueuses :**
- pH = -log[H₃O⁺]
- pH = 7 → neutre, pH < 7 → acide, pH > 7 → basique
- Pour un acide fort : pH = -log(C)
- Pour une base forte : pH = 14 + log(C)

💡 Les calculs de dilution et de concentration reviennent très souvent. Maîtrisez la formule C₁V₁ = C₂V₂ !`;
  }

  // ── Optics ──
  if (q.includes('optique') || q.includes('lentille') || q.includes('miroir') || q.includes('réflex') || q.includes('reflex') || q.includes('réfract') || q.includes('refract') || q.includes('focal')) {
    return `**L'optique** au concours FDS :

**Réflexion** : angle d'incidence = angle de réflexion (i = r)

**Réfraction (Snell-Descartes)** : n₁ sin(i₁) = n₂ sin(i₂)
- L'indice n de l'air ≈ 1, de l'eau ≈ 1,33, du verre ≈ 1,5
- Quand on passe d'un milieu moins réfringent à plus réfringent, le rayon se rapproche de la normale
- Réflexion totale si i > θc = arcsin(n₂/n₁)

**Lentilles minces** :
- Relation de conjugaison : 1/f = 1/p + 1/q
  (f = distance focale, p = distance objet, q = distance image)
- Grandissement : γ = -q/p
- Lentille convergente : f > 0, lentille divergente : f < 0
- Vergence : C = 1/f (en dioptries, δ)

**Miroirs** :
- Miroir convergent (concave) : f > 0
- Miroir divergent (convexe) : f < 0

**Exercice type :**
Une lentille convergente (f=20cm), objet à p=60cm.
1/q = 1/20 - 1/60 = (3-1)/60 = 2/60 = 1/30 → q = 30 cm
γ = -30/60 = -0,5 (image renversée, réduite de moitié)

💡 L'optique est souvent le sujet le plus facile de physique-géométrie. Entraînez-vous sur les lentilles !`;
  }

  // ── Haitian Culture ──
  if (q.includes('révolution haïtienne') || q.includes('revolution') || q.includes('indépendance') || q.includes('1804') || q.includes('colonis')) {
    return `**La Révolution haïtienne (1791-1804)** est un sujet incontournable.

**Les grandes étapes :**

1. **1789-1791** : Révolution française, révoltes d'esclaves à Saint-Domingue

2. **Août 1791** : Cérémonie du Bois Caïman, dirigée par Boukman. C'est le début de la révolte armée des esclaves.

3. **1793-1798** : L'abolition de l'esclavage par Sonthonax (1793). Toussaint Louverture prend progressivement le contrôle de l'île.

4. **1801** : Toussaint Louverture promulgue une constitution autonomiste.

5. **1802** : Napoléon envoie le général Leclerc avec 20 000+ soldats pour reprendre l'île en main. Toussaint est capturé et meurt en France (1803).

6. **18 novembre 1803** : Bataille de Vertières, victoire décisive des forces indigénistes menées par Dessalines.

7. **1er janvier 1804** : Proclamation de l'indépendance d'Haïti. Jean-Jacques Dessalines devient le premier chef d'État.

**Importance historique :** Haïti est la première république noire indépendante au monde et la première colonie à avoir conquis son indépendance par une révolte d'esclaves.

💡 Au concours, on peut vous demander de situer ces événements chronologiquement ou d'expliquer les causes de la révolution.`;
  }

  if (q.includes('haiti') || q.includes('haïti') || (q.includes('culture') && q.includes('général'))) {
    return `**Culture générale pour le concours FDS :**

**Géographie d'Haïti :**
- Capitale : Port-au-Prince
- Plus haut sommet : Pic la Selle (2 680 m)
- Superficie : 27 750 km²
- Langues officielles : Français et Créole haïtien
- Pays frontalier : République Dominicaine
- Départements : 10 (Ouest, Artibonite, Nord, Nord-Est, Centre, etc.)

**Histoire d'Haïti - dates clés :**
- 1492 : Arrivée de Christophe Colomb
- 1697 : Traité de Ryswick → Saint-Domingue devient française
- 1791 : Début de la Révolution
- 1804 : Indépendance (Dessalines)
- 1806 : Assassinat de Dessalines
- 1807-1820 : Pétion (sud) et Christophe (nord)
- 1915-1934 : Occupation américaine
- 2010 : Tremblement de terre dévastateur

**Littérature haïtienne :**
- Jacques Roumain : « Gouverneurs de la rosée »
- René Depestre : « Hadriana dans tous mes rêves »
- Frankétienne : « Ultravocal »
- Jean Price-Mars : « Ainsi parla l'oncle »

**Institutions :**
- Université d'État d'Haïti (UEH)
- Faculté des Sciences (FDS), fondée en 1902

💡 La culture générale peut faire la différence entre deux candidats ! Révisez l'histoire et la géographie.`;
  }

  // ── General advice ──
  if (q.includes('conseil') || q.includes('réussir') || q.includes('reussir') || q.includes('prépar') || q.includes('prepar') || q.includes('astuce')) {
    return `**Conseils pour réussir le concours FDS :**

📚 **Stratégie de préparation :**

1. **Planifiez votre temps** : Commencez au moins 3 mois avant le concours. Consacrez 2-3 heures par jour.

2. **Priorité aux mathématiques** : C'est l'épreuve la plus pondérée (3h). Entraînez-vous chaque jour sur les annales.

3. **Ne négligez aucune matière** : La physique-chimie et l'analyse de texte comptent aussi.

4. **Pratiquez les annales** : Les annales de 2004 à 2023 sont disponibles. Faites-les en conditions d'examen.

5. **Gérez votre temps le jour J** :
   - Maths (3h) : commencez par les exercices faciles pour gagner des points
   - Physique-Chimie (2h) : lisez tout, traitez ce que vous savez
   - Analyse/Logique (2h) : lisez attentivement le texte avant de répondre

6. **Documents à préparer à l'avance :**
   - Extrait de naissance
   - Diplôme BAC II
   - Copies certifiées
   - Photos d'identité

7. **Le jour de l'examen :**
   - Arrivez tôt
   - Lisez chaque question 2 fois avant de répondre
   - Vérifiez vos calculs si le temps le permet
   - Ne laissez aucune question sans réponse

8. **Cible** : Le concours accepte environ 100 candidats sur plusieurs milliers. Il faut être dans les meilleurs !

💪 Vous êtes capables ! La préparation régulière est la clé du succès. Bon courage !`;
  }

  if (q.includes('concours') || q.includes('fds') || q.includes('faculté') || q.includes('faculte') || q.includes('admission')) {
    return `**Le concours d'admission de la FDS :**

**Présentation :**
La Faculté des Sciences (FDS) de l'UEH est le principal établissement de formation scientifique en Haïti, fondée en 1902. Le concours est ouvert à tous les titulaires du BAC II.

**Structure du concours :**
1. **Mathématiques** (3 heures, pondération la plus forte)
   - Algèbre, géométrie, analyse, trigonométrie, probabilités, nombres complexes

2. **Physique-Chimie** (2 heures)
   - Mécanique, électricité, thermodynamique, optique, chimie générale et organique

3. **Analyse de texte et Logique** (2 heures)
   - Compréhension de texte en français, syllogismes, raisonnement logique, culture générale

**Filières après admission :**
- Génie Civil (5 ans, ingénieur)
- Génie Électronique (5 ans, ingénieur)
- Génie Électromécanique (5 ans, ingénieur)
- Topographie (3 ans, technicien supérieur)
- Licence en Chimie (4 ans)

**Sélection :** Environ 100 places par an pour plusieurs milliers de candidats. Le taux d'admission est d'environ 3-5%.

💡 Utilisez notre banque d'exercices et les examens simulés pour vous préparer efficacement !`;
  }

  // ── Generate exercise if asked ──
  if (q.includes('exercice') || q.includes('génère') || q.includes('genere') || q.includes('pratiqu')) {
    const subjects = ['mathématiques', 'physique', 'chimie', 'optique'];
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    if (randomSubject === 'mathématiques') {
      return generateResponse('génère un exercice d\'algèbre');
    } else if (randomSubject === 'physique') {
      return `Voici un exercice de physique :

**Exercice :**
Un wagon de masse 500 kg roule sur une voie horizontale avec une vitesse initiale de 4 m/s. Une force de freinage constante de 200 N est appliquée. Calculez :
a) La décélération du wagon
b) La distance d'arrêt

**Solution :**
a) Deuxième loi de Newton : F = ma
   a = F/m = -200/500 = -0,4 m/s² (négatif car freinage)

b) Utilisons v² = v₀² + 2ad
   0 = 16 + 2(-0,4)d
   0 = 16 - 0,8d
   d = 16/0,8 = 20 m

Le wagon s'arrête après 20 mètres.

💡 Revoyez bien les lois de Newton et les équations de mouvement !`;
    } else if (randomSubject === 'chimie') {
      return `Voici un exercice de chimie :

**Exercice :**
On fait réagir 2g de zinc (Zn) avec un excès d'acide chlorhydrique (HCl) selon l'équation :
Zn + 2HCl → ZnCl₂ + H₂

Calculez le volume de dihydrogène H₂ dégagé à 25°C sous une pression de 1 atm.
(Données : Zn = 65,4 g/mol ; R = 0,082 L·atm/(mol·K) ; VM = 24 L/mol)

**Solution :**
1. Nombre de moles de Zn : n = m/M = 2/65,4 = 0,0306 mol
2. D'après l'équation, 1 mol Zn → 1 mol H₂
   n(H₂) = 0,0306 mol
3. Volume : V = n × VM = 0,0306 × 24 = 0,734 L = 734 mL

💡 Les exercices de stoechiométrie reviennent très souvent au concours !`;
    } else {
      return generateResponse('explique-moi la loi d\'Ohm');
    }
  }

  // ── Default fallback ──
  return `Merci pour votre question ! En tant qu'assistant PrépaConcours, je peux vous aider dans les matières suivantes :

📐 **Mathématiques** : algèbre, géométrie, analyse, trigonométrie, probabilités, suites, nombres complexes

⚡ **Physique** : mécanique (lois de Newton, mouvement), électricité (loi d'Ohm, circuits), thermodynamique

🧪 **Chimie** : atomistique, chimie organique, solutions, réactions chimiques

🔭 **Optique** : réflexion, réfraction, lentilles

📖 **Culture générale** : histoire d'Haïti, géographie, institutions

**Essayez par exemple de me demander :**
- "Explique-moi les lois de Newton"
- "Génère un exercice de chimie organique"
- "Comment réussir le concours FDS ?"
- "Quelles sont les étapes de la Révolution haïtienne ?"
- "Explique la loi de Snell-Descartes"

Je suis là pour vous aider à réussir ! 😊`;
}

// ── Loading dots animation ─────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
      <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
      <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
    </div>
  );
}

// ── Empty chat state ───────────────────────────────────────────
function EmptyChatState({ onSuggestionClick }: { onSuggestionClick: (msg: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Assistant IA PrépaConcours
      </h2>
      <p className="text-muted-foreground max-w-md mb-6">
        Posez-moi une question en mathématiques, physique, chimie, optique ou culture générale.
        Je suis là pour vous aider à réussir le concours !
      </p>

      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {QUICK_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSuggestionClick(suggestion)}
            className="text-sm px-3 py-2 rounded-full border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────
export default function AIAssistantView() {
  const {
    aiMessages,
    addAiMessage,
    aiLoading,
    setAiLoading,
    setAiMessages,
  } = useAppStore();

  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Auto-scroll on new messages ───────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, aiLoading]);

  // ── Auto-resize textarea ─────────────────────────────────────
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  // ── Send message (fully client-side, no API call) ───────────
  function handleSend(text?: string) {
    const message = (text ?? input).trim();
    if (!message || aiLoading) return;

    // Clear input
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Add user message
    addAiMessage({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Start loading
    setAiLoading(true);

    // Simulate a small delay for realistic feel
    setTimeout(() => {
      const reply = generateResponse(message);
      addAiMessage({
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      });
      setAiLoading(false);
    }, 600 + Math.random() * 800);
  }

  // ── Handle keyboard ─────────────────────────────────────────
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ── Clear chat ───────────────────────────────────────────────
  function handleClear() {
    setAiMessages([]);
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assistant IA</h1>
          <p className="text-sm text-muted-foreground">
            Votre tuteur personnel pour le concours
          </p>
        </div>
        {aiMessages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={handleClear}
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Effacer
          </Button>
        )}
      </div>

      {/* Chat area */}
      <Card className="flex-1 flex flex-col mx-4 mb-2 overflow-hidden">
        <ScrollArea className="flex-1">
          <CardContent className="p-4 space-y-4">
            {aiMessages.length === 0 && !aiLoading ? (
              <EmptyChatState onSuggestionClick={handleSend} />
            ) : (
              <>
                {aiMessages.map((msg, index) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={index}
                      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>

                      {/* Message bubble */}
                      <div
                        className={`max-w-[80%] sm:max-w-[70%] ${
                          isUser ? 'items-end' : 'items-start'
                        }`}
                      >
                        <Card
                          className={
                            isUser
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-muted border-muted'
                          }
                        >
                          <CardContent className="p-3 text-sm whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                          </CardContent>
                        </Card>
                        <p
                          className={`text-[11px] text-muted-foreground mt-1 ${
                            isUser ? 'text-right' : 'text-left'
                          }`}
                        >
                          {formatTimestamp(new Date(msg.timestamp))}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {aiLoading && (
                  <div className="flex gap-3 flex-row">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <Card className="bg-muted border-muted">
                      <CardContent className="p-0">
                        <TypingIndicator />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </CardContent>
          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </ScrollArea>

        {/* Quick suggestions (shown when chat has messages) */}
        {aiMessages.length > 0 && !aiLoading && (
          <div className="px-4 pt-2 border-t border-border/50">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Sparkles className="w-4 h-4 flex-shrink-0 text-muted-foreground mt-0.5" />
              {QUICK_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSend(suggestion)}
                  className="flex-shrink-0 text-xs px-2.5 py-1.5 rounded-full border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="p-4 pt-3 border-t border-border">
          <div className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question..."
              className="min-h-[44px] max-h-[160px] resize-none flex-1"
              rows={1}
              disabled={aiLoading}
            />
            <Button
              size="icon"
              onClick={() => handleSend()}
              disabled={!input.trim() || aiLoading}
              className="flex-shrink-0 h-[44px] w-[44px]"
            >
              {aiLoading ? (
                <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5 text-center">
            Appuyez sur Entrée pour envoyer, Shift+Entrée pour un saut de ligne
          </p>
        </div>
      </Card>
    </div>
  );
}
