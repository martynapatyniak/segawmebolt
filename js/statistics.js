/**
 * Statistics System for IPS Chat
 * Handles user statistics, top users, and message counts
 */

class StatisticsSystem {
    constructor(chatInstance) {
        this.chat = chatInstance;
        this.isEnabled = ConfigUtils.get('features.enableStatistics', true);
        
        this.stats = {
            totalMessages: 0,
            todayMessages: 0,
            thisMonthMessages: 0,
            userStats: new Map(),
            dailyStats: new Map()
        };
        
        this.topUsersCount = ConfigUtils.get('statistics.topUsersCount', 4);
        this.showTopUsers = false; // Wyłączamy tworzenie sekcji w głównym obszarze
        
        this.init();
    }

    init() {
        if (!this.isEnabled) return;
        
        this.loadStatistics();
        this.createStatisticsUI();
        this.bindEvents();
        this.startPeriodicSave();
    }

    createStatisticsUI() {
        // Create top users section
        if (this.showTopUsers) {
            this.createTopUsersSection();
        }
        
        // Create statistics modal
        this.createStatisticsModal();
        
        // Add statistics button to chat tools
        this.addStatisticsButton();
    }

    createTopUsersSection() {
        const chatContainer = document.querySelector('.chat-container');
        if (!chatContainer) return;

        const topUsersSection = document.createElement('div');
        topUsersSection.className = 'top-users-section';
        topUsersSection.innerHTML = `
            <div class="top-users-header">
                <h4>🏆 Top użytkownicy</h4>
                <button class="toggle-stats-btn" onclick="statisticsSystem.toggleTopUsers()">
                    <span class="toggle-icon">▼</span>
                </button>
            </div>
            <div class="top-users-list" id="top-users-list">
                <div class="loading">Ładowanie statystyk...</div>
            </div>
        `;
        
        chatContainer.appendChild(topUsersSection);
        this.topUsersElement = topUsersSection;
        
        this.updateTopUsers();
    }

    createStatisticsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal statistics-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📊 Statystyki chatu</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number" id="total-messages">0</div>
                            <div class="stat-label">Wszystkich wiadomości</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" id="today-messages">0</div>
                            <div class="stat-label">Wiadomości dzisiaj</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" id="month-messages">0</div>
                            <div class="stat-label">Wiadomości w tym miesiącu</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" id="active-users">0</div>
                            <div class="stat-label">Aktywni użytkownicy</div>
                        </div>
                    </div>
                    
