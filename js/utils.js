export function shuffle(items) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}
export function shuffleAnswers(question) {
  const answers = question.answers.map((text, index) => ({
    text,
    isCorrect: index === question.correct
  }));

  for (let i = answers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [answers[i], answers[j]] = [answers[j], answers[i]];
  }

  return {
    ...question,
    answers: answers.map(answer => answer.text),
    correct: answers.findIndex(answer => answer.isCorrect)
  };
}