        document.addEventListener('DOMContentLoaded', () => {
            const fileInput = document.getElementById('fileInput');
            const cardContainer = document.getElementById('cardContainer');
            const downloadBtn = document.getElementById('downloadBtn');
            const resolutionSelect = document.getElementById('resolutionSelect');
            const videoElement = document.getElementById('my-video');
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

            downloadBtn.addEventListener('click', async () => {
                try {
                    const resolution = resolutionSelect.value;
                    const { createFFmpeg, fetchFile } = FFmpeg;
                    const ffmpeg = createFFmpeg({ log: true });
                    await ffmpeg.load();

                    for (const track of tracks) {
                        await ffmpeg.FS('writeFile', track.file.name, await fetchFile(track.file));
                    }

                    const videoInputs = tracks.filter(track => track.type === 'video').map((track, index) => `[${index}:v]scale=-1:${resolution},setsar=1:1[v${index}]`).join('; ');
                    const imageInputs = tracks.filter(track => track.type === 'image').map((track, index) => `[${index + tracks.filter(t => t.type === 'video').length}:v]scale=-1:${resolution},setsar=1:1[v${index + tracks.filter(t => t.type === 'video').length}]`).join('; ');
                    const audioInputs = tracks.filter(track => track.type === 'audio').map((track, index) => `[${index + tracks.filter(t => t.type === 'video' || t.type === 'image').length}:a]`).join('; ');

                    const filterComplex = `${videoInputs}; ${imageInputs}; ${audioInputs}`;

                    const inputs = tracks.map(track => `-i ${track.file.name}`).join(' ');

                    const command = `-filter_complex "${filterComplex}" -map "[v0]" -map "[a0]" output.mp4`;

                    await ffmpeg.run(...inputs.split(' '), ...command.split(' '));
                    const data = await ffmpeg.FS('readFile', 'output.mp4');
                    const blob = new Blob([data.buffer], { type: 'video/mp4' });
                    const videoUrl = URL.createObjectURL(blob);

                    videoElement.src = videoUrl;
                    videoElement.controls = true;

                    const downloadLink = document.createElement('a');
                    downloadLink.href = videoUrl;
                    downloadLink.download = `merged_video.mp4`;
                    downloadLink.textContent = 'Download';
                    cardContainer.appendChild(downloadLink);
                } catch (error) {
                    console.error(error);
                    alert("An error occurred while generating the video.");
                }
            });
        });
    
