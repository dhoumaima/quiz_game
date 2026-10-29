import { QUESTION_TIME } from './config.js';

let timerId = null;
let questionStartedAt = 0;

export function stopTimer() {
  if (timerId !== null) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

export function getElapsedTime() {
  if (!questionStartedAt) return 0;

  return Math.min(
    QUESTION_TIME,
    (Date.now() - questionStartedAt) / 1000
  );
}

export function startTimer(onTick, onTimeout) {
  stopTimer();

  questionStartedAt = Date.now();
  let remainingTime = QUESTION_TIME;

  onTick(remainingTime);

  timerId = window.setInterval(() => {
    remainingTime = Math.max(
      0,
      QUESTION_TIME - Math.floor((Date.now() - questionStartedAt) / 1000)
    );

    onTick(remainingTime);

    if (remainingTime <= 0) {
      stopTimer();
      onTimeout();
    }
  }, 200);
}