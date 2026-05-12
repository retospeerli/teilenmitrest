const TARGET_CORRECT = 15;

const taskEl = document.getElementById("task");
const form = document.getElementById("answerForm");
const answerInput = document.getElementById("answerInput");

const feedbackEl = document.getElementById("feedback");

const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");

const correctCountEl = document.getElementById("correctCount");
const tryCountEl = document.getElementById("tryCount");


let currentTask = null;

let correctCount = Number(
    localStorage.getItem("rest_correct") || 0
);

let tryCount = Number(
    localStorage.getItem("rest_tries") || 0
);

let completed =
    localStorage.getItem("rest_completed") === "true";


function randomInt(min,max){

    return Math.floor(
        Math.random()*(max-min+1)
    ) + min;
}


function createTask(){

    const divisor = randomInt(2,10);

    const quotient = randomInt(1,20);

    const remainder = randomInt(
        0,
        divisor-1
    );

    const dividend =
        divisor*quotient + remainder;

    return{

        divisor,
        quotient,
        remainder,
        dividend
    };
}


function saveState(){

    localStorage.setItem(
        "rest_correct",
        correctCount
    );

    localStorage.setItem(
        "rest_tries",
        tryCount
    );

    localStorage.setItem(
        "rest_completed",
        completed
    );
}


function renderStats(){

    correctCountEl.textContent =
        correctCount;

    tryCountEl.textContent =
        tryCount;
}


function newTask(){

    currentTask = createTask();

    taskEl.textContent =
        `${currentTask.dividend} : ${currentTask.divisor} = ?`;

    answerInput.value = "";

    answerInput.disabled = false;

    form.querySelector("button")
        .disabled = false;

    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";

    nextBtn.hidden = true;

    answerInput.focus();
}


function sendLearningViewDone(){

    window.parent.postMessage({

        type:"completed",
        success:true

    },"*");
}


function finishApp(){

    completed = true;

    saveState();

    taskEl.textContent =
        "Geschafft!";

    form.hidden = true;

    nextBtn.hidden = true;

    restartBtn.hidden = false;

    feedbackEl.textContent =
        "15 Aufgaben richtig gelöst.";

    feedbackEl.className =
        "feedback done";

    sendLearningViewDone();
}


form.addEventListener(
    "submit",
    function(event){

        event.preventDefault();

        if(completed){
            return;
        }

        const raw =
            answerInput.value.trim();

        // erlaubt:
        // 9R8
        // 9 R8
        // 9r8
        // 9 r8

        const match =
            raw.match(
                /^(\d+)\s*[rR]\s*(\d+)$/
            );

        let isCorrect = false;

        if(match){

            const userQuotient =
                Number(match[1]);

            const userRemainder =
                Number(match[2]);


            // immer sauber darstellen
            answerInput.value =
                `${userQuotient} R${userRemainder}`;


            isCorrect =

                userQuotient ===
                currentTask.quotient

                &&

                userRemainder ===
                currentTask.remainder;
        }


        tryCount++;

        if(isCorrect){

            correctCount++;

            feedbackEl.textContent =
                "Richtig!";

            feedbackEl.className =
                "feedback good";

        }else{

            feedbackEl.textContent =

                `Falsch. Richtig wäre: ` +

                `${currentTask.quotient}` +

                ` R${currentTask.remainder}`;

            feedbackEl.className =
                "feedback bad";
        }


        answerInput.disabled = true;

        form.querySelector("button")
            .disabled = true;


        renderStats();

        saveState();


        if(
            correctCount >=
            TARGET_CORRECT
        ){

            finishApp();

        }else{

            nextBtn.hidden = false;
        }
    }
);


nextBtn.addEventListener(
    "click",
    newTask
);


restartBtn.addEventListener(
    "click",
    function(){

        correctCount = 0;

        tryCount = 0;

        completed = false;

        form.hidden = false;

        restartBtn.hidden = true;

        saveState();

        renderStats();

        newTask();
    }
);


renderStats();


if(
    completed
    ||
    correctCount >= TARGET_CORRECT
){

    finishApp();

}else{

    newTask();
}
