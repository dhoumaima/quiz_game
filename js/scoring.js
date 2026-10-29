// Importe le nombre maximal de points par question et la duree du quiz
import { MAX_POINTS_PER_QUESTION, QUESTION_TIME } from './config.js';


// Fonction qui calcule les points obtenus pour une question
export function calculatePoints(isCorrect, elapsedTime) {

  // Si la reponse est incorrecte, aucun point n'est attribue
  if (!isCorrect) return 0;

  // Calcule une penalite proportionnelle au temps utilise
  // Plus le temps ecoule est important, plus la penalite augmente
  const penalty = Math.floor(
    (elapsedTime / QUESTION_TIME) * 50
  );

  // Soustrait la penalite au score maximal
  // Math.max garantit un minimum de 50 points pour une bonne reponse
  return Math.max(50, MAX_POINTS_PER_QUESTION - penalty);
}


// Fonction qui calcule le pourcentage de reussite au quiz
export function calculatePercentage(score, questionCount) {

  // Calcule le score maximal possible selon le nombre de questions
  const maximumScore = questionCount * MAX_POINTS_PER_QUESTION;

  // Evite une division par zero si le quiz ne contient aucune question
  if (maximumScore === 0) return 0;

  // Calcule le pourcentage et arrondit le resultat a l'entier le plus proche
  return Math.round((score / maximumScore) * 100);
}