// 100ms Video Conference Integration - Kintsugi AI
// Group video calls with guest access

const VideoConference = {
    hmsActions: null,
    hmsStore: null,
    currentRoom: null,
    localPeer: null,

    // Initialize 100ms SDK
    initialize: async function() {
        // Check if 100ms SDK is loaded
        if (typeof HMSReactiveStore === 'undefined') {
            console.warn('100ms SDK not loaded. Loading from CDN...');
            await this.load100msSDK();
        }

        this.hmsStore = new HMSReactiveStore();
        this.hmsActions = this.hmsStore.getActions();
        this.hmsStore.getHMSActions();

        // Subscribe to store updates
        this.subscribeToUpdates();
    },

    // Load 100ms SDK from CDN
    load100msSDK: function() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.100ms.live/hms-video/latest/index.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },

    // Subscribe to store updates
    subscribeToUpdates: function() {
        // Listen for peer updates
        this.hmsStore.subscribe((peers) => {
            this.renderPeers(peers);
        }, selectPeers);

        // Listen for local peer
        this.hmsStore.subscribe((peer) => {
            this.localPeer = peer;
        }, selectLocalPeer);

        // Listen for room state
        this.hmsStore.subscribe((isConnected) => {
            if (isConnected) {
                console.log('Connected to room');
            }
        }, selectIsConnectedToRoom);
    },

    // Join video conference
    joinConference: async function(groupId, userName, isGuest = false) {
        try {
            // Get auth token from backend
            const authToken = await this.getAuthToken(groupId, userName, isGuest);

            // Join room
            await this.hmsActions.join({
                userName: userName,
                authToken: authToken,
                settings: {
                    isAudioMuted: false,
                    isVideoMuted: false
                }
            });

            // Show video UI
            this.showVideoUI(groupId);
        } catch (error) {
            console.error('Failed to join conference:', error);
            alert('Failed to join video conference. Please try again.');
        }
    },

    // Get auth token from backend
    getAuthToken: async function(groupId, userName, isGuest) {
        try {
            const endpoint = isGuest
                ? `${API_URL}/messenger/groups/${groupId}/video/guest-token`
                : `${API_URL}/messenger/groups/${groupId}/video/token`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(isGuest ? {} : { 'Authorization': `Bearer ${getToken()}` })
                },
                body: JSON.stringify({ userName })
            });

            if (!response.ok) {
                throw new Error('Failed to get auth token');
            }

            const data = await response.json();
            return data.token;
        } catch (error) {
            console.error('Auth token error:', error);
            throw error;
        }
    },

    // Show video UI
    showVideoUI: function(groupId) {
        const modal = document.createElement('div');
        modal.id = 'video-conference-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--digital-black);
            z-index: 12000;
            display: flex;
            flex-direction: column;
        `;

        modal.innerHTML = `
            <!-- Header -->
            <div style="padding: 1rem 2rem; border-bottom: 3px solid var(--electric-purple); background: rgba(157, 0, 255, 0.1); display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 class="text-neon" style="font-size: 1.25rem; color: var(--electric-purple); margin-bottom: 0.25rem;">
                        📹 GROUP VIDEO CALL
                    </h3>
                    <div style="color: #999; font-size: 0.9rem;">
                        <span id="participant-count">0 participants</span> • <span id="call-duration">00:00</span>
                    </div>
                </div>
                <button onclick="VideoConference.leaveConference()" class="btn btn-secondary interactive" style="padding: 0.75rem 1.5rem; border-color: var(--neon-pink); color: var(--neon-pink);">
                    ✕ LEAVE CALL
                </button>
            </div>

            <!-- Video Grid -->
            <div id="video-grid" style="flex: 1; padding: 1rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; overflow-y: auto; background: #0A0A0A;">
                <!-- Video tiles will be added here -->
            </div>

            <!-- Controls -->
            <div style="padding: 1.5rem 2rem; border-top: 3px solid var(--electric-purple); background: rgba(157, 0, 255, 0.1); display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                <button id="toggle-audio" onclick="VideoConference.toggleAudio()" class="btn btn-primary interactive" style="padding: 1rem 1.5rem; min-width: 120px;">
                    🎤 MUTE
                </button>
                <button id="toggle-video" onclick="VideoConference.toggleVideo()" class="btn btn-primary interactive" style="padding: 1rem 1.5rem; min-width: 120px;">
                    📹 VIDEO OFF
                </button>
                <button onclick="VideoConference.shareScreen()" class="btn btn-secondary interactive" style="padding: 1rem 1.5rem; min-width: 120px;">
                    🖥 SHARE SCREEN
                </button>
                <button onclick="VideoConference.showParticipants()" class="btn btn-secondary interactive" style="padding: 1rem 1.5rem; min-width: 120px;">
                        👥 PARTICIPANTS
                </button>
                <button onclick="VideoConference.copyInviteLink('${groupId}')" class="btn btn-secondary interactive" style="padding: 1rem 1.5rem; min-width: 120px;">
                    🔗 INVITE
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        // Start call duration timer
        this.startCallTimer();
    },

    // Render video peers
    renderPeers: function(peers) {
        const grid = document.getElementById('video-grid');
        if (!grid) return;

        grid.innerHTML = '';

        peers.forEach(peer => {
            const tile = document.createElement('div');
            tile.id = `peer-${peer.id}`;
            tile.style.cssText = `
                position: relative;
                background: #1a1a1a;
                border: 3px solid ${peer.isLocal ? 'var(--kintsugi-gold)' : 'var(--cyber-cyan)'};
                aspect-ratio: 16/9;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                box-shadow: 4px 4px 0px ${peer.isLocal ? 'rgba(240, 255, 0, 0.3)' : 'rgba(0, 255, 255, 0.3)'};
            `;

            // Video element
            const video = document.createElement('video');
            video.autoplay = true;
            video.muted = peer.isLocal;
            video.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';

            if (peer.videoTrack) {
                const stream = new MediaStream();
                stream.addTrack(peer.videoTrack);
                video.srcObject = stream;
            }

            // Name overlay
            const nameOverlay = document.createElement('div');
            nameOverlay.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 0.75rem;
                background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
                color: ${peer.isLocal ? 'var(--kintsugi-gold)' : 'var(--cyber-cyan)'};
                font-weight: bold;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;

            nameOverlay.innerHTML = `
                <span>${peer.name} ${peer.isLocal ? '(You)' : ''}</span>
                <div style="display: flex; gap: 0.5rem;">
                    ${!peer.audioEnabled ? '<span>🔇</span>' : ''}
                    ${!peer.videoEnabled ? '<span>📹</span>' : ''}
                </div>
            `;

            tile.appendChild(video);
            tile.appendChild(nameOverlay);
            grid.appendChild(tile);
        });

        // Update participant count
        const countElement = document.getElementById('participant-count');
        if (countElement) {
            countElement.textContent = `${peers.length} participant${peers.length !== 1 ? 's' : ''}`;
        }
    },

    // Toggle audio
    toggleAudio: async function() {
        const isEnabled = this.localPeer?.audioEnabled;
        await this.hmsActions.setLocalAudioEnabled(!isEnabled);

        const btn = document.getElementById('toggle-audio');
        if (btn) {
            btn.textContent = isEnabled ? '🎤 UNMUTE' : '🎤 MUTE';
        }
    },

    // Toggle video
    toggleVideo: async function() {
        const isEnabled = this.localPeer?.videoEnabled;
        await this.hmsActions.setLocalVideoEnabled(!isEnabled);

        const btn = document.getElementById('toggle-video');
        if (btn) {
            btn.textContent = isEnabled ? '📹 VIDEO ON' : '📹 VIDEO OFF';
        }
    },

    // Share screen
    shareScreen: async function() {
        try {
            await this.hmsActions.setScreenShareEnabled(true);
        } catch (error) {
            console.error('Screen share error:', error);
            alert('Failed to share screen');
        }
    },

    // Leave conference
    leaveConference: async function() {
        if (!confirm('Leave the video call?')) return;

        try {
            await this.hmsActions.leave();

            const modal = document.getElementById('video-conference-modal');
            if (modal) modal.remove();

            if (this.callTimerInterval) {
                clearInterval(this.callTimerInterval);
            }
        } catch (error) {
            console.error('Leave error:', error);
        }
    },

    // Copy invite link
    copyInviteLink: async function(groupId) {
        const inviteLink = `${window.location.origin}/join-group-call?group=${groupId}`;

        try {
            await navigator.clipboard.writeText(inviteLink);
            alert('✓ Invite link copied to clipboard!\n\nAnyone with this link can join the video call.');
        } catch (error) {
            console.error('Copy error:', error);
        }
    },

    // Start call timer
    startCallTimer: function() {
        let seconds = 0;

        this.callTimerInterval = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;

            const timerElement = document.getElementById('call-duration');
            if (timerElement) {
                timerElement.textContent =
                    `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            }
        }, 1000);
    },

    // Join as guest
    joinAsGuest: async function(groupId) {
        const userName = prompt('Enter your name:');
        if (!userName) return;

        await this.initialize();
        await this.joinConference(groupId, userName, true);
    }
};

// Global functions
window.VideoConference = VideoConference;

// Initialize on page load if needed
if (window.location.pathname.includes('join-group-call')) {
    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get('group');

    if (groupId) {
        document.addEventListener('DOMContentLoaded', () => {
            VideoConference.joinAsGuest(groupId);
        });
    }
}

// Helper functions for 100ms selectors (these would normally come from the SDK)
function selectPeers(state) {
    return state.peers ? Object.values(state.peers) : [];
}

function selectLocalPeer(state) {
    return state.localPeer;
}

function selectIsConnectedToRoom(state) {
    return state.room?.isConnected || false;
}
