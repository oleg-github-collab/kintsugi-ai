// Stories Module - Kintsugi AI
// Instagram-style stories for messenger

const StoriesManager = {
    currentStories: [],
    currentStoryIndex: 0,
    storyTimer: null,
    storyDuration: 5000, // 5 seconds per story

    // Load user stories
    loadStories: async function() {
        try {
            const response = await fetch(`${API_URL}/messenger/stories`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.currentStories = data.stories || [];
                this.renderStoriesList();
            }
        } catch (error) {
            console.error('Failed to load stories:', error);
        }
    },

    // Render stories list
    renderStoriesList: function() {
        const list = document.getElementById('stories-list');
        if (!list) return;

        list.innerHTML = '';

        this.currentStories.forEach(story => {
            const div = document.createElement('div');
            div.className = 'story-item';
            div.onclick = () => this.viewStory(story);

            const initials = story.user_name ? story.user_name.substring(0, 2).toUpperCase() : '??';

            div.innerHTML = `
                <div class="story-avatar" style="background: linear-gradient(135deg, ${this.getRandomGradient()});">
                    ${initials}
                </div>
                <div class="story-name">${story.user_name || 'Unknown'}</div>
            `;

            list.appendChild(div);
        });
    },

    // Get random gradient
    getRandomGradient: function() {
        const gradients = [
            '#FF6B9D, #C06C84',
            '#00D9FF, #0099CC',
            '#F0FF00, #FFCC00',
            '#9D00FF, #CC00FF',
            '#A6F77B, #66CC66'
        ];
        return gradients[Math.floor(Math.random() * gradients.length)];
    },

    // Show create story modal
    showCreateStory: function() {
        const modal = document.createElement('div');
        modal.id = 'create-story-modal';
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
            <div class="scanlines" style="background: var(--digital-black); border: 4px solid var(--electric-purple); padding: 2.5rem; max-width: 600px; width: 95%; box-shadow: 0 0 50px rgba(157, 0, 255, 0.7);">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 3px solid var(--electric-purple);">
                    <h3 class="text-neon" style="font-size: 2rem; margin: 0; color: var(--electric-purple); text-transform: uppercase; text-shadow: 0 0 15px rgba(157, 0, 255, 0.8);">
                        ✨ CREATE STORY
                    </h3>
                    <button onclick="StoriesManager.closeCreateStory()" class="btn btn-secondary interactive" style="padding: 0.5rem 1rem; font-size: 1.5rem;">×</button>
                </div>

                <!-- Story Type Selection -->
                <div style="margin-bottom: 2rem;">
                    <label style="display: block; color: var(--cyber-cyan); margin-bottom: 1rem; font-weight: bold; font-size: 1.1rem;">
                        STORY TYPE:
                    </label>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                        <button onclick="StoriesManager.selectStoryType('text')" class="story-type-btn active" data-type="text" style="padding: 1.25rem; border: 3px solid var(--cyber-cyan); background: rgba(0, 255, 255, 0.1); transition: all 0.2s; cursor: pointer;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📝</div>
                            <div style="color: var(--cyber-cyan); font-weight: bold;">TEXT</div>
                        </button>
                        <button onclick="StoriesManager.selectStoryType('image')" class="story-type-btn" data-type="image" style="padding: 1.25rem; border: 3px solid #666; background: rgba(0, 0, 0, 0.1); transition: all 0.2s; cursor: pointer;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🖼️</div>
                            <div style="color: #999; font-weight: bold;">IMAGE</div>
                        </button>
                        <button onclick="StoriesManager.selectStoryType('video')" class="story-type-btn" data-type="video" style="padding: 1.25rem; border: 3px solid #666; background: rgba(0, 0, 0, 0.1); transition: all 0.2s; cursor: pointer;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎥</div>
                            <div style="color: #999; font-weight: bold;">VIDEO</div>
                        </button>
                    </div>
                </div>

                <!-- Content Input -->
                <div id="story-content-input" style="margin-bottom: 2rem;">
                    <!-- Text Story -->
                    <div id="text-story-input" style="display: block;">
                        <label style="display: block; color: var(--kintsugi-gold); margin-bottom: 0.75rem; font-weight: bold;">
                            YOUR STORY:
                        </label>
                        <textarea
                            id="story-text"
                            placeholder="Share what's on your mind..."
                            class="form-input interactive"
                            style="width: 100%; padding: 1.25rem; border: 3px solid var(--electric-purple); min-height: 150px; resize: vertical; font-size: 1.1rem; background: rgba(0,0,0,0.3);"
                            maxlength="300"
                        ></textarea>
                        <div style="color: #666; font-size: 0.85rem; margin-top: 0.5rem; text-align: right;">
                            <span id="char-count">0</span> / 300
                        </div>
                    </div>

                    <!-- Image Story -->
                    <div id="image-story-input" style="display: none;">
                        <label style="display: block; color: var(--kintsugi-gold); margin-bottom: 0.75rem; font-weight: bold;">
                            UPLOAD IMAGE:
                        </label>
                        <div style="border: 3px dashed var(--cyber-cyan); padding: 2rem; text-align: center; background: rgba(0, 255, 255, 0.05); cursor: pointer;" onclick="document.getElementById('story-image-file').click()">
                            <div style="font-size: 3rem; margin-bottom: 0.75rem;">📸</div>
                            <div style="color: var(--cyber-cyan); font-size: 1.1rem; margin-bottom: 0.5rem;">Click to upload image</div>
                            <div style="color: #999; font-size: 0.9rem;">JPEG, PNG, GIF (max 5MB)</div>
                        </div>
                        <input type="file" id="story-image-file" accept="image/*" style="display: none;">
                        <div id="image-preview" style="margin-top: 1rem; display: none;">
                            <img id="image-preview-img" style="max-width: 100%; border: 3px solid var(--cyber-cyan);">
                        </div>
                    </div>

                    <!-- Video Story -->
                    <div id="video-story-input" style="display: none;">
                        <div style="padding: 2rem; text-align: center; background: rgba(255, 0, 255, 0.05); border: 2px solid var(--neon-pink);">
                            <div style="font-size: 2.5rem; margin-bottom: 1rem;">🎬</div>
                            <div style="color: var(--neon-pink); font-size: 1.2rem; font-weight: bold; margin-bottom: 0.5rem;">
                                VIDEO STORIES COMING SOON!
                            </div>
                            <div style="color: #aaa; font-size: 0.95rem;">
                                We're working on video support. Stay tuned!
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Visibility Settings -->
                <div style="margin-bottom: 2rem; padding: 1.5rem; background: rgba(0, 255, 255, 0.05); border: 2px solid var(--cyber-cyan);">
                    <h4 style="color: var(--cyber-cyan); font-size: 1rem; margin-bottom: 1rem; text-transform: uppercase;">
                        👁️ VISIBILITY
                    </h4>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                        <label style="flex: 1; min-width: 150px; display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border: 2px solid var(--cyber-cyan); background: rgba(0, 255, 255, 0.1); cursor: pointer;">
                            <input type="radio" name="story-visibility" value="all" checked style="width: 18px; height: 18px;">
                            <div>
                                <div style="color: var(--cyber-cyan); font-weight: bold;">All Contacts</div>
                                <div style="color: #999; font-size: 0.8rem;">Everyone can see</div>
                            </div>
                        </label>
                        <label style="flex: 1; min-width: 150px; display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border: 2px solid #666; background: rgba(0, 0, 0, 0.1); cursor: pointer;">
                            <input type="radio" name="story-visibility" value="friends" style="width: 18px; height: 18px;">
                            <div>
                                <div style="color: #999; font-weight: bold;">Friends Only</div>
                                <div style="color: #666; font-size: 0.8rem;">Coming soon</div>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Duration -->
                <div style="margin-bottom: 2rem; padding: 1.25rem; background: rgba(240, 255, 0, 0.05); border: 2px solid var(--kintsugi-gold);">
                    <div style="color: var(--kintsugi-gold); font-size: 0.95rem; font-weight: bold; margin-bottom: 0.5rem;">
                        ⏰ STORY DURATION
                    </div>
                    <div style="color: #ccc; font-size: 0.9rem;">
                        Your story will disappear after 24 hours
                    </div>
                </div>

                <!-- Action Buttons -->
                <div style="display: flex; gap: 1rem;">
                    <button onclick="StoriesManager.publishStory()" class="btn btn-primary interactive" style="flex: 1; padding: 1.25rem; background: linear-gradient(135deg, var(--electric-purple), var(--cyber-pink)); font-size: 1.1rem; font-weight: bold;">
                        ✓ PUBLISH STORY
                    </button>
                    <button onclick="StoriesManager.closeCreateStory()" class="btn btn-secondary interactive" style="padding: 1.25rem 2rem;">
                        CANCEL
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add character counter
        const textarea = document.getElementById('story-text');
        const charCount = document.getElementById('char-count');
        textarea?.addEventListener('input', () => {
            charCount.textContent = textarea.value.length;
        });

        // Handle image upload
        const imageInput = document.getElementById('story-image-file');
        imageInput?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const preview = document.getElementById('image-preview');
                    const img = document.getElementById('image-preview-img');
                    img.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    },

    // Select story type
    selectStoryType: function(type) {
        // Update buttons
        document.querySelectorAll('.story-type-btn').forEach(btn => {
            if (btn.dataset.type === type) {
                btn.classList.add('active');
                btn.style.borderColor = 'var(--cyber-cyan)';
                btn.style.background = 'rgba(0, 255, 255, 0.1)';
                btn.querySelector('div:last-child').style.color = 'var(--cyber-cyan)';
            } else {
                btn.classList.remove('active');
                btn.style.borderColor = '#666';
                btn.style.background = 'rgba(0, 0, 0, 0.1)';
                btn.querySelector('div:last-child').style.color = '#999';
            }
        });

        // Show/hide inputs
        document.getElementById('text-story-input').style.display = type === 'text' ? 'block' : 'none';
        document.getElementById('image-story-input').style.display = type === 'image' ? 'block' : 'none';
        document.getElementById('video-story-input').style.display = type === 'video' ? 'block' : 'none';
    },

    // Publish story
    publishStory: async function() {
        const activeType = document.querySelector('.story-type-btn.active')?.dataset.type;

        if (activeType === 'text') {
            const text = document.getElementById('story-text').value.trim();
            if (!text) {
                alert('Please enter some text for your story');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/messenger/stories`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify({
                        content: text,
                        media_type: 'text'
                    })
                });

                if (response.ok) {
                    this.closeCreateStory();
                    this.loadStories();
                    this.showNotification('✓ Story published!', 'success');
                } else {
                    throw new Error('Failed to publish story');
                }
            } catch (error) {
                console.error('Error publishing story:', error);
                alert('Failed to publish story. Please try again.');
            }
        } else if (activeType === 'video') {
            alert('Video stories are coming soon!');
        }
    },

    // Close create story modal
    closeCreateStory: function() {
        const modal = document.getElementById('create-story-modal');
        if (modal) modal.remove();
    },

    // View story
    viewStory: function(story) {
        // TODO: Implement story viewer modal
        console.log('Viewing story:', story);
    },

    // Show notification
    showNotification: function(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? 'var(--matrix-green)' : 'var(--neon-pink)'};
            color: var(--digital-black);
            font-weight: bold;
            border: 3px solid var(--digital-black);
            box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.3);
            z-index: 15000;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Export for window
window.StoriesManager = StoriesManager;

// Initialize on messenger page
if (document.getElementById('stories-list')) {
    StoriesManager.loadStories();
}
