// WebRTC P2P Audio/Video Calls for Kintsugi AI Messenger

let localStream = null;
let remoteStream = null;
let peerConnection = null;
let callTimer = null;
let callStartTime = null;
let isAudioEnabled = true;
let isVideoEnabled = true;
let currentCallType = null;
let selectedContactForCall = null;

const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// Start call to current conversation
window.startCall = function(type) {
    // If no conversation selected, do nothing
    if (!currentConversationId) {
        alert('Please select a conversation first');
        return;
    }

    // Get current conversation
    const contact = conversations[currentConversationId];

    // Don't allow calls to AI
    if (contact.isAI) {
        return;
    }

    // Initiate call directly to current conversation
    initiateCall(currentConversationId, type);
};

// Initiate call
async function initiateCall(contactId, type) {
    selectedContactForCall = contactId;
    currentCallType = type;
    const modal = document.getElementById('call-modal');
    const contactName = conversations[currentConversationId]?.name || 'Unknown';

    // Update UI
    document.getElementById('call-type-icon').textContent = type === 'video' ? '📹' : '📞';
    document.getElementById('call-contact-name').textContent = contactName.toUpperCase();
    document.getElementById('toggle-video').style.display = type === 'video' ? 'block' : 'none';
    document.getElementById('call-status').textContent = 'Connecting...';

    modal.style.display = 'flex';

    try {
        // Get user media
        const constraints = {
            audio: true,
            video: type === 'video' ? { width: 1280, height: 720 } : false
        };

        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        document.getElementById('local-video').srcObject = localStream;

        if (type === 'audio') {
            document.getElementById('local-video').style.display = 'none';
        }

        // Create peer connection
        peerConnection = new RTCPeerConnection(configuration);

        // Add local stream tracks
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        // Handle remote stream
        peerConnection.ontrack = (event) => {
            if (!remoteStream) {
                remoteStream = new MediaStream();
                document.getElementById('remote-video').srcObject = remoteStream;
            }
            remoteStream.addTrack(event.track);
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate && ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'ice-candidate',
                    candidate: event.candidate,
                    conversationId: currentConversationId
                }));
            }
        };

        // Connection state change
        peerConnection.onconnectionstatechange = () => {
            const state = peerConnection.connectionState;
            document.getElementById('call-status').textContent = state.toUpperCase();

            if (state === 'connected') {
                startCallTimer();
                document.getElementById('call-status').textContent = 'Connected';
            } else if (state === 'failed' || state === 'disconnected' || state === 'closed') {
                endCall();
            }
        };

        // Create offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        // Send offer via WebSocket
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'call-offer',
                offer: offer,
                callType: type,
                conversationId: currentConversationId
            }));
        }

    } catch (error) {
        console.error('Failed to start call:', error);
        document.getElementById('call-status').textContent = 'Failed to access media devices';
        alert('Failed to start call. Please check your camera/microphone permissions.');
        setTimeout(() => endCall(), 2000);
    }
};

// Handle incoming call
window.handleIncomingCall = async function(data) {
    const { offer, callType, from } = data;

    // Show incoming call UI
    const accept = confirm(`Incoming ${callType} call from ${conversations[from]?.name || 'Unknown'}. Accept?`);

    if (!accept) {
        // Send reject signal
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'call-reject',
                conversationId: from
            }));
        }
        return;
    }

    currentCallType = callType;
    const modal = document.getElementById('call-modal');

    document.getElementById('call-type-icon').textContent = callType === 'video' ? '📹' : '📞';
    document.getElementById('call-contact-name').textContent = (conversations[from]?.name || 'Unknown').toUpperCase();
    document.getElementById('toggle-video').style.display = callType === 'video' ? 'block' : 'none';

    modal.style.display = 'flex';

    try {
        const constraints = {
            audio: true,
            video: callType === 'video' ? { width: 1280, height: 720 } : false
        };

        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        document.getElementById('local-video').srcObject = localStream;

        if (callType === 'audio') {
            document.getElementById('local-video').style.display = 'none';
        }

        peerConnection = new RTCPeerConnection(configuration);

        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        peerConnection.ontrack = (event) => {
            if (!remoteStream) {
                remoteStream = new MediaStream();
                document.getElementById('remote-video').srcObject = remoteStream;
            }
            remoteStream.addTrack(event.track);
        };

        peerConnection.onicecandidate = (event) => {
            if (event.candidate && ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'ice-candidate',
                    candidate: event.candidate,
                    conversationId: from
                }));
            }
        };

        peerConnection.onconnectionstatechange = () => {
            const state = peerConnection.connectionState;
            if (state === 'connected') {
                startCallTimer();
            } else if (state === 'failed' || state === 'disconnected' || state === 'closed') {
                endCall();
            }
        };

        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'call-answer',
                answer: answer,
                conversationId: from
            }));
        }

    } catch (error) {
        console.error('Failed to answer call:', error);
        endCall();
    }
};

