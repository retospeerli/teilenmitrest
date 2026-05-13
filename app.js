const TARGET_CORRECT = 15;

const menuCard = document.getElementById("menuCard");
const gameCard = document.getElementById("gameCard");

const grade3Btn = document.getElementById("grade3Btn");
const grade4Btn = document.getElementById("grade4Btn");

const levelText = document.getElementById("levelText");
const taskEl = document.getElementById("task");
const form = document.getElementById("answerForm");
const answerInput = document.getElementById("answerInput");

const feedbackEl = document.getElementById("feedback");

const nextBtn = document.getElementById("nextBtn");
const menuBtn = document.getElementById("menuBtn");
const restartBtn = document.getElementById("restartBtn");

const correctCountEl = document.getElementById("correctCount");
const tryCountEl = document.getElementById("tryCount");

let currentTask = null;
let currentLevel = null;

let correctCount = 0;
let tryCount = 0;
let completed = false;

const LEVELS = {
    grade3: {
        label: "3. Klasse · kleines Einmaleins 2–10 · Faktor bis 12",
        maxFactor: 12
    },
    grade4: {
        label: "4. Klasse · kleines Einmaleins 2–10 · Faktor bis 20",
        maxFactor: 20
    }
};

function randomInt(min,max){
    return Math.floor(Math.random()*(max-min+1)) + min;
}

function createTask(){
    const divisor = randomInt(2,10);
    const quotient = randomInt(1,currentLevel.maxFactor);
    const remainder = randomInt(0,divisor-1);
    const dividend = divisor*quotient + remainder;

    return {
        divisor,
        quotient,
        remainder,
        dividend
    };
}

function renderStats(){
    correctCountEl.textContent = correctCount;
    tryCountEl.textContent = tryCount;
}

function newTask(){
    currentTask = createTask();

    taskEl.textContent =
        `${currentTask.dividend} : ${currentTask.divisor} = ?`;

    answerInput.value = "";
    answerInput.disabled = false;
    form.querySelector("button").disabled = false;

    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";

    nextBtn.hidden = true;
    answerInput.focus();
}

function parseAnswer(raw){
    raw = raw.trim();

    const withRest = raw.match(/^(\d+)\s*[rR]\s*(\d+)$/);
    if(withRest){
        return {
            validPattern: true,
            quotient: Number(withRest[1]),
            remainder: Number(withRest[2]),
            formatted: `${Number(withRest[1])} R${Number(withRest[2])}`
        };
    }

    const withoutRest = raw.match(/^(\d+)$/);
    if(withoutRest){
        return {
            validPattern: true,
            quotient: Number(withoutRest[1]),
            remainder: null,
            formatted: `${Number(withoutRest[1])}`
        };
    }

    return {
        validPattern: false,
        quotient: null,
        remainder: null,
        formatted: raw
    };
}

function isAnswerCorrect(answer){
    if(!answer.validPattern){
        return false;
    }

    if(currentTask.remainder === 0){
        return (
            answer.quotient === currentTask.quotient &&
            (
                answer.remainder === 0 ||
                answer.remainder === null
            )
        );
    }

    return (
        answer.quotient === currentTask.quotient &&
        answer.remainder === currentTask.remainder
    );
}

function sendLearningViewDone(){
    window.parent.postMessage({
        type:"completed",
        success:true
    },"*");
}

function finishApp(){
    completed = true;

    taskEl.textContent = "Geschafft!";
    form.hidden = true;
    nextBtn.hidden = true;
    restartBtn.hidden = false;

    feedbackEl.textContent = "15 Aufgaben richtig gelöst.";
    feedbackEl.className = "feedback done";

    sendLearningViewDone();
}

function startLevel(levelKey){
    currentLevel = LEVELS[levelKey];

    correctCount = 0;
    tryCount = 0;
    completed = false;

    levelText.textContent = currentLevel.label;

    menuCard.hidden = true;
    gameCard.hidden = false;
    form.hidden = false;
    restartBtn.hidden = true;

    renderStats();
    newTask();
}

form.addEventListener("submit", function(event){
    event.preventDefault();

    if(completed){
        return;
    }

    const answer = parseAnswer(answerInput.value);
    const correct = isAnswerCorrect(answer);

    tryCount++;

    if(answer.validPattern){
        answerInput.value = answer.formatted;
    }

    if(correct){
        correctCount++;
        feedbackEl.textContent = "Richtig!";
        feedbackEl.className = "feedback good";
    }else{
        let correctText = `${currentTask.quotient}`;

        if(currentTask.remainder !== 0){
            correctText += ` R${currentTask.remainder}`;
        }else{
            correctText += ` oder ${currentTask.quotient} R0`;
        }

        feedbackEl.textContent =
            `Falsch. Richtig wäre: ${correctText}`;

        feedbackEl.className = "feedback bad";
    }

    answerInput.disabled = true;
    form.querySelector("button").disabled = true;

    renderStats();

    if(correctCount >= TARGET_CORRECT){
        finishApp();
    }else{
        nextBtn.hidden = false;
    }
});

grade3Btn.addEventListener("click", function(){
    startLevel("grade3");
});

grade4Btn.addEventListener("click", function(){
    startLevel("grade4");
});

nextBtn.addEventListener("click", newTask);

menuBtn.addEventListener("click", function(){
    gameCard.hidden = true;
    menuCard.hidden = false;
});

restartBtn.addEventListener("click", function(){
    correctCount = 0;
    tryCount = 0;
    completed = false;

    form.hidden = false;
    restartBtn.hidden = true;

    renderStats();
    newTask();
});
