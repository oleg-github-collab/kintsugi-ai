// Kintsugi AI Messenger - Full Implementation
// Features: User search, invite links, message search, AI contact, code canvas, image generation

if (!isAuthenticated()) {
    window.location.href = '/login.html';
}

// State
let ws = null;
let currentConversationId = null;
let currentUser = null;
const conversations = {};
const messages = {};
let isAIChat = false;
let currentAIModel = 'gpt-4o'; // AI model for assistant

function closeActiveModal() {
    const overlay = document.querySelector('.kintsugi-modal');
    if (overlay) {
        overlay.remove();
    }
}

function createModal(contentHtml, options = {}) {
    const overlay = document.createElement('div');
    overlay.className = 'kintsugi-modal';
    const classes = ['kintsugi-modal-card', options.cardClass].filter(Boolean).join(' ');
    overlay.innerHTML = `<div class="${classes}">${contentHtml}</div>`;
    const card = overlay.querySelector('.kintsugi-modal-card');
    if (options.maxWidth && card) {
        card.style.maxWidth = options.maxWidth;
    }
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            overlay.remove();
        }
    });
    document.body.appendChild(overlay);
    return overlay;
}

window.closeActiveModal = closeActiveModal;

function updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    if (!badge) return;
    const count = NotificationCenter.unreadCount();
    badge.textContent = count > 0 ? count : '';
}

function renderNotificationItems() {
    return NotificationCenter.notifications.map(n => `
        <div class="notification-card ${n.read ? '' : 'unread'}" data-id="${n.id}">
            <div class="notification-title">${n.title}</div>
            <div class="notification-description">${n.description}</div>
            <div class="notification-time">${n.time}</div>
        </div>
    `).join('');
}

function showNotificationsPanel() {
    const modal = createModal(`
        <div>
            <div class="modal-header" style="justify-content: space-between;">
                <div>
                    <h3 class="modal-title text-cyan">NOTIFICATIONS</h3>
                    <p class="modal-subtitle">${NotificationCenter.unreadCount()} unread</p>
                </div>
                <button type="button" class="btn btn-secondary interactive modal-close-btn">✕</button>
            </div>
            <div class="notification-list">
                ${renderNotificationItems()}
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-primary interactive mark-all-btn">MARK ALL AS READ</button>
                <button type="button" class="btn btn-secondary interactive modal-close-btn">CLOSE</button>
            </div>
        </div>
    `, { cardClass: 'modal-wide' });

    modal.querySelectorAll('.notification-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            NotificationCenter.toggleRead(id);
            modal.querySelector('.notification-list').innerHTML = renderNotificationItems();
            updateNotificationBadge();
        });
    });

    modal.querySelector('.mark-all-btn')?.addEventListener('click', () => {
        NotificationCenter.markAllRead();
        updateNotificationBadge();
        closeActiveModal();
    });

    modal.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', closeActiveModal);
    });
}

function showSettingsPanel() {
    const modal = createModal(`
        <div>
            <div class="modal-header" style="justify-content: space-between;">
                <div>
                    <h3 class="modal-title text-gold">SETTINGS</h3>
                    <p class="modal-subtitle">Customize your messenger preferences on the go.</p>
                </div>
                <button type="button" class="btn btn-secondary interactive modal-close-btn">✕</button>
            </div>
            <div class="modal-contact-list" id="settings-toggles">
                <div class="settings-toggle">
                    <span>Compact thread layout</span>
                    <span class="toggle-pill ${SettingsCenter.get('compactView') ? 'on' : ''}" data-key="compactView">${SettingsCenter.get('compactView') ? 'ON' : 'OFF'}</span>
                </div>
                <div class="settings-toggle">
                    <span>Push notifications</span>
                    <span class="toggle-pill ${SettingsCenter.get('pushAlerts') ? 'on' : ''}" data-key="pushAlerts">${SettingsCenter.get('pushAlerts') ? 'ON' : 'OFF'}</span>
                </div>
                <div class="settings-toggle">
                    <span>Force dark chrome</span>
                    <span class="toggle-pill ${SettingsCenter.get('darkMode') ? 'on' : ''}" data-key="darkMode">${SettingsCenter.get('darkMode') ? 'ON' : 'OFF'}</span>
                </div>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary interactive modal-close-btn">CLOSE</button>
            </div>
        </div>
    `, { cardClass: 'modal-compact' });

    modal.querySelectorAll('.toggle-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            const key = pill.dataset.key;
            SettingsCenter.toggle(key);
            pill.classList.toggle('on', SettingsCenter.get(key));
            pill.textContent = SettingsCenter.get(key) ? 'ON' : 'OFF';
        });
    });

    modal.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', closeActiveModal);
    });
}

