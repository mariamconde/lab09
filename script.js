'use strict';

//constants
const totalQuestions = 5;
const base_url = `https://opentdb.com/api.php?amount=${totalQuestions}`;

//global variables
let url; //send fetch request to this url
let counter;
let score;
let correct;
let questions;

//get DOM elements
const cards = document.querySelectorAll('.card');
const categoryCard = cards[0];
const questionCard = cards[1];
const skeletonCard = cards[2];
const scoreCard = cards[3];

const categoryElements = Array.from(document.querySelectorAll('.category-item'));
const playBtn = document.querySelector('button');
const submitBtn = questionCard.querySelector('button');
const playAgainBtn = scoreCard.querySelector('button');
const questionHeaders = questionCard.querySelectorAll('span');
const questionText = questionCard.querySelector('.question-text');
const questionBody = questionCard.querySelector('.card-body');
const scoreElements = scoreCard.querySelectorAll('.stat');


categoryElements.forEach(item=>item.addEventListener('click', clickCategory));

function clickCategory(e){
    e.target.classList.toggle('selected');
    categoryElements.forEach(item=>{
        if(item.classList.contains('selected')&& item!== e.target)
            item.classList.remove('selected');
    });
}

playBtn.addEventListener('click', initGame);

function initGame() {
    // Reset global variables
    counter = 0;
    score = 0;
    correct = 0;
    questions = []; // Reset the questions array
    url = base_url;

    const selectedCategory = categoryElements.find(item => item.classList.contains('selected'));

    if (selectedCategory) {
        url = `${base_url}&category=${selectedCategory.dataset.category}`;

        categoryCard.classList.add('hidden');
        skeletonCard.classList.remove('hidden');

        getQuestions();
    } else {
        alert('Choose a Category!!!');
    }
}

async function getQuestions() {
    try {
        const response = await fetch(url);
        if(!response.ok)
            throw Error(`Error: ${response.url} ${response.statusText}`);
        const data = await response.json();
        if(data.response_code === 0){
            processQuestions(data);
            showQuestions();
        }
        else{
            throw Error('Error: Cannot fetch questions from the API');
        }
    } catch (error) {
        console.log(error);
    }
}

function processQuestions(data) {
    const apiQuestions = data.results;

    apiQuestions.forEach(apiQuestion => {
        const question = {
            text: apiQuestion.question,
            level: apiQuestion.difficulty.toLowerCase(),
            answers: [],
            correctAnswer: 0,
        };

        question.answers.push(apiQuestion.correct_answer);

        apiQuestion.incorrect_answers.forEach(incorrectAnswer => {
            question.answers.push(incorrectAnswer);
        });

        shuffleArray(question.answers);

        question.correctAnswer = question.answers.indexOf(apiQuestion.correct_answer);

        questions.push(question);
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function showQuestions() {
    submitBtn.disabled = false;
    let optionElements = questionCard.querySelectorAll('.option-item');
    optionElements.forEach(element=>element.remove());

    const question = questions[counter];
    questionHeaders[0].textContent = `Question: ${counter+1} / ${totalQuestions}`;
    questionHeaders[1].textContent = `Level: ${question.level}`;
    questionHeaders[2].textContent = `Score: ${score}`;
    questionText.innerHTML = question.text;
    const fragment = document.createDocumentFragment();
    question.answers.forEach(answer=>{
        const option = document.createElement('div');
        option.innerHTML = answer;
        option.classList.add('option-item');
        fragment.append(option);
    });

    questionBody.insertBefore(fragment, submitBtn);
    skeletonCard.classList.add('hidden');
    questionCard.classList.remove('hidden');

    optionElements = questionCard.querySelectorAll('.option-item');
    optionElements.forEach(item=>item.addEventListener('click', e=>{
        optionElements.forEach(element=>{
            if(element.classList.contains('selected'))
                element.classList.remove('selected');
        });

        e.target.classList.add('selected');
    }));
}

submitBtn.addEventListener('click', submitAnswer);

function submitAnswer() {
    submitBtn.disabled = true;
    const answerSubmitted = questionBody.querySelector('.selected');
    const allAnswers = questionBody.querySelectorAll('.option-item');
    const correctAnswer = allAnswers[questions[counter].correctAnswer];

    correctAnswer.classList.add('correct');

    if (answerSubmitted) {
        const selectedAnswerIndex = Array.from(allAnswers).indexOf(answerSubmitted);

        if (selectedAnswerIndex === questions[counter].correctAnswer) {
            correctAnswer.classList.add('correct');
            score += getScoreForCurrentQuestion();
            correct++;
        } else {
            answerSubmitted.classList.add('wrong');
            correctAnswer.classList.add('correct');
        }

        setTimeout(nextQuestion, 1500);
    }
}

function getScoreForCurrentQuestion() {
    const currentQuestion = questions[counter];
    if (currentQuestion.level === 'easy') {
        return 10;
    } else if (currentQuestion.level === 'medium') {
        return 20;
    } else if (currentQuestion.level === 'hard') {
        return 30;
    }
    return 0;
}

function nextQuestion() {
    counter++;

    if(counter < totalQuestions)
        showQuestions();
    else
        showScore();
}

function showScore() {
    scoreElements[0].textContent = `Correct Answers: ${correct}`;
    scoreElements[1].textContent = `Score: ${score}`;

    questionCard.classList.add('hidden');
    scoreCard.classList.remove('hidden');
}

playAgainBtn.addEventListener('click', ()=>{

    counter = 0;
    score = 0;
    correct = 0;
    questions = [];
    
    scoreCard.classList.add('hidden');
    categoryCard.classList.remove('hidden');

    categoryElements.forEach(item => item.classList.remove('selected'));

    const selectedAnswer = questionBody.querySelector('.selected');
    if (selectedAnswer) {
        selectedAnswer.classList.remove('selected');
    }
});