
import { BEST_SCORES_KEY } from './config.js';

export function getBestScores() {
  try {
    const savedScores = localStorage.getItem(BEST_SCORES_KEY);
    return savedScores ? JSON.parse(savedScores) : {};
  } catch (error) {
    console.error('Erreur de lecture des meilleurs scores :', error);
    return {};
  }
}

export function saveBestScore(category, score, percentage) {
  const bestScores = getBestScores();
  const previousBest = bestScores[category];

  if (previousBest && score <= previousBest.score) {
    return false;
  }

  bestScores[category] = {
    score,
    percentage,
    date: new Date().toISOString()
  };

  try {
    localStorage.setItem(
      BEST_SCORES_KEY,
      JSON.stringify(bestScores)
    );
    return true;
  } catch (error) {
    console.error('Erreur de sauvegarde du meilleur score :', error);
    return false;
  }
}
