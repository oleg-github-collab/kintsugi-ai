// Media Upload & Audio Recording for Kintsugi AI Messenger
// Cloudinary Integration

// Cloudinary config (set these in backend env vars)
const CLOUDINARY_CLOUD_NAME = 'kintsugi-ai'; // Replace with your cloud name
const CLOUDINARY_UPLOAD_PRESET = 'messenger_uploads'; // Create unsigned upload preset

let selectedFile = null;
let audioRecorder = null;
let audioChunks = [];
let audioBlob = null;
let audioTimer = null;
let recordingStartTime = null;
const MAX_RECORDING_TIME = 180; // 3 minutes in seconds

// File Upload
window.openFileUpload = function() {
    const modal = document.getElementById('file-upload-modal');
    modal.style.display = 'flex';

    // Setup drag and drop
    const preview = document.getElementById('file-preview');
    preview.onclick = () => document.getElementById('file-input').click();

    preview.ondragover = (e) => {
        e.preventDefault();
        preview.style.borderColor = 'var(--kintsugi-gold)';
    };

    preview.ondragleave = () => {
        preview.style.borderColor = 'var(--cyber-cyan)';
    };

    preview.ondrop = (e) => {
        e.preventDefault();
        preview.style.borderColor = 'var(--cyber-cyan)';
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    document.getElementById('file-input').onchange = (e) => {
        const file = e.target.files[0];
        if (file) handleFileSelect(file);
    };
};

function handleFileSelect(file) {
    selectedFile = file;
    const preview = document.getElementById('file-preview');
    const fileSize = (file.size / 1024 / 1024).toFixed(2); // MB

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `
                <img src="${e.target.result}" style="max-width: 100%; max-height: 300px; border: 2px solid var(--cyber-cyan);">
                <p style="margin-top: 1rem; color: var(--cyber-cyan);">${file.name} (${fileSize} MB)</p>
            `;
        };
        reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
        preview.innerHTML = `
            <div style="font-size: 4rem;">🎬</div>
            <p style="margin-top: 1rem; color: var(--cyber-cyan);">${file.name} (${fileSize} MB)</p>
            <p style="color: #999;">Video file selected</p>
        `;
    } else {
        preview.innerHTML = `
            <div style="font-size: 4rem;">📄</div>
            <p style="margin-top: 1rem; color: var(--cyber-cyan);">${file.name} (${fileSize} MB)</p>
            <p style="color: #999;">${file.type || 'Unknown type'}</p>
        `;
    }
}

window.uploadFile = async function() {
    if (!selectedFile) {
        alert('Please select a file first');
        return;
    }

    const caption = document.getElementById('file-caption').value;
    const progressDiv = document.getElementById('upload-progress');
    const progressBar = document.getElementById('upload-progress-bar');
    const statusText = document.getElementById('upload-status');

    progressDiv.style.display = 'block';
    statusText.textContent = 'Uploading to Cloudinary...';

    try {
        // Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progressBar.style.width = percentComplete + '%';
                statusText.textContent = `Uploading... ${Math.round(percentComplete)}%`;
            }
        });

        xhr.addEventListener('load', async () => {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                const fileUrl = response.secure_url;

                statusText.textContent = 'Sending message...';

                // Send message with file URL
                const messageData = {
                    content: caption || 'File attachment',
                    media_url: fileUrl,
                    message_type: selectedFile.type.startsWith('image/') ? 'image' :
                                  selectedFile.type.startsWith('video/') ? 'video' : 'file'
                };

                await fetch(`${API_URL}/messenger/conversations/${currentConversationId}/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(messageData)
                });

                statusText.textContent = 'Sent!';
                setTimeout(() => closeFileUpload(), 1000);
            } else {
                throw new Error('Upload failed');
            }
        });

        xhr.addEventListener('error', () => {
            statusText.textContent = 'Upload failed';
            statusText.style.color = 'var(--neon-pink)';
        });

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`);
        xhr.send(formData);

    } catch (error) {
        console.error('File upload error:', error);
        statusText.textContent = 'Upload failed';
        statusText.style.color = 'var(--neon-pink)';
    }
};

