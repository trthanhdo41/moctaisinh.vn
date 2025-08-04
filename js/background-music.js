class BackgroundMusicPlayer {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this.volume = 1.0; // Max volume
    this.player = null;
    this.init();
  }
  init() {
    this.audio = document.createElement('audio');
    this.audio.id = 'background-audio';
    this.audio.src = 'audio/Tận Hưởng Cuộc Sống.mp3';
    this.audio.loop = true;
    this.audio.volume = this.volume;
    this.audio.preload = 'auto';
    this.createPlayer();
    document.body.appendChild(this.audio);
    this.loadState();
    this.setupEventListeners();
    this.setupAutoStart();
  }
  createPlayer() {
    this.player = document.createElement('button');
    this.player.className = 'background-music-player';
    this.player.style.display = 'none';
    document.body.appendChild(this.player);
  }
  setupEventListeners() {
    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.saveState();
    });
    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.saveState();
    });
    this.audio.addEventListener('ended', () => {
      if (this.isPlaying) {
        this.audio.play();
      }
    });
    this.audio.addEventListener('timeupdate', () => {
      this.saveState();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.saveState();
      }
    });
    setInterval(() => {
      if (this.isPlaying) {
        this.saveState();
      }
    }, 5000); // Save every 5 seconds when playing
    document.addEventListener('visibilitychange', () => {
    });
  }
  setupAutoStart() {
    const startMusic = () => {
      if (!this.isPlaying) {
        this.play();
      }
      document.removeEventListener('click', startMusic);
      document.removeEventListener('keydown', startMusic);
      document.removeEventListener('touchstart', startMusic);
    };
    document.addEventListener('click', startMusic, { once: true });
    document.addEventListener('keydown', startMusic, { once: true });
    document.addEventListener('touchstart', startMusic, { once: true });
    if (this.shouldAutoPlay()) {
      setTimeout(() => {
        this.play();
      }, 1000);
    }
  }
  shouldAutoPlay() {
    try {
      const savedState = localStorage.getItem('backgroundMusicState');
      if (savedState) {
        const state = JSON.parse(savedState);
        return state.isPlaying || state.autoPlay;
      }
    } catch (error) {
    }
    return false;
  }
  play() {
    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
      }).catch(error => {
      });
    }
  }
  pause() {
    this.audio.pause();
  }
  saveState() {
    const state = {
      isPlaying: this.isPlaying,
      volume: this.volume,
      autoPlay: true, // Always enable auto-play
      currentTime: this.audio.currentTime,
      timestamp: Date.now()
    };
    localStorage.setItem('backgroundMusicState', JSON.stringify(state));
  }
  loadState() {
    try {
      const savedState = localStorage.getItem('backgroundMusicState');
      if (savedState) {
        const state = JSON.parse(savedState);
        this.volume = state.volume || 1.0; // Default to max volume
        this.audio.volume = this.volume;
        if (state.currentTime && state.timestamp) {
          const timeDiff = (Date.now() - state.timestamp) / 1000; // seconds
          this.audio.addEventListener('loadedmetadata', () => {
            if (this.audio.duration > 0) {
              const expectedTime = (state.currentTime + timeDiff) % this.audio.duration;
              this.audio.currentTime = expectedTime;
            }
          }, { once: true });
        }
        if (state.isPlaying || state.autoPlay) {
          setTimeout(() => {
            this.play();
          }, 1000);
        }
      } else {
        this.saveState();
      }
    } catch (error) {
    }
  }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new BackgroundMusicPlayer();
  });
} else {
  new BackgroundMusicPlayer();
} 