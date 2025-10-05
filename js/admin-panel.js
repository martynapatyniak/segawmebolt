/**
 * Admin Panel System for IPS Chat
 * Comprehensive administration interface for chat management
 */

class AdminPanelSystem {
    constructor(chatInstance) {
        this.chat = chatInstance;
        this.isVisible = false;
        this.currentSection = 'dashboard';
        
        this.sections = {
            dashboard: 'Dashboard',
            users: 'Zarządzanie użytkownikami',
            ranks: 'System rang',
            rooms: 'Pokoje',
            messages: 'Moderacja wiadomości',
            settings: 'Ustawienia chatu',
            logs: 'Logi systemowe',
            statistics: 'Statystyki'
        };
        
        this.init();
    }

    init() {
        this.createAdminPanel();
        this.bindEvents();
        this.loadAdminData();
    }

    createAdminPanel() {
        // Check if admin panel already exists
        if (document.getElementById('admin-panel')) {
            // Panel already exists in HTML, just add admin button
            this.addAdminButton();
            return;
        }
        
        // Create admin panel container
        const panel = document.createElement('div');
        panel.id = 'admin-panel';
        panel.className = 'admin-panel';
        panel.style.display = 'none';
        
        panel.innerHTML = `
            <div class="admin-panel-overlay"></div>
            <div class="admin-panel-content">
                <div class="admin-panel-header">
                    <h2>🛡️ Panel Administratora</h2>
                    <button class="admin-close-btn">✕</button>
                </div>
                
                <div class="admin-panel-body">
                    <div class="admin-sidebar">
                        <nav class="admin-nav">
                            ${this.createNavigation()}
                        </nav>
                    </div>
                    
                    <div class="admin-main">
                        <div class="admin-content">
                            ${this.createDashboard()}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Add admin button to chat header if user has admin permissions
        this.addAdminButton();
    }

    createNavigation() {
        return Object.entries(this.sections).map(([key, label]) => `
            <button class="admin-nav-btn ${key === 'dashboard' ? 'active' : ''}" data-section="${key}">
                ${this.getSectionIcon(key)} ${label}
            </button>
        `).join('');
    }

    getSectionIcon(section) {
        const icons = {
            dashboard: '📊',
            users: '👥',
            ranks: '🏆',
            rooms: '🏠',
            messages: '💬',
            settings: '⚙️',
            logs: '📋',
            statistics: '📈'
        };
        return icons[section] || '📄';
    }

    createDashboard() {
        return `
            <div class="admin-section" data-section="dashboard">
                <h3>Dashboard</h3>
                <div class="admin-stats-grid">
                    <div class="admin-stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-info">
                            <div class="stat-number" id="total-users">0</div>
                            <div class="stat-label">Użytkownicy online</div>
                        </div>
                    </div>
                    
                    <div class="admin-stat-card">
                        <div class="stat-icon">💬</div>
                        <div class="stat-info">
                            <div class="stat-number" id="total-messages">0</div>
                            <div class="stat-label">Wiadomości dzisiaj</div>
                        </div>
                    </div>
                    
                    <div class="admin-stat-card">
                        <div class="stat-icon">🏠</div>
                        <div class="stat-info">
                            <div class="stat-number" id="total-rooms">0</div>
                            <div class="stat-label">Aktywne pokoje</div>
                        </div>
                    </div>
                    
                    <div class="admin-stat-card">
                        <div class="stat-icon">⚠️</div>
                        <div class="stat-info">
                            <div class="stat-number" id="total-reports">0</div>
                            <div class="stat-label">Zgłoszenia</div>
                        </div>
                    </div>
                </div>
                
                <div class="admin-recent-activity">
                    <h4>Ostatnia aktywność</h4>
                    <div class="activity-list" id="recent-activity">
                        <!-- Activity items will be populated here -->
                    </div>
                </div>
            </div>
            
            <div class="admin-section" data-section="users" style="display: none;">
                <h3>Zarządzanie użytkownikami</h3>
                <div class="admin-toolbar">
                    <input type="text" id="user-search" placeholder="Szukaj użytkownika..." class="admin-search">
                    <select id="user-filter" class="admin-filter">
                        <option value="all">Wszyscy użytkownicy</option>
                        <option value="online">Online</option>
                        <option value="banned">Zbanowani</option>
                        <option value="muted">Wyciszeni</option>
                    </select>
                </div>
                
                <div class="users-table-container">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Użytkownik</th>
                                <th>Ranga</th>
                                <th>Status</th>
                                <th>Ostatnia aktywność</th>
                                <th>Akcje</th>
                            </tr>
                        </thead>
                        <tbody id="users-table-body">
                            <!-- Users will be populated here -->
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="admin-section" data-section="ranks" style="display: none;">
                <h3>System rang</h3>
                <div class="admin-toolbar">
                    <button class="admin-btn primary" id="create-rank-btn">Utwórz nową rangę</button>
                    <button class="admin-btn secondary" id="import-ranks-btn">Importuj rangi</button>
                    <button class="admin-btn secondary" id="export-ranks-btn">Eksportuj rangi</button>
                </div>
                
                <div class="ranks-grid" id="ranks-grid">
                    <!-- Ranks will be populated here -->
                </div>
            </div>
            
            <div class="admin-section" data-section="rooms" style="display: none;">
                <h3>Zarządzanie pokojami</h3>
                <div class="admin-toolbar">
                    <button class="admin-btn primary" id="create-room-btn">Utwórz pokój</button>
                    <select id="room-filter" class="admin-filter">
                        <option value="all">Wszystkie pokoje</option>
                        <option value="public">Publiczne</option>
                        <option value="private">Prywatne</option>
                        <option value="vip">VIP</option>
                    </select>
                </div>
                
                <div class="rooms-grid" id="rooms-grid">
                    <!-- Rooms will be populated here -->
                </div>
            </div>
            
            <div class="admin-section" data-section="messages" style="display: none;">
                <h3>Moderacja wiadomości</h3>
                <div class="admin-toolbar">
                    <input type="text" id="message-search" placeholder="Szukaj w wiadomościach..." class="admin-search">
                    <select id="message-filter" class="admin-filter">
                        <option value="all">Wszystkie</option>
                        <option value="reported">Zgłoszone</option>
                        <option value="deleted">Usunięte</option>
                        <option value="flagged">Oznaczone</option>
                    </select>
                </div>
                
                <div class="messages-list" id="admin-messages-list">
                    <!-- Messages will be populated here -->
                </div>
            </div>
            
            <div class="admin-section" data-section="settings" style="display: none;">
                <h3>Ustawienia chatu</h3>
                <div class="settings-grid">
                    <div class="settings-group">
                        <h4>Ogólne</h4>
                        <div class="setting-item">
                            <label>Nazwa chatu</label>
                            <input type="text" id="chat-name" value="IPS Chat">
                        </div>
                        <div class="setting-item">
                            <label>Maksymalna liczba użytkowników</label>
                            <input type="number" id="max-users" value="100">
                        </div>
                        <div class="setting-item">
                            <label>Dozwolone formaty plików</label>
                            <input type="text" id="allowed-files" value="jpg,png,gif,pdf,txt">
                        </div>
                    </div>
                    
                    <div class="settings-group">
                        <h4>Moderacja</h4>
                        <div class="setting-item">
                            <label>
                                <input type="checkbox" id="auto-moderation"> Automatyczna moderacja
                            </label>
                        </div>
                        <div class="setting-item">
                            <label>
                                <input type="checkbox" id="word-filter"> Filtr słów
                            </label>
                        </div>
                        <div class="setting-item">
                            <label>
                                <input type="checkbox" id="link-filter"> Filtr linków
                            </label>
                        </div>
                    </div>
                    
                    <div class="settings-group">
                        <h4>Limity</h4>
                        <div class="setting-item">
                            <label>Maksymalna długość wiadomości</label>
                            <input type="number" id="max-message-length" value="500">
                        </div>
                        <div class="setting-item">
                            <label>Maksymalny rozmiar pliku (MB)</label>
                            <input type="number" id="max-file-size" value="10">
                        </div>
                        <div class="setting-item">
                            <label>Limit wiadomości na minutę</label>
                            <input type="number" id="message-rate-limit" value="10">
                        </div>
                    </div>
                </div>
                
                <div class="settings-actions">
                    <button class="admin-btn primary" id="save-settings-btn">Zapisz ustawienia</button>
                    <button class="admin-btn secondary" id="reset-settings-btn">Przywróć domyślne</button>
                </div>
            </div>
            
            <div class="admin-section" data-section="logs" style="display: none;">
                <h3>Logi systemowe</h3>
                <div class="admin-toolbar">
                    <select id="log-level" class="admin-filter">
                        <option value="all">Wszystkie</option>
                        <option value="info">Info</option>
                        <option value="warning">Ostrzeżenia</option>
                        <option value="error">Błędy</option>
                    </select>
                    <button class="admin-btn secondary" id="clear-logs-btn">Wyczyść logi</button>
                    <button class="admin-btn secondary" id="export-logs-btn">Eksportuj logi</button>
                </div>
                
                <div class="logs-container" id="logs-container">
                    <!-- Logs will be populated here -->
                </div>
            </div>
            
            <div class="admin-section" data-section="statistics" style="display: none;">
                <h3>Statystyki</h3>
                <div class="stats-period">
                    <button class="period-btn active" data-period="today">Dzisiaj</button>
                    <button class="period-btn" data-period="week">Tydzień</button>
                    <button class="period-btn" data-period="month">Miesiąc</button>
                </div>
                
                <div class="charts-container">
                    <div class="chart-card">
                        <h4>Aktywność użytkowników</h4>
                        <canvas id="users-chart"></canvas>
                    </div>
                    
                    <div class="chart-card">
                        <h4>Wiadomości</h4>
                        <canvas id="messages-chart"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    addAdminButton() {
        // Check if user has admin permissions
        if (!this.chat.hasPermission || !this.chat.hasPermission('adminPanel')) {
            return;
        }
        
        const chatHeader = document.querySelector('.chat-header');
        if (chatHeader) {
            const adminBtn = document.createElement('button');
            if (adminBtn) {
                adminBtn.className = 'admin-panel-btn';
                adminBtn.innerHTML = '🛡️';
                adminBtn.title = 'Panel Administratora';
                adminBtn.onclick = () => this.show();
                
                chatHeader.appendChild(adminBtn);
            }
        }
    }

    bindEvents() {
        const panel = document.getElementById('admin-panel');
        if (!panel) return;
        
        // Close button
        const closeBtn = panel.querySelector('.admin-close-btn');
        if (closeBtn) {
            closeBtn.onclick = () => this.hide();
        }
        
        // Overlay click to close
        const overlay = panel.querySelector('.admin-panel-overlay');
        if (overlay) {
            overlay.onclick = () => this.hide();
        }
        
        // Navigation
        panel.querySelectorAll('.admin-nav-btn').forEach(btn => {
            btn.onclick = () => this.showSection(btn.dataset.section);
        });
        
        // Settings save button
        const saveBtn = panel.querySelector('#save-settings-btn');
        if (saveBtn) {
            saveBtn.onclick = () => this.saveSettings();
        }
        
        // User search
        const userSearch = panel.querySelector('#user-search');
        if (userSearch) {
            userSearch.oninput = () => this.filterUsers();
        }
        
        // Message search
        const messageSearch = panel.querySelector('#message-search');
        if (messageSearch) {
            messageSearch.oninput = () => this.filterMessages();
        }
        
        // Create rank button
        const createRankBtn = panel.querySelector('#create-rank-btn');
        if (createRankBtn) {
            createRankBtn.onclick = () => this.showCreateRankModal();
        }
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    show() {
        const panel = document.getElementById('admin-panel');
        if (panel) {
            panel.style.display = 'flex';
            this.isVisible = true;
            this.refreshData();
        }
    }

    hide() {
        const panel = document.getElementById('admin-panel');
        if (panel) {
            panel.style.display = 'none';
            this.isVisible = false;
        }
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.admin-nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === sectionName);
        });
        
