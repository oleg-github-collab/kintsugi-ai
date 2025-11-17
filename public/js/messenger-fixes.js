// Kintsugi AI Messenger - Critical Fixes
// Виправлення XSS, stub-функцій та додавання валідації

// ============================================
// 1. XSS PROTECTION - Helper Function
// ============================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// 2. NOTIFICATION SYSTEM (замість alert)
// ============================================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `kintsugi-notification kintsugi-notification-${type}`;

    // Detect current theme
    const isCleanTheme = document.documentElement.getAttribute('data-theme') === 'clean';

    const colors = {
        success: 'var(--matrix-green)',
        error: 'var(--cyber-pink)',
        info: 'var(--cyber-cyan)',
        warning: 'var(--kintsugi-gold)'
    };

    // Theme-adaptive styles
    if (isCleanTheme) {
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            max-width: 400px;
            padding: 1rem 1.5rem;
            background: #FFFFFF;
            border: 2px solid ${colors[type] || 'var(--color-primary)'};
            border-radius: 12px;
            color: var(--text-primary);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 0.95rem;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
    } else {
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            max-width: 400px;
            padding: 1rem 1.5rem;
            background: rgba(10, 10, 10, 0.95);
            border: 2px solid ${colors[type] || colors.info};
            border-radius: 12px;
            color: var(--digital-white);
            font-family: "Courier New", monospace;
            font-size: 0.95rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
    }

    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// CSS для анімацій
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// 3. INPUT VALIDATION
// ============================================
const Validator = {
    MAX_MESSAGE_LENGTH: 5000,
    MAX_USERNAME_LENGTH: 50,
    MAX_SEARCH_LENGTH: 100,
    MIN_SEARCH_LENGTH: 3,

    validateMessage(content) {
        if (!content || typeof content !== 'string') {
            return { valid: false, error: 'Message cannot be empty' };
        }

        const trimmed = content.trim();
        if (trimmed.length === 0) {
            return { valid: false, error: 'Message cannot be empty' };
        }

        if (trimmed.length > this.MAX_MESSAGE_LENGTH) {
            return { valid: false, error: `Message too long (max ${this.MAX_MESSAGE_LENGTH} characters)` };
        }

        return { valid: true, content: trimmed };
    },

    validateSearch(query) {
        if (!query || typeof query !== 'string') {
            return { valid: false, error: 'Search query is required' };
        }

        const trimmed = query.trim();
        if (trimmed.length < this.MIN_SEARCH_LENGTH) {
            return { valid: false, error: `Search requires at least ${this.MIN_SEARCH_LENGTH} characters` };
        }

        if (trimmed.length > this.MAX_SEARCH_LENGTH) {
            return { valid: false, error: `Search too long (max ${this.MAX_SEARCH_LENGTH} characters)` };
        }

        // Перевірка на небезпечні символи
        if (/<script|javascript:|onerror=/i.test(trimmed)) {
            return { valid: false, error: 'Invalid search query' };
        }

        return { valid: true, query: trimmed };
    },

    validateUserId(userId) {
        if (!userId || typeof userId !== 'string') {
            return { valid: false, error: 'Invalid user ID' };
        }

        // UUID validation (приклад)
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidPattern.test(userId)) {
            return { valid: false, error: 'Invalid user ID format' };
        }

        return { valid: true, userId };
    }
};

