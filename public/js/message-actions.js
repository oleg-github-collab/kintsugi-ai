// Kintsugi AI Messenger - Advanced Message Operations
// Features: Context menu, Forward, Delete, Quote/Reply, Reactions, GIF picker

const MessageActions = {
    currentContextMenu: null,
    currentReplyTo: null,
    selectedGif: null,

    // Initialize
    init: function() {
        this.setupContextMenuListener();
        this.setupReplyBar();
        this.loadGiphyAPI();
    },

    // Context Menu
    setupContextMenuListener: function() {
        document.addEventListener('click', (e) => {
            // Close context menu when clicking outside
            if (this.currentContextMenu && !e.target.closest('.message-context-menu')) {
                this.closeContextMenu();
            }
        });
    },

    showContextMenu: function(messageId, messageElement, event) {
        event.preventDefault();
        event.stopPropagation();

        // Close existing menu
        this.closeContextMenu();

        const message = this.getMessage(messageId);
        if (!message) return;

        const isOwn = message.sender_id === currentUser?.id || message.sender_id === 'user';

        const menu = document.createElement('div');
        menu.className = 'message-context-menu';
        menu.style.cssText = `
            position: fixed;
            top: ${event.clientY}px;
            left: ${event.clientX}px;
            background: var(--digital-black);
            border: 3px solid var(--cyber-cyan);
            padding: 0.5rem;
            z-index: 10000;
            min-width: 200px;
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
        `;

        const options = [
            { icon: '💬', text: 'REPLY', action: () => this.replyToMessage(messageId) },
            { icon: '↗', text: 'FORWARD', action: () => this.forwardMessage(messageId) },
            { icon: '📋', text: 'COPY', action: () => this.copyMessage(messageId) },
            { icon: '😀', text: 'REACT', action: () => this.showReactionPicker(messageId) }
        ];

        // Add delete option for own messages
        if (isOwn && !isAIChat) {
            options.push({ icon: '🗑️', text: 'DELETE', action: () => this.deleteMessage(messageId, isOwn) });
        }

        options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'context-menu-item interactive';
            btn.style.cssText = `
                width: 100%;
                padding: 0.75rem;
                border: none;
                background: rgba(0, 255, 255, 0.05);
                color: var(--cyber-cyan);
                text-align: left;
                cursor: pointer;
                border-bottom: 2px solid rgba(0, 255, 255, 0.2);
                transition: all 0.2s;
                font-weight: bold;
                display: flex;
                align-items: center;
                gap: 0.75rem;
            `;
            btn.innerHTML = `<span style="font-size: 1.2rem;">${option.icon}</span> ${option.text}`;
            btn.onmouseover = () => {
                btn.style.background = 'rgba(0, 255, 255, 0.2)';
                btn.style.transform = 'translateX(4px)';
            };
            btn.onmouseout = () => {
                btn.style.background = 'rgba(0, 255, 255, 0.05)';
                btn.style.transform = 'translateX(0)';
            };
            btn.onclick = () => {
                option.action();
                this.closeContextMenu();
            };
            menu.appendChild(btn);
        });

        document.body.appendChild(menu);
        this.currentContextMenu = menu;

        // Adjust position if menu goes off screen
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = (window.innerWidth - rect.width - 10) + 'px';
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = (window.innerHeight - rect.height - 10) + 'px';
        }
    },

    closeContextMenu: function() {
        if (this.currentContextMenu) {
            this.currentContextMenu.remove();
            this.currentContextMenu = null;
        }
    },

    // Reply to Message
    setupReplyBar: function() {
        const replyBar = document.createElement('div');
        replyBar.id = 'reply-bar';
        replyBar.style.cssText = `
            display: none;
            padding: 1rem;
            background: rgba(0, 255, 255, 0.1);
            border-top: 3px solid var(--cyber-cyan);
            border-bottom: 3px solid var(--cyber-cyan);
        `;

        const inputContainer = document.querySelector('.chat-input-container');
        inputContainer.parentNode.insertBefore(replyBar, inputContainer);
    },

    replyToMessage: function(messageId) {
        const message = this.getMessage(messageId);
        if (!message) return;

        this.currentReplyTo = messageId;

        const replyBar = document.getElementById('reply-bar');
        replyBar.style.display = 'block';
        replyBar.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="flex: 1;">
                    <div style="color: var(--cyber-cyan); font-weight: bold; margin-bottom: 0.25rem;">↩ REPLYING TO ${message.sender_name?.toUpperCase()}</div>
                    <div style="color: #999; font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${this.escapeHtml(message.content.substring(0, 100))}
                    </div>
                </div>
                <button onclick="MessageActions.cancelReply()" class="btn btn-secondary interactive" style="padding: 0.5rem 1rem; margin-left: 1rem;">✕</button>
            </div>
        `;

        document.getElementById('message-input').focus();
    },

    cancelReply: function() {
        this.currentReplyTo = null;
        document.getElementById('reply-bar').style.display = 'none';
    },

    // Forward Message
    forwardMessage: function(messageId) {
        const message = this.getMessage(messageId);
        if (!message) return;

        const modal = document.createElement('div');
        modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 11000; display: flex; align-items: center; justify-content: center;';
        modal.innerHTML = `
            <div class="scanlines" style="background: var(--digital-black); border: 3px solid var(--kintsugi-gold); padding: 2rem; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 3px solid var(--kintsugi-gold); padding-bottom: 1rem;">
                    <h3 class="text-gold text-neon" style="font-size: 1.5rem; margin: 0;">↗ FORWARD MESSAGE</h3>
                    <button onclick="this.closest('[style*=fixed]').remove()" class="btn btn-secondary interactive" style="padding: 0.5rem 1rem;">✕</button>
                </div>

                <!-- Message Preview -->
                <div style="padding: 1rem; border: 2px solid var(--cyber-cyan); background: rgba(0, 255, 255, 0.05); margin-bottom: 1.5rem;">
                    <div style="color: #999; font-size: 0.85rem; margin-bottom: 0.5rem;">FORWARDING:</div>
                    <div style="color: var(--cyber-cyan);">${this.escapeHtml(message.content.substring(0, 150))}${message.content.length > 150 ? '...' : ''}</div>
                </div>

                <!-- Contact Selection -->
                <div style="margin-bottom: 1rem;">
                    <input type="text" id="forward-search" placeholder="🔍 Search contacts..." class="form-input interactive" style="width: 100%; padding: 0.75rem; border: 2px solid var(--cyber-cyan);">
                </div>

                <div id="forward-contact-list" style="max-height: 300px; overflow-y: auto;">
                    ${Object.values(conversations).filter(c => !c.isAI).map(c => `
                        <button onclick="MessageActions.doForward('${messageId}', '${c.id}')" class="interactive" style="width: 100%; padding: 1rem; margin-bottom: 0.5rem; border: 2px solid var(--electric-purple); background: rgba(157, 0, 255, 0.05); color: var(--cyber-cyan); text-align: left; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 40px; height: 40px; border: 2px solid var(--cyber-cyan); display: flex; align-items: center; justify-content: center; font-weight: bold; color: var(--kintsugi-gold);">${this.getInitials(c.name)}</div>
                            <div style="flex: 1;">
                                <div style="font-weight: bold;">${c.name}</div>
                                <div style="color: #999; font-size: 0.85rem;">${c.participants_count || 2} participants</div>
                            </div>
                        </button>
                    `).join('')}
                </div>

                <button onclick="this.closest('[style*=fixed]').remove()" class="btn btn-secondary interactive" style="width: 100%; padding: 1rem; margin-top: 1rem;">CANCEL</button>
            </div>
        `;

        document.body.appendChild(modal);

        // Forward search functionality
        modal.querySelector('#forward-search').addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            modal.querySelectorAll('#forward-contact-list button').forEach(btn => {
                const name = btn.textContent.toLowerCase();
                btn.style.display = name.includes(query) ? 'flex' : 'none';
            });
        });
    },

    doForward: async function(messageId, targetConversationId) {
        const message = this.getMessage(messageId);
        if (!message) return;

        document.querySelector('[style*="position: fixed"]')?.remove();

        try {
            const response = await fetch(`${API_URL}/messenger/conversations/${targetConversationId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    content: `[Forwarded]\n${message.content}`,
                    forwarded_from: messageId
                })
            });

            if (response.ok) {
                this.showNotification('✓ Message forwarded!', 'success');
            } else {
                throw new Error('Forward failed');
            }
        } catch (error) {
            console.error('Forward error:', error);
            this.showNotification('❌ Failed to forward message', 'error');
        }
    },

    // Delete Message
    deleteMessage: function(messageId, isOwn) {
        const options = isOwn
            ? ['Delete for me', 'Delete for everyone', 'Cancel']
            : ['Delete for me', 'Cancel'];

        const modal = document.createElement('div');
        modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 11000; display: flex; align-items: center; justify-content: center;';
        modal.innerHTML = `
            <div class="scanlines" style="background: var(--digital-black); border: 3px solid var(--neon-pink); padding: 2rem; max-width: 500px; width: 90%;">
                <h3 class="text-pink text-neon" style="font-size: 1.5rem; margin-bottom: 1.5rem;">🗑️ DELETE MESSAGE</h3>

                <p style="color: #ccc; margin-bottom: 2rem;">Choose delete option:</p>

                ${isOwn ? `
                    <button onclick="MessageActions.doDelete('${messageId}', 'me')" class="btn btn-secondary interactive" style="width: 100%; padding: 1rem; margin-bottom: 0.75rem; text-align: left;">
                        <div style="font-weight: bold; color: var(--cyber-cyan);">🔒 DELETE FOR ME</div>
                        <div style="color: #999; font-size: 0.85rem; margin-top: 0.25rem;">Only you won't see this message</div>
                    </button>
                    <button onclick="MessageActions.doDelete('${messageId}', 'everyone')" class="btn btn-secondary interactive" style="width: 100%; padding: 1rem; margin-bottom: 0.75rem; text-align: left; border-color: var(--neon-pink);">
                        <div style="font-weight: bold; color: var(--neon-pink);">⚠️ DELETE FOR EVERYONE</div>
                        <div style="color: #999; font-size: 0.85rem; margin-top: 0.25rem;">This message will be removed for all participants</div>
                    </button>
                ` : `
                    <button onclick="MessageActions.doDelete('${messageId}', 'me')" class="btn btn-secondary interactive" style="width: 100%; padding: 1rem; margin-bottom: 0.75rem;">
                        DELETE FOR ME
                    </button>
                `}

                <button onclick="this.closest('[style*=fixed]').remove()" class="btn btn-primary interactive" style="width: 100%; padding: 1rem;">CANCEL</button>
            </div>
        `;

        document.body.appendChild(modal);
    },

    doDelete: async function(messageId, deleteType) {
        document.querySelector('[style*="position: fixed"]')?.remove();

        if (isAIChat) {
            // Local deletion for AI chat
            const msgs = messages['ai-assistant'] || [];
            const index = msgs.findIndex(m => m.id == messageId);
            if (index !== -1) {
                msgs.splice(index, 1);
                saveAIMessages();
                renderMessages();
                this.showNotification('✓ Message deleted', 'success');
            }
            return;
        }

        try {
            const response = await fetch(`${API_URL}/messenger/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    delete_for: deleteType
                })
            });

            if (response.ok) {
                // Remove from local state
                const msgs = messages[currentConversationId] || [];
                const index = msgs.findIndex(m => m.id == messageId);
                if (index !== -1) {
                    if (deleteType === 'everyone') {
                        msgs.splice(index, 1);
                    } else {
                        msgs[index].deleted_for_me = true;
                    }
                }
                renderMessages();
                this.showNotification('✓ Message deleted', 'success');
            } else {
                throw new Error('Delete failed');
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.showNotification('❌ Failed to delete message', 'error');
        }
    },

    // Copy Message
    copyMessage: function(messageId) {
        const message = this.getMessage(messageId);
        if (!message) return;

        navigator.clipboard.writeText(message.content).then(() => {
            this.showNotification('✓ Message copied!', 'success');
        }).catch(() => {
            this.showNotification('❌ Failed to copy', 'error');
        });
    },

    // Reaction Picker
    showReactionPicker: function(messageId) {
        const picker = document.createElement('div');
        picker.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--digital-black);
            border: 3px solid var(--kintsugi-gold);
            padding: 1.5rem;
            z-index: 11000;
            box-shadow: 0 0 50px rgba(240, 255, 0, 0.5);
        `;

        const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '🔥', '🎉', '👏', '✨', '💯', '🙏'];

        picker.innerHTML = `
            <h4 class="text-gold" style="margin-bottom: 1rem; text-align: center;">REACT TO MESSAGE</h4>
            <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.5rem; margin-bottom: 1rem;">
                ${emojis.map(emoji => `
                    <button onclick="MessageActions.addReaction('${messageId}', '${emoji}')" class="interactive" style="font-size: 2rem; padding: 0.75rem; border: 2px solid var(--cyber-cyan); background: rgba(0, 255, 255, 0.05); cursor: pointer; transition: all 0.2s;">
                        ${emoji}
                    </button>
                `).join('')}
            </div>
            <button onclick="this.closest('[style*=fixed]').remove()" class="btn btn-secondary interactive" style="width: 100%; padding: 0.75rem;">CANCEL</button>
        `;

        // Add hover effects
        picker.querySelectorAll('button[onclick*="addReaction"]').forEach(btn => {
            btn.onmouseover = () => {
                btn.style.transform = 'scale(1.2)';
                btn.style.background = 'rgba(240, 255, 0, 0.2)';
            };
            btn.onmouseout = () => {
                btn.style.transform = 'scale(1)';
                btn.style.background = 'rgba(0, 255, 255, 0.05)';
            };
        });

        document.body.appendChild(picker);
    },

    addReaction: async function(messageId, emoji) {
        document.querySelector('[style*="position: fixed"]')?.remove();

        if (isAIChat) {
            const msgs = messages['ai-assistant'] || [];
            const msg = msgs.find(m => m.id == messageId);
            if (msg) {
                if (!msg.reactions) msg.reactions = [];
                msg.reactions.push({ emoji, user_id: currentUser?.id });
                saveAIMessages();
                renderMessages();
            }
            return;
        }

        try {
            const response = await fetch(`${API_URL}/messenger/messages/${messageId}/reactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ emoji })
            });

            if (!response.ok) throw new Error('Reaction failed');
        } catch (error) {
            console.error('Reaction error:', error);
            this.showNotification('❌ Failed to add reaction', 'error');
        }
    },

    // GIF Picker (Giphy Integration)
    loadGiphyAPI: function() {
        // Create GIF button in chat input
        const form = document.getElementById('message-form');
        const gifBtn = document.createElement('button');
        gifBtn.type = 'button';
        gifBtn.className = 'btn btn-secondary interactive';
        gifBtn.style.cssText = 'padding: 1rem;';
        gifBtn.title = 'Send GIF';
        gifBtn.innerHTML = 'GIF';
        gifBtn.onclick = () => this.showGifPicker();

        // Insert after emoji button
        const emojiBtn = form.querySelector('button[onclick*="openAudioRecorder"]');
        emojiBtn.after(gifBtn);
    },

    showGifPicker: function() {
        const modal = document.createElement('div');
        modal.id = 'gif-picker-modal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.95); z-index: 11000; display: flex; align-items: center; justify-content: center; padding: 1rem;';
        modal.innerHTML = `
            <div class="scanlines" style="background: var(--digital-black); border: 3px solid var(--electric-purple); padding: 2rem; max-width: 800px; width: 95%; max-height: 90vh; display: flex; flex-direction: column;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 3px solid var(--electric-purple); padding-bottom: 1rem;">
                    <h3 class="text-purple text-neon" style="font-size: 1.5rem; margin: 0;">GIF SEARCH</h3>
                    <button onclick="this.closest('[style*=fixed]').remove()" class="btn btn-secondary interactive" style="padding: 0.5rem 1rem;">✕</button>
                </div>

                <input type="text" id="gif-search-input" placeholder="🔍 Search GIFs (e.g., happy, cat, dance)..." class="form-input interactive" style="width: 100%; padding: 1rem; border: 2px solid var(--electric-purple); margin-bottom: 1.5rem; font-size: 1rem;">

                <div id="gif-results" style="flex: 1; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 0.75rem; padding: 0.5rem;">
                    <div style="grid-column: 1 / -1; text-align: center; color: #999; padding: 3rem;">
                        Type to search for GIFs...
                    </div>
                </div>

                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid var(--electric-purple); text-align: center;">
                    <p style="color: #666; font-size: 0.85rem;">Powered by Giphy</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Search functionality
        const searchInput = modal.querySelector('#gif-search-input');
        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();

            if (query.length < 2) {
                modal.querySelector('#gif-results').innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #999; padding: 3rem;">Type to search for GIFs...</div>';
                return;
            }

            searchTimeout = setTimeout(() => {
                this.searchGifs(query, modal);
            }, 500);
        });

        searchInput.focus();
    },

    searchGifs: async function(query, modal) {
        const resultsContainer = modal.querySelector('#gif-results');
        resultsContainer.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--cyber-cyan); padding: 3rem;">Searching...</div>';

        // Giphy API key (use your own in production)
        const GIPHY_API_KEY = 'YOUR_GIPHY_API_KEY'; // Replace with actual key
        const url = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=20&rating=g`;

        try {
            // For demo purposes, use trending GIFs endpoint which doesn't require API key
            const trendingUrl = `https://api.giphy.com/v1/gifs/trending?api_key=YOUR_GIPHY_API_KEY&limit=20&rating=g`;

            // In production, use actual Giphy API
            // For now, show placeholder GIFs
            resultsContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                    <div style="color: var(--kintsugi-gold); font-size: 3rem; margin-bottom: 1rem;">🎬</div>
                    <div style="color: var(--cyber-cyan); font-weight: bold; margin-bottom: 0.5rem;">GIF SEARCH READY</div>
                    <div style="color: #999; font-size: 0.9rem; margin-bottom: 1.5rem;">
                        Configure Giphy API key in production to enable GIF search
                    </div>
                    <div style="padding: 1rem; border: 2px dashed var(--electric-purple); background: rgba(157, 0, 255, 0.05);">
                        <div style="color: #ccc; font-size: 0.85rem; margin-bottom: 0.5rem;">💡 TO ENABLE:</div>
                        <div style="color: #999; font-size: 0.85rem; text-align: left;">
                            1. Get free API key from developers.giphy.com<br>
                            2. Replace YOUR_GIPHY_API_KEY in message-actions.js<br>
                            3. Search query: "${query}"
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('GIF search error:', error);
            resultsContainer.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--neon-pink); padding: 3rem;">❌ Failed to load GIFs</div>';
        }
    },

    sendGif: function(gifUrl) {
        document.getElementById('gif-picker-modal')?.remove();

        const input = document.getElementById('message-input');
        input.value = `[GIF: ${gifUrl}]`;

        // Trigger send
        document.getElementById('message-form').dispatchEvent(new Event('submit'));
    },

    // Helpers
    getMessage: function(messageId) {
        const msgs = messages[currentConversationId] || [];
        return msgs.find(m => m.id == messageId);
    },

    getInitials: function(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    },

    escapeHtml: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

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

// Make MessageActions globally available
window.MessageActions = MessageActions;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MessageActions.init());
} else {
    MessageActions.init();
}
