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



export function renderAnswers(question, onSelect) {
  elements.answersList.replaceChildren();

  question.answers.forEach((answer, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer-option';

    const letter = document.createElement('span');
    letter.className = 'answer-letter';

    if (question.type === 'true-false') {
      letter.textContent = index === 0 ? 'V' : 'F';
    } else {
      letter.textContent = String.fromCharCode(65 + index);
    }

    const text = document.createElement('span');
    text.textContent = answer;

    button.append(letter, text);
    button.addEventListener('click', () => onSelect(index));

    elements.answersList.append(button);
  });
}

export function renderCorrections(questions, history) {
  elements.correctionsList.replaceChildren();

  questions.forEach((question, index) => {
    const answer = history[index] || {
      selected: -1,
      timedOut: true
    };

    const isCorrect = answer.selected === question.correct;
    const article = document.createElement('article');
    article.className = `correction-card ${
      isCorrect ? 'is-correct' : 'is-wrong'
    }`;

    const heading = document.createElement('h3');
    heading.textContent = `Question ${index + 1} : ${question.question}`;

    const result = document.createElement('p');
    result.textContent = isCorrect
      ? '✓ Bonne réponse'
      : answer.timedOut
        ? 'Temps écoulé'
        : '✕ Réponse incorrecte';

    const userAnswer = document.createElement('p');
    userAnswer.textContent = answer.selected < 0
      ? 'Ta réponse : aucune réponse'
      : `Ta réponse : ${question.answers[answer.selected]}`;

    const correctAnswer = document.createElement('p');
    correctAnswer.textContent =
      `Bonne réponse : ${question.answers[question.correct]}`;

    const explanation = document.createElement('p');
    explanation.textContent = question.explanation || '';

    article.append(
      heading,
      result,
      userAnswer,
      correctAnswer,
      explanation
    );

    elements.correctionsList.append(article);
  });
  
}
export function renderProgress(questions, history, currentIndex) {
  const track = elements.progressTrack;
  track.replaceChildren();

  questions.forEach((question, index) => {
    const box = document.createElement('div');
    box.className = 'progress-box';

    const answer = history[index];

    if (answer) {
      box.classList.add(
        answer.isCorrect ? 'is-correct' : 'is-wrong'
      );
    } else if (index === currentIndex) {
      box.classList.add('is-current');
    }

    box.setAttribute('aria-label', `Question ${index + 1}`);
    box.title = `Question ${index + 1}`;

    track.append(box);
  });

  track.setAttribute('aria-valuemax', String(questions.length));
  track.setAttribute('aria-valuenow', String(
    history.filter(Boolean).length
  ));
}