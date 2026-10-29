
import { QUESTION_TIME, QUESTIONS_PER_QUIZ, CATEGORY_NAMES, MAX_POINTS_PER_QUESTION } from './config.js';
import { startTimer, stopTimer, getElapsedTime } from './timer.js';
import { calculatePoints, calculatePercentage } from './scoring.js';
import { getBestScores, saveBestScore } from './storage.js';
import { elements, renderAnswers, renderCorrections, renderProgress } from './ui.js';
import { shuffle, shuffleAnswers } from './utils.js';

// Récupération des éléments HTML utilisés dans le quiz.
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

// Récupération de la banque de questions définie dans le fichier HTML.
const QUESTION_BANK = window.QUESTION_BANK;

// Variables qui gèrent l'état actuel du quiz.
let currentCategory = '';       // Catégorie choisie par le joueur.
let questions = [];             // Questions utilisées pour la partie.
let currentIndex = 0;            // Indice de la question actuelle.
let score = 0;                   // Score total obtenu.
let selectedAnswer = null;       // Indice de la réponse sélectionnée.
let remainingTime = QUESTION_TIME; // Temps restant pour répondre.
let totalAnswerTime = 0;         // Temps total utilisé pour toutes les réponses.
let answersHistory = [];         // Historique des réponses du joueur.
let answerFinalized = false;     // Indique si la réponse actuelle est finalisée.
let isTransitioning = false;     // Empêche plusieurs animations simultanées.

// Met à jour l'affichage du chronomètre.
function updateTimerDisplay(time) {
  remainingTime = time;
  timerValue.textContent = String(time);

  // Ajoute une classe CSS lorsque le temps devient faible ou est écoulé.
  timer.classList.toggle('is-warning', time <= 5 && time > 0);
  timer.classList.toggle('is-expired', time <= 0);
}