const NotificationCenter = {
    storageKey: 'kintsugi_notifications',
    notifications: [
        { id: 'welcome', title: 'Welcome aboard', description: 'Your Kintsugi AI account is ready.', time: 'Just now', read: false },
        { id: 'token_reset', title: 'Tokens refreshed', description: 'Your hourly token bucket was reset.', time: '1 hour ago', read: false },
        { id: 'story_live', title: 'Story shared', description: 'One of your circles posted a new story.', time: 'Today', read: true }
    ],
    load() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.notifications = JSON.parse(stored);
            }
        } catch (err) {
            console.warn('Failed to load notifications:', err);
        }
    },
    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.notifications));
    },
    unreadCount() {
        return this.notifications.filter(n => !n.read).length;
    },
    toggleRead(id) {
        const note = this.notifications.find(n => n.id === id);
        if (note) {
            note.read = !note.read;
            this.save();
        }
    },
    markAllRead() {
        this.notifications.forEach(n => {
            n.read = true;
        });
        this.save();
    }
};

const SettingsCenter = {
    storageKey: 'kintsugi_settings',
    defaults: {
        compactView: false,
        pushAlerts: true,
        darkMode: true
    },
    state: {},
    load() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            this.state = stored ? JSON.parse(stored) : { ...this.defaults };
        } catch (err) {
            console.warn('Failed to load settings:', err);
            this.state = { ...this.defaults };
        }
    },
    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    },
    toggle(key) {
        if (typeof this.state[key] === 'boolean') {
            this.state[key] = !this.state[key];
            this.save();
        }
    },
    get(key) {
        return this.state[key];
    }
};

NotificationCenter.load();
SettingsCenter.load();
updateNotificationBadge();

