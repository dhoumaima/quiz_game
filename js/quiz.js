import {QUESTION_TIME, QUESTIONS_PER_QUIZ, CATEGORY_NAMES, MAX_POINTS_PER_QUESTION} from './config.js';
import { startTimer, stopTimer, getElapsedTime } from './timer.js';
import { calculatePoints, calculatePercentage } from './scoring.js';
import { getBestScores, saveBestScore } from './storage.js';
import { elements, renderAnswers, renderCorrections, renderProgress } from './ui.js';
import { shuffle, shuffleAnswers } from './utils.js';
const {
  categoryScreen,
  gameScreen,
  resultScreen,
  quizTitle,
  timer,
  timerValue,
  questionCounter,
  scoreLive,
  progressTrack,
  questionText,
  answersList,
  answerStatus,
  questionHint,
  nextButton,
  resultTitle,
  resultMessage,
  finalScore,
  finalPercent,
  finalTime
} = elements;

const QUESTION_BANK = window.QUESTION_BANK;

let currentCategory = '';
let questions = [];
let currentIndex = 0;
let score = 0;
let selectedAnswer = null;
let remainingTime = QUESTION_TIME;
let totalAnswerTime = 0;
let answersHistory = [];
let answerFinalized = false;
let isTransitioning = false;

function updateTimerDisplay(time) {
  remainingTime = time;
  timerValue.textContent = String(time);
  timer.classList.toggle('is-warning', time <= 5 && time > 0);
  timer.classList.toggle('is-expired', time <= 0);
}

function startQuiz(category) {
  if (!QUESTION_BANK || !QUESTION_BANK[category]) return;

  stopTimer();

  currentCategory = category;
 questions = shuffle(QUESTION_BANK[category])
  .slice(0, QUESTIONS_PER_QUIZ)
  .map(question => shuffleAnswers(question));

  currentIndex = 0;
  score = 0;
  totalAnswerTime = 0;
  answersHistory = [];

  categoryScreen.hidden = true;
  resultScreen.hidden = true;
  gameScreen.hidden = false;

  quizTitle.textContent = CATEGORY_NAMES[category];
  scoreLive.textContent = 'Score : 0';

  renderQuestion();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderQuestion() {
  stopTimer();

  selectedAnswer = null;
  answerFinalized = false;

  const question = questions[currentIndex];

  questionCounter.textContent =
    `Question ${currentIndex + 1} sur ${questions.length}`;
  renderProgress(questions, answersHistory, currentIndex);

  progressTrack.setAttribute('aria-valuemax', String(questions.length));
  progressTrack.setAttribute('aria-valuenow', String(currentIndex + 1));
  
  questionText.textContent = question.question;
  answerStatus.textContent = '';
  questionHint.textContent = 'Choisis une seule réponse.';

  nextButton.disabled = true;
  nextButton.innerHTML = currentIndex === questions.length - 1
    ? 'Voir mon résultat <span aria-hidden="true">→</span>'
    : 'Question suivante <span aria-hidden="true">→</span>';

  renderAnswers(question, selectAnswer);
  startTimer(updateTimerDisplay, handleTimeout);
}

function selectAnswer(index) {
  if (answerFinalized || remainingTime <= 0) return;

  selectedAnswer = index;

  [...answersList.children].forEach((button, buttonIndex) => {
    button.classList.toggle('is-selected', buttonIndex === index);
  });

  nextButton.disabled = false;
}

function finalizeAnswer(timedOut = false) {
  if (answerFinalized) return;

  answerFinalized = true;
  stopTimer();

  const question = questions[currentIndex];
  const elapsedTime = timedOut
    ? QUESTION_TIME
    : getElapsedTime();

  totalAnswerTime += elapsedTime;

  const isCorrect = selectedAnswer === question.correct;
  const points = calculatePoints(isCorrect, elapsedTime);

  score += points;

answersHistory[currentIndex] = {
  selected: selectedAnswer === null ? -1 : selectedAnswer,
  timedOut: selectedAnswer === null && timedOut,
  isCorrect,
  points,
  elapsedTime
};

renderProgress(questions, answersHistory, currentIndex);
  scoreLive.textContent = `Score : ${score}`;
[...answersList.children].forEach(button => {
  button.disabled = true;
});

  if (selectedAnswer === null) {
    answerStatus.textContent = 'Temps écoulé ! Aucune réponse enregistrée.';
  } else if (isCorrect) {
    answerStatus.textContent = `Bonne réponse ! +${points} points.`;
  } else {
    answerStatus.textContent =
      `Mauvaise réponse. La bonne réponse était : ${question.answers[question.correct]}.`;
  }

  questionHint.textContent = `Temps utilisé : ${Math.round(elapsedTime)} s.`;
  nextButton.disabled = false;
}

function handleTimeout() {
  if (answerFinalized) return;

  updateTimerDisplay(0);
  finalizeAnswer(true);

  window.setTimeout(() => {
    goToNextQuestion();
  }, 500);
}

function goToNextQuestion() {
  if (isTransitioning) return;

  if (selectedAnswer === null && !answerFinalized) return;

  if (!answerFinalized) {
    finalizeAnswer(false);
  }

  if (currentIndex >= questions.length - 1) {
    showResults();
    return;
  }

  const questionCard = document.querySelector('.question-card');

  if (!questionCard) {
    currentIndex += 1;
    renderQuestion();
    return;
  }

  isTransitioning = true;
  questionCard.classList.add('slide-out');

  window.setTimeout(() => {
    currentIndex += 1;

    questionCard.classList.remove('slide-out');
    renderQuestion();

    questionCard.classList.add('slide-in');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        questionCard.classList.remove('slide-in');
        isTransitioning = false;
      });
    });
  }, 300);
}


