// Profile Settings - Kintsugi AI
// Extended profile management with preferences and customization

const ProfileSettings = {
    currentUser: null,
    preferences: {},

    // Load user profile
    loadProfile: async function() {
        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                this.renderProfile();
                await this.loadPreferences();
                await this.loadUsageStats();
            } else {
                window.location.href = '/login.html';
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    },

    // Render profile
    renderProfile: function() {
        if (!this.currentUser) return;

        document.getElementById('profile-username').textContent = this.currentUser.username || 'USERNAME';
        document.getElementById('profile-email').textContent = this.currentUser.email || 'email@example.com';
        document.getElementById('edit-username').value = this.currentUser.username || '';
        document.getElementById('edit-email').value = this.currentUser.email || '';
        document.getElementById('edit-bio').value = this.currentUser.bio || '';

        // Subscription tier
        const tier = this.currentUser.subscription_tier || 'basic';
        document.getElementById('profile-tier').textContent = tier.toUpperCase();

        // Tokens
        const tokensUsed = this.currentUser.tokens_used || 0;
        const tokensLimit = this.currentUser.tokens_limit || 50000;
        document.getElementById('profile-tokens').textContent = `${tokensUsed.toLocaleString()} / ${tokensLimit.toLocaleString()}`;

        // Avatar
        if (this.currentUser.avatar_url) {
            document.getElementById('profile-photo').innerHTML =
                `<img src="${this.currentUser.avatar_url}" style="width: 100%; height: 100%; object-fit: cover;">`;
        }
    },

    // Load user preferences
    loadPreferences: async function() {
        try {
            const response = await fetch(`${API_URL}/auth/preferences`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.preferences = data.preferences || {};
                this.renderPreferences();
            }
        } catch (error) {
            console.error('Failed to load preferences:', error);
            // Load from localStorage as fallback
            this.preferences = JSON.parse(localStorage.getItem('user_preferences') || '{}');
            this.renderPreferences();
        }
    },

    // Render preferences
    renderPreferences: function() {
        // Theme
        const theme = this.preferences.theme || 'dark';
        document.querySelectorAll('input[name="theme"]').forEach(radio => {
            radio.checked = radio.value === theme;
        });

        // Language
        const language = this.preferences.language || 'en';
        document.getElementById('pref-language').value = language;

        // Notifications
        document.getElementById('pref-email-notifications').checked = this.preferences.email_notifications !== false;
        document.getElementById('pref-push-notifications').checked = this.preferences.push_notifications !== false;
        document.getElementById('pref-sound').checked = this.preferences.sound !== false;

        // Privacy
        document.getElementById('pref-profile-visibility').value = this.preferences.profile_visibility || 'public';
        document.getElementById('pref-read-receipts').checked = this.preferences.read_receipts !== false;
        document.getElementById('pref-typing-indicator').checked = this.preferences.typing_indicator !== false;

        // AI Preferences
        document.getElementById('pref-default-model').value = this.preferences.default_model || 'gpt-4o';
        document.getElementById('pref-temperature').value = this.preferences.temperature || 0.7;
        document.getElementById('temp-value').textContent = this.preferences.temperature || 0.7;
        document.getElementById('pref-code-highlighting').checked = this.preferences.code_highlighting !== false;
        document.getElementById('pref-markdown').checked = this.preferences.markdown !== false;
    },

    // Update profile
    updateProfile: async function() {
        const username = document.getElementById('edit-username').value.trim();
        const bio = document.getElementById('edit-bio').value.trim();

        if (!username) {
            alert('Username cannot be empty');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ username, bio })
            });

            if (response.ok) {
                this.showNotification('✓ Profile updated successfully', 'success');
                await this.loadProfile();
            } else {
                const error = await response.json();
                alert(`Failed to update profile: ${error.message}`);
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('Failed to update profile');
        }
    },

    // Change password
    changePassword: async function() {
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (!newPassword || !confirmPassword) {
            alert('Please fill in both password fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            alert('Password must be at least 8 characters long');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ new_password: newPassword })
            });

            if (response.ok) {
                this.showNotification('✓ Password changed successfully', 'success');
                document.getElementById('new-password').value = '';
                document.getElementById('confirm-password').value = '';
            } else {
                const error = await response.json();
                alert(`Failed to change password: ${error.message}`);
            }
        } catch (error) {
            console.error('Password change error:', error);
            alert('Failed to change password');
        }
    },

    // Change profile photo
    changeProfilePhoto: async function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Show loading
            this.showNotification('Uploading photo...', 'info');

            try {
                // Upload to Cloudinary
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', 'messenger_uploads'); // Reuse existing preset

                const cloudinaryResponse = await fetch(
                    `https://api.cloudinary.com/v1_1/kintsugi-ai/image/upload`,
                    {
                        method: 'POST',
                        body: formData
                    }
                );

                if (!cloudinaryResponse.ok) {
                    throw new Error('Failed to upload to Cloudinary');
                }

                const cloudinaryData = await cloudinaryResponse.json();
                const avatarUrl = cloudinaryData.secure_url;

                // Update backend
                const response = await fetch(`${API_URL}/auth/update-avatar`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify({ avatar_url: avatarUrl })
                });

                if (response.ok) {
                    document.getElementById('profile-photo').innerHTML =
                        `<img src="${avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;">`;
                    this.showNotification('✓ Profile photo updated', 'success');
                } else {
                    throw new Error('Failed to update avatar');
                }
            } catch (error) {
                console.error('Avatar upload error:', error);
                alert('Failed to upload photo. Please try again.');
            }
        };

        input.click();
    },

    // Save preferences
    savePreferences: async function() {
        // Collect all preferences
        const preferences = {
            theme: document.querySelector('input[name="theme"]:checked')?.value || 'dark',
            language: document.getElementById('pref-language').value,
            email_notifications: document.getElementById('pref-email-notifications').checked,
            push_notifications: document.getElementById('pref-push-notifications').checked,
            sound: document.getElementById('pref-sound').checked,
            profile_visibility: document.getElementById('pref-profile-visibility').value,
            read_receipts: document.getElementById('pref-read-receipts').checked,
            typing_indicator: document.getElementById('pref-typing-indicator').checked,
            default_model: document.getElementById('pref-default-model').value,
            temperature: parseFloat(document.getElementById('pref-temperature').value),
            code_highlighting: document.getElementById('pref-code-highlighting').checked,
            markdown: document.getElementById('pref-markdown').checked
        };

        try {
            const response = await fetch(`${API_URL}/auth/preferences`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ preferences })
            });

            if (response.ok) {
                this.preferences = preferences;
                localStorage.setItem('user_preferences', JSON.stringify(preferences));
                this.showNotification('✓ Preferences saved', 'success');

                // Apply theme
                this.applyTheme(preferences.theme);
            } else {
                throw new Error('Failed to save preferences');
            }
        } catch (error) {
            console.error('Preferences save error:', error);
            // Save to localStorage as fallback
            localStorage.setItem('user_preferences', JSON.stringify(preferences));
            this.showNotification('✓ Preferences saved locally', 'success');
        }
    },

    // Apply theme
    applyTheme: function(theme) {
        if (theme === 'light') {
            document.body.style.setProperty('--digital-black', '#F0F0F0');
            document.body.style.setProperty('--digital-white', '#0A0A0A');
        } else {
            document.body.style.setProperty('--digital-black', '#0A0A0A');
            document.body.style.setProperty('--digital-white', '#F0F0F0');
        }
    },

    // Load usage stats
    loadUsageStats: async function() {
        try {
            const response = await fetch(`${API_URL}/auth/usage-stats`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.renderUsageStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to load usage stats:', error);
        }
    },

    // Render usage stats
    renderUsageStats: function(stats) {
        if (!stats) return;

        const container = document.getElementById('usage-stats-container');
        if (!container) return;

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                <div class="stat-card">
                    <div class="stat-value">${stats.total_messages || 0}</div>
                    <div class="stat-label">MESSAGES SENT</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.total_translations || 0}</div>
                    <div class="stat-label">TRANSLATIONS</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.total_ai_chats || 0}</div>
                    <div class="stat-label">AI CHATS</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.total_groups || 0}</div>
                    <div class="stat-label">GROUPS</div>
                </div>
            </div>
        `;
    },

    // Show notification
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--digital-black);
            border: 3px solid ${type === 'success' ? 'var(--matrix-green)' : 'var(--cyber-cyan)'};
            padding: 1rem 1.5rem;
            z-index: 12000;
            box-shadow: 6px 6px 0px ${type === 'success' ? 'rgba(0, 255, 65, 0.4)' : 'rgba(0, 255, 255, 0.4)'};
            animation: slideInRight 0.3s ease-out;
        `;

        notification.innerHTML = `
            <div style="color: ${type === 'success' ? 'var(--matrix-green)' : 'var(--cyber-cyan)'}; font-weight: bold;">
                ${message}
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Global functions
window.updateProfile = () => ProfileSettings.updateProfile();
window.changePassword = () => ProfileSettings.changePassword();
window.changeProfilePhoto = () => ProfileSettings.changeProfilePhoto();
window.savePreferences = () => ProfileSettings.savePreferences();

// Update temperature slider value display
document.getElementById('pref-temperature')?.addEventListener('input', (e) => {
    document.getElementById('temp-value').textContent = e.target.value;
});

// Initialize on page load
if (window.location.pathname.includes('profile')) {
    document.addEventListener('DOMContentLoaded', () => {
        ProfileSettings.loadProfile();
    });
}
