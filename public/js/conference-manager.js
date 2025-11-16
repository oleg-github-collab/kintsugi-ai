// Video Conference Manager - Kintsugi AI
// Handles conference creation, guest invites, and room management

const ConferenceManager = {
    currentConversation: null,

    // Show conference options modal
    showConferenceOptions: function(conversationId, conversationName) {
        this.currentConversation = { id: conversationId, name: conversationName };

        const modal = document.createElement('div');
        modal.id = 'conference-options-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.95);
            z-index: 11000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        `;

        modal.innerHTML = `
            <div class="scanlines" style="background: var(--digital-black); border: 4px solid var(--electric-purple); padding: 2.5rem; max-width: 650px; width: 95%; box-shadow: 0 0 50px rgba(157, 0, 255, 0.7);">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 3px solid var(--electric-purple);">
                    <div>
                        <h3 class="text-neon" style="font-size: 2rem; margin: 0 0 0.5rem 0; color: var(--electric-purple); text-transform: uppercase; text-shadow: 0 0 15px rgba(157, 0, 255, 0.8);">
                            📹 START VIDEO CALL
                        </h3>
                        <div style="color: var(--cyber-cyan); font-size: 1rem;">
                            ${conversationName}
                        </div>
                    </div>
                    <button onclick="ConferenceManager.closeOptions()" class="btn btn-secondary interactive" style="padding: 0.5rem 1rem; font-size: 1.5rem;">×</button>
                </div>

                <!-- Options -->
                <div style="display: grid; gap: 1.5rem; margin-bottom: 2rem;">
                    <!-- Quick Start -->
                    <div class="conference-option-card" onclick="ConferenceManager.startInstantConference()" style="padding: 1.75rem; background: linear-gradient(135deg, rgba(0, 255, 255, 0.15), rgba(0, 255, 255, 0.05)); border: 3px solid var(--cyber-cyan); cursor: pointer; transition: all 0.3s ease; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: 10px; right: 10px; background: var(--kintsugi-gold); color: var(--digital-black); padding: 0.3rem 0.7rem; font-size: 0.7rem; font-weight: bold; border-radius: 3px;">
                            QUICK START
                        </div>
                        <div style="display: flex; align-items: center; gap: 1.5rem;">
                            <div style="width: 60px; height: 60px; background: var(--cyber-cyan); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; flex-shrink: 0;">
                                ⚡
                            </div>
                            <div style="flex: 1;">
                                <h4 style="color: var(--cyber-cyan); font-size: 1.3rem; margin-bottom: 0.5rem; font-weight: bold;">Instant Conference</h4>
                                <p style="color: #ccc; font-size: 0.95rem; margin: 0; line-height: 1.5;">Start a video call immediately with current group members. Perfect for quick meetings.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Schedule with Guests -->
                    <div class="conference-option-card" onclick="ConferenceManager.showGuestInviteUI()" style="padding: 1.75rem; background: linear-gradient(135deg, rgba(240, 255, 0, 0.15), rgba(240, 255, 0, 0.05)); border: 3px solid var(--kintsugi-gold); cursor: pointer; transition: all 0.3s ease; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: 10px; right: 10px; background: var(--electric-purple); color: white; padding: 0.3rem 0.7rem; font-size: 0.7rem; font-weight: bold; border-radius: 3px;">
                            RECOMMENDED
                        </div>
                        <div style="display: flex; align-items: center; gap: 1.5rem;">
                            <div style="width: 60px; height: 60px; background: var(--kintsugi-gold); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; flex-shrink: 0; color: var(--digital-black);">
                                🔗
                            </div>
                            <div style="flex: 1;">
                                <h4 style="color: var(--kintsugi-gold); font-size: 1.3rem; margin-bottom: 0.5rem; font-weight: bold; text-shadow: 0 0 10px rgba(240, 255, 0, 0.5);">Invite Guests</h4>
                                <p style="color: #ccc; font-size: 0.95rem; margin: 0; line-height: 1.5;">Generate a shareable link for non-registered users. Anyone with the link can join.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Audio Only -->
                    <div class="conference-option-card" onclick="ConferenceManager.startAudioOnlyConference()" style="padding: 1.75rem; background: linear-gradient(135deg, rgba(255, 0, 255, 0.15), rgba(255, 0, 255, 0.05)); border: 3px solid var(--neon-pink); cursor: pointer; transition: all 0.3s ease;">
                        <div style="display: flex; align-items: center; gap: 1.5rem;">
                            <div style="width: 60px; height: 60px; background: var(--neon-pink); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; flex-shrink: 0;">
                                🎤
                            </div>
                            <div style="flex: 1;">
                                <h4 style="color: var(--neon-pink); font-size: 1.3rem; margin-bottom: 0.5rem; font-weight: bold;">Audio Only</h4>
                                <p style="color: #ccc; font-size: 0.95rem; margin: 0; line-height: 1.5;">Start an audio-only call to save bandwidth. Ideal for voice discussions.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Info Box -->
                <div style="padding: 1.25rem; background: rgba(157, 0, 255, 0.1); border: 2px solid var(--electric-purple); border-radius: 4px;">
                    <div style="color: var(--cyber-cyan); font-size: 0.85rem; font-weight: bold; margin-bottom: 0.5rem; text-transform: uppercase;">💡 Conference Features:</div>
                    <div style="color: #aaa; font-size: 0.9rem; line-height: 1.6;">
                        • HD video & audio quality<br>
                        • Screen sharing support<br>
                        • Up to 50 participants<br>
                        • Guest access available<br>
                        • Recording capabilities (coming soon)
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add hover effects
        setTimeout(() => {
            document.querySelectorAll('.conference-option-card').forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateX(8px) scale(1.02)';
                    this.style.boxShadow = '0 8px 30px rgba(157, 0, 255, 0.4)';
                });
                card.addEventListener('mouseleave', function() {
                    this.style.transform = '';
                    this.style.boxShadow = '';
                });
            });
        }, 100);
    },

    // Close options modal
    closeOptions: function() {
        const modal = document.getElementById('conference-options-modal');
        if (modal) modal.remove();

        const guestModal = document.getElementById('guest-invite-modal');
        if (guestModal) guestModal.remove();
    },

    // Start instant conference
    startInstantConference: function() {
        if (!this.currentConversation) return;

        this.closeOptions();

        // Initialize and join conference
        if (typeof VideoConference !== 'undefined') {
            const userName = localStorage.getItem('username') || 'User';
            VideoConference.initialize().then(() => {
                VideoConference.joinConference(this.currentConversation.id, userName, false);
            });
        } else {
            alert('Video conference module not loaded. Please refresh the page.');
        }
    },

    // Start audio-only conference
    startAudioOnlyConference: function() {
        if (!this.currentConversation) return;

        this.closeOptions();

        // Initialize and join audio-only
        if (typeof VideoConference !== 'undefined') {
            const userName = localStorage.getItem('username') || 'User';
            VideoConference.initialize().then(() => {
                VideoConference.joinConference(this.currentConversation.id, userName, false, true);
            });
        } else {
            alert('Video conference module not loaded. Please refresh the page.');
        }
    },

    // Show guest invite UI
    showGuestInviteUI: function() {
        if (!this.currentConversation) return;

        const existingModal = document.getElementById('conference-options-modal');
        if (existingModal) existingModal.style.display = 'none';

        const modal = document.createElement('div');
        modal.id = 'guest-invite-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.95);
            z-index: 11001;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        `;

        const guestLink = `${window.location.origin}/guest-join.html?group=${this.currentConversation.id}&name=${encodeURIComponent(this.currentConversation.name)}`;

        modal.innerHTML = `
            <div class="scanlines" style="background: var(--digital-black); border: 4px solid var(--kintsugi-gold); padding: 2.5rem; max-width: 650px; width: 95%; box-shadow: 0 0 50px rgba(240, 255, 0, 0.7);">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 3px solid var(--kintsugi-gold);">
                    <div>
                        <h3 class="text-neon" style="font-size: 2rem; margin: 0 0 0.5rem 0; color: var(--kintsugi-gold); text-transform: uppercase; text-shadow: 0 0 15px rgba(240, 255, 0, 0.8);">
                            🔗 GUEST INVITE
                        </h3>
                        <div style="color: var(--cyber-cyan); font-size: 1rem;">
                            ${this.currentConversation.name}
                        </div>
                    </div>
                    <button onclick="ConferenceManager.closeOptions()" class="btn btn-secondary interactive" style="padding: 0.5rem 1rem; font-size: 1.5rem;">×</button>
                </div>

                <!-- Instructions -->
                <div style="margin-bottom: 2rem; padding: 1.5rem; background: rgba(0, 255, 255, 0.1); border: 3px solid var(--cyber-cyan);">
                    <h4 style="color: var(--cyber-cyan); font-size: 1.2rem; margin-bottom: 1rem; text-transform: uppercase;">📋 How It Works</h4>
                    <ol style="color: #ccc; font-size: 0.95rem; line-height: 1.8; margin: 0; padding-left: 1.5rem;">
                        <li>Copy the invite link below</li>
                        <li>Share it with anyone you want to invite</li>
                        <li>They can join without registration</li>
                        <li>Start the conference when ready</li>
                    </ol>
                </div>

                <!-- Link Box -->
                <div style="margin-bottom: 2rem;">
                    <label style="display: block; color: var(--kintsugi-gold); margin-bottom: 0.75rem; font-weight: bold; font-size: 1rem;">SHAREABLE LINK:</label>
                    <div style="display: flex; gap: 0.75rem; align-items: stretch;">
                        <input
                            type="text"
                            id="guest-link-input"
                            value="${guestLink}"
                            readonly
                            class="form-input"
                            style="flex: 1; padding: 1.1rem; border: 3px solid var(--kintsugi-gold); background: rgba(0,0,0,0.3); color: var(--kintsugi-gold); font-size: 0.95rem; font-family: monospace;"
                        >
                        <button
                            onclick="ConferenceManager.copyGuestLink()"
                            class="btn btn-primary interactive"
                            style="padding: 1.1rem 1.75rem; background: var(--kintsugi-gold); color: var(--digital-black); font-weight: bold; white-space: nowrap;"
                        >
                            📋 COPY
                        </button>
                    </div>
                    <div id="copy-feedback" style="color: var(--cyber-cyan); font-size: 0.85rem; margin-top: 0.5rem; opacity: 0; transition: opacity 0.3s;">
                        ✓ Link copied to clipboard!
                    </div>
                </div>

                <!-- Share Options -->
                <div style="margin-bottom: 2rem; padding: 1.5rem; background: linear-gradient(135deg, rgba(240, 255, 0, 0.1), rgba(240, 255, 0, 0.05)); border: 3px solid var(--kintsugi-gold);">
                    <h4 style="color: var(--kintsugi-gold); font-size: 1.1rem; margin-bottom: 1rem; text-transform: uppercase;">📤 Quick Share</h4>
                    <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                        <button onclick="ConferenceManager.shareViaEmail()" class="btn btn-secondary interactive" style="flex: 1; min-width: 140px; padding: 0.9rem;">
                            ✉️ Email
                        </button>
                        <button onclick="ConferenceManager.shareViaWhatsApp()" class="btn btn-secondary interactive" style="flex: 1; min-width: 140px; padding: 0.9rem;">
                            💬 WhatsApp
                        </button>
                        <button onclick="ConferenceManager.shareViaTelegram()" class="btn btn-secondary interactive" style="flex: 1; min-width: 140px; padding: 0.9rem;">
                            ✈️ Telegram
                        </button>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div style="display: flex; gap: 1rem;">
                    <button onclick="ConferenceManager.startInstantConference()" class="btn btn-primary interactive" style="flex: 1; padding: 1.25rem; background: linear-gradient(135deg, var(--kintsugi-gold), var(--cyber-cyan)); color: var(--digital-black); font-weight: bold; font-size: 1.05rem;">
                        ▶ START CONFERENCE NOW
                    </button>
                    <button onclick="ConferenceManager.closeOptions()" class="btn btn-secondary interactive" style="padding: 1.25rem 2rem;">
                        BACK
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    // Copy guest link
    copyGuestLink: function() {
        const input = document.getElementById('guest-link-input');
        const feedback = document.getElementById('copy-feedback');

        input.select();
        input.setSelectionRange(0, 99999); // For mobile

        navigator.clipboard.writeText(input.value).then(() => {
            feedback.style.opacity = '1';
            setTimeout(() => {
                feedback.style.opacity = '0';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy link. Please copy manually.');
        });
    },

    // Share via email
    shareViaEmail: function() {
        const link = document.getElementById('guest-link-input').value;
        const subject = encodeURIComponent(`Join video call: ${this.currentConversation.name}`);
        const body = encodeURIComponent(`You're invited to join a video conference!\n\nGroup: ${this.currentConversation.name}\n\nClick the link below to join:\n${link}\n\nNo registration required!`);
        window.open(`mailto:?subject=${subject}&body=${body}`);
    },

    // Share via WhatsApp
    shareViaWhatsApp: function() {
        const link = document.getElementById('guest-link-input').value;
        const text = encodeURIComponent(`Join video call: ${this.currentConversation.name}\n${link}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    },

    // Share via Telegram
    shareViaTelegram: function() {
        const link = document.getElementById('guest-link-input').value;
        const text = encodeURIComponent(`Join video call: ${this.currentConversation.name}`);
        window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${text}`, '_blank');
    }
};

// Make globally available
window.ConferenceManager = ConferenceManager;
