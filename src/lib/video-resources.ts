import type { Subject } from './types';

export interface VideoResource {
  id: string;
  title: string;
  youtubeId: string;
  subject: Subject;
  topic: string;
  duration: string;
  channel: string;
}

export const videoResources: VideoResource[] = [
  // ===================== MATHEMATIQUES =====================
  {
    id: 'v_math_1',
    title: 'Algebre lineaire - Systemes d\'equations',
    youtubeId: 'HJGK3ZH1F8Q',
    subject: 'MATHEMATIQUES',
    topic: 'Algebre',
    duration: '15:32',
    channel: 'Khan Academy Francais',
  },
  {
    id: 'v_math_2',
    title: 'Les fonctions - cours complet',
    youtubeId: 'lbpV-1p4sFo',
    subject: 'MATHEMATIQUES',
    topic: 'Analyse',
    duration: '22:10',
    channel: 'Yvan Monka',
  },
  {
    id: 'v_math_3',
    title: 'Geometrie plane - Theoreme de Pythagore et Thales',
    youtubeId: 'pWnJML0CQmU',
    subject: 'MATHEMATIQUES',
    topic: 'Geometrie',
    duration: '18:45',
    channel: 'Khan Academy Francais',
  },
  {
    id: 'v_math_4',
    title: 'Trigonometrie - Formules et exercices',
    youtubeId: 'R0bmR9SE0Xs',
    subject: 'MATHEMATIQUES',
    topic: 'Trigonometrie',
    duration: '20:15',
    channel: 'Yvan Monka',
  },
  {
    id: 'v_math_5',
    title: 'Nombres complexes - Partie 1',
    youtubeId: 'Y86OQyUu80A',
    subject: 'MATHEMATIQUES',
    topic: 'Nombres complexes',
    duration: '25:30',
    channel: 'Yvan Monka',
  },
  {
    id: 'v_math_6',
    title: 'Probabilites - Cours complet pour debutants',
    youtubeId: 'TNtMHgLkHqM',
    subject: 'MATHEMATIQUES',
    topic: 'Probabilites',
    duration: '19:42',
    channel: 'Khan Academy Francais',
  },
  {
    id: 'v_math_7',
    title: 'Suites numeriques - cours et exercices',
    youtubeId: '9jSxK3fMEoA',
    subject: 'MATHEMATIQUES',
    topic: 'Suites numeriques',
    duration: '16:28',
    channel: 'Yvan Monka',
  },
  {
    id: 'v_math_8',
    title: 'Geometrie analytique - Equation de droite',
    youtubeId: 'ZxkCjSgJSiM',
    subject: 'MATHEMATIQUES',
    topic: 'Geometrie analytique',
    duration: '14:55',
    channel: 'Khan Academy Francais',
  },
  {
    id: 'v_math_9',
    title: 'Limites et continuite - Exercices corriges',
    youtubeId: 'vM19mjzQY9k',
    subject: 'MATHEMATIQUES',
    topic: 'Limites',
    duration: '21:03',
    channel: 'Yvan Monka',
  },

  // ===================== PHYSIQUE =====================
  {
    id: 'v_phys_1',
    title: 'Les lois de Newton - Mecanique',
    youtubeId: 'Mn_40FvJj9A',
    subject: 'PHYSIQUE',
    topic: 'Mecanique',
    duration: '17:20',
    channel: 'Khan Academy Francais',
  },
  {
    id: 'v_phys_2',
    title: 'Cinematique - Mouvement rectiligne uniforme',
    youtubeId: 'MTpEoKBg3Rs',
    subject: 'PHYSIQUE',
    topic: 'Mecanique',
    duration: '13:45',
    channel: 'Physique Chimie',
  },
  {
    id: 'v_phys_3',
    title: 'Electricite - Loi d\'Ohm et circuits',
    youtubeId: 'bHIhgxavNLA',
    subject: 'PHYSIQUE',
    topic: 'Electricite',
    duration: '19:15',
    channel: 'Khan Academy Francais',
  },
  {
    id: 'v_phys_4',
    title: 'Thermodynamique - Les gaz parfaits',
    youtubeId: 'jVh0U5fVDyU',
    subject: 'PHYSIQUE',
    topic: 'Thermodynamique',
    duration: '16:50',
    channel: 'Physique Chimie',
  },
  {
    id: 'v_phys_5',
    title: 'Energie cinetique et potentielle - Exercices',
    youtubeId: 'NpLbVvF_yEo',
    subject: 'PHYSIQUE',
    topic: 'Mecanique',
    duration: '14:30',
    channel: 'Khan Academy Francais',
  },
  {
    id: 'v_phys_6',
    title: 'Circuits electriques - Série et parallèle',
    youtubeId: 'p8V9S8s5VKM',
    subject: 'PHYSIQUE',
    topic: 'Electricite',
    duration: '12:20',
    channel: 'Physique Chimie',
  },

  // ===================== CHIMIE =====================
  {
    id: 'v_chim_1',
    title: 'Atomistique - Structure de l\'atome',
    youtubeId: 'yx3vBdMJ7qk',
    subject: 'CHIMIE',
    topic: 'Atomistique',
    duration: '18:40',
    channel: 'Khan Academy Francais',
  },
  {
    id: 'v_chim_2',
    title: 'Chimie organique - Les hydrocarbures',
    youtubeId: 'QyOq4JLpPLk',
    subject: 'CHIMIE',
    topic: 'Chimie organique',
    duration: '20:10',
    channel: 'Chimie Explicative',
  },
  {
    id: 'v_chim_3',
    title: 'Solutions aqueuses - Concentration et dilution',
    youtubeId: 'rH3E4rcMwNY',
    subject: 'CHIMIE',
    topic: 'Solutions',
    duration: '15:25',
    channel: 'Khan Academy Francais',
  },
  {
    id: 'v_chim_4',
    title: 'Reactions chimiques - Equilibrer une equation',
    youtubeId: 'bC3MfMwmGPo',
    subject: 'CHIMIE',
    topic: 'Reactions chimiques',
    duration: '13:55',
    channel: 'Chimie Explicative',
  },
  {
    id: 'v_chim_5',
    title: 'Tableau periodique - Classification des elements',
    youtubeId: '0RRVV4Diomg',
    subject: 'CHIMIE',
    topic: 'Atomistique',
    duration: '17:30',
    channel: 'Khan Academy Francais',
  },
  {
    id: 'v_chim_6',
    title: 'Moles et masse molaire - Exercices corriges',
    youtubeId: 'hGKmjOwJDyU',
    subject: 'CHIMIE',
    topic: 'Solutions',
    duration: '16:15',
    channel: 'Chimie Explicative',
  },

  // ===================== OPTIQUE =====================
  {
    id: 'v_opt_1',
    title: 'Reflexion et refraction de la lumiere',
    youtubeId: 'K4SfJPNQcZM',
    subject: 'OPTIQUE',
    topic: 'Reflexion',
    duration: '14:20',
    channel: 'Khan Academy Francais',
  },
  {
    id: 'v_opt_2',
    title: 'Loi de Snell-Descartes - Exercices',
    youtubeId: 'R1aVvGzVFMA',
    subject: 'OPTIQUE',
    topic: 'Refraction',
    duration: '16:45',
    channel: 'Physique Chimie',
  },
  {
    id: 'v_opt_3',
    title: 'Les lentilles convergentes et divergentes',
    youtubeId: 'LfRG5gfbQxE',
    subject: 'OPTIQUE',
    topic: 'Lentilles',
    duration: '19:30',
    channel: 'Khan Academy Francais',
  },
  {
    id: 'v_opt_4',
    title: 'Formation des images par les lentilles',
    youtubeId: 'fPmWf_1CJGo',
    subject: 'OPTIQUE',
    topic: 'Lentilles',
    duration: '15:10',
    channel: 'Physique Chimie',
  },
  {
    id: 'v_opt_5',
    title: 'Optique geometrique - Miroirs et lentilles',
    youtubeId: 'WPO8nGkq5hw',
    subject: 'OPTIQUE',
    topic: 'Reflexion',
    duration: '22:00',
    channel: 'Khan Academy Francais',
  },

  // ===================== CULTURE GENERALE =====================
  {
    id: 'v_cg_1',
    title: 'Histoire d\'Haiti - La Revolution de 1804',
    youtubeId: 'zB6zMxsBHYs',
    subject: 'CULTURE_GENERALE',
    topic: 'Histoire d\'Haiti',
    duration: '25:40',
    channel: 'Histoire d\'Haiti',
  },
  {
    id: 'v_cg_2',
    title: 'Jean-Jacques Dessalines - Le pere de la nation',
    youtubeId: 'WKRR6zmJ7aU',
    subject: 'CULTURE_GENERALE',
    topic: 'Histoire d\'Haiti',
    duration: '18:20',
    channel: 'Documentaires Haiti',
  },
  {
    id: 'v_cg_3',
    title: 'Geographie d\'Haiti - Les 10 departements',
    youtubeId: 'tqQmLbBMvCE',
    subject: 'CULTURE_GENERALE',
    topic: 'Geographie',
    duration: '12:15',
    channel: 'Decouverte Haiti',
  },
  {
    id: 'v_cg_4',
    title: 'Toussaint Louverture - Le strategiste de la liberte',
    youtubeId: 'MBjQGF0wAuE',
    subject: 'CULTURE_GENERALE',
    topic: 'Histoire d\'Haiti',
    duration: '20:30',
    channel: 'Histoire d\'Haiti',
  },
  {
    id: 'v_cg_5',
    title: 'Culture haitienne - Musique, art et traditions',
    youtubeId: 'FWfYvFz6pmM',
    subject: 'CULTURE_GENERALE',
    topic: 'Culture generale',
    duration: '16:50',
    channel: 'Decouverte Haiti',
  },
];

export function getVideosBySubject(subject: Subject): VideoResource[] {
  return videoResources.filter((v) => v.subject === subject);
}

export function getVideosByTopic(subject: Subject, topic: string): VideoResource[] {
  return videoResources.filter((v) => v.subject === subject && v.topic === topic);
}