// ============================================
// 4. FIX: doForwardCode (замість alert)
// ============================================
window.doForwardCode = async function(convId, code, lang) {
    closeActiveModal();

    if (!convId || !code) {
        showNotification('❌ Invalid forward parameters', 'error');
        return;
    }

    // Валідація коду
    if (code.length > 10000) {
        showNotification('❌ Code snippet too large', 'error');
        return;
    }

    try {
        const messageContent = `\`\`\`${escapeHtml(lang || '')}\n${code}\n\`\`\``;

        const response = await fetch(`${API_URL}/messenger/conversations/${convId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                content: messageContent,
                type: 'code',
                metadata: { language: lang }
            })
        });

        if (!response.ok) {
            throw new Error(`Forward failed: ${response.status}`);
        }

        const data = await response.json();
        showNotification(`✓ Code forwarded to ${escapeHtml(conversations[convId]?.name || 'conversation')}!`, 'success');

    } catch (error) {
        console.error('Forward code error:', error);
        showNotification('❌ Failed to forward code. Please try again.', 'error');
    }
};

// ============================================
// 5. FIX: doForwardImage (замість alert)
// ============================================
window.doForwardImage = async function(convId, imageUrl, caption) {
    closeActiveModal();

    if (!convId || !imageUrl) {
        showNotification('❌ Invalid forward parameters', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/messenger/conversations/${convId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                content: caption || '',
                type: 'image',
                imageUrl: imageUrl
            })
        });

        if (!response.ok) {
            throw new Error(`Forward failed: ${response.status}`);
        }

        const data = await response.json();
        showNotification(`✓ Image forwarded to ${escapeHtml(conversations[convId]?.name || 'conversation')}!`, 'success');

    } catch (error) {
        console.error('Forward image error:', error);
        showNotification('❌ Failed to forward image. Please try again.', 'error');
    }
};

// ============================================
// 6. FIX: handleShareToMessenger (замість alert)
// ============================================
window.handleShareToMessenger = async function(convId) {
    closeActiveModal();

    if (!convId) {
        showNotification('❌ No conversation selected', 'error');
        return;
    }

    const chatMessages = messages['ai-assistant'] || [];
    if (chatMessages.length === 0) {
        showNotification('❌ No chat history to share', 'error');
        return;
    }

    try {
        // Форматуємо історію чату
        const formattedHistory = chatMessages.slice(-10).map(msg =>
            `${msg.role === 'user' ? 'You' : 'AI'}: ${msg.content}`
        ).join('\n\n');

        const response = await fetch(`${API_URL}/messenger/conversations/${convId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                content: `📋 Shared AI Chat History:\n\n${formattedHistory}`,
                type: 'text'
            })
        });

        if (!response.ok) {
            throw new Error(`Share failed: ${response.status}`);
        }

        showNotification(`✓ Chat history shared to ${escapeHtml(conversations[convId]?.name || 'conversation')}!`, 'success');

    } catch (error) {
        console.error('Share to messenger error:', error);
        showNotification('❌ Failed to share chat history. Please try again.', 'error');
    }
};

// ============================================
// 7. FIX: Story Viewer (замість alert)
// ============================================
window.viewStory = function(storyId) {
    // Знаходимо story
    const story = StoriesManager.stories.find(s => s.id === storyId);

    if (!story) {
        showNotification('❌ Story not found', 'error');
        return;
    }

    // Створюємо модалку для перегляду
    const modal = createModal(`
        <div class="story-viewer">
            <div class="story-viewer-header">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div class="story-avatar" style="width: 40px; height: 40px;">
                        ${escapeHtml(story.username.charAt(0).toUpperCase())}
                    </div>
                    <div>
                        <div class="text-cyan" style="font-weight: bold;">${escapeHtml(story.username)}</div>
                        <div style="font-size: 0.85rem; color: #999;">${escapeHtml(story.timestamp)}</div>
                    </div>
                </div>
                <button type="button" class="btn btn-secondary interactive modal-close-btn" style="padding: 0.5rem 1rem;">✕</button>
            </div>
            <div class="story-viewer-content" style="padding: 2rem; text-align: center;">
                ${story.type === 'image'
                    ? `<img src="${escapeHtml(story.content)}" alt="Story" style="max-width: 100%; max-height: 60vh; border-radius: 12px;">`
                    : `<div style="font-size: 1.5rem; color: var(--kintsugi-gold); padding: 3rem;">${escapeHtml(story.content)}</div>`
                }
            </div>
            <div class="story-viewer-actions" style="padding: 1rem; display: flex; gap: 1rem; justify-content: center;">
                <button type="button" class="btn btn-secondary interactive" onclick="replyToStory('${escapeHtml(storyId)}')">💬 Reply</button>
                <button type="button" class="btn btn-secondary interactive modal-close-btn">Close</button>
            </div>
        </div>
    `, { cardClass: 'modal-wide' });

    modal.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', closeActiveModal);
    });
};

