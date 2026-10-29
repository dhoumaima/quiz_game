// Importe la cle utilisee pour identifier les meilleurs scores dans localStorage
import { BEST_SCORES_KEY } from './config.js';


// Fonction qui recupere les meilleurs scores sauvegardes
export function getBestScores() {
  try {

    // Recupere les donnees stockees dans le navigateur
    const savedScores = localStorage.getItem(BEST_SCORES_KEY);

    // Convertit les donnees JSON en objet JavaScript
    // Si aucune donnee n'existe, retourne un objet vide
    return savedScores ? JSON.parse(savedScores) : {};

  } catch (error) {

    // Affiche un message en cas d'erreur de lecture
    console.error('Erreur de lecture des meilleurs scores :', error);

    // Retourne un objet vide en cas d'erreur
    return {};
  }
}


// Fonction qui sauvegarde un nouveau meilleur score
export function saveBestScore(category, score, percentage) {

  // Recupere tous les meilleurs scores deja enregistres
  const bestScores = getBestScores();

  // Recupere le meilleur score de la categorie concernee
  const previousBest = bestScores[category];

  // Verifie si un meilleur score existe deja
  // Si le nouveau score est inferieur ou egal, aucune modification n'est effectuee
  if (previousBest && score <= previousBest.score) {
    return false;
  }

  // Enregistre le nouveau meilleur resultat pour cette categorie
  bestScores[category] = {
    score,
    percentage,

    // Enregistre la date et l'heure de la sauvegarde au format ISO
    date: new Date().toISOString()
  };

  try {

    // Convertit l'objet JavaScript en JSON
    // Puis sauvegarde les donnees dans localStorage
    localStorage.setItem(
      BEST_SCORES_KEY,
      JSON.stringify(bestScores)
    );

    // Retourne true si la sauvegarde reussit
    return true;

  } catch (error) {

    // Affiche un message en cas d'erreur de sauvegarde
    console.error('Erreur de sauvegarde du meilleur score :', error);

    // Retourne false si la sauvegarde echoue
    return false;
  }
}