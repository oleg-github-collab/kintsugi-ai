// Global Search & Quick Switcher - Kintsugi AI
// Unified search across all modules with keyboard shortcuts

const GlobalSearch = {
    isOpen: false,
    searchMode: 'global', // global or quick
    currentResults: [],

    // Initialize
    init: function() {
        this.setupKeyboardShortcuts();
        this.createSearchModal();
    },

    // Setup keyboard shortcuts
    setupKeyboardShortcuts: function() {
        document.addEventListener('keydown', (e) => {
            // Cmd/Ctrl + K for global search
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearch('global');
            }

            // Cmd/Ctrl + P for quick switcher
            if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
                e.preventDefault();
                this.openSearch('quick');
            }

            // ESC to close
            if (e.key === 'Escape' && this.isOpen) {
                this.closeSearch();
            }
        });
    },

    // Create search modal
    createSearchModal: function() {
        const modal = document.createElement('div');
        modal.id = 'global-search-modal';
        modal.className = 'search-modal';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="search-modal-overlay" onclick="GlobalSearch.closeSearch()"></div>
            <div class="search-modal-content border-3 border-cyan">
                <div class="search-header">
                    <div class="search-input-container">
                        <span class="search-icon">🔍</span>
                        <input
                            type="text"
                            id="global-search-input"
                            class="search-input"
                            placeholder="Search everything... (⌘K)"
                            autocomplete="off"
                        >
                        <button onclick="GlobalSearch.closeSearch()" class="search-close">✕</button>
                    </div>
                    <div class="search-tabs">
                        <button class="search-tab active" data-mode="global" onclick="GlobalSearch.switchMode('global')">
                            🌐 All
                        </button>
                        <button class="search-tab" data-mode="chat" onclick="GlobalSearch.switchMode('chat')">
                            💬 Chat
                        </button>
                        <button class="search-tab" data-mode="messenger" onclick="GlobalSearch.switchMode('messenger')">
                            📨 Messenger
                        </button>
                        <button class="search-tab" data-mode="translation" onclick="GlobalSearch.switchMode('translation')">
                            🌍 Translation
                        </button>
                        <button class="search-tab" data-mode="files" onclick="GlobalSearch.switchMode('files')">
                            📁 Files
                        </button>
                    </div>
                </div>
                <div class="search-results" id="global-search-results">
                    <div class="search-empty">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                        <div style="color: #666;">Start typing to search...</div>
                        <div style="margin-top: 1rem; color: #444; font-size: 0.85rem;">
                            <kbd>⌘K</kbd> Global Search • <kbd>⌘P</kbd> Quick Switcher • <kbd>ESC</kbd> Close
                        </div>
                    </div>
                </div>
                <div class="search-footer">
                    <div class="search-suggestions" id="search-suggestions"></div>
                    <div class="search-stats">
                        <span id="search-results-count">0 results</span>
                        <span id="search-time"></span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Setup input listener
        const input = document.getElementById('global-search-input');
        let searchTimeout;
        input.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performSearch(e.target.value);
            }, 300);
        });

        // Arrow key navigation
        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateResults(e.key === 'ArrowDown' ? 1 : -1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                this.selectResult();
            }
        });
    },

    // Open search
    openSearch: function(mode = 'global') {
        this.searchMode = mode;
        this.isOpen = true;

        const modal = document.getElementById('global-search-modal');
        const input = document.getElementById('global-search-input');

        modal.style.display = 'flex';
        input.value = '';
        input.focus();

        if (mode === 'quick') {
            input.placeholder = 'Quick switch... (⌘P)';
            this.loadRecentItems();
        } else {
            input.placeholder = 'Search everything... (⌘K)';
            this.loadRecentItems();
        }

        // Load suggestions
        this.loadSuggestions();
    },

    // Close search
    closeSearch: function() {
        this.isOpen = false;
        const modal = document.getElementById('global-search-modal');
        modal.style.display = 'none';
    },

    // Switch search mode
    switchMode: function(mode) {
        this.searchMode = mode;

        // Update tabs
        document.querySelectorAll('.search-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.mode === mode) {
                tab.classList.add('active');
            }
        });

        // Re-search
        const input = document.getElementById('global-search-input');
        if (input.value) {
            this.performSearch(input.value);
        }
    },

    // Perform search
    performSearch: async function(query) {
        if (!query || query.length < 2) {
            this.loadRecentItems();
            return;
        }

        const modules = this.searchMode === 'global'
            ? ['chat', 'messenger', 'translation', 'files']
            : [this.searchMode];

        try {
            const token = getToken();
            const response = await fetch(`${API_URL}/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    query: query,
                    modules: modules,
                    limit: 50
                })
            });

            if (!response.ok) throw new Error('Search failed');

            const data = await response.json();
            this.currentResults = data.results;
            this.renderResults(data);
        } catch (error) {
            console.error('[SEARCH] Error:', error);
            this.showError('Search failed. Please try again.');
        }
    },

    // Render results
    renderResults: function(data) {
        const container = document.getElementById('global-search-results');
        const statsCount = document.getElementById('search-results-count');
        const statsTime = document.getElementById('search-time');

        statsCount.textContent = `${data.total} result${data.total !== 1 ? 's' : ''}`;
        statsTime.textContent = `${data.time_taken_ms.toFixed(0)}ms`;

        if (data.results.length === 0) {
            container.innerHTML = `
                <div class="search-empty">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                    <div style="color: #666;">No results found for "${data.query}"</div>
                    <div style="margin-top: 1rem; color: #444; font-size: 0.9rem;">
                        Try different keywords or check spelling
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = data.results.map((result, index) => `
            <div class="search-result-item ${index === 0 ? 'selected' : ''}" data-index="${index}" onclick="GlobalSearch.openResult(${index})">
                <div class="search-result-icon">${this.getModuleIcon(result.module)}</div>
                <div class="search-result-content">
                    <div class="search-result-title">${this.escapeHtml(result.title)}</div>
                    <div class="search-result-highlight">${this.escapeHtml(result.highlight)}</div>
                    <div class="search-result-meta">
                        <span class="search-result-module">${result.module}</span>
                        <span class="search-result-date">${this.formatDate(result.created_at)}</span>
                    </div>
                </div>
                <div class="search-result-score">${result.score.toFixed(0)}</div>
            </div>
        `).join('');

        // Render suggestions
        if (data.suggestions && data.suggestions.length > 0) {
            const suggestionsContainer = document.getElementById('search-suggestions');
            suggestionsContainer.innerHTML = data.suggestions.map(s => `
                <button class="search-suggestion" onclick="GlobalSearch.applySuggestion('${s}')">
                    ${this.escapeHtml(s)}
                </button>
            `).join('');
        }
    },

    // Load recent items
    loadRecentItems: async function() {
        try {
            const token = getToken();
            const response = await fetch(`${API_URL}/search/recent?limit=10`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to load recent items');

            const data = await response.json();
            this.renderRecentItems(data.items);
        } catch (error) {
            console.error('[SEARCH] Recent items error:', error);
        }
    },

    // Render recent items
    renderRecentItems: function(items) {
        const container = document.getElementById('global-search-results');

        if (!items || items.length === 0) {
            container.innerHTML = `
                <div class="search-empty">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">⏱️</div>
                    <div style="color: #666;">No recent items</div>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="search-section-title">Recent Items</div>
            ${items.map((item, index) => `
                <div class="search-result-item ${index === 0 ? 'selected' : ''}" onclick="window.location.href='${item.url}'">
                    <div class="search-result-icon">${this.getItemTypeIcon(item.item_type)}</div>
                    <div class="search-result-content">
                        <div class="search-result-title">${this.escapeHtml(item.title)}</div>
                        <div class="search-result-meta">
                            <span class="search-result-module">${item.item_type}</span>
                            <span class="search-result-date">${this.formatDate(item.accessed_at)}</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        `;
    },

    // Load AI suggestions
    loadSuggestions: async function() {
        try {
            const token = getToken();
            const response = await fetch(`${API_URL}/search/suggestions?limit=5`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) return;

            const data = await response.json();
            if (data.suggestions && data.suggestions.length > 0) {
                this.renderAISuggestions(data.suggestions);
            }
        } catch (error) {
            console.error('[SEARCH] Suggestions error:', error);
        }
    },

    // Render AI suggestions
    renderAISuggestions: function(suggestions) {
        const container = document.getElementById('global-search-results');
        const suggestionsHTML = `
            <div class="search-section-title">💡 Smart Suggestions</div>
            ${suggestions.map((s, index) => `
                <div class="search-result-item suggestion-item" onclick="window.location.href='${s.action}'">
                    <div class="search-result-icon">✨</div>
                    <div class="search-result-content">
                        <div class="search-result-title">${this.escapeHtml(s.title)}</div>
                        <div class="search-result-highlight">${this.escapeHtml(s.description)}</div>
                        <div class="search-result-meta">
                            <span class="search-result-module">${s.type}</span>
                            <span class="search-result-score">${(s.confidence * 100).toFixed(0)}% confidence</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        `;

        container.innerHTML = suggestionsHTML + container.innerHTML;
    },

    // Navigate results with arrow keys
    navigateResults: function(direction) {
        const items = document.querySelectorAll('.search-result-item');
        const selected = document.querySelector('.search-result-item.selected');

        if (!selected || items.length === 0) return;

        const currentIndex = parseInt(selected.dataset.index || 0);
        const newIndex = Math.max(0, Math.min(items.length - 1, currentIndex + direction));

        items.forEach(item => item.classList.remove('selected'));
        items[newIndex].classList.add('selected');
        items[newIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    },

    // Select result
    selectResult: function() {
        const selected = document.querySelector('.search-result-item.selected');
        if (selected) {
            selected.click();
        }
    },

    // Open result
    openResult: function(index) {
        const result = this.currentResults[index];
        if (result && result.url) {
            this.recordRecentItem(result);
            window.location.href = result.url;
        }
    },

    // Record recent item
    recordRecentItem: async function(result) {
        try {
            const token = getToken();
            await fetch(`${API_URL}/search/recent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    item_type: result.type,
                    item_id: result.id,
                    title: result.title,
                    url: result.url
                })
            });
        } catch (error) {
            console.error('[SEARCH] Record recent error:', error);
        }
    },

    // Apply suggestion
    applySuggestion: function(suggestion) {
        const input = document.getElementById('global-search-input');
        input.value = suggestion;
        this.performSearch(suggestion);
    },

    // Get module icon
    getModuleIcon: function(module) {
        const icons = {
            'chat': '💬',
            'messenger': '📨',
            'translation': '🌍',
            'files': '📁',
            'user': '👤'
        };
        return icons[module] || '📄';
    },

    // Get item type icon
    getItemTypeIcon: function(type) {
        const icons = {
            'chat': '💬',
            'message': '📨',
            'translation': '🌍',
            'file': '📁',
            'conversation': '💬'
        };
        return icons[type] || '📄';
    },

    // Format date
    formatDate: function(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;

        return date.toLocaleDateString();
    },

    // Escape HTML
    escapeHtml: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Show error
    showError: function(message) {
        const container = document.getElementById('global-search-results');
        container.innerHTML = `
            <div class="search-empty">
                <div style="font-size: 3rem; margin-bottom: 1rem; color: var(--neon-pink);">⚠️</div>
                <div style="color: var(--neon-pink);">${message}</div>
            </div>
        `;
    }
};

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GlobalSearch.init());
} else {
    GlobalSearch.init();
}

// Export
window.GlobalSearch = GlobalSearch;
