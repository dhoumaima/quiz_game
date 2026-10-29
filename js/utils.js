// Fonction qui mélange aleatoirement les elements d'un tableau
export function shuffle(items) {

  // Cree une copie du tableau original pour ne pas le modifier
  const copy = [...items];

  // Parcourt le tableau de la derniere position jusqu'a la deuxieme
  for (let i = copy.length - 1; i > 0; i -= 1) {

    // Genere un indice aleatoire entre 0 et i
    const j = Math.floor(Math.random() * (i + 1));

    // Echange les elements situes aux positions i et j
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  // Retourne le tableau melange
  return copy;
}


// Fonction qui melange les reponses d'une question
// tout en conservant l'identification de la bonne reponse
export function shuffleAnswers(question) {

  // Associe chaque reponse a un indicateur qui precise
  // si elle est correcte ou non
  const answers = question.answers.map((text, index) => ({
    text,
    isCorrect: index === question.correct
  }));

  // Melange aleatoirement les reponses
  for (let i = answers.length - 1; i > 0; i--) {

    // Genere un indice aleatoire entre 0 et i
    const j = Math.floor(Math.random() * (i + 1));

    // Echange les deux reponses
    [answers[i], answers[j]] = [answers[j], answers[i]];
  }

  // Retourne une copie de la question avec les reponses melangees
  return {
    ...question,

    // Recupere uniquement le texte des reponses dans le nouvel ordre
    answers: answers.map(answer => answer.text),

    // Recherche et retourne le nouvel indice de la bonne reponse
    correct: answers.findIndex(answer => answer.isCorrect)
  };
}