window.closeFileUpload = function() {
    document.getElementById('file-upload-modal').style.display = 'none';
    document.getElementById('file-preview').innerHTML = '<p style="color: #999;">Click or drag file here</p>';
    document.getElementById('file-caption').value = '';
    document.getElementById('upload-progress').style.display = 'none';
    document.getElementById('upload-progress-bar').style.width = '0%';
    document.getElementById('upload-status').style.color = 'var(--cyber-cyan)';
    selectedFile = null;
};

// Audio Recording
window.openAudioRecorder = function() {
    const modal = document.getElementById('audio-recorder-modal');
    modal.style.display = 'flex';
    initWaveform();
};

function initWaveform() {
    const waveform = document.getElementById('audio-waveform');
    waveform.innerHTML = '';
    for (let i = 0; i < 30; i++) {
        const bar = document.createElement('div');
        bar.style.cssText = `
            width: 4px;
            height: 10px;
            background: var(--kintsugi-gold);
            transition: height 0.1s;
        `;
        waveform.appendChild(bar);
    }
}

window.startRecording = async function() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioRecorder = new MediaRecorder(stream);
        audioChunks = [];

        audioRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        audioRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            document.getElementById('play-btn').disabled = false;
            document.getElementById('send-audio-btn').disabled = false;
        };

        audioRecorder.start();
        recordingStartTime = Date.now();

        // Update UI
        document.getElementById('record-controls').style.display = 'none';
        document.getElementById('recording-controls').style.display = 'flex';

        // Start timer
        audioTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('audio-timer').textContent =
                `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            // Auto-stop at 3 minutes
            if (elapsed >= MAX_RECORDING_TIME) {
                stopRecording();
            }

            // Animate waveform
            animateWaveform();
        }, 100);

    } catch (error) {
        console.error('Failed to start recording:', error);
        alert('Failed to access microphone. Please check permissions.');
    }
};

function animateWaveform() {
    const bars = document.querySelectorAll('#audio-waveform div');
    bars.forEach(bar => {
        const height = Math.random() * 80 + 20;
        bar.style.height = height + 'px';
    });
}

window.stopRecording = function() {
    if (audioRecorder && audioRecorder.state !== 'inactive') {
        audioRecorder.stop();
        audioRecorder.stream.getTracks().forEach(track => track.stop());
    }

    if (audioTimer) {
        clearInterval(audioTimer);
        audioTimer = null;
    }

    // Reset waveform
    const bars = document.querySelectorAll('#audio-waveform div');
    bars.forEach(bar => {
        bar.style.height = '10px';
    });
};

window.playRecording = function() {
    if (!audioBlob) return;

    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();

    const playBtn = document.getElementById('play-btn');
    playBtn.textContent = '⏸ PAUSE';

    audio.onended = () => {
        playBtn.textContent = '▶ PLAY';
    };
};

window.sendAudio = async function() {
    if (!audioBlob) return;

    document.getElementById('upload-status').textContent = 'Uploading audio...';

    try {
        // Convert blob to file
        const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, { type: 'audio/webm' });

        // Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', audioFile);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('resource_type', 'video'); // Cloudinary uses 'video' for audio

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        const audioUrl = data.secure_url;

        // Send message
        await fetch(`${API_URL}/messenger/conversations/${currentConversationId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                content: '🎤 Voice message',
                media_url: audioUrl,
                message_type: 'audio'
            })
        });

        closeAudioRecorder();

    } catch (error) {
        console.error('Failed to send audio:', error);
        alert('Failed to send audio message');
    }
};

window.closeAudioRecorder = function() {
    stopRecording();
    document.getElementById('audio-recorder-modal').style.display = 'none';
    document.getElementById('audio-timer').textContent = '00:00';
    document.getElementById('record-controls').style.display = 'flex';
    document.getElementById('recording-controls').style.display = 'none';
    document.getElementById('play-btn').disabled = true;
    document.getElementById('send-audio-btn').disabled = true;
    audioBlob = null;
    audioChunks = [];
};
