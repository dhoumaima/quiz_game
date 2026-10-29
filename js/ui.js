// Regroupe les elements HTML utilises dans l'interface du quiz
// querySelector permet de recuperer chaque element a partir de son identifiant
export const elements = {
  categoryScreen: document.querySelector('#category-screen'),
  gameScreen: document.querySelector('#game-screen'),
  resultScreen: document.querySelector('#result-screen'),
  quizTitle: document.querySelector('#quiz-title'),
  timer: document.querySelector('#timer'),
  timerValue: document.querySelector('#timer-value'),
  questionCounter: document.querySelector('#question-counter'),
  scoreLive: document.querySelector('#score-live'),
  progressTrack: document.querySelector('#progress-track'),
  questionText: document.querySelector('#question-text'),
  answersList: document.querySelector('#answers-list'),
  answerStatus: document.querySelector('#answer-status'),
  questionHint: document.querySelector('#question-hint'),
  nextButton: document.querySelector('#next-button'),
  resultTitle: document.querySelector('#result-title'),
  resultMessage: document.querySelector('#result-message'),
  finalScore: document.querySelector('#final-score'),
  finalPercent: document.querySelector('#final-percent'),
  finalTime: document.querySelector('#final-time'),
  correctionsList: document.querySelector('#corrections-list')
};


// Fonction qui affiche les reponses d'une question dans l'interface
// onSelect represente la fonction executee lorsqu'une reponse est choisie
export function renderAnswers(question, onSelect) {

  // Supprime les anciennes reponses affichees
  elements.answersList.replaceChildren();

  // Parcourt toutes les reponses de la question
  question.answers.forEach((answer, index) => {

    // Cree un bouton pour chaque reponse
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer-option';

    // Cree un element pour afficher la lettre de la reponse
    const letter = document.createElement('span');
    letter.className = 'answer-letter';

    // Pour une question Vrai/Faux, affiche V ou F
    if (question.type === 'true-false') {
      letter.textContent = index === 0 ? 'V' : 'F';
    } else {

      // Pour les autres questions, genere les lettres A, B, C, D...
      letter.textContent = String.fromCharCode(65 + index);
    }

    // Cree un element contenant le texte de la reponse
    const text = document.createElement('span');
    text.textContent = answer;

    // Ajoute la lettre et le texte dans le bouton
    button.append(letter, text);

    // Execute onSelect avec l'indice de la reponse lors du clic
    button.addEventListener('click', () => onSelect(index));

    // Ajoute le bouton a la liste des reponses
    elements.answersList.append(button);
  });
}


// Fonction qui affiche les corrections apres la fin du quiz
export function renderCorrections(questions, history) {

  // Supprime les anciennes corrections affichees
  elements.correctionsList.replaceChildren();

  // Parcourt toutes les questions du quiz
  questions.forEach((question, index) => {

    // Recupere la reponse de l'utilisateur dans l'historique
    // Si aucune reponse n'existe, considere que le temps est ecoule
    const answer = history[index] || {
      selected: -1,
      timedOut: true
    };

    // Verifie si la reponse choisie correspond a la bonne reponse
    const isCorrect = answer.selected === question.correct;

    // Cree une carte pour afficher la correction
    const article = document.createElement('article');

    // Attribue une classe selon que la reponse est correcte ou incorrecte
    article.className = `correction-card ${
      isCorrect ? 'is-correct' : 'is-wrong'
    }`;

    // Cree le titre contenant le numero et le texte de la question
    const heading = document.createElement('h3');
    heading.textContent = `Question ${index + 1} : ${question.question}`;

    // Cree un message indiquant le resultat de la reponse
    const result = document.createElement('p');
    result.textContent = isCorrect
      ? '✓ Bonne réponse'
      : answer.timedOut
        ? 'Temps écoulé'
        : '✕ Réponse incorrecte';

    // Affiche la reponse choisie par l'utilisateur
    const userAnswer = document.createElement('p');
    userAnswer.textContent = answer.selected < 0
      ? 'Ta réponse : aucune réponse'
      : `Ta réponse : ${question.answers[answer.selected]}`;

    // Affiche la bonne reponse
    const correctAnswer = document.createElement('p');
    correctAnswer.textContent =
      `Bonne réponse : ${question.answers[question.correct]}`;

    // Cree un paragraphe contenant l'explication de la question
    const explanation = document.createElement('p');
    explanation.textContent = question.explanation || '';

    // Ajoute tous les elements dans la carte de correction
    article.append(
      heading,
      result,
      userAnswer,
      correctAnswer,
      explanation
    );

    // Ajoute la carte de correction a la liste des corrections
    elements.correctionsList.append(article);
  });
}


// Fonction qui affiche la progression du quiz
export function renderProgress(questions, history, currentIndex) {

  // Recupere la barre de progression
  const track = elements.progressTrack;

  // Supprime les anciennes cases de progression
  track.replaceChildren();

  // Parcourt toutes les questions pour creer une case par question
  questions.forEach((question, index) => {

    // Cree une case de progression
    const box = document.createElement('div');
    box.className = 'progress-box';

    // Recupere la reponse associee a cette question
    const answer = history[index];

    // Si une reponse existe, indique si elle est correcte ou incorrecte
    if (answer) {
      box.classList.add(
        answer.isCorrect ? 'is-correct' : 'is-wrong'
      );

    // Sinon, met en evidence la question actuellement affichee
    } else if (index === currentIndex) {
      box.classList.add('is-current');
    }

    // Ajoute un nom accessible a chaque case
    box.setAttribute('aria-label', `Question ${index + 1}`);

    // Affiche le numero de la question au survol
    box.title = `Question ${index + 1}`;

    // Ajoute la case a la barre de progression
    track.append(box);
  });

  // Definit le nombre total de questions dans la barre de progression
  track.setAttribute('aria-valuemax', String(questions.length));

  // Indique le nombre de questions deja traitees
  track.setAttribute('aria-valuenow', String(
    history.filter(Boolean).length
  ));
}