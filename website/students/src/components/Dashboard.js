import { getUserProgress, saveUserProgress, logoutUser } from '../services/firebaseService.js';

class Dashboard {
  constructor(user) {
    this.user = user;
    this.userProgress = null;
    this.episodes = [
      {
        id: 1,
        title: "Types of Signs & Their Meanings",
        videoUrl: "https://youtu.be/wNJLUguG3Cg?si=5bkdUX5GnPvalznS",
        description: "Learn about different types of road traffic signs and their meanings."
      },
      {
        id: 2,
        title: "Control Signs (Regulatory Signs)",
        videoUrl: "https://youtu.be/abVZPyq5YZQ?si=pgM61wVC3RURqM3g",
        description: "Understanding control and regulatory signs on South African roads."
      },
      {
        id: 3,
        title: "Command Signs (Regulatory Signs)",
        videoUrl: "https://youtu.be/Mi0os_pSyjo?si=nFsmnoI8h3jO5-K1",
        description: "Learn about command signs and their importance in road safety."
      },
      {
        id: 4,
        title: "Prohibition Signs (Regulatory Signs)",
        videoUrl: "https://youtu.be/hDs8kYr0ezQ?si=I4o4OykPBZS9W0g2",
        description: "Understanding prohibition signs and what they mean for drivers."
      },
      {
        id: 5,
        title: "Reservation Signs Part 1",
        videoUrl: "https://youtu.be/2EdR4KaTBxI?si=KXurH8pduxc0TUhI",
        description: "First part of reservation signs education."
      },
      {
        id: 6,
        title: "Reservation Signs Part 2",
        videoUrl: "https://youtu.be/09jtg4PDeQQ?si=tf7Ib9GAwsqaXTdF",
        description: "Second part of reservation signs education."
      },
      {
        id: 7,
        title: "Reservation Signs Part 3",
        videoUrl: "https://youtu.be/wtKCJ0bdupI?si=9Zf2gx9Ay82OK7jt",
        description: "Final part of reservation signs education."
      }
    ];
    this.init();
  }

  async init() {
    await this.loadUserProgress();
    this.createDashboard();
    this.attachEventListeners();
  }

  async loadUserProgress() {
    try {
      this.userProgress = await getUserProgress(this.user.uid);
      if (!this.userProgress) {
        // Initialize progress for new user
        this.userProgress = {
          completedEpisodes: [],
          currentEpisode: 1,
          scores: {},
          totalScore: 0,
          lastUpdated: new Date()
        };
        await saveUserProgress(this.user.uid, this.userProgress);
      }
    } catch (error) {
      console.error('Error loading user progress:', error);
      this.userProgress = {
        completedEpisodes: [],
        currentEpisode: 1,
        scores: {},
        totalScore: 0,
        lastUpdated: new Date()
      };
    }
  }

  createDashboard() {
    const dashboardHTML = `
      <div id="dashboard-container" class="dashboard-container">
        <header class="dashboard-header">
          <div class="logo-section">
            <img src="assets/logo.png" alt="MHS Driving School" class="dashboard-logo">
            <h1>MHS Driving School</h1>
          </div>
          <div class="user-section">
            <span>Welcome, ${this.user.email}</span>
            <button id="logout-btn" class="btn-secondary">Logout</button>
          </div>
        </header>

        <main class="dashboard-main">
          <div class="progress-overview">
            <h2>Your Progress</h2>
            <div class="progress-stats">
              <div class="stat">
                <span class="stat-number">${this.userProgress.completedEpisodes.length}</span>
                <span class="stat-label">Episodes Completed</span>
              </div>
              <div class="stat">
                <span class="stat-number">${this.episodes.length}</span>
                <span class="stat-label">Total Episodes</span>
              </div>
              <div class="stat">
                <span class="stat-number">${Math.round((this.userProgress.completedEpisodes.length / this.episodes.length) * 100)}%</span>
                <span class="stat-label">Course Progress</span>
              </div>
            </div>
          </div>

          <div class="episodes-section">
            <h2>K53 Road Traffic Signs Episodes</h2>
            <div class="episodes-grid">
              ${this.episodes.map(episode => this.createEpisodeCard(episode)).join('')}
            </div>
          </div>
        </main>
      </div>
    `;

    document.getElementById('app').innerHTML = dashboardHTML;
  }

  createEpisodeCard(episode) {
    const isCompleted = this.userProgress.completedEpisodes.includes(episode.id);
    const isLocked = episode.id > this.userProgress.currentEpisode;
    const score = this.userProgress.scores[episode.id] || null;

    return `
      <div class="episode-card ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}">
        <div class="episode-header">
          <h3>Episode ${episode.id}</h3>
          ${isCompleted ? '<span class="completion-badge">✓ Completed</span>' : ''}
          ${isLocked ? '<span class="locked-badge">🔒 Locked</span>' : ''}
        </div>
        <div class="episode-content">
          <h4>${episode.title}</h4>
          <p>${episode.description}</p>
          ${score ? `<div class="episode-score">Last Score: ${score}/50</div>` : ''}
        </div>
        <div class="episode-actions">
          ${!isLocked ? `
            <button class="btn-primary watch-video" data-episode="${episode.id}">
              ${isCompleted ? 'Rewatch Video' : 'Watch Video'}
            </button>
            ${isCompleted ? `
              <button class="btn-secondary retake-quiz" data-episode="${episode.id}">
                Retake Quiz
              </button>
            ` : ''}
          ` : ''}
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Logout functionality
    document.getElementById('logout-btn').addEventListener('click', async () => {
      try {
        await logoutUser();
        // Redirect to login
        import('./Authentication.js').then(({ Authentication }) => {
          new Authentication();
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    });

    // Watch video buttons
    document.querySelectorAll('.watch-video').forEach(button => {
      button.addEventListener('click', (e) => {
        const episodeId = parseInt(e.target.dataset.episode);
        this.watchEpisode(episodeId);
      });
    });

    // Retake quiz buttons
    document.querySelectorAll('.retake-quiz').forEach(button => {
      button.addEventListener('click', (e) => {
        const episodeId = parseInt(e.target.dataset.episode);
        this.startQuiz(episodeId);
      });
    });
  }

  watchEpisode(episodeId) {
    const episode = this.episodes.find(ep => ep.id === episodeId);
    if (episode) {
      import('./VideoPlayer.js').then(({ VideoPlayer }) => {
        new VideoPlayer(episode, this.user, () => {
          // Callback when video is completed
          this.onVideoCompleted(episodeId);
        });
      });
    }
  }

  async onVideoCompleted(episodeId) {
    // Start quiz after video completion
    this.startQuiz(episodeId);
  }

  startQuiz(episodeId) {
    import('./Quiz.js').then(({ Quiz }) => {
      new Quiz(episodeId, this.user, (score) => {
        // Callback when quiz is completed
        this.onQuizCompleted(episodeId, score);
      });
    });
  }

  async onQuizCompleted(episodeId, score) {
    // Update user progress
    if (!this.userProgress.completedEpisodes.includes(episodeId)) {
      this.userProgress.completedEpisodes.push(episodeId);
    }
    
    this.userProgress.scores[episodeId] = score;
    this.userProgress.currentEpisode = Math.max(this.userProgress.currentEpisode, episodeId + 1);
    this.userProgress.lastUpdated = new Date();

    try {
      await saveUserProgress(this.user.uid, this.userProgress);
      // Refresh dashboard to show updated progress
      this.createDashboard();
      this.attachEventListeners();
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }
}

export { Dashboard };