                    <div class="detailed-stats">
                        <h4>📈 Szczegółowe statystyki</h4>
                        <div class="user-stats-list" id="detailed-user-stats">
                            <!-- User statistics will be populated here -->
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="statisticsSystem.closeModal()">Zamknij</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.modal = modal;
    }

    addStatisticsButton() {
        const chatTools = document.querySelector('.chat-tools');
        if (chatTools) {
            const statsBtn = document.createElement('button');
            statsBtn.className = 'chat-tool-btn statistics-btn';
            statsBtn.innerHTML = '📊';
            statsBtn.title = 'Statystyki chatu';
            statsBtn.onclick = () => this.showStatistics();
            chatTools.appendChild(statsBtn);
        }
    }

    bindEvents() {
        // Listen for new messages
        document.addEventListener('messageAdded', (e) => {
            this.recordMessage(e.detail.message);
        });

        // Listen for user activity
        document.addEventListener('userActivity', (e) => {
            this.recordUserActivity(e.detail.userId);
        });
    }

    recordMessage(message) {
        if (message.type !== 'user') return;

        const today = this.getTodayKey();
        const month = this.getMonthKey();
        const userId = message.userId || message.author;

        // Update total stats
        this.stats.totalMessages++;
        this.stats.todayMessages++;
        this.stats.thisMonthMessages++;

        // Update user stats
        if (!this.stats.userStats.has(userId)) {
            this.stats.userStats.set(userId, {
                nickname: message.nickname || message.author,
                totalMessages: 0,
                todayMessages: 0,
                thisMonthMessages: 0,
                lastActivity: Date.now(),
                avatar: message.avatar || null,
                rank: message.rank || null
            });
        }

        const userStat = this.stats.userStats.get(userId);
        userStat.totalMessages++;
        userStat.todayMessages++;
        userStat.thisMonthMessages++;
        userStat.lastActivity = Date.now();

        // Update daily stats
        if (!this.stats.dailyStats.has(today)) {
            this.stats.dailyStats.set(today, 0);
        }
        this.stats.dailyStats.set(today, this.stats.dailyStats.get(today) + 1);

        // Update UI
        this.updateTopUsers();
        this.saveStatistics();
    }

    recordUserActivity(userId) {
        if (this.stats.userStats.has(userId)) {
            this.stats.userStats.get(userId).lastActivity = Date.now();
        }
    }

    updateTopUsers() {
        if (!this.showTopUsers || !this.topUsersElement) return;

        const topUsersList = document.getElementById('top-users-list');
        if (!topUsersList) return;

        // Get top users by total messages
        const sortedUsers = Array.from(this.stats.userStats.entries())
            .sort(([,a], [,b]) => b.totalMessages - a.totalMessages)
            .slice(0, this.topUsersCount);

        if (sortedUsers.length === 0) {
            topUsersList.innerHTML = '<div class="no-stats">Brak danych statystycznych</div>';
            return;
        }

        topUsersList.innerHTML = sortedUsers.map(([userId, stats], index) => `
            <div class="top-user-item">
                <div class="user-rank">${index + 1}</div>
                <div class="user-avatar">
                    ${stats.avatar ? `<img src="${stats.avatar}" alt="${stats.nickname}">` : 
                      `<div class="avatar-placeholder">${stats.nickname.charAt(0).toUpperCase()}</div>`}
                </div>
                <div class="user-info">
                    <div class="user-nickname">${this.escapeHtml(stats.nickname)}</div>
                    <div class="user-messages">${stats.totalMessages} wiadomości</div>
                </div>
                ${stats.rank ? `<div class="user-rank-badge">${stats.rank}</div>` : ''}
            </div>
        `).join('');
    }

    showStatistics() {
        this.updateStatisticsModal();
        this.modal.style.display = 'block';
    }

    updateStatisticsModal() {
        // Update main stats
        document.getElementById('total-messages').textContent = this.stats.totalMessages;
        document.getElementById('today-messages').textContent = this.stats.todayMessages;
        document.getElementById('month-messages').textContent = this.stats.thisMonthMessages;
        document.getElementById('active-users').textContent = this.stats.userStats.size;

        // Update detailed user stats
        const detailedStats = document.getElementById('detailed-user-stats');
        const sortedUsers = Array.from(this.stats.userStats.entries())
            .sort(([,a], [,b]) => b.totalMessages - a.totalMessages);

        detailedStats.innerHTML = sortedUsers.map(([userId, stats]) => `
            <div class="detailed-user-stat">
                <div class="user-info">
                    <div class="user-avatar">
                        ${stats.avatar ? `<img src="${stats.avatar}" alt="${stats.nickname}">` : 
                          `<div class="avatar-placeholder">${stats.nickname.charAt(0).toUpperCase()}</div>`}
                    </div>
                    <div class="user-details">
                        <div class="user-nickname">${this.escapeHtml(stats.nickname)}</div>
                        ${stats.rank ? `<div class="user-rank">${stats.rank}</div>` : ''}
                    </div>
                </div>
                <div class="user-stats-numbers">
                    <div class="stat-item">
                        <span class="stat-value">${stats.totalMessages}</span>
                        <span class="stat-label">Ogółem</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${stats.todayMessages}</span>
                        <span class="stat-label">Dzisiaj</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${stats.thisMonthMessages}</span>
                        <span class="stat-label">Ten miesiąc</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    toggleTopUsers() {
        const topUsersList = document.getElementById('top-users-list');
        const toggleIcon = document.querySelector('.toggle-stats-btn .toggle-icon');
        
        if (topUsersList.style.display === 'none') {
            topUsersList.style.display = 'block';
            toggleIcon.textContent = '▼';
        } else {
            topUsersList.style.display = 'none';
            toggleIcon.textContent = '▶';
        }
    }

    closeModal() {
        this.modal.style.display = 'none';
    }

    resetDailyStats() {
        const today = this.getTodayKey();
        const yesterday = this.getYesterdayKey();
        
        // Reset today's counters if it's a new day
        if (!this.stats.dailyStats.has(today)) {
            this.stats.todayMessages = 0;
            this.stats.userStats.forEach(userStat => {
                userStat.todayMessages = 0;
            });
        }
    }

    resetMonthlyStats() {
        const currentMonth = this.getMonthKey();
        const lastMonth = this.getLastMonthKey();
        
        // Reset monthly counters if it's a new month
        if (this.lastKnownMonth && this.lastKnownMonth !== currentMonth) {
            this.stats.thisMonthMessages = 0;
            this.stats.userStats.forEach(userStat => {
                userStat.thisMonthMessages = 0;
            });
        }
        
        this.lastKnownMonth = currentMonth;
    }

    getTodayKey() {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }

    getYesterdayKey() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    }

    getMonthKey() {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    }

    getLastMonthKey() {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
    }

    loadStatistics() {
        try {
            const savedStats = localStorage.getItem('ips-chat-statistics');
            if (savedStats) {
                const parsed = JSON.parse(savedStats);
                this.stats.totalMessages = parsed.totalMessages || 0;
                this.stats.todayMessages = parsed.todayMessages || 0;
                this.stats.thisMonthMessages = parsed.thisMonthMessages || 0;
                
                // Convert user stats back to Map
                if (parsed.userStats) {
                    this.stats.userStats = new Map(parsed.userStats);
                }
                
                // Convert daily stats back to Map
                if (parsed.dailyStats) {
                    this.stats.dailyStats = new Map(parsed.dailyStats);
                }
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
        
        // Reset counters if needed
        this.resetDailyStats();
        this.resetMonthlyStats();
    }

    saveStatistics() {
        try {
            const statsToSave = {
                totalMessages: this.stats.totalMessages,
                todayMessages: this.stats.todayMessages,
                thisMonthMessages: this.stats.thisMonthMessages,
                userStats: Array.from(this.stats.userStats.entries()),
                dailyStats: Array.from(this.stats.dailyStats.entries()),
                lastSaved: Date.now()
            };
            
            localStorage.setItem('ips-chat-statistics', JSON.stringify(statsToSave));
        } catch (error) {
            console.error('Error saving statistics:', error);
        }
    }

    startPeriodicSave() {
        // Save statistics every 5 minutes
        setInterval(() => {
            this.saveStatistics();
        }, 5 * 60 * 1000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Public API methods
    getUserStats(userId) {
        return this.stats.userStats.get(userId) || null;
    }

    getTotalMessages() {
        return this.stats.totalMessages;
    }

    getTodayMessages() {
        return this.stats.todayMessages;
    }

    getTopUsers(count = 10) {
        return Array.from(this.stats.userStats.entries())
            .sort(([,a], [,b]) => b.totalMessages - a.totalMessages)
            .slice(0, count);
    }
}

// Export for use in main.js
window.StatisticsSystem = StatisticsSystem;