// Toggle audio
window.toggleAudio = function() {
    if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
            isAudioEnabled = !isAudioEnabled;
            audioTrack.enabled = isAudioEnabled;
            document.getElementById('toggle-audio').textContent = isAudioEnabled ? '🎤 MUTE' : '🔇 UNMUTE';
        }
    }
};

// Toggle video
window.toggleVideo = function() {
    if (localStream && currentCallType === 'video') {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
            isVideoEnabled = !isVideoEnabled;
            videoTrack.enabled = isVideoEnabled;
            document.getElementById('toggle-video').textContent = isVideoEnabled ? '📹 STOP VIDEO' : '📹 START VIDEO';
        }
    }
};

// End call
window.endCall = function() {
    // Stop call timer
    if (callTimer) {
        clearInterval(callTimer);
        callTimer = null;
    }

    // Close peer connection
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }

    // Stop local stream
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }

    // Clear remote stream
    remoteStream = null;

    // Reset UI
    document.getElementById('call-modal').style.display = 'none';
    document.getElementById('call-timer').textContent = '00:00';
    document.getElementById('local-video').style.display = 'block';
    document.getElementById('toggle-audio').textContent = '🎤 MUTE';
    document.getElementById('toggle-video').textContent = '📹 STOP VIDEO';

    // Reset states
    isAudioEnabled = true;
    isVideoEnabled = true;
    currentCallType = null;

    // Send end call signal
    if (ws && ws.readyState === WebSocket.OPEN && currentConversationId) {
        ws.send(JSON.stringify({
            type: 'call-end',
            conversationId: currentConversationId
        }));
    }
};

// Start call timer
function startCallTimer() {
    callStartTime = Date.now();
    callTimer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('call-timer').textContent =
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// Toggle fullscreen mode
window.toggleFullscreen = function() {
    const callModal = document.getElementById('call-modal');

    if (!document.fullscreenElement) {
        // Enter fullscreen
        if (callModal.requestFullscreen) {
            callModal.requestFullscreen();
        } else if (callModal.webkitRequestFullscreen) {
            callModal.webkitRequestFullscreen();
        } else if (callModal.msRequestFullscreen) {
            callModal.msRequestFullscreen();
        }
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
};

// Handle WebSocket messages for WebRTC signaling
if (typeof handleWebSocketMessage !== 'undefined') {
    const originalHandler = handleWebSocketMessage;
    window.handleWebSocketMessage = function(data) {
        switch (data.type) {
            case 'call-offer':
                handleIncomingCall(data.payload);
                break;
            case 'call-answer':
                if (peerConnection) {
                    peerConnection.setRemoteDescription(new RTCSessionDescription(data.payload.answer));
                }
                break;
            case 'ice-candidate':
                if (peerConnection && data.payload.candidate) {
                    peerConnection.addIceCandidate(new RTCIceCandidate(data.payload.candidate));
                }
                break;
            case 'call-end':
                endCall();
                break;
            case 'call-reject':
                alert('Call rejected');
                endCall();
                break;
            default:
                originalHandler(data);
        }
    };
}