        // Update content
        document.querySelectorAll('.admin-section').forEach(section => {
            section.style.display = section.dataset.section === sectionName ? 'block' : 'none';
        });
        
        this.currentSection = sectionName;
        this.loadSectionData(sectionName);
    }

    loadAdminData() {
        this.updateDashboardStats();
        this.loadRecentActivity();
    }

    loadSectionData(section) {
        switch (section) {
            case 'users':
                this.loadUsersData();
                break;
            case 'ranks':
                this.loadRanksData();
                break;
            case 'rooms':
                this.loadRoomsData();
                break;
            case 'messages':
                this.loadMessagesData();
                break;
            case 'logs':
                this.loadLogsData();
                break;
            case 'statistics':
                this.loadStatisticsData();
                break;
        }
    }

    updateDashboardStats() {
        // Update stats from chat data
        const stats = {
            totalUsers: this.chat.users ? this.chat.users.size : 0,
            totalMessages: this.chat.stats ? this.chat.stats.messagesCount : 0,
            totalRooms: this.chat.rooms ? this.chat.rooms.size : 0,
            totalReports: 0 // Would be loaded from reports system
        };
        
        const totalUsersEl = document.getElementById('total-users');
        const totalMessagesEl = document.getElementById('total-messages');
        const totalRoomsEl = document.getElementById('total-rooms');
        const totalReportsEl = document.getElementById('total-reports');
        
        if (totalUsersEl) totalUsersEl.textContent = stats.totalUsers;
        if (totalMessagesEl) totalMessagesEl.textContent = stats.totalMessages;
        if (totalRoomsEl) totalRoomsEl.textContent = stats.totalRooms;
        if (totalReportsEl) totalReportsEl.textContent = stats.totalReports;
    }

    loadRecentActivity() {
        const activityList = document.getElementById('recent-activity');
        if (!activityList) return;
        
        // Mock recent activity data
        const activities = [
            { type: 'user_join', user: 'Jan Kowalski', time: '2 min temu' },
            { type: 'message_delete', user: 'Admin', target: 'Spam message', time: '5 min temu' },
            { type: 'user_ban', user: 'Moderator', target: 'TrollUser123', time: '10 min temu' },
            { type: 'room_create', user: 'VIPUser', target: 'Nowy pokój VIP', time: '15 min temu' }
        ];
        
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${this.getActivityIcon(activity.type)}</div>
                <div class="activity-content">
                    <div class="activity-text">${this.formatActivityText(activity)}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            user_join: '👋',
            user_leave: '👋',
            message_delete: '🗑️',
            user_ban: '🔨',
            user_unban: '✅',
            room_create: '🏠',
            room_delete: '🗑️'
        };
        return icons[type] || '📝';
    }

    formatActivityText(activity) {
        const formats = {
            user_join: `${activity.user} dołączył do chatu`,
            user_leave: `${activity.user} opuścił chat`,
            message_delete: `${activity.user} usunął wiadomość: "${activity.target}"`,
            user_ban: `${activity.user} zbanował użytkownika ${activity.target}`,
            user_unban: `${activity.user} odbanował użytkownika ${activity.target}`,
            room_create: `${activity.user} utworzył pokój "${activity.target}"`,
            room_delete: `${activity.user} usunął pokój "${activity.target}"`
        };
        return formats[activity.type] || `${activity.user} wykonał akcję`;
    }

    loadUsersData() {
        const tbody = document.getElementById('users-table-body');
        if (!tbody || !this.chat.users) return;
        
        const users = Array.from(this.chat.users.values());
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>
                    <div class="user-info">
                        <img src="${user.avatar}" alt="Avatar" class="user-avatar-small">
                        <span>${user.nick}</span>
                        <img src="https://flagcdn.com/16x12/${user.country}.png" alt="${user.country}" class="country-flag-small">
                    </div>
                </td>
                <td>
                    <span class="rank-badge ${user.rank}">${user.rank}</span>
                </td>
                <td>
                    <span class="status-badge ${user.status}">${user.status}</span>
                </td>
                <td>${new Date(user.lastActivity || Date.now()).toLocaleString('pl-PL')}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn warn" onclick="adminPanel.warnUser('${user.id}')">⚠️</button>
                        <button class="action-btn mute" onclick="adminPanel.muteUser('${user.id}')">🔇</button>
                        <button class="action-btn ban" onclick="adminPanel.banUser('${user.id}')">🔨</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    loadRanksData() {
        if (!this.chat.ranksSystem) return;
        
        const ranksGrid = document.getElementById('ranks-grid');
        if (!ranksGrid) return;
        
        const ranks = this.chat.ranksSystem.getAllRanks();
        ranksGrid.innerHTML = Object.entries(ranks).map(([id, rank]) => `
            <div class="rank-card">
                <div class="rank-header">
                    <span class="rank-name" style="color: ${rank.color}">${rank.name}</span>
                    <div class="rank-actions">
                        <button class="action-btn edit" onclick="adminPanel.editRank('${id}')">✏️</button>
                        <button class="action-btn delete" onclick="adminPanel.deleteRank('${id}')">🗑️</button>
                    </div>
                </div>
                <div class="rank-details">
                    <div class="rank-priority">Priorytet: ${rank.priority}</div>
                    <div class="rank-permissions">
                        Uprawnienia: ${Object.keys(rank.permissions).filter(p => rank.permissions[p]).length}
                    </div>
                </div>
            </div>
        `).join('');
    }

    saveSettings() {
        const settings = {
            chatName: document.getElementById('chat-name').value,
            maxUsers: parseInt(document.getElementById('max-users').value),
            allowedFiles: document.getElementById('allowed-files').value,
            autoModeration: document.getElementById('auto-moderation').checked,
            wordFilter: document.getElementById('word-filter').checked,
            linkFilter: document.getElementById('link-filter').checked,
            maxMessageLength: parseInt(document.getElementById('max-message-length').value),
            maxFileSize: parseInt(document.getElementById('max-file-size').value),
            messageRateLimit: parseInt(document.getElementById('message-rate-limit').value)
        };
        
        // Save to localStorage or send to server
        localStorage.setItem('chatSettings', JSON.stringify(settings));
        
        this.showNotification('Ustawienia zostały zapisane', 'success');
    }

    refreshData() {
        this.loadAdminData();
        if (this.currentSection !== 'dashboard') {
            this.loadSectionData(this.currentSection);
        }
    }

    showNotification(message, type = 'info') {
        // Use the advanced features notification system if available
        if (this.chat.advancedFeatures) {
            this.chat.advancedFeatures.showNotification(message, type);
        } else {
            alert(message);
        }
    }

    // User management methods
    warnUser(userId) {
        if (confirm('Czy na pewno chcesz ostrzec tego użytkownika?')) {
            const reason = prompt('Podaj powód ostrzeżenia:', 'Nieodpowiednie zachowanie');
            if (reason) {
                // Store warning data
                const warnings = JSON.parse(localStorage.getItem('userWarnings') || '{}');
                if (!warnings[userId]) warnings[userId] = [];
                
                warnings[userId].push({
                    warnedBy: this.chat.currentUser?.username || 'Admin',
                    reason: reason,
                    timestamp: Date.now()
                });
                localStorage.setItem('userWarnings', JSON.stringify(warnings));
                
                // Add to activity log
                this.addActivity('user_warn', this.chat.currentUser?.username || 'Admin', userId);
                
                this.showNotification('Użytkownik został ostrzeżony', 'warning');
                
                // Auto-ban after 3 warnings
                if (warnings[userId].length >= 3) {
                    if (confirm('Użytkownik ma już 3 ostrzeżenia. Zbanować automatycznie?')) {
                        this.banUser(userId);
                    }
                }
            }
        }
    }

    muteUser(userId) {
        if (confirm('Czy na pewno chcesz wyciszyć tego użytkownika?')) {
            const duration = prompt('Na ile minut wyciszyć użytkownika?', '10');
            if (duration && !isNaN(duration)) {
                const muteDuration = parseInt(duration) * 60 * 1000; // Convert to milliseconds
                const muteUntil = Date.now() + muteDuration;
                
                // Store mute data
                const mutedUsers = JSON.parse(localStorage.getItem('mutedUsers') || '{}');
                mutedUsers[userId] = {
                    mutedBy: this.chat.currentUser?.username || 'Admin',
                    muteUntil: muteUntil,
                    reason: 'Wyciszony przez administratora',
                    timestamp: Date.now()
                };
                localStorage.setItem('mutedUsers', JSON.stringify(mutedUsers));
                
                // Add to activity log
                this.addActivity('user_mute', this.chat.currentUser?.username || 'Admin', userId);
                
                // Update UI
                this.loadUsersData();
                this.showNotification(`Użytkownik został wyciszony na ${duration} minut`, 'info');
                
                // Auto-unmute after duration
                setTimeout(() => {
                    this.unmuteUser(userId, true);
                }, muteDuration);
            }
        }
    }

    unmuteUser(userId, auto = false) {
        const mutedUsers = JSON.parse(localStorage.getItem('mutedUsers') || '{}');
        if (mutedUsers[userId]) {
            delete mutedUsers[userId];
            localStorage.setItem('mutedUsers', JSON.stringify(mutedUsers));
            
            if (!auto) {
                this.addActivity('user_unmute', this.chat.currentUser?.username || 'Admin', userId);
                this.loadUsersData();
                this.showNotification('Użytkownik został odwyciszony', 'success');
            }
        }
    }

    banUser(userId) {
        if (confirm('Czy na pewno chcesz zbanować tego użytkownika?')) {
            const reason = prompt('Podaj powód bana:', 'Naruszenie regulaminu');
            const duration = prompt('Na ile dni zbanować? (0 = permanentnie)', '7');
            
            if (reason && duration !== null && !isNaN(duration)) {
                const banDuration = parseInt(duration) === 0 ? null : parseInt(duration) * 24 * 60 * 60 * 1000;
                const banUntil = banDuration ? Date.now() + banDuration : null;
                
                // Store ban data
                const bannedUsers = JSON.parse(localStorage.getItem('bannedUsers') || '{}');
                bannedUsers[userId] = {
                    bannedBy: this.chat.currentUser?.username || 'Admin',
                    banUntil: banUntil,
                    reason: reason,
                    timestamp: Date.now(),
                    permanent: banDuration === null
                };
                localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
                
                // Add to activity log
                this.addActivity('user_ban', this.chat.currentUser?.username || 'Admin', userId);
                
                // Update UI
                this.loadUsersData();
                this.showNotification(`Użytkownik został zbanowany${banDuration ? ` na ${duration} dni` : ' permanentnie'}`, 'error');
                
                // Auto-unban after duration (if not permanent)
                if (banDuration) {
                    setTimeout(() => {
                        this.unbanUser(userId, true);
                    }, banDuration);
                }
            }
        }
    }

    unbanUser(userId, auto = false) {
        const bannedUsers = JSON.parse(localStorage.getItem('bannedUsers') || '{}');
        if (bannedUsers[userId]) {
            delete bannedUsers[userId];
            localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
            
            if (!auto) {
                this.addActivity('user_unban', this.chat.currentUser?.username || 'Admin', userId);
                this.loadUsersData();
                this.showNotification('Użytkownik został odbanowany', 'success');
            }
        }
    }

    kickUser(userId) {
        if (confirm('Czy na pewno chcesz wyrzucić tego użytkownika?')) {
            const reason = prompt('Podaj powód wyrzucenia:', 'Naruszenie regulaminu');
            if (reason) {
                // Add to activity log
                this.addActivity('user_kick', this.chat.currentUser?.username || 'Admin', userId);
                
                // In a real implementation, this would disconnect the user
                this.showNotification('Użytkownik został wyrzucony z chatu', 'warning');
                
                // Simulate user leaving
                if (this.chat.users && this.chat.users[userId]) {
                    delete this.chat.users[userId];
                    this.chat.updateUsersList();
                }
            }
        }
    }

    // Additional methods for other functionalities...
    filterUsers() {
        // Implementation for filtering users
    }

    filterMessages() {
        // Implementation for filtering messages
    }

    showCreateRankModal() {
        // Implementation for creating new rank
    }

    editRank(rankId) {
        // Implementation for editing rank
    }

    deleteRank(rankId) {
        // Implementation for deleting rank
    }

    loadRoomsData() {
        // Implementation for loading rooms data
    }

    loadMessagesData() {
        // Implementation for loading messages data
    }

    loadLogsData() {
        // Implementation for loading logs data
    }

    loadStatisticsData() {
        // Implementation for loading statistics data
    }

    addActivity(type, user, target = null) {
        const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
        activities.unshift({
            type: type,
            user: user,
            target: target,
            timestamp: Date.now()
        });
        
        // Keep only last 100 activities
        if (activities.length > 100) {
            activities.splice(100);
        }
        
        localStorage.setItem('adminActivities', JSON.stringify(activities));
        this.updateRecentActivity();
    }

    isUserBanned(userId) {
        const bannedUsers = JSON.parse(localStorage.getItem('bannedUsers') || '{}');
        const ban = bannedUsers[userId];
        
        if (!ban) return false;
        
        // Check if ban expired
        if (ban.banUntil && Date.now() > ban.banUntil) {
            this.unbanUser(userId, true);
            return false;
        }
        
        return true;
    }

    isUserMuted(userId) {
        const mutedUsers = JSON.parse(localStorage.getItem('mutedUsers') || '{}');
        const mute = mutedUsers[userId];
        
        if (!mute) return false;
        
        // Check if mute expired
        if (mute.muteUntil && Date.now() > mute.muteUntil) {
            this.unmuteUser(userId, true);
            return false;
        }
        
        return true;
    }

    getUserWarnings(userId) {
        const warnings = JSON.parse(localStorage.getItem('userWarnings') || '{}');
        return warnings[userId] || [];
    }
}

// Make available globally
window.AdminPanelSystem = AdminPanelSystem;