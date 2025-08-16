document.addEventListener('DOMContentLoaded', () => {
    // Player elements
    const player = document.querySelector('.player');
    const video = player.querySelector('.player__video');
    const playerControls = player.querySelector('.player__controls');

    // Control elements
    const playPauseBtn = document.getElementById('play-pause');
    const muteBtn = document.getElementById('mute');
    const volumeSlider = document.getElementById('volume-slider');
    const progressContainer = document.querySelector('.progress-container');
    const progressBar = document.querySelector('.progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const speedSelect = document.getElementById('playback-speed');
    const pipBtn = document.getElementById('pip');
    const fullscreenBtn = document.getElementById('fullscreen');

    // File upload elements
    const videoUploadInput = document.getElementById('video-upload');
    const uploadButton = document.getElementById('upload-button');

    // Play/Pause icons
    const playIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24px" height="24px"><path d="M8 5v14l11-7z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`;
    const pauseIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24px" height="24px"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`;
    
    // Volume icons
    const volumeUpIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24px" height="24px"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`;
    const volumeMuteIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24px" height="24px"><path d="M7 9v6h4l5 5V4l-5 5H7z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`;

    // --- Core Functions ---
    function togglePlay() {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    }

    function updatePlayButton() {
        playPauseBtn.innerHTML = video.paused ? playIcon : pauseIcon;
        player.classList.toggle('playing', !video.paused);
    }

    function handleVolumeUpdate() {
        video.volume = volumeSlider.value;
        video.muted = volumeSlider.value === 0;
        updateMuteIcon();
    }

    function toggleMute() {
        video.muted = !video.muted;
        if(video.muted) {
            volumeSlider.value = 0;
        } else {
            volumeSlider.value = video.volume > 0 ? video.volume : 0.5; // Restore to previous volume or a default
        }
        video.volume = volumeSlider.value;
        updateMuteIcon();
    }
    
    function updateMuteIcon() {
        muteBtn.innerHTML = (video.muted || video.volume === 0) ? volumeMuteIcon : volumeUpIcon;
    }

    function handleProgress() {
        const percent = (video.currentTime / video.duration) * 100;
        progressBar.style.width = `${percent}%`;
        updateTimes();
    }

    function scrub(e) {
        const scrubTime = (e.offsetX / progressContainer.offsetWidth) * video.duration;
        video.currentTime = scrubTime;
    }
    
    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function updateTimes() {
        currentTimeEl.textContent = formatTime(video.currentTime);
    }
    
    function handleLoadedMetadata() {
        totalTimeEl.textContent = formatTime(video.duration);
    }

    function setSpeed() {
        video.playbackRate = speedSelect.value;
    }

    async function togglePip() {
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else if (document.pictureInPictureEnabled) {
                await video.requestPictureInPicture();
            }
        } catch(error) {
            console.error("PiP Error:", error);
        }
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            player.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // --- File Upload ---
    uploadButton.addEventListener('click', () => videoUploadInput.click());
    videoUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const videoURL = URL.createObjectURL(file);
            video.src = videoURL;
            video.play();
        }
    });

    // --- Event Listeners ---
    video.addEventListener('click', togglePlay);
    video.addEventListener('play', updatePlayButton);
    video.addEventListener('pause', updatePlayButton);
    video.addEventListener('volumechange', updateMuteIcon);
    video.addEventListener('timeupdate', handleProgress);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    playPauseBtn.addEventListener('click', togglePlay);
    muteBtn.addEventListener('click', toggleMute);
    volumeSlider.addEventListener('input', handleVolumeUpdate);
    
    let isMouseDown = false;
    progressContainer.addEventListener('click', scrub);
    progressContainer.addEventListener('mousemove', (e) => isMouseDown && scrub(e));
    progressContainer.addEventListener('mousedown', () => isMouseDown = true);
    progressContainer.addEventListener('mouseup', () => isMouseDown = false);
    
    speedSelect.addEventListener('change', setSpeed);
    pipBtn.addEventListener('click', togglePip);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ignore shortcuts if user is typing in an input
        if (document.activeElement.tagName === 'INPUT') return;

        switch (e.code) {
            case 'Space':
                e.preventDefault(); // Prevent page scroll
                togglePlay();
                break;
            case 'KeyM':
                toggleMute();
                break;
            case 'KeyF':
                toggleFullscreen();
                break;
            case 'ArrowRight':
                video.currentTime += 5;
                break;
            case 'ArrowLeft':
                video.currentTime -= 5;
                break;
        }
    });
});
