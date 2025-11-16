// Admin Dashboard - Kintsugi AI
// System administration and user management

const AdminDashboard = {
    users: [],
    stats: null,
    currentPage: 1,
    pageSize: 50,
    totalUsers: 0,
    searchQuery: '',

    // Initialize
    init: async function() {
        if (!isAuthenticated()) {
            window.location.href = '/login.html';
            return;
        }

        await this.checkAdminAccess();
        await this.loadSystemStats();
        await this.loadAllUsers();
    },

    // Check admin access
    checkAdminAccess: async function() {
        try {
            const token = getToken();
            if (!token) {
                window.location.href = '/login.html';
                return;
            }

            const response = await fetch(`${API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                removeToken();
                window.location.href = '/login.html';
                return;
            }

            const data = await response.json();
            const user = data.user;

            // Check if user is admin or superadmin
            if (user.role !== 'admin' && user.role !== 'superadmin') {
                alert('Access denied. Admin privileges required.');
                window.location.href = '/chat.html';
                return;
            }
        } catch (error) {
            console.error('[ADMIN] Check access error:', error);
            window.location.href = '/login.html';
        }
    },

    // Load system statistics
    loadSystemStats: async function() {
        try {
            const token = getToken();
            if (!token) return;

            const response = await fetch(`${API_URL}/admin/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            this.stats = await response.json();
            this.renderStats();
        } catch (error) {
            console.error('[ADMIN] Load stats error:', error);
        }
    },

    // Render statistics
    renderStats: function() {
        if (!this.stats) return;

        document.getElementById('total-users').textContent = this.stats.total_users?.toLocaleString() || '0';
        document.getElementById('active-today').textContent = this.stats.active_today?.toLocaleString() || '0';
        document.getElementById('total-chats').textContent = this.stats.total_chats?.toLocaleString() || '0';
        document.getElementById('revenue').textContent = '$' + (this.stats.revenue?.toFixed(2) || '0.00');
        document.getElementById('total-tokens').textContent = (this.stats.total_tokens_used?.toLocaleString() || '0');
        document.getElementById('new-users-week').textContent = this.stats.new_users_this_week?.toLocaleString() || '0';
    },

    // Load all users
    loadAllUsers: async function() {
        try {
            const token = getToken();
            if (!token) return;

            const offset = (this.currentPage - 1) * this.pageSize;
            const response = await fetch(`${API_URL}/admin/users?limit=${this.pageSize}&offset=${offset}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            this.users = data.users || [];
            this.totalUsers = data.total || 0;
            this.renderUsers();
            this.updatePagination();
        } catch (error) {
            console.error('[ADMIN] Load users error:', error);
            this.showError('Failed to load users');
        }
    },

    // Search users
    searchUsers: async function() {
        const query = document.getElementById('search-input').value.trim();
        if (!query) {
            this.loadAllUsers();
            return;
        }

        this.searchQuery = query;

        try {
            const token = getToken();
            if (!token) return;

            const offset = (this.currentPage - 1) * this.pageSize;
            const response = await fetch(`${API_URL}/admin/users/search?query=${encodeURIComponent(query)}&limit=${this.pageSize}&offset=${offset}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            this.users = data.users || [];
            this.totalUsers = data.total || 0;
            this.renderUsers();
            this.updatePagination();
        } catch (error) {
            console.error('[ADMIN] Search users error:', error);
            this.showError('Failed to search users');
        }
    },

    // Render users table
    renderUsers: function() {
        const tbody = document.getElementById('users-table-body');

        if (this.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #666;">No users found</td></tr>';
            return;
        }

        tbody.innerHTML = this.users.map(user => {
            const createdDate = new Date(user.created_at).toLocaleDateString();
            const tokenPercentage = user.tokens_limit > 0 ? ((user.tokens_used / user.tokens_limit) * 100).toFixed(1) : 0;

            return `
                <tr>
                    <td>
                        <div style="font-weight: bold; color: var(--cyber-cyan);">${this.escapeHtml(user.username)}</div>
                        ${user.is_banned ? '<span style="color: var(--neon-pink); font-size: 0.85rem;">🚫 BANNED</span>' : ''}
                    </td>
                    <td>${this.escapeHtml(user.email)}</td>
                    <td>
                        <span style="
                            padding: 0.25rem 0.75rem;
                            border: 2px solid ${this.getTierColor(user.subscription_tier)};
                            color: ${this.getTierColor(user.subscription_tier)};
                            font-size: 0.85rem;
                            font-weight: bold;
                        ">
                            ${user.subscription_tier.toUpperCase()}
                        </span>
                    </td>
                    <td>
                        <span style="
                            padding: 0.25rem 0.75rem;
                            border: 2px solid ${this.getRoleColor(user.role)};
                            color: ${this.getRoleColor(user.role)};
                            font-size: 0.85rem;
                            font-weight: bold;
                        ">
                            ${user.role.toUpperCase()}
                        </span>
                    </td>
                    <td>
                        <div>${user.tokens_used.toLocaleString()} / ${user.tokens_limit === -1 ? '∞' : user.tokens_limit.toLocaleString()}</div>
                        ${user.tokens_limit > 0 ? `<div style="font-size: 0.85rem; color: #666;">${tokenPercentage}%</div>` : ''}
                    </td>
                    <td>${createdDate}</td>
                    <td>
                        <button onclick="AdminDashboard.viewUserDetails('${user.id}')" class="action-btn">
                            👁️ VIEW
                        </button>
                        ${!user.is_banned
                            ? `<button onclick="AdminDashboard.banUser('${user.id}')" class="action-btn danger">🚫 BAN</button>`
                            : `<button onclick="AdminDashboard.unbanUser('${user.id}')" class="action-btn">✅ UNBAN</button>`
                        }
                    </td>
                </tr>
            `;
        }).join('');
    },

    // Get tier color
    getTierColor: function(tier) {
        const colors = {
            'basic': 'var(--cyber-cyan)',
            'premium': 'var(--kintsugi-gold)',
            'unlimited': 'var(--electric-purple)'
        };
        return colors[tier] || 'var(--cyber-cyan)';
    },

    // Get role color
    getRoleColor: function(role) {
        const colors = {
            'user': '#666',
            'admin': 'var(--kintsugi-gold)',
            'superadmin': 'var(--neon-pink)'
        };
        return colors[role] || '#666';
    },

    // View user details
    viewUserDetails: async function(userId) {
        try {
            const token = getToken();
            if (!token) return;

            const [userResponse, activityResponse] = await Promise.all([
                fetch(`${API_URL}/admin/users/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_URL}/admin/users/${userId}/activity`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (!userResponse.ok || !activityResponse.ok) {
                throw new Error('Failed to load user details');
            }

            const user = await userResponse.json();
            const activity = await activityResponse.json();

            this.showUserDetailsModal(user, activity);
        } catch (error) {
            console.error('[ADMIN] View user details error:', error);
            this.showError('Failed to load user details');
        }
    },

    // Show user details modal
    showUserDetailsModal: function(user, activity) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content border-3 border-purple" style="max-width: 800px; background: var(--digital-black); padding: 2rem; max-height: 90vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h3 class="text-purple text-neon" style="font-size: 1.75rem;">USER DETAILS</h3>
                    <button onclick="AdminDashboard.closeModal()" style="background: none; border: none; color: var(--neon-pink); cursor: pointer; font-size: 1.5rem;">✕</button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
                    <div class="border-2 border-cyan" style="padding: 1rem; background: rgba(0, 255, 255, 0.05);">
                        <div style="color: #999; font-size: 0.85rem; margin-bottom: 0.25rem;">USERNAME</div>
                        <div style="color: var(--cyber-cyan); font-size: 1.25rem; font-weight: bold;">${this.escapeHtml(user.username)}</div>
                    </div>

                    <div class="border-2 border-cyan" style="padding: 1rem; background: rgba(0, 255, 255, 0.05);">
                        <div style="color: #999; font-size: 0.85rem; margin-bottom: 0.25rem;">EMAIL</div>
                        <div style="color: var(--cyber-cyan); font-size: 1.25rem; font-weight: bold;">${this.escapeHtml(user.email)}</div>
                    </div>

                    <div class="border-2 border-gold" style="padding: 1rem; background: rgba(240, 255, 0, 0.05);">
                        <div style="color: #999; font-size: 0.85rem; margin-bottom: 0.25rem;">SUBSCRIPTION</div>
                        <div style="color: var(--kintsugi-gold); font-size: 1.25rem; font-weight: bold;">${user.subscription_tier.toUpperCase()}</div>
                    </div>

                    <div class="border-2 border-purple" style="padding: 1rem; background: rgba(157, 0, 255, 0.05);">
                        <div style="color: #999; font-size: 0.85rem; margin-bottom: 0.25rem;">ROLE</div>
                        <div style="color: var(--electric-purple); font-size: 1.25rem; font-weight: bold;">${user.role.toUpperCase()}</div>
                    </div>

                    <div class="border-2 border-cyan" style="padding: 1rem; background: rgba(0, 255, 255, 0.05);">
                        <div style="color: #999; font-size: 0.85rem; margin-bottom: 0.25rem;">TOKENS USED</div>
                        <div style="color: var(--cyber-cyan); font-size: 1.25rem; font-weight: bold;">${user.tokens_used.toLocaleString()} / ${user.tokens_limit === -1 ? '∞' : user.tokens_limit.toLocaleString()}</div>
                    </div>

                    <div class="border-2 border-cyan" style="padding: 1rem; background: rgba(0, 255, 255, 0.05);">
                        <div style="color: #999; font-size: 0.85rem; margin-bottom: 0.25rem;">STATUS</div>
                        <div style="color: ${user.is_banned ? 'var(--neon-pink)' : 'var(--matrix-green)'}; font-size: 1.25rem; font-weight: bold;">
                            ${user.is_banned ? '🚫 BANNED' : '✅ ACTIVE'}
                        </div>
                    </div>
                </div>

                <h4 class="text-gold" style="font-size: 1.25rem; margin-bottom: 1rem;">ACTIVITY</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 2rem;">
                    <div style="padding: 0.75rem; background: rgba(0, 0, 0, 0.5); border: 2px solid #333;">
                        <div style="color: #999; font-size: 0.85rem;">Total Chats</div>
                        <div style="color: #ccc; font-size: 1.5rem; font-weight: bold;">${activity.total_chats || 0}</div>
                    </div>
                    <div style="padding: 0.75rem; background: rgba(0, 0, 0, 0.5); border: 2px solid #333;">
                        <div style="color: #999; font-size: 0.85rem;">Total Messages</div>
                        <div style="color: #ccc; font-size: 1.5rem; font-weight: bold;">${activity.total_messages || 0}</div>
                    </div>
                    <div style="padding: 0.75rem; background: rgba(0, 0, 0, 0.5); border: 2px solid #333;">
                        <div style="color: #999; font-size: 0.85rem;">Code Executions</div>
                        <div style="color: #ccc; font-size: 1.5rem; font-weight: bold;">${activity.total_executions || 0}</div>
                    </div>
                    <div style="padding: 0.75rem; background: rgba(0, 0, 0, 0.5); border: 2px solid #333;">
                        <div style="color: #999; font-size: 0.85rem;">Total Tokens</div>
                        <div style="color: #ccc; font-size: 1.5rem; font-weight: bold;">${(activity.total_tokens || 0).toLocaleString()}</div>
                    </div>
                </div>

                <h4 class="text-pink" style="font-size: 1.25rem; margin-bottom: 1rem;">ADMIN ACTIONS</h4>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    <button onclick="AdminDashboard.updateUserRole('${user.id}')" class="btn btn-secondary interactive">
                        ⚡ CHANGE ROLE
                    </button>
                    <button onclick="AdminDashboard.updateUserSubscription('${user.id}')" class="btn btn-secondary interactive">
                        💎 CHANGE PLAN
                    </button>
                    <button onclick="AdminDashboard.resetUserTokens('${user.id}')" class="btn btn-secondary interactive">
                        🔄 RESET TOKENS
                    </button>
                    ${!user.is_banned
                        ? `<button onclick="AdminDashboard.banUser('${user.id}')" class="btn btn-primary interactive" style="background: var(--neon-pink); border-color: var(--neon-pink);">🚫 BAN USER</button>`
                        : `<button onclick="AdminDashboard.unbanUser('${user.id}')" class="btn btn-primary interactive">✅ UNBAN USER</button>`
                    }
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    // Update user role
    updateUserRole: async function(userId) {
        const role = prompt('Enter new role (user, admin, superadmin):');
        if (!role || !['user', 'admin', 'superadmin'].includes(role)) {
            alert('Invalid role');
            return;
        }

        try {
            const token = getToken();
            const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role })
            });

            if (!response.ok) throw new Error('Failed to update role');

            alert('Role updated successfully!');
            this.closeModal();
            this.loadAllUsers();
        } catch (error) {
            console.error('[ADMIN] Update role error:', error);
            this.showError('Failed to update role');
        }
    },

    // Update user subscription
    updateUserSubscription: async function(userId) {
        const tier = prompt('Enter new subscription tier (basic, premium, unlimited):');
        if (!tier || !['basic', 'premium', 'unlimited'].includes(tier)) {
            alert('Invalid tier');
            return;
        }

        try {
            const token = getToken();
            const response = await fetch(`${API_URL}/admin/users/${userId}/subscription`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ tier })
            });

            if (!response.ok) throw new Error('Failed to update subscription');

            alert('Subscription updated successfully!');
            this.closeModal();
            this.loadAllUsers();
        } catch (error) {
            console.error('[ADMIN] Update subscription error:', error);
            this.showError('Failed to update subscription');
        }
    },

    // Reset user tokens
    resetUserTokens: async function(userId) {
        if (!confirm('Reset this user\'s tokens to 0?')) return;

        try {
            const token = getToken();
            const response = await fetch(`${API_URL}/admin/users/${userId}/reset-tokens`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to reset tokens');

            alert('Tokens reset successfully!');
            this.closeModal();
            this.loadAllUsers();
        } catch (error) {
            console.error('[ADMIN] Reset tokens error:', error);
            this.showError('Failed to reset tokens');
        }
    },

    // Ban user
    banUser: async function(userId) {
        if (!confirm('Ban this user? They will not be able to access the platform.')) return;

        try {
            const token = getToken();
            const response = await fetch(`${API_URL}/admin/users/${userId}/ban`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to ban user');

            alert('User banned successfully!');
            this.closeModal();
            this.loadAllUsers();
        } catch (error) {
            console.error('[ADMIN] Ban user error:', error);
            this.showError('Failed to ban user');
        }
    },

    // Unban user
    unbanUser: async function(userId) {
        try {
            const token = getToken();
            const response = await fetch(`${API_URL}/admin/users/${userId}/unban`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to unban user');

            alert('User unbanned successfully!');
            this.closeModal();
            this.loadAllUsers();
        } catch (error) {
            console.error('[ADMIN] Unban user error:', error);
            this.showError('Failed to unban user');
        }
    },

    // Update pagination
    updatePagination: function() {
        const totalPages = Math.ceil(this.totalUsers / this.pageSize);
        document.getElementById('page-info').textContent = `Page ${this.currentPage} of ${totalPages}`;

        document.getElementById('prev-btn').disabled = this.currentPage === 1;
        document.getElementById('next-btn').disabled = this.currentPage >= totalPages;
    },

    // Next page
    nextPage: function() {
        this.currentPage++;
        if (this.searchQuery) {
            this.searchUsers();
        } else {
            this.loadAllUsers();
        }
    },

    // Previous page
    prevPage: function() {
        if (this.currentPage > 1) {
            this.currentPage--;
            if (this.searchQuery) {
                this.searchUsers();
            } else {
                this.loadAllUsers();
            }
        }
    },

    // Close modal
    closeModal: function() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) modal.remove();
    },

    // Escape HTML
    escapeHtml: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Show error
    showError: function(message) {
        alert('ERROR: ' + message);
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AdminDashboard.init());
} else {
    AdminDashboard.init();
}

// Global functions
window.AdminDashboard = AdminDashboard;