// Initialise une nouvelle partie dans la catégorie choisie.
function startQuiz(category) {
  // Vérifie que la catégorie contient des questions.
  if (!QUESTION_BANK || !QUESTION_BANK[category]) return;

  // Arrête le chronomètre d'une éventuelle partie précédente.
  stopTimer();

  currentCategory = category;

  // Mélange les questions, limite leur nombre et mélange leurs réponses.
  questions = shuffle(QUESTION_BANK[category])
    .slice(0, QUESTIONS_PER_QUIZ)
    .map(question => shuffleAnswers(question));

  // Réinitialise les données de la partie.
  currentIndex = 0;
  score = 0;
  totalAnswerTime = 0;
  answersHistory = [];

  // Masque les autres écrans et affiche l'écran du quiz.
  categoryScreen.hidden = true;
  resultScreen.hidden = true;
  gameScreen.hidden = false;

  // Affiche le nom de la catégorie et initialise le score.
  quizTitle.textContent = CATEGORY_NAMES[category];
  scoreLive.textContent = 'Score : 0';

  // Affiche la première question et remet la page en haut.
  renderQuestion();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Affiche la question actuelle et prépare ses réponses.
function renderQuestion() {
  // Arrête le chronomètre précédent.
  stopTimer();

  // Réinitialise les données propres à la nouvelle question.
  selectedAnswer = null;
  answerFinalized = false;

  const question = questions[currentIndex];

  // Met à jour le numéro de la question.
  questionCounter.textContent =
    `Question ${currentIndex + 1} sur ${questions.length}`;

  // Met à jour la barre de progression.
  renderProgress(questions, answersHistory, currentIndex);

  progressTrack.setAttribute('aria-valuemax', String(questions.length));
  progressTrack.setAttribute('aria-valuenow', String(currentIndex + 1));

  // Affiche l'énoncé et efface les messages de la question précédente.
  questionText.textContent = question.question;
  answerStatus.textContent = '';
  questionHint.textContent = 'Choisis une seule réponse.';

  // Désactive le bouton jusqu'à la sélection ou la finalisation d'une réponse.
  nextButton.disabled = true;

  // Adapte le texte du bouton selon qu'il s'agit de la dernière question ou non.
  nextButton.innerHTML = currentIndex === questions.length - 1
    ? 'Voir mon résultat <span aria-hidden="true">→</span>'
    : 'Question suivante <span aria-hidden="true">→</span>';

  // Affiche les réponses et associe chaque bouton à la fonction selectAnswer.
  renderAnswers(question, selectAnswer);

  // Démarre le chronomètre de la nouvelle question.
  startTimer(updateTimerDisplay, handleTimeout);
}

// Enregistre la réponse choisie par le joueur.
function selectAnswer(index) {
  // Ignore la sélection si la réponse est déjà finalisée ou si le temps est écoulé.
  if (answerFinalized || remainingTime <= 0) return;

  selectedAnswer = index;

  // Met en évidence uniquement le bouton sélectionné.
  [...answersList.children].forEach((button, buttonIndex) => {
    button.classList.toggle('is-selected', buttonIndex === index);
  });

  // Autorise le passage à la question suivante.
  nextButton.disabled = false;
}

// Finalise la réponse et calcule les points obtenus.
function finalizeAnswer(timedOut = false) {
  // Évite de finaliser plusieurs fois la même réponse.
  if (answerFinalized) return;

  answerFinalized = true;

  // Arrête le chronomètre.
  stopTimer();

  const question = questions[currentIndex];

  // Si le temps est écoulé, utilise le temps maximal autorisé.
  // Sinon, récupère le temps réellement utilisé.
  const elapsedTime = timedOut
    ? QUESTION_TIME
    : getElapsedTime();

  // Ajoute le temps utilisé au temps total de la partie.
  totalAnswerTime += elapsedTime;

  // Vérifie si la réponse sélectionnée est correcte.
  const isCorrect = selectedAnswer === question.correct;

  // Calcule les points en fonction de la réponse et du temps utilisé.
  const points = calculatePoints(isCorrect, elapsedTime);

  // Ajoute les points au score total.
  score += points;

  // Enregistre les informations nécessaires aux résultats et aux corrections.
  answersHistory[currentIndex] = {
    selected: selectedAnswer === null ? -1 : selectedAnswer,
    timedOut: selectedAnswer === null && timedOut,
    isCorrect,
    points,
    elapsedTime
  };

  // Actualise la progression et le score affiché.
  renderProgress(questions, answersHistory, currentIndex);
  scoreLive.textContent = `Score : ${score}`;

  // Désactive toutes les réponses après la finalisation.
  [...answersList.children].forEach(button => {
    button.disabled = true;
  });

  // Affiche un message correspondant au résultat de la réponse.
  if (selectedAnswer === null) {
    answerStatus.textContent = 'Temps écoulé ! Aucune réponse enregistrée.';
  } else if (isCorrect) {
    answerStatus.textContent = `Bonne réponse ! +${points} points.`;
  } else {
    answerStatus.textContent =
      `Mauvaise réponse. La bonne réponse était : ${question.answers[question.correct]}.`;
  }

  // Affiche le temps utilisé pour répondre.
  questionHint.textContent = `Temps utilisé : ${Math.round(elapsedTime)} s.`;

  // Autorise le passage à la question suivante.
  nextButton.disabled = false;
}

// Fonction appelée lorsque le chronomètre atteint zéro.
function handleTimeout() {
  // Ne fait rien si la réponse a déjà été finalisée.
  if (answerFinalized) return;

  // Affiche zéro et finalise la question sans réponse.
  updateTimerDisplay(0);
  finalizeAnswer(true);

  // Passe automatiquement à la question suivante après 500 ms.
  window.setTimeout(() => {
    goToNextQuestion();
  }, 500);
}

// Passe à la question suivante avec une animation horizontale.
function goToNextQuestion() {
  // Empêche un deuxième passage pendant l'animation.
  if (isTransitioning) return;

  // Empêche de continuer si aucune réponse n'a été donnée
  // et que le temps n'est pas encore écoulé.
  if (selectedAnswer === null && !answerFinalized) return;

  // Finalise la réponse si cela n'a pas encore été fait.
  if (!answerFinalized) {
    finalizeAnswer(false);
  }

  // Si c'est la dernière question, affiche les résultats.
  if (currentIndex >= questions.length - 1) {
    showResults();
    return;
  }

  // Récupère le conteneur HTML de la question.
  const questionCard = document.querySelector('.question-card');

  // Si le conteneur n'existe pas, passe directement à la question suivante.
  if (!questionCard) {
    currentIndex += 1;
    renderQuestion();
    return;
  }

  // Signale que la transition est en cours.
  isTransitioning = true;

  // Déclenche le glissement de l'ancienne question vers la gauche.
  // Cette classe doit être définie dans le fichier CSS.
  questionCard.classList.add('slide-out');

  // Attend 300 ms pour laisser l'ancienne question glisser.
  window.setTimeout(() => {
    // Passe à la question suivante.
    currentIndex += 1;

    // Supprime les classes d'animation précédentes.
    questionCard.classList.remove('slide-out');

    // Affiche la nouvelle question et redémarre son chronomètre.
    renderQuestion();

    // Prépare l'arrivée de la nouvelle question depuis la droite.
    questionCard.classList.add('slide-in');

    // Attend que le navigateur applique la classe avant de lancer le retour.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Retire la classe pour faire apparaître la question à sa position normale.
        questionCard.classList.remove('slide-in');

        // Autorise une nouvelle transition.
        isTransitioning = false;
      });
    });
  }, 300);
}