// Initialize WebSocket
function connectWebSocket() {
    const wsUrl = window.location.hostname === 'localhost'
        ? `ws://localhost:8080/api/messenger/ws?token=${getToken()}`
        : `wss://${window.location.host}/api/messenger/ws?token=${getToken()}`;

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('WebSocket connected');
        loadConversations();
        loadStories();
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
    };

    ws.onclose = () => {
        console.log('WebSocket disconnected. Reconnecting...');
        setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

function handleWebSocketMessage(data) {
    switch (data.type) {
        case 'new_message':
            handleNewMessage(data.payload);
            break;
        case 'message_reaction':
            handleMessageReaction(data.payload);
            break;
        case 'typing':
            handleTyping(data.payload);
            break;
        case 'read_receipt':
            handleReadReceipt(data.payload);
            break;
    }
}

// Add Kintsugi AI as default contact
function addAIContact() {
    const aiContact = {
        id: 'ai-assistant',
        name: 'Kintsugi AI',
        isAI: true,
        last_message: 'Ask me anything!',
        updated_at: new Date().toISOString(),
        participants_count: 2
    };
    conversations['ai-assistant'] = aiContact;

    // Initialize AI messages if not exists
    if (!messages['ai-assistant']) {
        messages['ai-assistant'] = [];
    }

    // Insert AI contact at the top
    const list = document.getElementById('conversations-list');
    const div = document.createElement('div');
    div.className = 'conversation-item interactive';
    div.style.borderLeft = '4px solid var(--kintsugi-gold)';
    div.dataset.conversationId = 'ai-assistant';
    div.addEventListener('click', (e) => {
        selectConversation('ai-assistant', e.currentTarget);
    });
    div.innerHTML = `
        <div style="display: flex; align-items: center;">
            <div class="conversation-avatar" style="background: linear-gradient(135deg, var(--kintsugi-gold), var(--neon-orange));">🤖</div>
            <div class="conversation-info">
                <div class="conversation-name text-gold">Kintsugi AI</div>
                <div class="conversation-preview">AI Assistant • Always online</div>
            </div>
            <div class="conversation-time">●</div>
        </div>
    `;
    list.prepend(div);
}

// Load conversations
async function loadConversations() {
    try {
        const response = await fetch(`${API_URL}/messenger/conversations`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            renderConversations(data.conversations || []);
        }
    } catch (error) {
        console.error('Failed to load conversations:', error);
    }
}

function renderConversations(convs) {
    const list = document.getElementById('conversations-list');
    // Keep AI contact, clear others
    const aiContact = list.firstChild;
    list.innerHTML = '';
    if (aiContact) list.appendChild(aiContact);

    convs.forEach(conv => {
        conversations[conv.id] = conv;
        const div = document.createElement('div');
        div.className = 'conversation-item interactive';
        div.dataset.conversationId = conv.id;
        div.addEventListener('click', (e) => {
            selectConversation(conv.id, e.currentTarget);
        });
        div.innerHTML = `
            <div style="display: flex; align-items: center;">
                <div class="conversation-avatar">${getInitials(conv.name)}</div>
                <div class="conversation-info">
                    <div class="conversation-name">${conv.name}</div>
                    <div class="conversation-preview">${conv.last_message || 'No messages yet'}</div>
                </div>
                <div class="conversation-time">${formatTime(conv.updated_at)}</div>
            </div>
        `;
        list.appendChild(div);
    });
}

// Select conversation
async function selectConversation(convId, triggerEl = null) {
    currentConversationId = convId;
    const conv = conversations[convId];

    // Check if conversation exists
    if (!conv && convId !== 'ai-assistant') {
        console.error('Conversation not found:', convId);
        return;
    }

    isAIChat = (convId === 'ai-assistant') || (conv && conv.isAI);

    // Update active state
    document.querySelectorAll('.conversation-item').forEach(el => {
        el.classList.remove('active');
    });
    const activeElement = triggerEl || document.querySelector(`.conversation-item[data-conversation-id="${convId}"]`);
    activeElement?.classList.add('active');

    // Update header
    if (isAIChat) {
        document.getElementById('chat-header').innerHTML = `
            <div class="conversation-avatar" style="background: linear-gradient(135deg, var(--kintsugi-gold), var(--neon-orange));">🤖</div>
            <div style="flex: 1;">
                <div class="conversation-name text-gold" style="font-size: 1.25rem;">Kintsugi AI</div>
                <div class="conversation-time">
                    AI Assistant • Always online
                </div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button onclick="showAITools()" class="btn btn-secondary interactive" style="padding: 0.5rem 1rem; font-size: 0.85rem;">🛠️ TOOLS</button>
            </div>
        `;
        // Hide call buttons for AI chat
        const callButtons = document.getElementById('call-buttons');
        if (callButtons) {
            callButtons.style.display = 'none';
        }
    } else if (conv) {
        document.getElementById('chat-header').innerHTML = `
            <div class="conversation-avatar">${getInitials(conv.name)}</div>
            <div style="flex: 1;">
                <div class="conversation-name text-gold" style="font-size: 1.25rem;">${conv.name}</div>
                <div class="conversation-time">${conv.participants_count || 2} participants</div>
            </div>
        `;
        // Show call buttons for non-AI chats
        const callButtons = document.getElementById('call-buttons');
        if (callButtons) {
            callButtons.style.display = 'flex';
        }
    }

    // Enable input
    document.getElementById('message-input').disabled = false;
    document.querySelector('#message-form button').disabled = false;

    // Trigger mobile event
    window.dispatchEvent(new Event('conversationSelected'));

    // Load messages
    if (isAIChat) {
        loadAIMessages();
    } else {
        await loadMessages(convId);
    }
}

// AI model switching removed - single AI model

window.showAITools = function() {
    const tools = `
╔══════════════════════════════════╗
║     KINTSUGI AI TOOLS MENU      ║
╚══════════════════════════════════╝

📝 CODE CANVAS
   Type: /code [description]
   Example: /code create a python web scraper

🎨 IMAGE GENERATION (DALL-E)
   Type: /image [description]
   Example: /image cyberpunk city at night

📤 SHARE TO MESSENGER
   Type: /share [contact]
   Shares current AI chat with contact

💾 SAVE CODE
   Type: /save
   Downloads code from canvas

🔄 CLEAR CHAT
   Type: /clear
   Clears current AI conversation
    `;

    addAIMessage(tools);
};

function loadAIMessages() {
    const aiMessages = JSON.parse(localStorage.getItem('ai_chat_messages') || '[]');
    messages['ai-assistant'] = aiMessages;
    renderMessages();

    if (aiMessages.length === 0) {
        addAIMessage(`👋 Hello! I'm your Kintsugi AI Assistant.

I'm running on ${currentAIModel === 'gpt-4' ? 'GPT-4 (Epic)' : 'GPT-3.5 (Basic)'}.

What can I help you with today?

Type /tools to see available commands.`);
    }
}

function saveAIMessages() {
    localStorage.setItem('ai_chat_messages', JSON.stringify(messages['ai-assistant'] || []));
}

function addAIMessage(content) {
    if (!messages['ai-assistant']) {
        messages['ai-assistant'] = [];
    }

    messages['ai-assistant'].push({
        id: Date.now(),
        sender_id: 'ai',
        sender_name: 'Kintsugi AI',
        content: content,
        created_at: new Date().toISOString(),
        reactions: []
    });

    saveAIMessages();
    renderMessages();
}

async function loadMessages(convId) {
    try {
        const response = await fetch(`${API_URL}/messenger/conversations/${convId}/messages`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            messages[convId] = data.messages || [];
            renderMessages();
        }
    } catch (error) {
        console.error('Failed to load messages:', error);
    }
}

function renderMessages() {
    const container = document.getElementById('chat-messages');
    container.innerHTML = '';

    const msgs = messages[currentConversationId] || [];

    msgs.forEach(msg => {
        const isOwn = msg.sender_id === currentUser?.id || msg.sender_id === 'user';
        const div = document.createElement('div');
        div.className = `message-group ${isOwn ? 'own' : ''}`;

        // Check if message contains code or image
        let messageContent;

        // Use SyntaxHighlighter for AI messages
        if (msg.sender_id === 'ai' && typeof SyntaxHighlighter !== 'undefined') {
            messageContent = SyntaxHighlighter.formatMarkdown(msg.content);
        } else {
            messageContent = escapeHtml(msg.content);
            // Detect code blocks
            if (msg.content.includes('```')) {
                messageContent = formatCodeBlocks(msg.content);
            }
        }

        // Detect image URLs
        if (msg.image_url) {
            messageContent = `
                <div class="image-container" style="position: relative; margin-top: 0.5rem;">
                    <img src="${msg.image_url}" style="max-width: 100%; border: 2px solid var(--cyber-cyan); display: block;" alt="Generated image">
                    <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                        <button onclick="downloadImage('${msg.image_url}', 'kintsugi-image-${msg.id}')" class="btn btn-secondary interactive" style="flex: 1; padding: 0.5rem; font-size: 0.85rem;">⬇ DOWNLOAD</button>
                        <button onclick="forwardImage('${msg.image_url}')" class="btn btn-secondary interactive" style="flex: 1; padding: 0.5rem; font-size: 0.85rem;">↗ FORWARD</button>
                    </div>
                </div>
            ` + messageContent;
        }

        // Add right-click context menu
        div.oncontextmenu = (e) => {
            if (typeof MessageActions !== 'undefined') {
                MessageActions.showContextMenu(msg.id, div, e);
            }
            return false;
        };

        // Add long-press for mobile
        let pressTimer;
        div.ontouchstart = (e) => {
            pressTimer = setTimeout(() => {
                if (typeof MessageActions !== 'undefined') {
                    const touch = e.touches[0];
                    MessageActions.showContextMenu(msg.id, div, {
                        preventDefault: () => {},
                        stopPropagation: () => {},
                        clientX: touch.clientX,
                        clientY: touch.clientY
                    });
                }
            }, 500);
        };
        div.ontouchend = () => clearTimeout(pressTimer);
        div.ontouchmove = () => clearTimeout(pressTimer);

        div.innerHTML = `
            <div class="message-avatar">${getInitials(msg.sender_name || 'U')}</div>
            <div class="message-content-wrapper">
                <div class="message-bubble">
                    ${msg.reply_to ? `<div style="font-size: 0.85rem; color: var(--cyber-cyan); margin-bottom: 0.5rem; border-left: 2px solid var(--cyber-cyan); padding-left: 0.5rem;">↩ Replying to message</div>` : ''}
                    <div class="message-text">${messageContent}</div>
                </div>
                <div class="message-meta">
                    <span>${formatTime(msg.created_at)}</span>
                    ${msg.read_at ? '<span class="text-cyan">✓✓</span>' : '<span>✓</span>'}
                </div>
                <div class="message-reactions">
                    ${renderReactions(msg.reactions || [])}
                    ${!isAIChat ? `<button class="add-reaction interactive" onclick="MessageActions.showReactionPicker(${msg.id})">+</button>` : ''}
                </div>
            </div>
        `;
        container.appendChild(div);
    });

    container.scrollTop = container.scrollHeight;
}

function formatCodeBlocks(text) {
    return text.replace(/```(\w+)?\n([\s\S]+?)```/g, (match, lang, code) => {
        const codeId = 'code-' + Math.random().toString(36).substr(2, 9);
        return `<div class="code-block" style="margin: 0.5rem 0;" data-code-id="${codeId}">
            <div style="background: var(--cyber-cyan); color: var(--digital-black); padding: 0.5rem; font-weight: bold; text-transform: uppercase; font-size: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
                <span>${lang || 'code'}</span>
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="copyCode(this)" class="interactive" style="background: var(--digital-black); color: var(--cyber-cyan); border: 2px solid var(--digital-black); padding: 0.25rem 0.5rem; cursor: pointer;">📋 COPY</button>
                    <button onclick="downloadCode('${codeId}', '${lang || 'code'}')" class="interactive" style="background: var(--digital-black); color: var(--cyber-cyan); border: 2px solid var(--digital-black); padding: 0.25rem 0.5rem; cursor: pointer;">⬇ DOWNLOAD</button>
                    <button onclick="forwardCode('${codeId}')" class="interactive" style="background: var(--digital-black); color: var(--cyber-cyan); border: 2px solid var(--digital-black); padding: 0.25rem 0.5rem; cursor: pointer;">↗ FORWARD</button>
                </div>
            </div>
            <pre style="background: #1a1a1a; padding: 1rem; overflow-x: auto; margin: 0; border: 2px solid var(--cyber-cyan);"><code>${escapeHtml(code.trim())}</code></pre>
        </div>`;
    });
}

window.copyCode = function(btn) {
    const code = btn.closest('.code-block').querySelector('code').textContent;
    navigator.clipboard.writeText(code);
    const originalText = btn.textContent;
    btn.textContent = '✓ COPIED!';
    setTimeout(() => {
        btn.textContent = originalText;
    }, 2000);
};

window.downloadCode = function(codeId, lang) {
    const codeBlock = document.querySelector(`[data-code-id="${codeId}"]`);
    const code = codeBlock.querySelector('code').textContent;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kintsugi-code-${Date.now()}.${getFileExtension(lang)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

window.forwardCode = function(codeId) {
    const codeBlock = document.querySelector(`[data-code-id="${codeId}"]`);
    const code = codeBlock.querySelector('code').textContent;
    const lang = codeBlock.querySelector('span').textContent.toLowerCase();

    const modal = createModal(`
        <div>
            <h3 class="modal-title text-cyan">📤 FORWARD CODE</h3>
            <p class="modal-subtitle">Select a contact to forward this code snippet:</p>
            <div class="modal-contact-list"></div>
        </div>
        <div class="modal-actions">
            <button type="button" class="btn btn-primary interactive modal-close-btn">CANCEL</button>
        </div>
    `, { cardClass: 'modal-compact' });

    const list = modal.querySelector('.modal-contact-list');
    const contacts = Object.values(conversations).filter(c => !c.isAI);

    if (contacts.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'modal-empty';
        empty.textContent = 'No contacts available yet.';
        list.appendChild(empty);
    } else {
        contacts.forEach(contact => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-secondary interactive modal-contact';
            button.textContent = contact.name;
            button.addEventListener('click', () => doForwardCode(contact.id, code, lang));
            list.appendChild(button);
        });
    }

    modal.querySelector('.modal-close-btn').addEventListener('click', closeActiveModal);
};

window.doForwardCode = function(convId, code, lang) {
    closeActiveModal();

    // In production, send the code as a message to the conversation
    alert(`Code forwarded to ${conversations[convId].name}!\n\nIn production, this would send the ${lang} code snippet.`);
};

window.downloadImage = async function(url, filename) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${filename}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('Download failed:', error);
        alert('Failed to download image');
    }
};

