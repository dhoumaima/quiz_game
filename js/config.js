
/*
 * Configuration générale du quiz QuizMaster.
 * Ce fichier centralise les paramètres utilisés par les autres modules.
 */

// Durée maximale autorisée pour répondre à chaque question, en secondes.
export const QUESTION_TIME = 15;

// Nombre de questions sélectionnées pour chaque partie.
export const QUESTIONS_PER_QUIZ = 10;

// Nombre maximal de points pouvant être obtenus pour une question.
export const MAX_POINTS_PER_QUESTION = 100;

// Noms affichés à l'écran pour chaque catégorie de questions.
export const CATEGORY_NAMES = {
  programming: 'Programmation',
  networks: 'Réseaux informatiques',
  databases: 'Bases de données'
};

// Clé utilisée dans le stockage local du navigateur (localStorage)
// pour sauvegarder les meilleurs scores de chaque catégorie.
export const BEST_SCORES_KEY = 'quizmaster_best_scores';
