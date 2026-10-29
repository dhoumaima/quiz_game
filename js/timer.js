// Importe la duree maximale d'une question depuis config.js
import { QUESTION_TIME } from './config.js';

// Identifiant du chronometre, null signifie qu'il est arrete
let timerId = null;

// Enregistre le moment exact du debut de la question
let questionStartedAt = 0;


// Fonction qui arrete le chronometre
export function stopTimer() {

  // Verifie si un chronometre est en cours
  if (timerId !== null) {

    // Arrete l'execution repetee du chronometre
    window.clearInterval(timerId);

    // Reinitialise son identifiant
    timerId = null;
  }
}


// Fonction qui calcule le temps ecoule depuis le debut de la question
export function getElapsedTime() {

  // Si la question n'a pas encore commence, retourne 0
  if (!questionStartedAt) return 0;

  // Calcule le temps ecoule en secondes
  // Math.min limite le resultat a la duree maximale d'une question
  return Math.min(
    QUESTION_TIME,
    (Date.now() - questionStartedAt) / 1000
  );
}


// Fonction qui demarre le chronometre
export function startTimer(onTick, onTimeout) {

  // Arrete un eventuel ancien chronometre
  stopTimer();

  // Enregistre l'heure de debut de la question
  questionStartedAt = Date.now();

  // Initialise le temps restant a 15 secondes
  let remainingTime = QUESTION_TIME;

  // Affiche immediatement la valeur initiale du chronometre
  onTick(remainingTime);

  // Execute le code toutes les 200 millisecondes
  timerId = window.setInterval(() => {

    // Calcule le temps restant en secondes
    // Math.floor arrondit le temps ecoule a l'entier inferieur
    // Math.max empeche le temps restant de devenir negatif
    remainingTime = Math.max(
      0,
      QUESTION_TIME - Math.floor((Date.now() - questionStartedAt) / 1000)
    );

    // Met a jour l'affichage du chronometre
    onTick(remainingTime);

    // Verifie si le temps est ecoule
    if (remainingTime <= 0) {

      // Arrete le chronometre
      stopTimer();

      // Execute la fonction prevue lorsque le temps est ecoule
      onTimeout();
    }
  }, 200);
}