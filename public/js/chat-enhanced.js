// Enhanced AI Chat - Kintsugi AI
// Full-featured ChatGPT-style interface

const ChatEnhanced = {
    currentChatId: null,
    currentModel: 'gpt-4o',
    currentMultiplier: 1,
    chatHistory: [],
    messages: [],
    currentAttachment: null,

    // Initialize
    init: function() {
        if (!isAuthenticated()) {
            window.location.href = '/login.html';
            return;
        }

        this.setupEventListeners();
        this.loadChatHistory();
        this.loadUserInfo();
        this.setupParameterListeners();

        // Auto-save draft
        setInterval(() => this.saveDraft(), 30000);

        // Refresh tokens every 30s
        setInterval(() => this.loadUserInfo(), 30000);
    },

    // Setup event listeners
    setupEventListeners: function() {
        // Chat form
        document.getElementById('chat-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        // Character counter
        const input = document.getElementById('chat-input');
        input.addEventListener('input', () => {
            document.getElementById('char-counter').textContent = input.value.length;
        });

        // Keyboard shortcuts
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // File input
        document.getElementById('file-input').addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });
    },

    // Setup parameter listeners
    setupParameterListeners: function() {
        document.getElementById('temperature').addEventListener('input', (e) => {
            document.getElementById('temp-value').textContent = e.target.value;
        });

        document.getElementById('max-length').addEventListener('input', (e) => {
            document.getElementById('length-value').textContent = e.target.value;
        });
    },

    // Send message
    sendMessage: async function() {
        const input = document.getElementById('chat-input');
        const userMessage = input.value.trim();

        if (!userMessage) return;

        const token = getToken();
        if (!token) {
            this.showNotification('❌ Not authenticated', 'error');
            window.location.href = '/login.html';
            return;
        }

        // Create chat if needed
        if (!this.currentChatId) {
            const created = await this.createNewChat(userMessage.substring(0, 50));
            if (!created) {
                this.showNotification('❌ Failed to create chat', 'error');
                return;
            }
        }

        // Add user message to UI
        this.addMessage('user', userMessage);
        input.value = '';
        document.getElementById('char-counter').textContent = '0';

        // Hide welcome message
        const welcome = document.getElementById('welcome-message');
        if (welcome) welcome.style.display = 'none';

        // Add loading indicator
        const loadingId = 'loading-' + Date.now();
        this.addMessage('assistant', '<div style="display: flex; gap: 0.5rem; align-items: center;"><div style="font-size: 1.5rem; animation: pulse 1s infinite;">⚙️</div><span>Thinking...</span></div>', loadingId, true);

        try {
            const response = await fetch(`${API_URL}/chats/${this.currentChatId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: userMessage
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    removeToken();
                    window.location.href = '/login.html';
                    return;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Remove loading
            document.getElementById(loadingId)?.remove();

            // Handle streaming
            const streamEnabled = document.getElementById('stream-response').checked;

            if (streamEnabled) {
                await this.handleStreamResponse(response);
            } else {
                const data = await response.json();
                this.addMessage('assistant', data.content);
            }

            // Update message count
            this.updateMessageCount();

            // Reload tokens
            this.loadUserInfo();

            // Save to history
            this.messages.push({ role: 'user', content: userMessage });

        } catch (error) {
            console.error('Send message error:', error);
            document.getElementById(loadingId)?.remove();
            this.addMessage('assistant', `<div style="color: var(--neon-pink);">❌ Error: Failed to get response. Please try again.</div>`, null, true);
        }
    },

    // Handle streaming response
    handleStreamResponse: async function(response) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';
        const assistantId = 'msg-' + Date.now();

        this.addMessage('assistant', '', assistantId, true);

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;

                    try {
                        const json = JSON.parse(data);
                        if (json.delta) {
                            assistantMessage += json.delta;
                            this.updateMessageContent(assistantId, assistantMessage);
                        }
                    } catch (e) {
                        // Skip invalid JSON
                    }
                }
            }
        }

        // Format with syntax highlighting
        this.updateMessageContent(assistantId, SyntaxHighlighter.formatMarkdown(assistantMessage));
        this.messages.push({ role: 'assistant', content: assistantMessage });
    },

    // Add message to UI
    addMessage: function(role, content, id = null, isHtml = false) {
        const messagesDiv = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `enhanced-message ${role}`;
        if (id) messageDiv.id = id;

        const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const roleName = role === 'user' ? 'YOU' : 'KINTSUGI AI';
        const roleColor = role === 'user' ? 'var(--kintsugi-gold)' : 'var(--cyber-cyan)';

        messageDiv.innerHTML = `
            <div class="message-header">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="font-weight: bold; color: ${roleColor}; text-transform: uppercase;">${roleName}</div>
                    <div style="color: #666; font-size: 0.8rem;">${timestamp}</div>
                </div>
                ${role === 'assistant' ? `
                    <div class="message-actions">
                        <button class="message-btn interactive" onclick="ChatEnhanced.copyMessage('${id || Date.now()}')">📋 COPY</button>
                        <button class="message-btn interactive" onclick="ChatEnhanced.regenerateMessage()">🔄 RETRY</button>
                    </div>
                ` : ''}
            </div>
            <div class="message-content" style="line-height: 1.7; color: #e0e0e0;">
                ${isHtml ? content : this.escapeHtml(content)}
            </div>
        `;

        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    },

    // Update message content
    updateMessageContent: function(id, content) {
        const messageDiv = document.getElementById(id);
        if (messageDiv) {
            const contentDiv = messageDiv.querySelector('.message-content');
            if (contentDiv) {
                contentDiv.innerHTML = content;
            }
        }
        // Auto-scroll
        const messagesDiv = document.getElementById('chat-messages');
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    },

    // Escape HTML
    escapeHtml: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Copy message
    copyMessage: function(id) {
        const messageDiv = document.getElementById(id);
        if (messageDiv) {
            const content = messageDiv.querySelector('.message-content').textContent;
            navigator.clipboard.writeText(content).then(() => {
                this.showNotification('✓ Copied to clipboard!', 'success');
            });
        }
    },

    // Regenerate message
    regenerateMessage: function() {
        if (this.messages.length >= 2) {
            const lastUserMessage = this.messages[this.messages.length - 2].content;
            document.getElementById('chat-input').value = lastUserMessage;
        }
    },

    // Create new chat
    createNewChat: async function(title = 'New Chat') {
        try {
            const token = getToken();
            if (!token) {
                console.error('[CHAT] No token for creating chat');
                window.location.href = '/login.html';
                return false;
            }

            const response = await fetch(`${API_URL}/chats`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: title,
                    model: this.currentModel
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.error('[CHAT] Unauthorized creating chat');
                    removeToken();
                    window.location.href = '/login.html';
                    return false;
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            this.currentChatId = data.id;
            document.getElementById('current-chat-title').textContent = title.toUpperCase();
            this.loadChatHistory();
            return true;
        } catch (error) {
            console.error('[CHAT] Create chat error:', error);
            this.showNotification('❌ Failed to create chat', 'error');
        }
        return false;
    },

    // Load chat history
    loadChatHistory: async function() {
        try {
            const token = getToken();
            if (!token) {
                console.error('[CHAT] No token for chat history');
                return;
            }

            const response = await fetch(`${API_URL}/chats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.error('[CHAT] Unauthorized loading chat history');
                    removeToken();
                    window.location.href = '/login.html';
                    return;
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            this.chatHistory = data.chats || [];
            this.renderChatHistory();
        } catch (error) {
            console.error('[CHAT] Load history error:', error);
        }
    },

    // Render chat history
    renderChatHistory: function() {
        const list = document.getElementById('chat-history-list');
        list.innerHTML = '';

        if (this.chatHistory.length === 0) {
            list.innerHTML = '<div style="padding: 1rem; text-align: center; color: #666;">No chats yet</div>';
            return;
        }

        this.chatHistory.forEach(chat => {
            const div = document.createElement('div');
            div.className = 'chat-item';
            if (chat.id === this.currentChatId) div.classList.add('active');

            const date = new Date(chat.created_at).toLocaleDateString();

            div.innerHTML = `
                <div style="font-weight: bold; color: var(--cyber-cyan); margin-bottom: 0.25rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${chat.title || 'Untitled'}
                </div>
                <div style="font-size: 0.8rem; color: #666;">
                    ${date}
                </div>
            `;

            div.onclick = () => this.loadChat(chat.id);
            list.appendChild(div);
        });
    },

    // Load specific chat
    loadChat: async function(chatId) {
        try {
            const token = getToken();
            if (!token) {
                console.error('[CHAT] No token for loading chat');
                return;
            }

            const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.error('[CHAT] Unauthorized loading chat');
                    removeToken();
                    window.location.href = '/login.html';
                    return;
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            this.currentChatId = chatId;
            this.messages = data.messages || [];

            // Clear and reload messages
            document.getElementById('chat-messages').innerHTML = '';
            document.getElementById('welcome-message')?.remove();

            this.messages.forEach(msg => {
                const formattedContent = msg.role === 'assistant'
                    ? SyntaxHighlighter.formatMarkdown(msg.content)
                    : msg.content;
                this.addMessage(msg.role, formattedContent, null, msg.role === 'assistant');
            });

            this.updateMessageCount();
            this.renderChatHistory();
        } catch (error) {
            console.error('[CHAT] Load chat error:', error);
        }
    },

    // Update message count
    updateMessageCount: function() {
        document.getElementById('message-count').textContent = this.messages.length + ' messages';
    },

    // Load user info
    loadUserInfo: async function() {
        try {
            const token = getToken();
            if (!token) {
                console.error('[CHAT] No token available');
                window.location.href = '/login.html';
                return;
            }

            const response = await fetch(`${API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.error('[CHAT] Unauthorized - redirecting to login');
                    removeToken();
                    window.location.href = '/login.html';
                    return;
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const tokensUsed = data.user.tokens_used || 0;
            const tokensLimit = data.user.tokens_limit || 50000;

            document.getElementById('tokens-used').textContent = tokensUsed.toLocaleString();
            document.getElementById('tokens-limit').textContent = tokensLimit.toLocaleString();

            const percentage = (tokensUsed / tokensLimit) * 100;
            const progressBar = document.getElementById('token-progress');
            progressBar.style.width = percentage + '%';

            if (percentage > 80) {
                progressBar.style.background = 'linear-gradient(90deg, var(--neon-pink), var(--neon-orange))';
            } else if (percentage > 50) {
                progressBar.style.background = 'linear-gradient(90deg, var(--kintsugi-gold), var(--neon-orange))';
            } else {
                progressBar.style.background = 'linear-gradient(90deg, var(--cyber-cyan), var(--kintsugi-gold))';
            }
        } catch (error) {
            console.error('[CHAT] Load user info error:', error);
        }
    },

    // Select model
    selectModel: function(btn) {
        this.currentModel = btn.dataset.model;
        this.currentMultiplier = parseFloat(btn.dataset.multiplier);

        document.querySelectorAll('.model-btn').forEach(b => {
            b.className = 'model-btn btn btn-secondary';
        });
        btn.className = 'model-btn btn btn-primary';

        const modelName = this.currentMultiplier === 1 ? 'BASIC' : 'EPIC';
        document.getElementById('current-model-display').textContent = `Model: ${modelName}`;
    },

    // Use template
    useTemplate: function(type) {
        const templates = {
            code: "I need help with programming. Can you assist me with coding, debugging, and explaining code?",
            write: "I need help with writing. Can you help me create, edit, and improve written content?",
            explain: "I want to learn something new. Can you explain complex topics in a simple and clear way?",
            creative: "I need creative ideas. Can you help me brainstorm and generate creative content?"
        };

        const input = document.getElementById('chat-input');
        input.value = templates[type] || '';
        input.focus();
        document.getElementById('char-counter').textContent = input.value.length;
    },

    // Attach file
    attachFile: function() {
        document.getElementById('file-input').click();
    },

    // Handle file select
    handleFileSelect: function(e) {
        const file = e.target.files[0];
        if (!file) return;

        this.currentAttachment = file;
        const preview = document.getElementById('attachments-preview');
        const name = document.getElementById('attachment-name');

        name.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
        preview.style.display = 'block';
    },

    // Clear attachment
    clearAttachment: function() {
        this.currentAttachment = null;
        document.getElementById('attachments-preview').style.display = 'none';
        document.getElementById('file-input').value = '';
    },

    // Toggle system prompt
    toggleSystemPrompt: function() {
        const section = document.getElementById('system-prompt-section');
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    },

    // Export chat
    exportChat: function() {
        if (this.messages.length === 0) {
            this.showNotification('No messages to export', 'error');
            return;
        }

        const chatText = this.messages.map(msg => {
            return `${msg.role.toUpperCase()}: ${msg.content}\n\n`;
        }).join('');

        const blob = new Blob([chatText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kintsugi-chat-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('✓ Chat exported!', 'success');
    },

    // Clear chat
    clearChat: function() {
        if (!confirm('Clear current chat? This cannot be undone.')) return;

        document.getElementById('chat-messages').innerHTML = '';
        this.messages = [];
        this.currentChatId = null;
        document.getElementById('current-chat-title').textContent = 'NEW CHAT';
        this.updateMessageCount();

        // Show welcome message
        const welcome = document.getElementById('welcome-message');
        if (welcome) welcome.style.display = 'block';
    },

    // Start new chat
    startNewChat: function() {
        this.clearChat();
        this.loadChatHistory();
    },

    // Save draft
    saveDraft: function() {
        const input = document.getElementById('chat-input');
        if (input.value.trim()) {
            localStorage.setItem('chat-draft', input.value);
        }
    },

    // Load draft
    loadDraft: function() {
        const draft = localStorage.getItem('chat-draft');
        if (draft) {
            document.getElementById('chat-input').value = draft;
            document.getElementById('char-counter').textContent = draft.length;
        }
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

// Global functions
window.selectModel = (btn) => ChatEnhanced.selectModel(btn);
window.useTemplate = (type) => ChatEnhanced.useTemplate(type);
window.attachFile = () => ChatEnhanced.attachFile();
window.clearAttachment = () => ChatEnhanced.clearAttachment();
window.toggleSystemPrompt = () => ChatEnhanced.toggleSystemPrompt();
window.exportChat = () => ChatEnhanced.exportChat();
window.clearChat = () => ChatEnhanced.clearChat();
window.startNewChat = () => ChatEnhanced.startNewChat();
window.toggleSettings = () => {
    alert('Settings panel is always visible on desktop. Use the sidebar on the right!');
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ChatEnhanced.init());
} else {
    ChatEnhanced.init();
}