function showResults() {
  stopTimer();

  gameScreen.hidden = true;
  resultScreen.hidden = false;

  const percentage = calculatePercentage(score, questions.length);
  const maximumScore = questions.length * MAX_POINTS_PER_QUESTION;

  finalScore.textContent = `${score}/${maximumScore}`;
  finalPercent.textContent = `${percentage}%`;
  finalTime.textContent = `${Math.round(totalAnswerTime)} s`;
  resultTitle.textContent = percentage >= 80
    ? 'Excellent travail !'
    : percentage >= 50
      ? 'Bien joué !'
      : 'Continue à progresser !';

  resultMessage.textContent = percentage >= 80
    ? 'Tu maîtrises bien ce sujet. Continue comme ça !'
    : percentage >= 50
      ? 'Tu as de bonnes bases. Relis les corrections pour progresser.'
      : 'Consulte les corrections puis réessaie.';

  const previousBest = getBestScores()[currentCategory];
  const isNewBest = saveBestScore(currentCategory, score, percentage);
  const bestScores = getBestScores()[currentCategory];

  document.querySelector('.best-score-highlight')?.remove();
if (bestScores) {
  const bestScoreInfo = document.createElement('div');
  bestScoreInfo.className = 'best-score-highlight';

  bestScoreInfo.innerHTML = `
    <span class="best-score-icon">🏆</span>
    <div class="best-score-content">
      <span class="best-score-label">TON RECORD PERSONNEL</span>
      <strong>${bestScores.score} <span>/ ${maximumScore} points</span></strong>
      <span class="best-score-percent">${bestScores.percentage}% de réussite</span>
    </div>
  `;

  resultMessage.after(bestScoreInfo);
}

  if (isNewBest && (!previousBest || score > previousBest.score)) {
    resultMessage.textContent += ' Nouveau record !';
  }

  renderCorrections(questions, answersHistory);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showCategorySelection() {
  stopTimer();

  gameScreen.hidden = true;
  resultScreen.hidden = true;
  categoryScreen.hidden = false;

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('[data-category]').forEach(button => {
  button.addEventListener('click', () => {
    startQuiz(button.dataset.category);
  });
});

nextButton.addEventListener('click', goToNextQuestion);

document.querySelector('#retry-button').addEventListener('click', () => {
  startQuiz(currentCategory);
});

document.querySelector('#change-category-button').addEventListener('click', showCategorySelection);

const params = new URLSearchParams(window.location.search);
const requestedCategory = params.get('category');

if (requestedCategory && QUESTION_BANK?.[requestedCategory]) {
  startQuiz(requestedCategory);
}