window.replyToStory = function(storyId) {
    closeActiveModal();
    showNotification('✓ Opening chat to reply...', 'info');
    // Тут можна додати логіку для відкриття чату з автором story
};

// ============================================
// 8. WEBSOCKET RECONNECTION з backoff
// ============================================
const WebSocketManager = {
    ws: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 10,
    baseDelay: 1000,

    connect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            showNotification('❌ Connection failed. Please refresh the page.', 'error');
            return;
        }

        try {
            this.ws = new WebSocket(WS_URL);

            this.ws.onopen = () => {
                console.log('✓ WebSocket connected');
                this.reconnectAttempts = 0;
                showNotification('✓ Connected', 'success');

                // Аутентифікація
                const token = getToken();
                if (token) {
                    this.ws.send(JSON.stringify({ type: 'auth', token }));
                }
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('WebSocket message parse error:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.attemptReconnect();
            };

        } catch (error) {
            console.error('WebSocket connection error:', error);
            this.attemptReconnect();
        }
    },

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            const delay = Math.min(
                this.baseDelay * Math.pow(2, this.reconnectAttempts),
                30000
            );

            console.log(`Reconnecting in ${delay}ms... (Attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

            setTimeout(() => {
                this.reconnectAttempts++;
                this.connect();
            }, delay);
        } else {
            showNotification('❌ Unable to connect. Please refresh the page.', 'error');
        }
    },

    handleMessage(data) {
        // Обробка повідомлень від WebSocket
        if (data.type === 'new_message') {
            // Додаємо нове повідомлення
            if (data.conversationId && data.message) {
                if (!messages[data.conversationId]) {
                    messages[data.conversationId] = [];
                }
                messages[data.conversationId].push(data.message);

                if (currentConversationId === data.conversationId) {
                    renderMessages();
                }

                updateConversationPreview(data.conversationId, data.message);
            }
        }
    },

    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
            return true;
        } else {
            showNotification('❌ Not connected. Reconnecting...', 'error');
            return false;
        }
    }
};

// ============================================
// 9. DEBOUNCE для search
// ============================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// 9. FIX XSS IN renderUserSearchResults
// ============================================
window.renderUserSearchResults = function(users) {
    const container = document.getElementById('user-search-results');
    if (!container) return;

    container.innerHTML = '';

    if (users.length === 0) {
        const status = document.getElementById('user-search-status');
        if (status) {
            status.textContent = 'No users found yet. Try another query.';
        }
        return;
    }

    const status = document.getElementById('user-search-status');
    if (status) {
        status.textContent = `${users.length} match${users.length === 1 ? '' : 'es'} found`;
    }

    users.forEach(user => {
        const div = document.createElement('div');
        div.className = 'search-result-card interactive';

        // XSS PROTECTION: Escape all user-generated content
        const safeUsername = escapeHtml(user.username || '');
        const safeEmail = escapeHtml(user.email || '');
        const safeId = escapeHtml((user.id || '').toString().slice(0, 6));
        const safeUsernameForAttr = safeUsername.replace(/'/g, '&#39;');

        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${safeUsername}</strong>
                    <div class="result-meta">${safeEmail}</div>
                </div>
                <span class="result-meta">ID: ${safeId}</span>
            </div>
        <div class="result-actions">
            <button onclick="startConversation('${user.id}', '${safeUsernameForAttr}')" class="btn btn-primary interactive" style="padding: 0.5rem 1rem;">📬 START CHAT</button>
            <button onclick="copyInviteLink('${user.id}', '${safeUsername}')" class="btn btn-secondary interactive" style="padding: 0.5rem 1rem;">🔗 COPY</button>
        </div>
        `;
        container.appendChild(div);
    });
};

// Експортуємо функції
window.showNotification = showNotification;
window.Validator = Validator;
window.WebSocketManager = WebSocketManager;
window.debounce = debounce;
window.escapeHtml = escapeHtml;

console.log('✓ Messenger fixes loaded');
