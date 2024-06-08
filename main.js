document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const muteBtn = document.getElementById('muteBtn');
    const progressBar = document.getElementById('progressBar');
    const progress = document.getElementById('progress');
    const currentTimeElem = document.getElementById('currentTime');
    const durationElem = document.getElementById('duration');
    const volumeBar = document.getElementById('volumeBar');
    const volumeLevel = document.getElementById('volumeLevel');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const resolutionSelect = document.getElementById('resolutionSelect');
    const videoInput = document.getElementById('videoInput');
    const splitVideoBtn = document.getElementById('splitVideoBtn');
    const splitAudioBtn = document.getElementById('splitAudioBtn');
    const cardContainer = document.getElementById('cardContainer');
    const noiseReduction = document.getElementById('noiseReduction');
    const echo = document.getElementById('echo');
    const bass = document.getElementById('bass');
    const treble = document.getElementById('treble');
    const playbackSpeed = document.getElementById('playbackSpeed');

    // Play/Pause functionality
    playPauseBtn.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            playPauseBtn.textContent = 'Pause';
        } else {
            video.pause();
            playPauseBtn.textContent = 'Play';
        }
    });

    // Mute/Unmute functionality
    muteBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? 'Unmute' : 'Mute';
    });

    // Update progress bar as video plays
    video.addEventListener('timeupdate', () => {
        const progressPercent = (video.currentTime / video.duration) * 100;
        progress.style.width = `${progressPercent}%`;
        currentTimeElem.textContent = formatTime(video.currentTime);
        durationElem.textContent = formatTime(video.duration);
    });

    // Seek functionality
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const progress = offsetX / rect.width;
        video.currentTime = progress * video.duration;
    });

    // Volume control functionality
    volumeBar.addEventListener('click', (e) => {
        const rect = volumeBar.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const volume = offsetX / rect.width;
        video.volume = volume;
        volumeLevel.style.width = `${volume * 100}%`;
    });

    // Fullscreen functionality
    fullscreenBtn.addEventListener('click', () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            video.requestFullscreen();
        }
    });

    // Download video functionality
    downloadBtn.addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = video.src;
        a.download = 'video.mp4';
        a.click();
    });

    // Resolution change functionality
    resolutionSelect.addEventListener('change', () => {
        const resolution = resolutionSelect.value;
        // Implement the logic to change video resolution
    });

    // Split video functionality
    splitVideoBtn.addEventListener('click', () => {
        // Implement the logic to split video
    });

    // Split audio functionality
    splitAudioBtn.addEventListener('click', () => {
        // Implement the logic to split audio
    });

    // Video file input functionality
    videoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            video.src = url;
            generateThumbnails(file);
        }
    });

    // Formatting time in mm:ss
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Edit panel functionality
    noiseReduction.addEventListener('input', () => {
        // Implement noise reduction logic
    });

    echo.addEventListener('input', () => {
        // Implement echo logic
    });

    bass.addEventListener('input', () => {
        // Implement bass adjustment logic
    });

    treble.addEventListener('input', () => {
        // Implement treble adjustment logic
    });

    playbackSpeed.addEventListener('input', () => {
        video.playbackRate = playbackSpeed.value;
    });

    // Generate example video cards
    function createCard(title, url, thumbnail) {
        const card = document.createElement('div');
        card.className = 'card';
        const img = document.createElement('img');
        img.src = thumbnail;
        card.appendChild(img);
        card.addEventListener('click', () => {
            video.src = url;
        });
        return card;
    }

    const exampleVideos = [
        { title: 'Video 1', url: 'path/to/video1.mp4', thumbnail: 'path/to/thumbnail1.jpg' },
        { title: 'Video 2', url: 'path/to/video2.mp4', thumbnail: 'path/to/thumbnail2.jpg' },
        { title: 'Video 3', url: 'path/to/video3.mp4', thumbnail: 'path/to/thumbnail3.jpg' }
    ];

    exampleVideos.forEach(video => {
        const card = createCard(video.title, video.url, video.thumbnail);
        cardContainer.appendChild(card);
    });

    // Generate thumbnails from the video
    function generateThumbnails(file) {
        const videoElement = document.createElement('video');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        videoElement.src = URL.createObjectURL(file);
        videoElement.addEventListener('loadeddata', () => {
            const duration = videoElement.duration;
            const step = duration / 5; // generate 5 thumbnails
            for (let i = 1; i <= 5; i++) {
                setTimeout(() => {
                    videoElement.currentTime = step * i;
                }, i * 500); // delay to ensure videoElement.currentTime is updated
            }
        });

        videoElement.addEventListener('seeked', () => {
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            const thumbnail = canvas.toDataURL();
            const card = createCard('Thumbnail', videoElement.src, thumbnail);
            cardContainer.appendChild(card);
        });
    }
});

