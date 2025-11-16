// Analytics Dashboard - Kintsugi AI
// Usage tracking and insights visualization

const Analytics = {
    summary: null,
    breakdown: null,
    dailyData: [],

    // Initialize
    init: async function() {
        await this.loadSummary();
        await this.loadBreakdown();
    },

    // Load analytics summary
    loadSummary: async function() {
        try {
            const token = getToken();
            if (!token) return;

            const response = await fetch(`${API_URL}/analytics/summary`, {
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
            this.summary = data;
        } catch (error) {
            console.error('[ANALYTICS] Load summary error:', error);
        }
    },

    // Load usage breakdown
    loadBreakdown: async function() {
        try {
            const token = getToken();
            if (!token) return;

            const response = await fetch(`${API_URL}/analytics/breakdown`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            this.breakdown = data;
        } catch (error) {
            console.error('[ANALYTICS] Load breakdown error:', error);
        }
    },

    // Load daily analytics
    loadDailyAnalytics: async function(from, to) {
        try {
            const token = getToken();
            if (!token) return [];

            const fromStr = from.toISOString().split('T')[0];
            const toStr = to.toISOString().split('T')[0];

            const response = await fetch(`${API_URL}/analytics/daily?from=${fromStr}&to=${toStr}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            this.dailyData = data.analytics || [];
            return this.dailyData;
        } catch (error) {
            console.error('[ANALYTICS] Load daily analytics error:', error);
            return [];
        }
    },

    // Load detailed analytics
    loadDetailedAnalytics: async function(from, to) {
        try {
            const token = getToken();
            if (!token) return null;

            const fromStr = from.toISOString().split('T')[0];
            const toStr = to.toISOString().split('T')[0];

            const response = await fetch(`${API_URL}/analytics/detailed?from=${fromStr}&to=${toStr}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            return await response.json();
        } catch (error) {
            console.error('[ANALYTICS] Load detailed analytics error:', error);
            return null;
        }
    },

    // Get usage trends
    getTrends: async function(days = 7) {
        try {
            const token = getToken();
            if (!token) return null;

            const response = await fetch(`${API_URL}/analytics/trends?days=${days}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            return await response.json();
        } catch (error) {
            console.error('[ANALYTICS] Get trends error:', error);
            return null;
        }
    },

    // Show analytics modal
    showAnalyticsModal: async function() {
        await this.loadSummary();
        await this.loadBreakdown();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content border-3 border-purple" style="max-width: 1100px; background: var(--digital-black); padding: 2rem; max-height: 90vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h3 class="text-purple text-neon" style="font-size: 1.75rem;">📊 USAGE ANALYTICS</h3>
                    <button onclick="Analytics.closeModal()" style="background: none; border: none; color: var(--neon-pink); cursor: pointer; font-size: 1.5rem;">✕</button>
                </div>

                <!-- Summary Cards -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                    ${this.renderSummaryCards()}
                </div>

                <!-- Breakdown Section -->
                <div style="margin-bottom: 2rem;">
                    <h4 class="text-cyan" style="font-size: 1.25rem; margin-bottom: 1rem;">USAGE BREAKDOWN (Last 30 Days)</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        ${this.renderBreakdownBars()}
                    </div>
                </div>

                <!-- Quick Stats -->
                <div style="margin-bottom: 2rem;">
                    <h4 class="text-gold" style="font-size: 1.25rem; margin-bottom: 1rem;">INSIGHTS</h4>
                    ${this.renderInsights()}
                </div>

                <!-- Action Buttons -->
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button onclick="Analytics.exportAnalytics()" class="btn btn-secondary interactive" style="padding: 0.75rem 1.5rem;">
                        ⬇ EXPORT DATA
                    </button>
                    <button onclick="Analytics.closeModal()" class="btn btn-primary interactive" style="padding: 0.75rem 2rem;">
                        CLOSE
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    // Render summary cards
    renderSummaryCards: function() {
        if (!this.summary) {
            return '<div style="grid-column: 1/-1; text-align: center; color: #666;">Loading analytics...</div>';
        }

        const cards = [
            {
                title: 'Chat Tokens',
                value: this.summary.total_chat_tokens?.toLocaleString() || '0',
                icon: '💬',
                color: 'var(--cyber-cyan)'
            },
            {
                title: 'Translation Chars',
                value: this.summary.total_translation_chars?.toLocaleString() || '0',
                icon: '🌍',
                color: 'var(--electric-purple)'
            },
            {
                title: 'Images Generated',
                value: this.summary.total_images_generated || '0',
                icon: '🎨',
                color: 'var(--kintsugi-gold)'
            },
            {
                title: 'Voice Messages',
                value: this.summary.total_voice_messages || '0',
                icon: '🎤',
                color: 'var(--neon-pink)'
            },
            {
                title: 'Messages Sent',
                value: this.summary.total_messages?.toLocaleString() || '0',
                icon: '📨',
                color: 'var(--matrix-green)'
            },
            {
                title: 'Time Spent',
                value: `${Math.round((this.summary.total_time_spent_minutes || 0) / 60)}h`,
                icon: '⏱️',
                color: 'var(--neon-orange)'
            }
        ];

        return cards.map(card => `
            <div class="border-3" style="border-color: ${card.color}; padding: 1.5rem; background: rgba(0, 0, 0, 0.5); transition: all 0.3s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">${card.icon}</div>
                <div style="color: ${card.color}; font-weight: bold; font-size: 2rem; margin-bottom: 0.25rem;">${card.value}</div>
                <div style="color: #999; font-size: 0.9rem; text-transform: uppercase;">${card.title}</div>
            </div>
        `).join('');
    },

    // Render breakdown bars
    renderBreakdownBars: function() {
        if (!this.breakdown) {
            return '<div style="grid-column: 1/-1; text-align: center; color: #666;">No breakdown data</div>';
        }

        const total = this.breakdown.chat_tokens + this.breakdown.translation_chars +
                     (this.breakdown.images_generated * 1000) + (this.breakdown.voice_messages * 500);

        const items = [
            {
                label: 'Chat',
                value: this.breakdown.chat_tokens,
                percentage: total > 0 ? (this.breakdown.chat_tokens / total * 100).toFixed(1) : 0,
                color: 'var(--cyber-cyan)'
            },
            {
                label: 'Translation',
                value: this.breakdown.translation_chars,
                percentage: total > 0 ? (this.breakdown.translation_chars / total * 100).toFixed(1) : 0,
                color: 'var(--electric-purple)'
            },
            {
                label: 'Images',
                value: this.breakdown.images_generated,
                percentage: total > 0 ? (this.breakdown.images_generated * 1000 / total * 100).toFixed(1) : 0,
                color: 'var(--kintsugi-gold)'
            },
            {
                label: 'Voice',
                value: this.breakdown.voice_messages,
                percentage: total > 0 ? (this.breakdown.voice_messages * 500 / total * 100).toFixed(1) : 0,
                color: 'var(--neon-pink)'
            }
        ];

        return items.map(item => `
            <div style="padding: 1rem; background: rgba(0, 0, 0, 0.3); border: 2px solid ${item.color};">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span style="color: ${item.color}; font-weight: bold;">${item.label}</span>
                    <span style="color: #ccc;">${item.value.toLocaleString()}</span>
                </div>
                <div style="width: 100%; height: 8px; background: #1a1a1a; border: 1px solid ${item.color}; position: relative;">
                    <div style="height: 100%; width: ${item.percentage}%; background: ${item.color}; transition: width 0.5s;"></div>
                </div>
                <div style="text-align: right; color: #666; font-size: 0.85rem; margin-top: 0.25rem;">${item.percentage}%</div>
            </div>
        `).join('');
    },

    // Render insights
    renderInsights: function() {
        if (!this.summary) {
            return '<div style="color: #666;">No insights available</div>';
        }

        const avgPerDay = Math.round((this.summary.total_chat_tokens || 0) / 30);
        const avgTimePerDay = Math.round((this.summary.total_time_spent_minutes || 0) / 30);
        const mostUsedFeature = this.getMostUsedFeature();

        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                <div class="border-2 border-cyan" style="padding: 1.25rem; background: rgba(0, 255, 255, 0.05);">
                    <div style="font-weight: bold; color: var(--cyber-cyan); margin-bottom: 0.5rem;">📈 Average Daily Usage</div>
                    <div style="color: #ccc; font-size: 1.25rem;">${avgPerDay.toLocaleString()} tokens/day</div>
                </div>

                <div class="border-2 border-gold" style="padding: 1.25rem; background: rgba(240, 255, 0, 0.05);">
                    <div style="font-weight: bold; color: var(--kintsugi-gold); margin-bottom: 0.5rem;">⏱️ Average Time Spent</div>
                    <div style="color: #ccc; font-size: 1.25rem;">${avgTimePerDay} min/day</div>
                </div>

                <div class="border-2 border-purple" style="padding: 1.25rem; background: rgba(157, 0, 255, 0.05);">
                    <div style="font-weight: bold; color: var(--electric-purple); margin-bottom: 0.5rem;">⭐ Most Used Feature</div>
                    <div style="color: #ccc; font-size: 1.25rem;">${mostUsedFeature}</div>
                </div>
            </div>
        `;
    },

    // Get most used feature
    getMostUsedFeature: function() {
        if (!this.breakdown) return 'N/A';

        const features = {
            'AI Chat': this.breakdown.chat_tokens || 0,
            'Translation': this.breakdown.translation_chars || 0,
            'Image Generation': this.breakdown.images_generated || 0,
            'Voice Messages': this.breakdown.voice_messages || 0,
            'Messenger': this.breakdown.messages_count || 0
        };

        let maxFeature = 'N/A';
        let maxValue = 0;

        for (const [feature, value] of Object.entries(features)) {
            if (value > maxValue) {
                maxValue = value;
                maxFeature = feature;
            }
        }

        return maxFeature;
    },

    // Export analytics data
    exportAnalytics: function() {
        if (!this.summary || !this.breakdown) {
            alert('No analytics data to export');
            return;
        }

        const data = {
            summary: this.summary,
            breakdown: this.breakdown,
            exportedAt: new Date().toISOString()
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kintsugi-analytics-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (window.ChatEnhanced) {
            ChatEnhanced.showNotification('✓ Analytics exported!', 'success');
        }
    },

    // Close modal
    closeModal: function() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) modal.remove();
    },

    // Record usage (internal helper methods)
    recordChatUsage: async function(tokens) {
        try {
            const token = getToken();
            if (!token) return;

            await fetch(`${API_URL}/analytics/record/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ tokens })
            });
        } catch (error) {
            console.error('[ANALYTICS] Record chat usage error:', error);
        }
    },

    recordTranslationUsage: async function(characters) {
        try {
            const token = getToken();
            if (!token) return;

            await fetch(`${API_URL}/analytics/record/translation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ characters })
            });
        } catch (error) {
            console.error('[ANALYTICS] Record translation usage error:', error);
        }
    },

    recordImageGeneration: async function() {
        try {
            const token = getToken();
            if (!token) return;

            await fetch(`${API_URL}/analytics/record/image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('[ANALYTICS] Record image generation error:', error);
        }
    }
};

// Global functions
window.Analytics = Analytics;

// Add to ChatEnhanced if available
if (window.ChatEnhanced) {
    ChatEnhanced.showAnalytics = function() {
        Analytics.showAnalyticsModal();
    };
}