// Affiche l'écran final et calcule les résultats de la partie.
function showResults() {
  stopTimer();

  // Masque le quiz et affiche l'écran des résultats.
  gameScreen.hidden = true;
  resultScreen.hidden = false;

  // Calcule le pourcentage et le score maximal possible.
  const percentage = calculatePercentage(score, questions.length);
  const maximumScore = questions.length * MAX_POINTS_PER_QUESTION;

  // Affiche le score, le pourcentage et le temps total.
  finalScore.textContent = `${score}/${maximumScore}`;
  finalPercent.textContent = `${percentage}%`;
  finalTime.textContent = `${Math.round(totalAnswerTime)} s`;

  // Choisit le titre selon le pourcentage de réussite.
  resultTitle.textContent = percentage >= 80
    ? 'Excellent travail !'
    : percentage >= 50
      ? 'Bien joué !'
      : 'Continue à progresser !';

  // Affiche un message adapté au résultat.
  resultMessage.textContent = percentage >= 80
    ? 'Tu maîtrises bien ce sujet. Continue comme ça !'
    : percentage >= 50
      ? 'Tu as de bonnes bases. Relis les corrections pour progresser.'
      : 'Consulte les corrections puis réessaie.';

  // Récupère le record précédent, enregistre le résultat et relit le record.
  const previousBest = getBestScores()[currentCategory];
  const isNewBest = saveBestScore(currentCategory, score, percentage);
  const bestScores = getBestScores()[currentCategory];

  // Supprime l'ancien affichage du record, s'il existe.
  document.querySelector('.best-score-highlight')?.remove();

  // Affiche le record personnel de la catégorie.
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

    // Place le bloc du record après le message de résultat.
    resultMessage.after(bestScoreInfo);
  }

  // Signale un nouveau record si le score est supérieur à l'ancien.
  if (isNewBest && (!previousBest || score > previousBest.score)) {
    resultMessage.textContent += ' Nouveau record !';
  }

  // Affiche les corrections de toutes les questions.
  renderCorrections(questions, answersHistory);

  // Remonte en haut de la page.
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Quitte le quiz et revient à l'écran de sélection des catégories.
function showCategorySelection() {
  stopTimer();

  gameScreen.hidden = true;
  resultScreen.hidden = true;
  categoryScreen.hidden = false;

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Associe chaque bouton de catégorie au démarrage du quiz correspondant.
document.querySelectorAll('[data-category]').forEach(button => {
  button.addEventListener('click', () => {
    startQuiz(button.dataset.category);
  });
});

// Associe le bouton Suivant à la fonction de transition.
nextButton.addEventListener('click', goToNextQuestion);

// Permet de recommencer une partie dans la même catégorie.
document.querySelector('#retry-button').addEventListener('click', () => {
  startQuiz(currentCategory);
});

// Permet de revenir à l'écran de sélection des catégories.
document.querySelector('#change-category-button').addEventListener('click', showCategorySelection);

// Récupère la catégorie demandée dans l'URL, si elle existe.
const params = new URLSearchParams(window.location.search);
const requestedCategory = params.get('category');

// Démarre automatiquement le quiz si une catégorie valide est présente dans l'URL.
if (requestedCategory && QUESTION_BANK?.[requestedCategory]) {
  startQuiz(requestedCategory);
}
