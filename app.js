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
        label: "3. Klasse · Faktor bis 12",
        maxFactor: 12
    },
    grade4: {
        label: "4. Klasse · Faktor bis 20",
        maxFactor: 20
    }
};

function randomInt(min,max){
    return Math.floor(Math.random()*(max-min+1))+min;
}

function createTask(){
    const divisor = randomInt(2,10);
    const quotient = randomInt(1,currentLevel.maxFactor);
    const remainder = randomInt(0,divisor-1);

    return {
        divisor,
        quotient,
        remainder,
        dividend: divisor*quotient + remainder
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

    // Mit Rest
    const withRest = raw.match(/^(\d+)\s*[rR]\s*(\d+)$/);
    if(withRest){
        return {
            valid:true,
            q:Number(withRest[1]),
            r:Number(withRest[2]),
            formatted:`${Number(withRest[1])} R${Number(withRest[2])}`
        };
    }

    // Ohne Rest
    const withoutRest = raw.match(/^(\d+)$/);
    if(withoutRest){
        return {
            valid:true,
            q:Number(withoutRest[1]),
            r:null,
            formatted:`${Number(withoutRest[1])}`
        };
    }

    return { valid:false };
}

function isCorrect(ans){

    if(!ans.valid) return false;

    if(currentTask.remainder === 0){
        return (
            ans.q === currentTask.quotient &&
            (ans.r === 0 || ans.r === null)
        );
    }

    return (
        ans.q === currentTask.quotient &&
        ans.r === currentTask.remainder
    );
}

function sendLearningViewDone(){

    // WICHTIG: LearningView erkennt DAS
    window.parent.postMessage("AppSolved","*");

    // Backup (optional)
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

    renderStats();
    newTask();
}

form.addEventListener("submit", function(e){

    e.preventDefault();
    if(completed) return;

    const ans = parseAnswer(answerInput.value);
    const correct = isCorrect(ans);

    tryCount++;

    if(ans.valid){
        answerInput.value = ans.formatted;
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

grade3Btn.onclick = () => startLevel("grade3");
grade4Btn.onclick = () => startLevel("grade4");

nextBtn.onclick = newTask;

menuBtn.onclick = () => {
    gameCard.hidden = true;
    menuCard.hidden = false;
};

restartBtn.onclick = () => {
    correctCount = 0;
    tryCount = 0;
    completed = false;

    form.hidden = false;
    restartBtn.hidden = true;

    renderStats();
    newTask();
};
