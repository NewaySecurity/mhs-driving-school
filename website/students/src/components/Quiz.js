import { getUserProgress, saveUserProgress } from '../services/firebaseService.js';
import { getQuestionsForEpisode } from '../data/quizQuestions.js';

class Quiz {
  constructor(episodeId, user, onQuizCompleteCallback) {
    this.episodeId = episodeId;
    this.user = user;
    this.onQuizCompleteCallback = onQuizCompleteCallback;
    this.questions = [];
    this.userAnswers = {};
    this.fetchQuestions();
  }

  async fetchQuestions() {
    // Fetch quiz questions from a database or static JSON file
    this.questions = await this.loadQuestions();
    this.displayQuiz();
  }

  async loadQuestions() {
    // Load actual K53 questions for this episode
    return getQuestionsForEpisode(this.episodeId);
  }

  displayQuiz() {
    const quizHTML = `
      
<div class="quiz-container">
        <h2>Episode ${this.episodeId} Quiz</h2>
        <form id="quiz-form">
          ${this.questions
            .map(
              (q, index) => `
          <div class="quiz-question">
            <p>${index + 1}. ${q.question}</p>
            ${Object.keys(q.options)
              .map(
                (key) => `
            <label>
              <input type="radio" name="question${q.id}" value="${key}" required> ${q.options[key]}
            </label><br>`
              )
              .join('')}
          </div>`
            )
            .join('')}
          <button type="submit" class="btn-primary">Submit Quiz</button>
        </form>
      </div>
    `;

    document.getElementById('app').innerHTML = quizHTML;
    this.addSubmitListener();
  }

  addSubmitListener() {
    const quizForm = document.getElementById('quiz-form');
    quizForm.addEventListener('submit', (e) => {
      e.preventDefault();
      Array.from(new FormData(quizForm)).forEach(([name, value]) => {
        const qId = parseInt(name.replace('question', ''));
        this.userAnswers[qId] = value;
      });
      this.evaluateQuiz();
    });
  }

  evaluateQuiz() {
    let score = 0;
    this.questions.forEach((q) => {
      if (this.userAnswers[q.id] === q.correct) {
        score++;
      }
    });
    this.showResult(score);
    this.saveScore(score);
  }

  showResult(score) {
    const resultHTML = `
      <div class="quiz-result">
        <h2>Quiz Complete!</h2>
        <p>You scored ${score} out of ${this.questions.length}.</p>
        <button class="btn-secondary" id="returnDashboard">Return to Dashboard</button>
      </div>
    `;
    document.getElementById('app').innerHTML = resultHTML;
    document.getElementById('returnDashboard').addEventListener('click', () => {
      this.onQuizCompleteCallback(score);
    });
  }

  async saveScore(score) {
    const userProgress = await getUserProgress(this.user.uid);
    userProgress.scores[this.episodeId] = score;
    userProgress.lastUpdated = new Date();
    await saveUserProgress(this.user.uid, userProgress);
  }
}

export { Quiz };

