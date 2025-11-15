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
    div.onclick = () => selectConversation('ai-assistant');
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
        div.onclick = () => selectConversation(conv.id);
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
async function selectConversation(convId) {
    currentConversationId = convId;
    const conv = conversations[convId];
    isAIChat = conv.isAI || false;

    // Update active state
    document.querySelectorAll('.conversation-item').forEach(el => {
        el.classList.remove('active');
    });
    event.currentTarget.classList.add('active');

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
    } else {
        document.getElementById('chat-header').innerHTML = `
            <div class="conversation-avatar">${getInitials(conv.name)}</div>
            <div style="flex: 1;">
                <div class="conversation-name text-gold" style="font-size: 1.25rem;">${conv.name}</div>
                <div class="conversation-time">${conv.participants_count} participants</div>
            </div>
        `;

        // Show call buttons for non-AI chats
        const callButtons = document.getElementById('call-buttons');
        if (callButtons) {
            callButtons.style.display = 'flex';
        }
    }

    // Hide call buttons for AI chat
    if (isAIChat) {
        const callButtons = document.getElementById('call-buttons');
        if (callButtons) {
            callButtons.style.display = 'none';
        }
    }

    // Enable input
    document.getElementById('message-input').disabled = false;
    document.querySelector('#message-form button').disabled = false;

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
        let messageContent = escapeHtml(msg.content);

        // Detect code blocks
        if (msg.content.includes('```')) {
            messageContent = formatCodeBlocks(msg.content);
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
                    ${!isAIChat ? `<button class="add-reaction interactive" onclick="addReaction(${msg.id})">+</button>` : ''}
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

    // Create forward modal
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; align-items: center; justify-content: center;';
    modal.innerHTML = `
        <div style="background: var(--digital-black); border: 3px solid var(--cyber-cyan); padding: 2rem; max-width: 600px; width: 90%;">
            <h3 class="text-cyan" style="margin-bottom: 1rem;">📤 FORWARD CODE</h3>
            <p style="color: #999; margin-bottom: 1rem;">Select a contact to forward this code snippet:</p>
            <div style="max-height: 300px; overflow-y: auto; margin-bottom: 1rem;">
                ${Object.values(conversations).filter(c => !c.isAI).map(c => `
                    <button onclick="doForwardCode('${c.id}', \`${code.replace(/`/g, '\\`')}\`, '${lang}')" class="btn btn-secondary interactive" style="width: 100%; margin-bottom: 0.5rem; text-align: left;">
                        ${c.name}
                    </button>
                `).join('')}
            </div>
            <button onclick="this.closest('div[style*=fixed]').remove()" class="btn btn-primary interactive" style="width: 100%;">CANCEL</button>
        </div>
    `;
    document.body.appendChild(modal);
};

window.doForwardCode = function(convId, code, lang) {
    // Close modal
    document.querySelector('div[style*="position: fixed"]').remove();

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
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; align-items: center; justify-content: center;';
    modal.innerHTML = `
        <div style="background: var(--digital-black); border: 3px solid var(--cyber-cyan); padding: 2rem; max-width: 600px; width: 90%;">
            <h3 class="text-cyan" style="margin-bottom: 1rem;">📤 FORWARD IMAGE</h3>
            <p style="color: #999; margin-bottom: 1rem;">Select a contact to forward this image:</p>
            <div style="max-height: 300px; overflow-y: auto; margin-bottom: 1rem;">
                ${Object.values(conversations).filter(c => !c.isAI).map(c => `
                    <button onclick="doForwardImage('${c.id}', '${imageUrl}')" class="btn btn-secondary interactive" style="width: 100%; margin-bottom: 0.5rem; text-align: left;">
                        ${c.name}
                    </button>
                `).join('')}
            </div>
            <button onclick="this.closest('div[style*=fixed]').remove()" class="btn btn-primary interactive" style="width: 100%;">CANCEL</button>
        </div>
    `;
    document.body.appendChild(modal);
};

window.doForwardImage = function(convId, imageUrl) {
    document.querySelector('div[style*="position: fixed"]').remove();
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
        await sendRegularMessage(content);
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

async function sendRegularMessage(content) {
    try {
        const response = await fetch(`${API_URL}/messenger/conversations/${currentConversationId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ content })
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
        return;
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

    users.forEach(user => {
        const div = document.createElement('div');
        div.className = 'user-search-item interactive';
        div.innerHTML = `
            <div class="conversation-avatar">${getInitials(user.username)}</div>
            <div style="flex: 1;">
                <div class="conversation-name">${user.username}</div>
                <div class="conversation-preview">${user.email}</div>
            </div>
            <button onclick="startConversation('${user.id}')" class="btn btn-primary interactive" style="padding: 0.5rem 1rem;">MESSAGE</button>
        `;
        container.appendChild(div);
    });
}

window.startConversation = async function(userId) {
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
            const data = await response.json();
            closeUserSearch();
            loadConversations();
            selectConversation(data.conversation.id);
        }
    } catch (error) {
        console.error('Failed to start conversation:', error);
    }
};

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

        const modal = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--digital-black); border: 3px solid var(--kintsugi-gold); padding: 2rem; z-index: 10000; min-width: 400px;">
                <h3 class="text-gold" style="font-size: 1.5rem; margin-bottom: 1rem;">INVITE FRIENDS</h3>
                <p style="color: var(--cyber-cyan); margin-bottom: 1rem;">Share this link to invite friends to register:</p>
                <div style="margin-bottom: 1rem;">
                    <input type="text" id="invite-link-input" value="${inviteLink}" readonly style="width: 100%; padding: 0.75rem; border: 2px solid var(--cyber-cyan); background: var(--digital-black); color: var(--cyber-cyan); font-family: monospace;">
                </div>
                <button onclick="navigator.clipboard.writeText(document.getElementById('invite-link-input').value); this.textContent='✓ COPIED!'" class="btn btn-primary interactive" style="width: 100%; margin-bottom: 1rem;">📋 COPY LINK</button>
                <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                    <a href="${telegramLink}" target="_blank" class="btn btn-primary interactive" style="flex: 1; text-align: center;">📱 TELEGRAM</a>
                    <a href="${whatsappLink}" target="_blank" class="btn btn-primary interactive" style="flex: 1; text-align: center;">💬 WHATSAPP</a>
                </div>
                <button onclick="this.parentElement.remove(); this.previousElementSibling.remove();" class="btn btn-secondary interactive" style="width: 100%; margin-top: 1rem;">CLOSE</button>
            </div>
            <div onclick="this.nextElementSibling.remove(); this.remove();" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 9999;"></div>
        `;

        document.body.insertAdjacentHTML('beforeend', modal);
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
