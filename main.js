  var testVideo = document.querySelector("#testVideo");
  //testVideo.currentTime = 5;

  testVideo.addEventListener("timeupdate", function () {
    document.querySelector(".playButton").classList.add('hide');;
   this.removeEventListener("timeupdate",arguments.callee);
   // console.log('test');
  });







document.addEventListener('DOMContentLoaded', () => {
            const fileInput = document.getElementById('fileInput');
            const cardContainer = document.getElementById('cardContainer');
            const downloadBtn = document.getElementById('downloadBtn');
            const resolutionSelect = document.getElementById('resolutionSelect');
            const splitVideoBtn = document.getElementById('splitVideoBtn');
            const splitAudioBtn = document.getElementById('splitAudioBtn');
            const videoElement = document.getElementById('video');
            const tracks = [];

            fileInput.addEventListener('change', (e) => {
                const files = e.target.files;
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const fileType = file.type;

                    if (fileType.startsWith('video/')) {
                        handleVideoFile(file);
                    } else if (fileType.startsWith('audio/')) {
                        handleAudioFile(file);
                    } else if (fileType.startsWith('image/')) {
                        handleImageFile(file);
                    }
                }
            });

            function handleVideoFile(file) {
                const url = URL.createObjectURL(file);
                const videoElement = document.createElement('video');
                videoElement.src = url;
                videoElement.controls = true;

                const card = createCard('Video', url, 'path/to/video_thumbnail.jpg');
                card.appendChild(videoElement);
                cardContainer.appendChild(card);

                tracks.push({ type: 'video', file });
            }

            function handleAudioFile(file) {
                const url = URL.createObjectURL(file);
                const audioElement = document.createElement('audio');
                audioElement.src = url;
                audioElement.controls = true;

                const card = createCard('Audio', url, 'path/to/audio_thumbnail.jpg');
                card.appendChild(audioElement);
                cardContainer.appendChild(card);

                tracks.push({ type: 'audio', file });

                generateWaveform(file, card);
            }

            function handleImageFile(file) {
                const url = URL.createObjectURL(file);
                const imgElement = document.createElement('img');
                imgElement.src = url;

                const card = createCard('Image', url, url);
                card.appendChild(imgElement);
                cardContainer.appendChild(card);

                tracks.push({ type: 'image', file });
            }

            function createCard(title, url, thumbnail) {
                const card = document.createElement('div');
                card.className = 'card';
                card.draggable = true;
                const img = document.createElement('img');
                img.src = thumbnail;
                card.appendChild(img);
                card.addEventListener('click', () => {
                    window.open(url, '_blank');
                });
                return card;
            }

            async function generateWaveform(file, card) {
                const audioContext = new AudioContext();
                const arrayBuffer = await file.arrayBuffer();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = 500;
                canvas.height = 100;

                const data = audioBuffer.getChannelData(0);
                const step = Math.ceil(data.length / canvas.width);
                const amp = canvas.height / 2;

                context.fillStyle = 'silver';
                context.clearRect(0, 0, canvas.width, canvas.height);

                for (let i = 0; i < canvas.width; i++) {
                    const min = Math.min(...data.slice(i * step, (i + 1) * step));
                    const max = Math.max(...data.slice(i * step, (i + 1) * step));
                    context.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
                }

                card.appendChild(canvas);
            }

            async function splitAudio(file, startTime, endTime) {
                try {
                    const { createFFmpeg, fetchFile } = FFmpeg;
                    const ffmpeg = createFFmpeg({ log: true });
                    await ffmpeg.load();

                    await ffmpeg.FS('writeFile', 'input.mp3', await fetchFile(file));

                    await ffmpeg.run('-i', 'input.mp3', '-ss', startTime.toString(), '-to', endTime.toString(), '-c', 'copy', 'output.mp3');

                    const data = await ffmpeg.FS('readFile', 'output.mp3');

                    const blob = new Blob([data.buffer], { type: 'audio/mp3' });
                    const audioUrl = URL.createObjectURL(blob);

                    const thumbnail = 'path/to/audio_thumbnail.jpg';
                    const card = createCard('Cut Audio', audioUrl, thumbnail);
                    cardContainer.appendChild(card);

                    const downloadLink = document.createElement('a');
                    downloadLink.href = audioUrl;
                    downloadLink.download = 'cut_audio.mp3';
                    downloadLink.textContent = 'Download Cut Audio';
                    card.appendChild(downloadLink);
                } catch (error) {
                    console.error(error);
                    alert("An error occurred while splitting the audio.");
                }
            }

            async function splitVideo(file, startTime, endTime) {
                try {
                    const { createFFmpeg, fetchFile } = FFmpeg;
                    const ffmpeg = createFFmpeg({ log: true });
                    await ffmpeg.load();

                    await ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(file));

                    await ffmpeg.run('-i', 'input.mp4', '-ss', startTime.toString(), '-to', endTime.toString(), '-c', 'copy', 'output.mp4');

                    const data = await ffmpeg.FS('readFile', 'output.mp4');

                    const blob = new Blob([data.buffer], { type: 'video/mp4' });
                    const videoUrl = URL.createObjectURL(blob);

                    const thumbnail = 'path/to/video_thumbnail.jpg';
                    const card = createCard('Cut Video', videoUrl, thumbnail);
                    cardContainer.appendChild(card);

                    const downloadLink = document.createElement('a');
                    downloadLink.href = videoUrl;
                    downloadLink.download = 'cut_video.mp4';
                    downloadLink.textContent = 'Download Cut Video';
                    card.appendChild(downloadLink);
                } catch (error) {
                    console.error(error);
                    alert("An error occurred while splitting the video.");
                }
            }

            downloadBtn.addEventListener('click', async () => {
                try {
                    const resolution = resolutionSelect.value;
                    const { createFFmpeg, fetchFile } = FFmpeg;
                    const ffmpeg = createFFmpeg({ log: true });
                    await ffmpeg.load();

                    for (const track of tracks) {
                        await ffmpeg.FS('writeFile', track.file.name, await fetchFile(track.file));
                    }

                    const inputs = tracks.map(track => `-i ${track.file.name}`).join(' ');
                    const filters = tracks.map((track, index) => {
                        if (track.type === 'image') {
                            return `[${index}:v]scale=-1:${resolution},setsar=1:1[v${index}]`;
                        } else if (track.type === 'video') {
                            return `[${index}:v]scale=-1:${resolution},setsar=1:1[v${index}]`;
                        } else {
                            return `[${index}:a]`;
                        }
                    }).join('; ');

                    const command = `-filter_complex "${filters}" -map "[v0]" -map "${tracks.length > 1 ? '[a]' : '[a0]'}" output.mp4`;

                    await ffmpeg.run(...inputs.split(' '), command);
                    const data = await ffmpeg.FS('readFile', 'output.mp4');
                    const blob = new Blob([data.buffer], { type: 'video/mp4' });
                    const videoUrl = URL.createObjectURL(blob);

                    videoElement.src = videoUrl;
                    videoElement.controls = true;

                    const downloadLink = document.createElement('a');
                    downloadLink.href = videoUrl;
                    downloadLink.download = `${document.getElementById('fileName').value || 'output'}.mp4`;
                    downloadLink.textContent = 'Download';
                    cardContainer.appendChild(downloadLink);
                } catch (error) {
                    console.error(error);
                    alert("An error occurred while generating the video.");
                }
            });

            splitVideoBtn.addEventListener('click', () => {
                if (tracks.length > 0 && tracks[0].type === 'video') {
                    const startTime = prompt("Enter start time (in seconds):");
                    const endTime = prompt("Enter end time (in seconds):");
                    if (startTime !== null && endTime !== null) {
                        splitVideo(tracks[0].file, parseFloat(startTime), parseFloat(endTime));
                    }
                } else {
                    alert("No video track available.");
                }
            });

            splitAudioBtn.addEventListener('click', () => {
                if (tracks.length > 0 && tracks[0].type === 'audio') {
                    const startTime = prompt("Enter start time (in seconds):");
                    const endTime = prompt("Enter end time (in seconds):");
                    if (startTime !== null && endTime !== null) {
                        splitAudio(tracks[0].file, parseFloat(startTime), parseFloat(endTime));
                    }
                } else {
                    alert("No audio track available.");
                }
            });
        });
