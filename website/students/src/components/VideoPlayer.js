class VideoPlayer {
  constructor(episode, user, onVideoCompleteCallback) {
    this.episode = episode;
    this.user = user;
    this.onVideoCompleteCallback = onVideoCompleteCallback;
    this.createVideoPlayer();
  }

  createVideoPlayer() {
    const playerHTML = `
      <div class="video-player">
        <h2>Now Watching: ${this.episode.title}</h2>
        <div class="video-container">
          <iframe
            src="${this.episode.videoUrl}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
        <button class="btn-primary video-complete">Video Complete</button>
      </div>
    `;

    document.getElementById('app').innerHTML = playerHTML;
    this.attachEventListeners();
  }

  attachEventListeners() {
    document.querySelector('.video-complete').addEventListener('click', () => {
      this.onVideoCompleteCallback();
    });
  }
}

export { VideoPlayer };
