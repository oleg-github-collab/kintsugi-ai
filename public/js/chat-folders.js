// Chat Folders & Organization - Kintsugi AI
// Comprehensive folder management system with tags and smart folders

const ChatFolders = {
    folders: [],
    tags: [],
    currentFolder: null,

    // Initialize
    init: async function() {
        await this.loadFolders();
        await this.loadTags();
        this.render();
        this.setupEventListeners();
    },

    // Setup event listeners
    setupEventListeners: function() {
        // Folder management events will be added dynamically
    },

    // Load folders from API
    loadFolders: async function() {
        try {
            const token = getToken();
            if (!token) return;

            const response = await fetch(`${API_URL}/chat/folders`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    removeToken();
                    window.location.href = '/login.html';
                    return;
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            this.folders = data.folders || [];
        } catch (error) {
            console.error('[FOLDERS] Load error:', error);
        }
    },

    // Load tags from API
    loadTags: async function() {
        try {
            const token = getToken();
            if (!token) return;

            const response = await fetch(`${API_URL}/chat/tags`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            this.tags = data.tags || [];
        } catch (error) {
            console.error('[TAGS] Load error:', error);
        }
    },

    // Create new folder
    createFolder: async function(name, color = '#00FFFF', icon = '📁') {
        try {
            const token = getToken();
            if (!token) return null;

            const response = await fetch(`${API_URL}/chat/folders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, color, icon })
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            this.folders.push(data.folder);
            this.render();
            return data.folder;
        } catch (error) {
            console.error('[FOLDERS] Create error:', error);
            return null;
        }
    },

    // Update folder
    updateFolder: async function(folderId, updates) {
        try {
            const token = getToken();
            if (!token) return false;

            const response = await fetch(`${API_URL}/chat/folders/${folderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            await this.loadFolders();
            this.render();
            return true;
        } catch (error) {
            console.error('[FOLDERS] Update error:', error);
            return false;
        }
    },

    // Delete folder
    deleteFolder: async function(folderId) {
        try {
            const token = getToken();
            if (!token) return false;

            const response = await fetch(`${API_URL}/chat/folders/${folderId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            this.folders = this.folders.filter(f => f.id !== folderId);
            this.render();
            return true;
        } catch (error) {
            console.error('[FOLDERS] Delete error:', error);
            return false;
        }
    },

    // Assign chat to folder
    assignChatToFolder: async function(chatId, folderId) {
        try {
            const token = getToken();
            if (!token) return false;

            const response = await fetch(`${API_URL}/chat/folders/assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ chat_id: chatId, folder_id: folderId })
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return true;
        } catch (error) {
            console.error('[FOLDERS] Assign error:', error);
            return false;
        }
    },

    // Create tag
    createTag: async function(name, color = '#9D00FF') {
        try {
            const token = getToken();
            if (!token) return null;

            const response = await fetch(`${API_URL}/chat/tags`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, color })
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            this.tags.push(data.tag);
            return data.tag;
        } catch (error) {
            console.error('[TAGS] Create error:', error);
            return null;
        }
    },

    // Assign tag to chat
    assignTagToChat: async function(chatId, tagId) {
        try {
            const token = getToken();
            if (!token) return false;

            const response = await fetch(`${API_URL}/chat/tags/assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ chat_id: chatId, tag_id: tagId })
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return true;
        } catch (error) {
            console.error('[TAGS] Assign error:', error);
            return false;
        }
    },

    // Auto-categorize chat
    autoCategorize: async function(chatId) {
        try {
            const token = getToken();
            if (!token) return false;

            const response = await fetch(`${API_URL}/chat/chats/${chatId}/auto-categorize`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return true;
        } catch (error) {
            console.error('[FOLDERS] Auto-categorize error:', error);
            return false;
        }
    },

    // Render folders in sidebar
    render: function() {
        const container = document.getElementById('folders-container');
        if (!container) return;

        container.innerHTML = `
            <div style="padding: 1rem; border-bottom: 2px solid var(--cyber-cyan);">
                <button onclick="ChatFolders.showCreateFolderModal()" class="btn btn-primary interactive" style="width: 100%; padding: 0.75rem; font-size: 0.85rem;">
                    ➕ NEW FOLDER
                </button>
            </div>
            <div style="padding: 0.5rem;">
                ${this.folders.length === 0
                    ? '<div style="padding: 1rem; text-align: center; color: #666;">No folders yet</div>'
                    : this.folders.map(folder => this.renderFolderItem(folder)).join('')
                }
            </div>
        `;
    },

    // Render single folder item
    renderFolderItem: function(folder) {
        const isActive = this.currentFolder === folder.id;
        return `
            <div
                class="folder-item ${isActive ? 'active' : ''}"
                onclick="ChatFolders.selectFolder('${folder.id}')"
                style="
                    padding: 0.75rem;
                    margin-bottom: 0.5rem;
                    border: 2px solid ${folder.color || '#00FFFF'};
                    background: ${isActive ? `rgba(${this.hexToRgb(folder.color || '#00FFFF')}, 0.15)` : 'rgba(0, 0, 0, 0.3)'};
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                "
                onmouseover="this.style.transform='translateX(4px)'"
                onmouseout="this.style.transform='translateX(0)'"
            >
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 1.25rem;">${folder.icon || '📁'}</span>
                    <span style="color: ${folder.color || '#00FFFF'}; font-weight: bold;">${folder.name}</span>
                    ${folder.is_smart_folder ? '<span style="font-size: 0.75rem;">⚡</span>' : ''}
                </div>
                <button
                    onclick="event.stopPropagation(); ChatFolders.showFolderMenu('${folder.id}')"
                    style="background: none; border: none; color: #666; cursor: pointer; font-size: 1.2rem;"
                >⋮</button>
            </div>
        `;
    },

    // Helper: hex to RGB
    hexToRgb: function(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
            : '0, 255, 255';
    },

    // Select folder
    selectFolder: function(folderId) {
        this.currentFolder = folderId;
        this.render();
        // Trigger chat list filter
        if (window.ChatEnhanced) {
            ChatEnhanced.filterByFolder(folderId);
        }
    },

    // Show create folder modal
    showCreateFolderModal: function() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content border-3 border-cyan" style="max-width: 500px; background: var(--digital-black); padding: 2rem;">
                <h3 class="text-cyan text-neon" style="font-size: 1.5rem; margin-bottom: 1.5rem;">CREATE NEW FOLDER</h3>

                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; color: var(--cyber-cyan); margin-bottom: 0.5rem;">Folder Name</label>
                    <input type="text" id="folder-name-input" class="form-input" style="width: 100%; padding: 0.75rem;" placeholder="My Folder">
                </div>

                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; color: var(--cyber-cyan); margin-bottom: 0.5rem;">Icon</label>
                    <div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 0.5rem;">
                        ${['📁', '💼', '🎯', '💡', '🚀', '⚡', '🔥', '✨', '📊', '🎨', '🔧', '💻', '📝', '🎓', '🌟', '🔬'].map(icon => `
                            <button class="icon-select-btn" data-icon="${icon}" onclick="ChatFolders.selectIcon(this)" style="
                                padding: 0.5rem;
                                border: 2px solid #333;
                                background: rgba(0, 0, 0, 0.5);
                                cursor: pointer;
                                font-size: 1.5rem;
                                transition: all 0.2s;
                            ">${icon}</button>
                        `).join('')}
                    </div>
                </div>

                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; color: var(--cyber-cyan); margin-bottom: 0.5rem;">Color</label>
                    <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.5rem;">
                        ${['#00FFFF', '#F0FF00', '#9D00FF', '#FF00FF', '#FF6B00', '#00FF00'].map(color => `
                            <button class="color-select-btn" data-color="${color}" onclick="ChatFolders.selectColor(this)" style="
                                padding: 1rem;
                                border: 2px solid #333;
                                background: ${color};
                                cursor: pointer;
                                transition: all 0.2s;
                            "></button>
                        `).join('')}
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button onclick="ChatFolders.closeModal()" class="btn btn-secondary interactive">CANCEL</button>
                    <button onclick="ChatFolders.submitCreateFolder()" class="btn btn-primary interactive">CREATE</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Set defaults
        this.selectedIcon = '📁';
        this.selectedColor = '#00FFFF';
        modal.querySelector('.icon-select-btn').style.border = '2px solid var(--cyber-cyan)';
        modal.querySelector('.color-select-btn').style.border = '2px solid var(--cyber-cyan)';
    },

    // Select icon
    selectIcon: function(btn) {
        document.querySelectorAll('.icon-select-btn').forEach(b => b.style.border = '2px solid #333');
        btn.style.border = '2px solid var(--cyber-cyan)';
        this.selectedIcon = btn.dataset.icon;
    },

    // Select color
    selectColor: function(btn) {
        document.querySelectorAll('.color-select-btn').forEach(b => b.style.border = '2px solid #333');
        btn.style.border = '2px solid var(--cyber-cyan)';
        this.selectedColor = btn.dataset.color;
    },

    // Submit create folder
    submitCreateFolder: async function() {
        const name = document.getElementById('folder-name-input').value.trim();
        if (!name) {
            alert('Please enter a folder name');
            return;
        }

        const folder = await this.createFolder(name, this.selectedColor, this.selectedIcon);
        if (folder) {
            this.closeModal();
            if (window.ChatEnhanced) {
                ChatEnhanced.showNotification('✓ Folder created!', 'success');
            }
        } else {
            alert('Failed to create folder');
        }
    },

    // Close modal
    closeModal: function() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) modal.remove();
    },

    // Show folder context menu
    showFolderMenu: function(folderId) {
        const folder = this.folders.find(f => f.id === folderId);
        if (!folder) return;

        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.innerHTML = `
            <div class="border-3 border-cyan" style="background: var(--digital-black); padding: 0.5rem; min-width: 150px;">
                <button onclick="ChatFolders.renameFolder('${folderId}')" class="context-menu-item">✏️ Rename</button>
                <button onclick="ChatFolders.deleteFolder('${folderId}')" class="context-menu-item" style="color: var(--neon-pink);">🗑️ Delete</button>
            </div>
        `;

        document.body.appendChild(menu);

        // Position menu
        const rect = event.target.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = rect.bottom + 'px';
        menu.style.left = rect.left + 'px';
        menu.style.zIndex = '10000';

        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            });
        }, 10);
    }
};

// Global functions
window.ChatFolders = ChatFolders;
