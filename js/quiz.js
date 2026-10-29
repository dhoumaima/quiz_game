'use strict';

const QUESTION_TIME = 15;
const CATEGORY_NAMES = {
  programming: 'Programmation',
  networks: 'Réseaux informatiques',
  databases: 'Bases de données'
};

const QUESTION_BANK = window.QUESTION_BANK;

const categoryScreen = document.querySelector('#category-screen');
const gameScreen = document.querySelector('#game-screen');
const resultScreen = document.querySelector('#result-screen');
const quizTitle = document.querySelector('#quiz-title');
const timer = document.querySelector('#timer');
const timerValue = document.querySelector('#timer-value');
const questionCounter = document.querySelector('#question-counter');
const scoreLive = document.querySelector('#score-live');
const progressTrack = document.querySelector('#progress-track');
const progressFill = document.querySelector('#progress-fill');
const questionText = document.querySelector('#question-text');
const answersList = document.querySelector('#answers-list');
const answerStatus = document.querySelector('#answer-status');
const questionHint = document.querySelector('#question-hint');
const nextButton = document.querySelector('#next-button');
const resultTitle = document.querySelector('#result-title');
const resultMessage = document.querySelector('#result-message');
const finalScore = document.querySelector('#final-score');
const finalPercent = document.querySelector('#final-percent');
const finalTime = document.querySelector('#final-time');
const correctionsList = document.querySelector('#corrections-list');