window.forwardImage = function(imageUrl) {
    const modal = createModal(`
        <div>
            <h3 class="modal-title text-cyan">📤 FORWARD IMAGE</h3>
            <p class="modal-subtitle">Select a contact to forward this image:</p>
            <div class="modal-contact-list"></div>
        </div>
        <div class="modal-actions">
            <button type="button" class="btn btn-primary interactive modal-close-btn">CANCEL</button>
        </div>
    `, { cardClass: 'modal-compact' });

    const list = modal.querySelector('.modal-contact-list');
    const contacts = Object.values(conversations).filter(c => !c.isAI);

    if (contacts.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'modal-empty';
        empty.textContent = 'No contacts available yet.';
        list.appendChild(empty);
    } else {
        contacts.forEach(contact => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-secondary interactive modal-contact';
            button.textContent = contact.name;
            button.addEventListener('click', () => doForwardImage(contact.id, imageUrl));
            list.appendChild(button);
        });
    }

    modal.querySelector('.modal-close-btn').addEventListener('click', closeActiveModal);
};

window.doForwardImage = function(convId, imageUrl) {
    closeActiveModal();
    alert(`Image forwarded to ${conversations[convId].name}!\n\nIn production, this would send the image.`);
};

function getFileExtension(lang) {
    const extensions = {
        'javascript': 'js',
        'typescript': 'ts',
        'python': 'py',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c',
        'go': 'go',
        'rust': 'rs',
        'html': 'html',
        'css': 'css',
        'json': 'json',
        'yaml': 'yaml',
        'xml': 'xml',
        'sql': 'sql',
        'bash': 'sh',
        'shell': 'sh'
    };
    return extensions[lang.toLowerCase()] || 'txt';
}