splitVideoBtn.addEventListener('click', () => {
    // Ottieni il tempo di inizio e fine dalla barra di progresso
    const startTime = parseFloat(prompt("Enter start time (in seconds):"));
    const endTime = parseFloat(prompt("Enter end time (in seconds):"));
    
    // Verifica che i tempi siano validi
    if (!isNaN(startTime) && !isNaN(endTime) && endTime > startTime) {
        // Crea un video temporaneo per la divisione
        const tempVideo = document.createElement('video');
        tempVideo.src = video.src;
        
        // Imposta l'intervallo di tempo per il taglio
        const duration = endTime - startTime;
        tempVideo.addEventListener('loadedmetadata', () => {
            const canvas = document.createElement('canvas');
            canvas.width = tempVideo.videoWidth;
            canvas.height = tempVideo.videoHeight;
            const context = canvas.getContext('2d');
            
            // Cattura i frame del video
            context.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
            const thumbnail = canvas.toDataURL();
            
            // Crea una nuova card per il video tagliato
            const card = createCard('Cut Video', tempVideo.src, thumbnail);
            cardContainer.appendChild(card);
            
            // Aggiorna la durata e l'anteprima del video principale
            video.currentTime = startTime;
            progress.style.width = `${((video.currentTime - startTime) / duration) * 100}%`;
            currentTimeElem.textContent = formatTime(video.currentTime);
        });
        
        // Imposta il tempo di inizio per la divisione
        tempVideo.currentTime = startTime;
    } else {
        alert("Invalid start or end time.");
    }
});

splitAudioBtn.addEventListener('click', () => {
    // Implementa la logica per dividere l'audio
    // Ottieni il tempo di inizio e fine
    const startTime = parseFloat(prompt("Enter start time (in seconds):"));
    const endTime = parseFloat(prompt("Enter end time (in seconds):"));
    
    // Verifica che i tempi siano validi
    if (!isNaN(startTime) && !isNaN(endTime) && endTime > startTime) {
        // Implementa la logica per dividere l'audio
        // Esempio:
        const audio = new Audio(video.src);
        const slicedAudio = audio.currentTime(startTime).duration(endTime - startTime);
        const slicedAudioUrl = URL.createObjectURL(slicedAudio);
        const card = createCard('Cut Audio', slicedAudioUrl, thumbnail);
        cardContainer.appendChild(card);
    } else {
        alert("Invalid start or end time.");
    }
});


splitAudioBtn.addEventListener('click', async () => {
    // Ottieni il tempo di inizio e fine
    const startTime = parseFloat(prompt("Enter start time (in seconds):"));
    const endTime = parseFloat(prompt("Enter end time (in seconds):"));

    // Verifica che i tempi siano validi
    if (!isNaN(startTime) && !isNaN(endTime) && endTime > startTime) {
        try {
            // Carica ffmpeg
            const { createFFmpeg } = FFmpeg;
            const ffmpeg = createFFmpeg({ log: true });
            await ffmpeg.load();

            // Ottieni il file audio caricato dall'input
            const file = videoInput.files[0];
            await ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(file));

            // Esegui la divisione dell'audio
            await ffmpeg.run('-i', 'input.mp4', '-vn', '-ss', startTime.toString(), '-to', endTime.toString(), 'output.mp3');

            // Leggi il file audio risultante
            const data = await ffmpeg.FS('readFile', 'output.mp3');

            // Crea un oggetto Blob per il file audio risultante
            const blob = new Blob([data.buffer], { type: 'audio/mp3' });

            // Crea un URL per il file audio
            const audioUrl = URL.createObjectURL(blob);

            // Aggiungi un'opzione per il download del file audio
            const audioDownloadLink = document.createElement('a');
            audioDownloadLink.href = audioUrl;
            audioDownloadLink.download = 'audio.mp3';
            audioDownloadLink.textContent = 'Download Audio';
            document.body.appendChild(audioDownloadLink);

            // Crea una nuova card per l'audio tagliato
            const card = createCard('Cut Audio', audioUrl, 'thumbnail_placeholder.jpg');
            cardContainer.appendChild(card);
        } catch (error) {
            console.error(error);
            alert("An error occurred while splitting the audio.");
        }
    } else {
        alert("Invalid start or end time.");
    }
});