let currentCategory = '';
let questions = [];
let currentIndex = 0;
let score = 0;
let selectedAnswer = null;
let remainingTime = QUESTION_TIME;
let timerId = null;
let questionStartedAt = 0;
let totalAnswerTime = 0;
let answersHistory = [];

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function stopTimer() {
  if (timerId !== null) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

function updateTimerDisplay() {
  timerValue.textContent = String(remainingTime);
  timer.classList.toggle('is-warning', remainingTime <= 5 && remainingTime > 0);
  timer.classList.toggle('is-expired', remainingTime <= 0);
}

function startTimer() {
  stopTimer();
  remainingTime = QUESTION_TIME;
  updateTimerDisplay();
  questionStartedAt = Date.now();
  timerId = window.setInterval(() => {
    remainingTime -= 1;
    updateTimerDisplay();
    if (remainingTime <= 0) {
      stopTimer();
      handleTimeout();
    }
  }, 1000);
}

function startQuiz(category) {
  if (!QUESTION_BANK || !QUESTION_BANK[category]) return;

  currentCategory = category;

  questions = shuffle(QUESTION_BANK[category])
    .slice(0, 10)
    .map((question) => ({ ...question }));

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
  const question = questions[currentIndex];
  questionCounter.textContent = `Question ${currentIndex + 1} sur ${questions.length}`;
  progressTrack.setAttribute('aria-valuemax', String(questions.length));
  progressTrack.setAttribute('aria-valuenow', String(currentIndex + 1));
  progressFill.style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
  questionText.textContent = question.question;
  answerStatus.textContent = '';
  questionHint.textContent = 'Choisis une seule réponse.';
  nextButton.disabled = true;
  nextButton.innerHTML = currentIndex === questions.length - 1 ? 'Voir mon résultat <span aria-hidden="true">→</span>' : 'Question suivante <span aria-hidden="true">→</span>';
  answersList.replaceChildren();

  question.answers.forEach((answer, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer-option';
    button.innerHTML = `<span class="answer-letter">${String.fromCharCode(65 + index)}</span><span></span>`;
    button.lastElementChild.textContent = answer;
    button.addEventListener('click', () => selectAnswer(index));
    answersList.append(button);
  });
  startTimer();
}

function selectAnswer(index) {
  if (selectedAnswer !== null) return;
  selectedAnswer = index;
  stopTimer();
  totalAnswerTime += Math.min(QUESTION_TIME, Math.max(0, (Date.now() - questionStartedAt) / 1000));
  const question = questions[currentIndex];
  const isCorrect = index === question.correct;
  if (isCorrect) score += 1;
  answersHistory.push({ selected: index, timedOut: false });
  [...answersList.children].forEach((button, answerIndex) => {
    button.disabled = true;
    if (answerIndex === index) button.classList.add('is-selected');
  });
  answerStatus.textContent = isCorrect ? 'Réponse enregistrée. Continue quand tu es prêt !' : 'Réponse enregistrée. La correction sera affichée à la fin.';
  questionHint.textContent = isCorrect ? 'Bien joué !' : 'Garde le rythme, la suite arrive.';
  scoreLive.textContent = `Score : ${score}`;
  nextButton.disabled = false;
}

function handleTimeout() {
  if (selectedAnswer !== null) return;
  selectedAnswer = -1;
  totalAnswerTime += QUESTION_TIME;
  answersHistory.push({ selected: -1, timedOut: true });
  [...answersList.children].forEach((button) => { button.disabled = true; });
  answerStatus.textContent = 'Temps écoulé ! Passe à la question suivante.';
  questionHint.textContent = 'Aucune réponse enregistrée.';
  nextButton.disabled = false;
}

function goToNextQuestion() {
  if (selectedAnswer === null) return;
  if (currentIndex < questions.length - 1) {
    currentIndex += 1;
    renderQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  stopTimer();
  gameScreen.hidden = true;
  resultScreen.hidden = false;
  const total = questions.length;
  const percentage = Math.round((score / total) * 100);
  finalScore.textContent = `${score}/${total}`;
  finalPercent.textContent = `${percentage}%`;
  finalTime.textContent = `${Math.round(totalAnswerTime)} s`;
  resultTitle.textContent = percentage >= 80 ? 'Excellent travail !' : percentage >= 50 ? 'Bien joué !' : 'Continue à progresser !';
  resultMessage.textContent = percentage >= 80
    ? 'Tu maîtrises bien ce sujet. Continue comme ça !'
    : percentage >= 50
      ? 'Tu as de bonnes bases. Relis les corrections pour aller encore plus loin.'
      : 'Chaque essai est une occasion d’apprendre. Consulte les corrections puis réessaie.';
  renderCorrections();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderCorrections() {
  correctionsList.replaceChildren();
  questions.forEach((question, index) => {
    const history = answersHistory[index] || { selected: -1, timedOut: true };
    const isCorrect = history.selected === question.correct;
    const article = document.createElement('article');
    article.className = `correction-card ${isCorrect ? 'is-correct' : 'is-wrong'}`;
    const top = document.createElement('div');
    top.className = 'correction-top';
    const label = document.createElement('strong');
    label.textContent = `Question ${index + 1}`;
    const mark = document.createElement('span');
    mark.className = 'correction-mark';
    mark.textContent = isCorrect ? '✓ Bonne réponse' : history.timedOut ? 'Temps écoulé' : '✕ Incorrect';
    top.append(label, mark);
    const title = document.createElement('h3');
    title.textContent = question.question;
    const userAnswer = document.createElement('p');
    userAnswer.className = isCorrect ? '' : 'user-answer';
    userAnswer.textContent = history.selected < 0 ? 'Ta réponse : aucune réponse' : `Ta réponse : ${question.answers[history.selected]}`;
    const correctAnswer = document.createElement('p');
    correctAnswer.className = 'correct-answer';
    correctAnswer.textContent = `Bonne réponse : ${question.answers[question.correct]}`;
    const explanation = document.createElement('p');
    explanation.textContent = question.explanation;
    article.append(top, title, userAnswer, correctAnswer, explanation);
    correctionsList.append(article);
  });
}

function showCategorySelection() {
  stopTimer();
  gameScreen.hidden = true;
  resultScreen.hidden = true;
  categoryScreen.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('[data-category]').forEach((button) => {
  button.addEventListener('click', () => startQuiz(button.dataset.category));
});
nextButton.addEventListener('click', goToNextQuestion);
document.querySelector('#retry-button').addEventListener('click', () => startQuiz(currentCategory));
document.querySelector('#change-category-button').addEventListener('click', showCategorySelection);

const params = new URLSearchParams(window.location.search);
const requestedCategory = params.get('category');
if (requestedCategory && QUESTION_BANK && QUESTION_BANK[requestedCategory]) {
  startQuiz(requestedCategory);
}