function copyInviteLink(userId, username) {
    const text = `Join my Kintsugi AI chat: ${username} just invited you!`;
    navigator.clipboard.writeText(text).then(() => {
        alert('Message copied! Share it with your contact.');
    }).catch(() => {
        alert('Unable to copy to clipboard.');
    });
}

function renderReactions(reactions) {
    const grouped = {};
    reactions.forEach(r => {
        grouped[r.emoji] = (grouped[r.emoji] || 0) + 1;
    });

    return Object.entries(grouped).map(([emoji, count]) =>
        `<span class="reaction-btn interactive">${emoji} ${count}</span>`
    ).join('');
}

// Send message
document.getElementById('message-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const input = document.getElementById('message-input');
    const content = input.value.trim();
    if (!content || !currentConversationId) return;

    if (isAIChat) {
        await handleAIMessage(content);
    } else {
        // Check if replying to a message
        const replyTo = typeof MessageActions !== 'undefined' ? MessageActions.currentReplyTo : null;
        await sendRegularMessage(content, replyTo);

        // Cancel reply after sending
        if (replyTo && typeof MessageActions !== 'undefined') {
            MessageActions.cancelReply();
        }
    }

    input.value = '';
});

async function handleAIMessage(content) {
    // Add user message
    if (!messages['ai-assistant']) {
        messages['ai-assistant'] = [];
    }

    messages['ai-assistant'].push({
        id: Date.now(),
        sender_id: 'user',
        sender_name: currentUser?.username || 'You',
        content: content,
        created_at: new Date().toISOString(),
        reactions: []
    });
    saveAIMessages();
    renderMessages();

    // Handle special commands
    if (content.startsWith('/code ')) {
        await handleCodeGeneration(content.substring(6));
        return;
    }

    if (content.startsWith('/image ')) {
        await handleImageGeneration(content.substring(7));
        return;
    }

    if (content.startsWith('/share ')) {
        handleShareToMessenger(content.substring(7));
        return;
    }

    if (content === '/clear') {
        messages['ai-assistant'] = [];
        saveAIMessages();
        renderMessages();
        addAIMessage('Chat cleared! How can I help you?');
        return;
    }

    if (content === '/tools') {
        showAITools();
        return;
    }

    // Regular AI chat
    try {
        const response = await fetch(`${API_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                model: currentAIModel,
                messages: messages['ai-assistant'].slice(-10).map(m => ({
                    role: m.sender_id === 'user' ? 'user' : 'assistant',
                    content: m.content
                }))
            })
        });

        if (response.ok) {
            const data = await response.json();
            addAIMessage(data.choices[0].message.content);
        } else {
            addAIMessage('❌ Error: Failed to get response from AI.');
        }
    } catch (error) {
        console.error('AI chat error:', error);
        addAIMessage('❌ Error: Network error occurred.');
    }
}

async function handleCodeGeneration(description) {
    addAIMessage(`🔧 Generating code for: "${description}"`);

    try {
        const response = await fetch(`${API_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                model: currentAIModel,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a code generation assistant. Generate clean, well-commented code. Always wrap code in markdown code blocks with language specified.'
                    },
                    {
                        role: 'user',
                        content: `Generate code for: ${description}`
                    }
                ]
            })
        });

        if (response.ok) {
            const data = await response.json();
            addAIMessage(data.choices[0].message.content);
        }
    } catch (error) {
        addAIMessage('❌ Code generation failed.');
    }
}

