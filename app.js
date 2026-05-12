const TARGET_CORRECT = 15;

const taskEl = document.getElementById("task");
const form = document.getElementById("answerForm");
const quotientInput = document.getElementById("quotientInput");
const remainderInput = document.getElementById("remainderInput");
const feedbackEl = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");
const correctCountEl = document.getElementById("correctCount");
const tryCountEl = document.getElementById("tryCount");

let currentTask = null;
let correctCount = Number(localStorage.getItem("rest_correct") || 0);
let tryCount = Number(localStorage.getItem("rest_tries") || 0);
let completed = localStorage.getItem("rest_completed") === "true";

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createTask() {
  const divisor = randomInt(2, 10);       // Einmaleinsreihe
  const quotient = randomInt(1, 10);      // kleines Einmaleins
  const remainder = randomInt(0, divisor - 1);
  const dividend = divisor * quotient + remainder;

  // Dividend bleibt ungefähr im gewünschten Bereich und ist kindgerecht.
  if (dividend > 120) return createTask();

  return { dividend, divisor, quotient, remainder };
}

function renderStats() {
  correctCountEl.textContent = correctCount;
  tryCountEl.textContent = tryCount;
}

function saveStats() {
  localStorage.setItem("rest_correct", String(correctCount));
  localStorage.setItem("rest_tries", String(tryCount));
  localStorage.setItem("rest_completed", String(completed));
}

function newTask() {
  currentTask = createTask();
  taskEl.textContent = `${currentTask.dividend} : ${currentTask.divisor} = ? Rest ?`;

  quotientInput.value = "";
  remainderInput.value = "";
  quotientInput.disabled = false;
  remainderInput.disabled = false;
  form.querySelector("button").disabled = false;

  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  nextBtn.hidden = true;
  quotientInput.focus();
}

function sendLearningViewDone() {
  completed = true;
  saveStats();

  // Robuste Abschlussmeldung für Einbettungen.
  window.parent.postMessage({
    type: "learningview",
    status: "completed",
    score: correctCount,
    maxScore: TARGET_CORRECT,
    success: true
  }, "*");

  window.parent.postMessage({
    type: "completed",
    completed: true,
    success: true
  }, "*");
}

function finishApp() {
  taskEl.textContent = "Geschafft!";
  form.hidden = true;
  nextBtn.hidden = true;
  restartBtn.hidden = false;

  feedbackEl.textContent = "Du hast 15 Aufgaben richtig gelöst. Die Aufgabe ist abgeschlossen.";
  feedbackEl.className = "feedback done";

  sendLearningViewDone();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (completed) return;

  const userQuotient = Number(quotientInput.value);
  const userRemainder = Number(remainderInput.value);

  tryCount++;

  const isCorrect =
    userQuotient === currentTask.quotient &&
    userRemainder === currentTask.remainder;

  if (isCorrect) {
    correctCount++;
    feedbackEl.textContent = "Richtig!";
    feedbackEl.className = "feedback good";
  } else {
    feedbackEl.textContent =
      `Noch nicht. Richtig wäre: ${currentTask.quotient} Rest ${currentTask.remainder}.`;
    feedbackEl.className = "feedback bad";
  }

  quotientInput.disabled = true;
  remainderInput.disabled = true;
  form.querySelector("button").disabled = true;

  renderStats();
  saveStats();

  if (correctCount >= TARGET_CORRECT) {
    finishApp();
  } else {
    nextBtn.hidden = false;
  }
});

nextBtn.addEventListener("click", newTask);

restartBtn.addEventListener("click", () => {
  correctCount = 0;
  tryCount = 0;
  completed = false;
  saveStats();

  form.hidden = false;
  restartBtn.hidden = true;
  renderStats();
  newTask();
});

renderStats();

if (completed || correctCount >= TARGET_CORRECT) {
  finishApp();
} else {
  newTask();
}
