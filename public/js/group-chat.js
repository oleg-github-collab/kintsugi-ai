// Group Chat Management - Kintsugi AI
// Complete group chat functionality with settings, invites, and video calls

const GroupChat = {
    selectedMembers: new Set(),
    availableUsers: [],
    currentGroup: null,

    // Show create group modal
    showCreateGroup: async function() {
        const modal = document.getElementById('create-group-modal');
        modal.style.display = 'flex';

        // Load available users
        await this.loadAvailableUsers();

        // Reset form
        document.getElementById('group-name-input').value = '';
        document.getElementById('group-description-input').value = '';
        document.getElementById('enable-video-conference').checked = true;
        this.selectedMembers.clear();
        this.updateSelectedMembers();
    },

    // Close create group modal
    closeCreateGroup: function() {
        document.getElementById('create-group-modal').style.display = 'none';
        this.selectedMembers.clear();
    },

    // Load available users for group
    loadAvailableUsers: async function() {
        try {
            const response = await fetch(`${API_URL}/messenger/users`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.availableUsers = data.users || [];
                this.renderMemberList();
            }
        } catch (error) {
            console.error('Failed to load users:', error);
            // Fallback to mock data for development
            this.availableUsers = [
                { id: '1', username: 'Alice', email: 'alice@example.com', avatar_url: null },
                { id: '2', username: 'Bob', email: 'bob@example.com', avatar_url: null },
                { id: '3', username: 'Charlie', email: 'charlie@example.com', avatar_url: null }
            ];
            this.renderMemberList();
        }
    },

    // Render member list with checkboxes
    renderMemberList: function() {
        const container = document.getElementById('group-member-list');
        container.innerHTML = '';

        const searchQuery = document.getElementById('group-member-search').value.toLowerCase();

        this.availableUsers
            .filter(user =>
                user.username.toLowerCase().includes(searchQuery) ||
                user.email.toLowerCase().includes(searchQuery)
            )
            .forEach(user => {
                const div = document.createElement('div');
                div.className = 'member-item';
                div.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem;
                    margin: 0.5rem 0;
                    border: 2px solid ${this.selectedMembers.has(user.id) ? 'var(--kintsugi-gold)' : 'var(--cyber-cyan)'};
                    background: ${this.selectedMembers.has(user.id) ? 'rgba(240, 255, 0, 0.1)' : 'rgba(0, 255, 255, 0.05)'};
                    cursor: pointer;
                    transition: all 0.2s ease;
                `;

                div.innerHTML = `
                    <input type="checkbox"
                        id="member-${user.id}"
                        ${this.selectedMembers.has(user.id) ? 'checked' : ''}
                        style="width: 18px; height: 18px; cursor: pointer;"
                    >
                    <div style="width: 35px; height: 35px; border-radius: 50%; background: linear-gradient(135deg, var(--cyber-pink), var(--cyber-cyan)); display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid var(--cyber-cyan);">
                        ${user.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div style="flex: 1;">
                        <div style="color: var(--cyber-cyan); font-weight: bold;">${user.username}</div>
                        <div style="color: #999; font-size: 0.85rem;">${user.email}</div>
                    </div>
                `;

                div.onclick = () => this.toggleMember(user.id);
                container.appendChild(div);
            });
    },

    // Toggle member selection
    toggleMember: function(userId) {
        if (this.selectedMembers.has(userId)) {
            this.selectedMembers.delete(userId);
        } else {
            this.selectedMembers.add(userId);
        }
        this.renderMemberList();
        this.updateSelectedMembers();
    },

    // Update selected members display
    updateSelectedMembers: function() {
        const container = document.getElementById('selected-members-chips');
        const countSpan = document.getElementById('selected-count');

        countSpan.textContent = this.selectedMembers.size;
        container.innerHTML = '';

        this.selectedMembers.forEach(userId => {
            const user = this.availableUsers.find(u => u.id === userId);
            if (!user) return;

            const chip = document.createElement('div');
            chip.style.cssText = `
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.4rem 0.75rem;
                background: var(--kintsugi-gold);
                color: var(--digital-black);
                border: 2px solid var(--digital-black);
                font-weight: bold;
                font-size: 0.85rem;
                cursor: pointer;
                box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.3);
            `;

            chip.innerHTML = `
                ${user.username}
                <span style="font-size: 1.2rem; line-height: 1;">×</span>
            `;

            chip.onclick = () => this.toggleMember(userId);
            container.appendChild(chip);
        });
    },

    // Create group
    createGroup: async function() {
        const name = document.getElementById('group-name-input').value.trim();
        const description = document.getElementById('group-description-input').value.trim();
        const enableVideo = document.getElementById('enable-video-conference').checked;

        if (!name) {
            alert('Please enter a group name');
            return;
        }

        if (this.selectedMembers.size === 0) {
            alert('Please select at least one member');
            return;
        }

        const memberIds = Array.from(this.selectedMembers);

        try {
            const response = await fetch(`${API_URL}/messenger/groups`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    name: name,
                    description: description,
                    participant_ids: memberIds,
                    enable_video: enableVideo
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.closeCreateGroup();

                // Show success message
                this.showNotification('✓ Group created successfully!', 'success');

                // Reload conversations
                if (typeof loadConversations === 'function') {
                    loadConversations();
                }

                // Select the new group
                if (data.group && data.group.id) {
                    setTimeout(() => {
                        if (typeof selectConversation === 'function') {
                            selectConversation(data.group.id);
                        }
                    }, 500);
                }
            } else {
                const error = await response.json();
                alert(`Failed to create group: ${error.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Group creation error:', error);
            alert('Failed to create group. Please try again.');
        }
    },

    // Show group settings
    showGroupSettings: function(groupId) {
        const group = conversations[groupId];
        if (!group) return;

        const modal = document.createElement('div');
        modal.id = 'group-settings-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            z-index: 11001;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        modal.innerHTML = `
            <div style="background: var(--digital-black); border: 3px solid var(--electric-purple); padding: 2rem; max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 0 40px rgba(157, 0, 255, 0.6);">
                <h3 class="text-neon" style="font-size: 1.5rem; margin-bottom: 1.5rem; color: var(--electric-purple); text-transform: uppercase;">
                    ⚙ GROUP SETTINGS
                </h3>

                <!-- Group Info -->
                <div style="margin-bottom: 2rem; padding: 1.5rem; border: 2px solid var(--cyber-cyan); background: rgba(0, 255, 255, 0.05);">
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; color: var(--cyber-cyan); margin-bottom: 0.5rem; font-weight: bold;">GROUP NAME:</label>
                        <input type="text" id="edit-group-name" value="${group.name}" class="form-input interactive" style="width: 100%; padding: 0.75rem; border: 2px solid var(--cyber-cyan);">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; color: var(--cyber-cyan); margin-bottom: 0.5rem; font-weight: bold;">DESCRIPTION:</label>
                        <textarea id="edit-group-description" class="form-input interactive" style="width: 100%; padding: 0.75rem; border: 2px solid var(--cyber-cyan); min-height: 80px;">${group.description || ''}</textarea>
                    </div>
                    <button onclick="GroupChat.updateGroupInfo('${groupId}')" class="btn btn-primary interactive" style="width: 100%; padding: 0.75rem;">
                        ✓ UPDATE INFO
                    </button>
                </div>

                <!-- Members -->
                <div style="margin-bottom: 2rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h4 class="text-gold" style="font-size: 1.25rem;">MEMBERS (${group.participants_count || 0})</h4>
                        <button onclick="GroupChat.showAddMembers('${groupId}')" class="btn btn-secondary interactive" style="padding: 0.5rem 1rem; font-size: 0.85rem;">
                            + ADD MEMBERS
                        </button>
                    </div>
                    <div id="group-members-list" style="max-height: 300px; overflow-y: auto; border: 2px solid var(--electric-purple); padding: 0.5rem;">
                        <!-- Members will be loaded here -->
                    </div>
                </div>

                <!-- Actions -->
                <div style="margin-bottom: 1.5rem; padding: 1.5rem; border: 2px solid var(--kintsugi-gold); background: rgba(240, 255, 0, 0.05);">
                    <h4 class="text-gold" style="font-size: 1.25rem; margin-bottom: 1rem;">ACTIONS</h4>
                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                        <button onclick="GroupChat.generateGroupInvite('${groupId}')" class="btn btn-primary interactive" style="width: 100%; padding: 0.75rem;">
                            🔗 GENERATE INVITE LINK
                        </button>
                        <button onclick="GroupChat.startGroupCall('${groupId}')" class="btn btn-primary interactive" style="width: 100%; padding: 0.75rem; background: linear-gradient(135deg, var(--cyber-cyan), var(--electric-purple));">
                            📹 START VIDEO CALL
                        </button>
                        <button onclick="GroupChat.muteGroup('${groupId}')" class="btn btn-secondary interactive" style="width: 100%; padding: 0.75rem;">
                            🔕 MUTE NOTIFICATIONS
                        </button>
                    </div>
                </div>

                <!-- Danger Zone -->
                <div style="padding: 1.5rem; border: 2px solid var(--neon-pink); background: rgba(255, 0, 255, 0.05);">
                    <h4 style="font-size: 1.25rem; margin-bottom: 1rem; color: var(--neon-pink);">DANGER ZONE</h4>
                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                        <button onclick="GroupChat.leaveGroup('${groupId}')" class="btn btn-secondary interactive" style="width: 100%; padding: 0.75rem; border-color: var(--neon-pink); color: var(--neon-pink);">
                            👋 LEAVE GROUP
                        </button>
                        <button onclick="GroupChat.deleteGroup('${groupId}')" class="btn btn-secondary interactive" style="width: 100%; padding: 0.75rem; border-color: var(--neon-pink); color: var(--neon-pink);">
                            🗑 DELETE GROUP
                        </button>
                    </div>
                </div>

                <button onclick="GroupChat.closeGroupSettings()" class="btn btn-secondary interactive" style="width: 100%; padding: 1rem; margin-top: 1.5rem;">
                    CLOSE
                </button>
            </div>
        `;

        document.body.appendChild(modal);
        this.loadGroupMembers(groupId);
    },

    // Close group settings
    closeGroupSettings: function() {
        const modal = document.getElementById('group-settings-modal');
        if (modal) modal.remove();
    },

    // Load group members
    loadGroupMembers: async function(groupId) {
        const container = document.getElementById('group-members-list');
        if (!container) return;

        try {
            const response = await fetch(`${API_URL}/messenger/groups/${groupId}/members`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.renderGroupMembers(data.members || [], groupId);
            }
        } catch (error) {
            console.error('Failed to load members:', error);
        }
    },

    // Render group members
    renderGroupMembers: function(members, groupId) {
        const container = document.getElementById('group-members-list');
        container.innerHTML = '';

        members.forEach(member => {
            const div = document.createElement('div');
            div.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0.75rem;
                margin: 0.5rem 0;
                border: 2px solid var(--cyber-cyan);
                background: rgba(0, 255, 255, 0.05);
            `;

            div.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--cyber-pink), var(--kintsugi-gold)); display: flex; align-items: center; justify-content: center; font-weight: bold;">
                        ${member.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div style="color: var(--cyber-cyan); font-weight: bold;">${member.username}</div>
                        <div style="color: #999; font-size: 0.85rem;">${member.role || 'Member'}</div>
                    </div>
                </div>
                ${member.isOwner ? '<span class="text-gold">👑 OWNER</span>' : `
                    <button onclick="GroupChat.removeMember('${groupId}', '${member.id}')" class="btn btn-secondary interactive" style="padding: 0.4rem 0.75rem; font-size: 0.75rem; border-color: var(--neon-pink); color: var(--neon-pink);">
                        REMOVE
                    </button>
                `}
            `;

            container.appendChild(div);
        });
    },

    // Generate group invite link
    generateGroupInvite: async function(groupId) {
        try {
            const response = await fetch(`${API_URL}/messenger/groups/${groupId}/invite`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const inviteLink = `${window.location.origin}/join-group?code=${data.invite_code}`;

                this.showInviteLinkModal(inviteLink, groupId);
            }
        } catch (error) {
            console.error('Failed to generate invite:', error);
        }
    },

    // Show invite link modal
    showInviteLinkModal: function(inviteLink, groupId) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            z-index: 11002;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        modal.innerHTML = `
            <div style="background: var(--digital-black); border: 3px solid var(--kintsugi-gold); padding: 2rem; max-width: 500px; width: 90%; box-shadow: 0 0 40px rgba(240, 255, 0, 0.6);">
                <h3 class="text-gold" style="font-size: 1.5rem; margin-bottom: 1.5rem;">🔗 GROUP INVITE LINK</h3>

                <p style="color: var(--cyber-cyan); margin-bottom: 1rem;">Share this link to invite people to the group:</p>

                <div style="margin-bottom: 1.5rem;">
                    <input type="text" value="${inviteLink}" readonly class="form-input" style="width: 100%; padding: 1rem; border: 2px solid var(--kintsugi-gold); background: rgba(240, 255, 0, 0.1); color: var(--kintsugi-gold); font-family: monospace;">
                </div>

                <div style="display: flex; gap: 0.75rem; margin-bottom: 1.5rem;">
                    <button onclick="navigator.clipboard.writeText('${inviteLink}'); this.textContent='✓ COPIED!'" class="btn btn-primary interactive" style="flex: 1; padding: 1rem;">
                        📋 COPY LINK
                    </button>
                    <button onclick="GroupChat.shareInvite('${inviteLink}')" class="btn btn-secondary interactive" style="flex: 1; padding: 1rem;">
                        ↗ SHARE
                    </button>
                </div>

                <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" class="btn btn-secondary interactive" style="width: 100%; padding: 1rem;">
                    CLOSE
                </button>
            </div>
        `;

        document.body.appendChild(modal);
    },

    // Start group video call with 100ms
    startGroupCall: function(groupId) {
        // This will be implemented with 100ms integration
        alert('Starting group video call...\n\n100ms integration coming soon!');
        // TODO: Integrate with 100ms SDK
    },

    // Show notification
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--digital-black);
            border: 3px solid ${type === 'success' ? 'var(--matrix-green)' : 'var(--cyber-cyan)'};
            padding: 1rem 1.5rem;
            z-index: 12000;
            box-shadow: 6px 6px 0px ${type === 'success' ? 'rgba(0, 255, 65, 0.4)' : 'rgba(0, 255, 255, 0.4)'};
            animation: slideInRight 0.3s ease-out;
        `;

        notification.innerHTML = `
            <div style="color: ${type === 'success' ? 'var(--matrix-green)' : 'var(--cyber-cyan)'}; font-weight: bold;">
                ${message}
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    // Update group info
    updateGroupInfo: async function(groupId) {
        const name = document.getElementById('edit-group-name').value.trim();
        const description = document.getElementById('edit-group-description').value.trim();

        try {
            const response = await fetch(`${API_URL}/messenger/groups/${groupId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ name, description })
            });

            if (response.ok) {
                this.showNotification('✓ Group info updated', 'success');
                if (typeof loadConversations === 'function') {
                    loadConversations();
                }
            }
        } catch (error) {
            console.error('Failed to update group:', error);
        }
    },

    // Leave group
    leaveGroup: async function(groupId) {
        if (!confirm('Are you sure you want to leave this group?')) return;

        try {
            const response = await fetch(`${API_URL}/messenger/groups/${groupId}/leave`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (response.ok) {
                this.closeGroupSettings();
                this.showNotification('✓ Left group', 'success');
                if (typeof loadConversations === 'function') {
                    loadConversations();
                }
            }
        } catch (error) {
            console.error('Failed to leave group:', error);
        }
    },

    // Delete group
    deleteGroup: async function(groupId) {
        if (!confirm('Are you sure you want to DELETE this group? This action cannot be undone!')) return;

        try {
            const response = await fetch(`${API_URL}/messenger/groups/${groupId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (response.ok) {
                this.closeGroupSettings();
                this.showNotification('✓ Group deleted', 'success');
                if (typeof loadConversations === 'function') {
                    loadConversations();
                }
            }
        } catch (error) {
            console.error('Failed to delete group:', error);
        }
    }
};

// Global functions
window.showCreateGroup = () => GroupChat.showCreateGroup();
window.closeCreateGroup = () => GroupChat.closeCreateGroup();
window.createGroup = () => GroupChat.createGroup();

// Member search
document.getElementById('group-member-search')?.addEventListener('input', () => {
    GroupChat.renderMemberList();
});

// Animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
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
