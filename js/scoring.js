import { MAX_POINTS_PER_QUESTION, QUESTION_TIME } from './config.js';

export function calculatePoints(isCorrect, elapsedTime) {
  if (!isCorrect) return 0;

  const penalty = Math.floor(
    (elapsedTime / QUESTION_TIME) * 50
  );

  return Math.max(50, MAX_POINTS_PER_QUESTION - penalty);
}

export function calculatePercentage(score, questionCount) {
  const maximumScore = questionCount * MAX_POINTS_PER_QUESTION;

  if (maximumScore === 0) return 0;

  return Math.round((score / maximumScore) * 100);
}