async function handleImageGeneration(description) {
    addAIMessage(`🎨 Generating image: "${description}"`);

    try {
        const response = await fetch(`${API_URL}/chat/generate-image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                prompt: description,
                size: '1024x1024'
            })
        });

        if (response.ok) {
            const data = await response.json();

            if (!messages['ai-assistant']) {
                messages['ai-assistant'] = [];
            }

            messages['ai-assistant'].push({
                id: Date.now(),
                sender_id: 'ai',
                sender_name: 'Kintsugi AI',
                content: `Generated image for: "${description}"`,
                image_url: data.url,
                created_at: new Date().toISOString(),
                reactions: []
            });

            saveAIMessages();
            renderMessages();
        } else {
            addAIMessage('❌ Image generation failed. Check your subscription tier.');
        }
    } catch (error) {
        addAIMessage('❌ Image generation error.');
    }
}

function handleShareToMessenger(contactName) {
    const chatHistory = messages['ai-assistant'].slice(-5).map(m =>
        `${m.sender_name}: ${m.content}`
    ).join('\n\n');

    addAIMessage(`📤 Shared last 5 messages to: ${contactName}\n\nYou can now send this chat history in regular messenger.`);

    // In real implementation, this would create a new message in the specified conversation
    alert(`Chat shared with ${contactName}!\n\nIn production, this would send:\n\n${chatHistory}`);
}

async function sendRegularMessage(content, replyTo = null) {
    try {
        const payload = { content };
        if (replyTo) {
            payload.reply_to = replyTo;
        }

        const response = await fetch(`${API_URL}/messenger/conversations/${currentConversationId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            // Message will be added via WebSocket
        }
    } catch (error) {
        console.error('Failed to send message:', error);
    }
}

function handleNewMessage(message) {
    if (message.conversation_id === currentConversationId) {
        if (!messages[currentConversationId]) {
            messages[currentConversationId] = [];
        }
        messages[currentConversationId].push(message);
        renderMessages();
    }

    // Update conversation preview
    if (conversations[message.conversation_id]) {
        conversations[message.conversation_id].last_message = message.content;
        conversations[message.conversation_id].updated_at = message.created_at;
        loadConversations();
    }
}

function handleMessageReaction(data) {
    const msg = messages[currentConversationId]?.find(m => m.id === data.message_id);
    if (msg) {
        if (!msg.reactions) msg.reactions = [];
        msg.reactions.push(data);
        renderMessages();
    }
}

function handleTyping(data) {
    if (data.conversation_id === currentConversationId) {
        const indicator = document.getElementById('typing-indicator');
        indicator.style.display = 'block';
        setTimeout(() => {
            indicator.style.display = 'none';
        }, 3000);
    }
}

function handleReadReceipt(data) {
    const msg = messages[currentConversationId]?.find(m => m.id === data.message_id);
    if (msg) {
        msg.read_at = data.read_at;
        renderMessages();
    }
}

window.addReaction = async function(messageId) {
    const emoji = prompt('Enter reaction emoji (e.g., 👍, ❤️, 😂):');
    if (!emoji) return;

    try {
        await fetch(`${API_URL}/messenger/messages/${messageId}/reactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ emoji })
        });
    } catch (error) {
        console.error('Failed to add reaction:', error);
    }
};

// Stories
async function loadStories() {
    try {
        const response = await fetch(`${API_URL}/messenger/stories`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            renderStories(data.stories || []);
        }
    } catch (error) {
        console.error('Failed to load stories:', error);
    }
}

function renderStories(stories) {
    const list = document.getElementById('stories-list');
    list.innerHTML = '';

    stories.forEach(story => {
        const div = document.createElement('div');
        div.className = 'story-item interactive';
        div.onclick = () => viewStory(story.id);
        div.innerHTML = `
            <div class="story-avatar">${getInitials(story.user_name)}</div>
            <div class="story-name">${story.user_name}</div>
        `;
        list.appendChild(div);
    });
}

window.viewStory = function(storyId) {
    if (storyId === 'your-story') {
        const content = prompt('Enter story text:');
        if (!content) return;

        fetch(`${API_URL}/messenger/stories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ content })
        }).then(() => loadStories());
    } else {
        alert('Story viewer coming soon!');
    }
};

// User search
window.showUserSearch = function() {
    const modal = document.getElementById('user-search-modal');
    modal.style.display = 'flex';
    document.getElementById('user-search-input').focus();
};

window.closeUserSearch = function() {
    document.getElementById('user-search-modal').style.display = 'none';
};

document.getElementById('user-search-input')?.addEventListener('input', async (e) => {
    const query = e.target.value.trim();
    if (query.length < 3) {
        document.getElementById('user-search-results').innerHTML = '';
        const status = document.getElementById('user-search-status');
        if (status) {
            status.textContent = 'Enter at least 3 characters to search.';
        }
        return;
    }

    const status = document.getElementById('user-search-status');
    if (status) {
        status.textContent = 'Searching...';
    }

    try {
        const response = await fetch(`${API_URL}/messenger/search-users?q=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            renderUserSearchResults(data.users || []);
        }
    } catch (error) {
        console.error('User search failed:', error);
    }
});

function renderUserSearchResults(users) {
    const container = document.getElementById('user-search-results');
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
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${user.username}</strong>
                    <div class="result-meta">${user.email}</div>
                </div>
                <span class="result-meta">ID: ${user.id.slice(0, 6)}</span>
            </div>
        <div class="result-actions">
            <button onclick="startConversation('${user.id}', '${user.username.replace(/'/g, "\\'")}')" class="btn btn-primary interactive" style="padding: 0.5rem 1rem;">📬 START CHAT</button>
            <button onclick="copyInviteLink('${user.id}', '${user.username}')" class="btn btn-secondary interactive" style="padding: 0.5rem 1rem;">🔗 COPY</button>
        </div>
        `;
        container.appendChild(div);
    });
}

window.startConversation = async function(userId, userName = 'New Contact') {
    try {
        const response = await fetch(`${API_URL}/messenger/conversations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                participant_ids: [userId],
                name: 'New Conversation'
            })
        });

        if (response.ok) {
            const conversation = await response.json();
            const conversationId = conversation.id;

            console.log('Created conversation:', conversation);

            closeUserSearch();

            // Reload conversations to get fresh data from server
            await loadConversations();

            // Select the newly created conversation after a small delay
            if (conversationId) {
                setTimeout(() => {
                    const convElement = document.querySelector(`.conversation-item[data-conversation-id="${conversationId}"]`);
                    if (convElement) {
                        convElement.click();
                    } else {
                        console.warn('Conversation element not found, trying selectConversation directly');
                        selectConversation(conversationId);
                    }
                }, 500);
            }

            console.log('✅ Conversation started successfully!');
        } else {
            const error = await response.json();
            console.error('Failed to start conversation:', error);
            alert(`Failed to start conversation: ${error.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Failed to start conversation:', error);
        alert('Network error. Please try again.');
    }
};

function addDirectConversationPreview(conversationId, name) {
    if (!conversations[conversationId]) {
        conversations[conversationId] = {
            id: conversationId,
            name: name,
            last_message: 'New conversation',
            updated_at: new Date().toISOString()
        };
        renderConversations(Object.values(conversations));
    }
}

// Invite links
window.generateInviteLink = async function() {
    const baseUrl = window.location.origin;

    try {
        // Create invite code on backend
        const response = await fetch(`${API_URL}/messenger/create-invite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to create invite');
        }

        const data = await response.json();
        const inviteLink = `${baseUrl}/register.html?invite=${data.invite_code}`;

        const telegramLink = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent('Join me on Kintsugi AI Messenger!')}`;
        const whatsappLink = `https://wa.me/?text=${encodeURIComponent('Join me on Kintsugi AI Messenger! ' + inviteLink)}`;

        const inviteId = `invite-link-${Date.now()}`;
        const modal = createModal(`
            <div>
                <h3 class="modal-title text-gold">INVITE FRIENDS</h3>
                <p class="modal-subtitle">Share this link to invite friends to register:</p>
                <div class="modal-input-group">
                    <input id="${inviteId}" value="${inviteLink}" readonly>
                    <button type="button" class="modal-copy-btn interactive">📋 COPY LINK</button>
                </div>
                <div class="modal-share-row">
                    <a href="${telegramLink}" target="_blank" rel="noreferrer noopener" class="interactive">📱 TELEGRAM</a>
                    <a href="${whatsappLink}" target="_blank" rel="noreferrer noopener" class="interactive">💬 WHATSAPP</a>
                </div>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary interactive modal-close-btn">CLOSE</button>
            </div>
        `, { cardClass: 'modal-wide' });

        const copyBtn = modal.querySelector('.modal-copy-btn');
        const inviteInput = modal.querySelector(`#${inviteId}`);
        if (copyBtn && inviteInput) {
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(inviteInput.value);
                const original = copyBtn.textContent;
                copyBtn.textContent = '✓ COPIED!';
                setTimeout(() => {
                    copyBtn.textContent = original;
                }, 2000);
            });
        }

        modal.querySelector('.modal-close-btn')?.addEventListener('click', closeActiveModal);
    } catch (error) {
        console.error('Failed to generate invite link:', error);
        alert('Failed to generate invite link. Please try again.');
    }
};

// Message search
document.getElementById('search-messages-input')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();

    if (query.length === 0) {
        renderMessages(); // Show all messages
        return;
    }

    const container = document.getElementById('chat-messages');
    const allMessages = Array.from(container.children);

    allMessages.forEach(msgEl => {
        const text = msgEl.textContent.toLowerCase();
        if (text.includes(query)) {
            msgEl.style.display = 'flex';
        } else {
            msgEl.style.display = 'none';
        }
    });
});

// Conversation search
document.getElementById('search-conversations')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.conversation-item').forEach(item => {
        const name = item.querySelector('.conversation-name')?.textContent.toLowerCase() || '';
        item.style.display = name.includes(query) ? 'block' : 'none';
    });
});

// Helpers
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return date.toLocaleDateString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load current user
async function loadCurrentUser() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
        }
    } catch (error) {
        console.error('Failed to load user:', error);
    }
}

// Initialize
loadCurrentUser().then(() => {
    // Add AI contact immediately (before WebSocket)
    addAIContact();
    connectWebSocket();
});
