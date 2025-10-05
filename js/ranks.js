/**
 * System rang i formatowania dla IPS Chat
 * Zarządza rangami użytkowników, uprawnieniami i indywidualnym formatowaniem
 */

class RanksSystem {
    constructor(chat) {
        this.chat = chat;
        this.ranks = new Map();
        this.userRanks = new Map();
        this.customFormats = new Map();
        
        this.initializeDefaultRanks();
        this.loadCustomRanks();
        this.bindEvents();
    }

    /**
     * Inicjalizuje domyślne rangi systemu
     */
    initializeDefaultRanks() {
        // Domyślne rangi systemowe
        const defaultRanks = [
            {
                id: 'guest',
                name: 'Gość',
                color: '#999999',
                backgroundColor: 'transparent',
                borderColor: '#cccccc',
                textStyle: 'normal',
                icon: '',
                priority: 0,
                permissions: {
                    canSendMessages: true,
                    canSendPrivateMessages: false,
                    canCreateRooms: false,
                    canJoinPrivateRooms: false,
                    canUploadFiles: false,
                    canSendVoiceMessages: false,
                    canUseEmojis: true,
                    canMentionUsers: true,
                    canViewHistory: true,
                    maxMessageLength: 200,
                    floodProtection: 5000
                }
            },
            {
                id: 'user',
                name: 'Użytkownik',
                color: '#333333',
                backgroundColor: 'transparent',
                borderColor: '#e0e0e0',
                textStyle: 'normal',
                icon: '',
                priority: 10,
                permissions: {
                    canSendMessages: true,
                    canSendPrivateMessages: true,
                    canCreateRooms: true,
                    canJoinPrivateRooms: true,
                    canUploadFiles: true,
                    canSendVoiceMessages: true,
                    canUseEmojis: true,
                    canMentionUsers: true,
                    canViewHistory: true,
                    maxMessageLength: 500,
                    floodProtection: 3000
                }
            },
            {
                id: 'vip',
                name: 'VIP',
                color: '#ff6b35',
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
                borderColor: '#ff6b35',
                textStyle: 'bold',
                icon: '⭐',
                priority: 20,
                permissions: {
                    canSendMessages: true,
                    canSendPrivateMessages: true,
                    canCreateRooms: true,
                    canJoinPrivateRooms: true,
                    canUploadFiles: true,
                    canSendVoiceMessages: true,
                    canUseEmojis: true,
                    canMentionUsers: true,
                    canViewHistory: true,
                    canBypassFlood: true,
                    maxMessageLength: 1000,
                    floodProtection: 1000
                }
            },
            {
                id: 'moderator',
                name: 'Moderator',
                color: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderColor: '#4CAF50',
                textStyle: 'bold',
                icon: '🛡️',
                priority: 30,
                permissions: {
                    canSendMessages: true,
                    canSendPrivateMessages: true,
                    canCreateRooms: true,
                    canJoinPrivateRooms: true,
                    canUploadFiles: true,
                    canSendVoiceMessages: true,
                    canUseEmojis: true,
                    canMentionUsers: true,
                    canViewHistory: true,
                    canBypassFlood: true,
                    canDeleteMessages: true,
                    canKickUsers: true,
                    canBanUsers: true,
                    canManageRooms: true,
                    maxMessageLength: 2000,
                    floodProtection: 0
                }
            },
            {
                id: 'admin',
                name: 'Administrator',
                color: '#f44336',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                borderColor: '#f44336',
                textStyle: 'bold',
                icon: '👑',
                priority: 40,
                permissions: {
                    canSendMessages: true,
                    canSendPrivateMessages: true,
                    canCreateRooms: true,
                    canJoinPrivateRooms: true,
                    canUploadFiles: true,
                    canSendVoiceMessages: true,
                    canUseEmojis: true,
                    canMentionUsers: true,
                    canViewHistory: true,
                    canBypassFlood: true,
                    canDeleteMessages: true,
                    canKickUsers: true,
                    canBanUsers: true,
                    canManageRooms: true,
                    canManageUsers: true,
                    canAccessAdminPanel: true,
                    canChangeSettings: true,
                    maxMessageLength: 5000,
                    floodProtection: 0
                }
            }
        ];

        defaultRanks.forEach(rank => {
            this.ranks.set(rank.id, rank);
        });
    }

    /**
     * Ładuje niestandardowe rangi z localStorage
     */
    loadCustomRanks() {
        try {
            const customRanks = localStorage.getItem('ips_chat_custom_ranks');
            if (customRanks) {
                const ranks = JSON.parse(customRanks);
                ranks.forEach(rank => {
                    this.ranks.set(rank.id, rank);
                });
            }

            const userRanks = localStorage.getItem('ips_chat_user_ranks');
            if (userRanks) {
                const ranks = JSON.parse(userRanks);
                Object.entries(ranks).forEach(([userId, rankId]) => {
                    this.userRanks.set(userId, rankId);
                });
            }

            const customFormats = localStorage.getItem('ips_chat_custom_formats');
            if (customFormats) {
                const formats = JSON.parse(customFormats);
                Object.entries(formats).forEach(([userId, format]) => {
                    this.customFormats.set(userId, format);
                });
            }
        } catch (error) {
            console.error('Błąd podczas ładowania rang:', error);
        }
    }

    /**
     * Zapisuje niestandardowe rangi do localStorage
     */
    saveCustomRanks() {
        try {
            const customRanks = Array.from(this.ranks.values())
                .filter(rank => !['guest', 'user', 'vip', 'moderator', 'admin'].includes(rank.id));
            
            localStorage.setItem('ips_chat_custom_ranks', JSON.stringify(customRanks));
            
            const userRanksObj = Object.fromEntries(this.userRanks);
            localStorage.setItem('ips_chat_user_ranks', JSON.stringify(userRanksObj));
            
            const customFormatsObj = Object.fromEntries(this.customFormats);
            localStorage.setItem('ips_chat_custom_formats', JSON.stringify(customFormatsObj));
        } catch (error) {
            console.error('Błąd podczas zapisywania rang:', error);
        }
    }

    /**
     * Wiąże zdarzenia systemu
     */
    bindEvents() {
        // Nasłuchiwanie zmian konfiguracji
        document.addEventListener('configChanged', (e) => {
            if (e.detail.key.startsWith('ranks.')) {
                this.handleConfigChange(e.detail);
            }
        });
    }

    /**
     * Obsługuje zmiany konfiguracji rang
     */
    handleConfigChange(detail) {
        const { key, value } = detail;
        
        if (key === 'ranks.enabled') {
            this.toggleRanksSystem(value);
        } else if (key.startsWith('ranks.colors.')) {
            this.updateRankColors();
        }
    }

    /**
     * Włącza/wyłącza system rang
     */
    toggleRanksSystem(enabled) {
        const messages = document.querySelectorAll('.message');
        messages.forEach(message => {
            const rankElement = message.querySelector('.message-rank');
            if (rankElement) {
                rankElement.style.display = enabled ? 'inline-block' : 'none';
            }
        });
    }

    /**
     * Tworzy nową rangę
     */
    createRank(rankData) {
        const rank = {
            id: rankData.id || this.generateRankId(),
            name: rankData.name,
            color: rankData.color || '#333333',
            backgroundColor: rankData.backgroundColor || 'transparent',
            borderColor: rankData.borderColor || '#e0e0e0',
            textStyle: rankData.textStyle || 'normal',
            icon: rankData.icon || '',
            priority: rankData.priority || 0,
            permissions: { ...this.getDefaultPermissions(), ...rankData.permissions }
        };

        this.ranks.set(rank.id, rank);
        this.saveCustomRanks();
        
        this.dispatchEvent('rankCreated', { rank });
        return rank;
    }

    /**
     * Aktualizuje istniejącą rangę
     */
    updateRank(rankId, updates) {
        const rank = this.ranks.get(rankId);
        if (!rank) return false;

        Object.assign(rank, updates);
        this.ranks.set(rankId, rank);
        this.saveCustomRanks();
        
        this.dispatchEvent('rankUpdated', { rank });
        this.refreshUserMessages(rankId);
        return true;
    }

    /**
     * Usuwa rangę
     */
    deleteRank(rankId) {
        // Nie można usunąć domyślnych rang
        if (['guest', 'user', 'vip', 'moderator', 'admin'].includes(rankId)) {
            return false;
        }

        const rank = this.ranks.get(rankId);
        if (!rank) return false;

        this.ranks.delete(rankId);
        
        // Usuń rangę od wszystkich użytkowników
        for (const [userId, userRankId] of this.userRanks) {
            if (userRankId === rankId) {
                this.userRanks.set(userId, 'user'); // Przypisz domyślną rangę
            }
        }
        
        this.saveCustomRanks();
        this.dispatchEvent('rankDeleted', { rankId });
        return true;
    }

    /**
     * Przypisuje rangę użytkownikowi
     */
    assignRank(userId, rankId) {
        if (!this.ranks.has(rankId)) {
            console.error(`Ranga ${rankId} nie istnieje`);
            return false;
        }

        this.userRanks.set(userId, rankId);
        this.saveCustomRanks();
        
        this.dispatchEvent('userRankChanged', { userId, rankId });
        this.refreshUserMessages(null, userId);
        return true;
    }

    /**
     * Pobiera rangę użytkownika
     */
    getUserRank(userId) {
        const rankId = this.userRanks.get(userId) || 'user';
        return this.ranks.get(rankId);
    }

    /**
     * Pobiera ID rangi użytkownika
     */
    getUserRankId(userId) {
        return this.userRanks.get(userId) || 'user';
    }

    /**
     * Sprawdza uprawnienia użytkownika
     */
    hasPermission(userId, permission) {
        const rank = this.getUserRank(userId);
        return rank && rank.permissions[permission];
    }

    /**
     * Pobiera limit dla użytkownika
     */
    getUserLimit(userId, limitType) {
        const rank = this.getUserRank(userId);
        return rank ? rank.permissions[limitType] : null;
    }

    /**
     * Ustawia niestandardowe formatowanie dla użytkownika
     */
    setCustomFormat(userId, format) {
        this.customFormats.set(userId, format);
        this.saveCustomRanks();
        this.refreshUserMessages(null, userId);
    }

    /**
     * Pobiera niestandardowe formatowanie użytkownika
     */
    getCustomFormat(userId) {
        return this.customFormats.get(userId);
    }

    /**
     * Formatuje element rangi dla wiadomości
     */
    formatRankElement(userId) {
        const rank = this.getUserRank(userId);
        const customFormat = this.getCustomFormat(userId);
        
        if (!rank) return '';

        const rankElement = document.createElement('span');
        rankElement.className = 'message-rank';
        rankElement.textContent = rank.name;
        
        // Zastosuj style rangi
        rankElement.style.color = customFormat?.color || rank.color;
        rankElement.style.backgroundColor = customFormat?.backgroundColor || rank.backgroundColor;
        rankElement.style.borderColor = customFormat?.borderColor || rank.borderColor;
        rankElement.style.fontWeight = customFormat?.textStyle || rank.textStyle;
        
        if (rank.icon) {
            const iconElement = document.createElement('span');
            iconElement.className = 'rank-icon';
            iconElement.textContent = rank.icon;
            rankElement.prepend(iconElement);
        }

        return rankElement.outerHTML;
    }

    /**
     * Formatuje nick użytkownika z rangą
     */
    formatUserNick(userId, nick) {
        const rank = this.getUserRank(userId);
        const customFormat = this.getCustomFormat(userId);
        
        if (!rank) return nick;

        const nickElement = document.createElement('span');
        nickElement.className = 'user-nick';
        nickElement.textContent = nick;
        
        // Zastosuj style rangi do nicku
        if (customFormat?.nickColor || rank.color !== '#333333') {
            nickElement.style.color = customFormat?.nickColor || rank.color;
        }
        
        if (customFormat?.nickStyle || rank.textStyle !== 'normal') {
            nickElement.style.fontWeight = customFormat?.nickStyle || rank.textStyle;
        }

        return nickElement.outerHTML;
    }

    /**
     * Pobiera wszystkie rangi posortowane według priorytetu
     */
    getAllRanks() {
        return Array.from(this.ranks.values())
            .sort((a, b) => b.priority - a.priority);
    }

    /**
     * Pobiera użytkowników z określoną rangą
     */
    getUsersByRank(rankId) {
        const users = [];
        for (const [userId, userRankId] of this.userRanks) {
            if (userRankId === rankId) {
                users.push(userId);
            }
        }
        return users;
    }

    /**
     * Odświeża wiadomości użytkowników po zmianie rangi
     */
    refreshUserMessages(rankId = null, userId = null) {
        const messages = document.querySelectorAll('.message');
        
        messages.forEach(message => {
            const messageUserId = message.dataset.userId;
            
            if (userId && messageUserId !== userId) return;
            if (rankId && this.getUserRankId(messageUserId) !== rankId) return;
            
            // Odśwież element rangi
            const rankElement = message.querySelector('.message-rank');
            if (rankElement) {
                const newRankElement = this.formatRankElement(messageUserId);
                rankElement.outerHTML = newRankElement;
            }
            
            // Odśwież nick
            const nickElement = message.querySelector('.user-nick');
            if (nickElement) {
                const originalNick = nickElement.textContent;
                const newNickElement = this.formatUserNick(messageUserId, originalNick);
                nickElement.outerHTML = newNickElement;
            }
        });
    }

    /**
     * Generuje unikalny ID rangi
     */
    generateRankId() {
        return 'rank_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Pobiera domyślne uprawnienia
     */
    getDefaultPermissions() {
        return {
            canSendMessages: true,
            canSendPrivateMessages: true,
            canCreateRooms: true,
            canJoinPrivateRooms: true,
            canUploadFiles: true,
            canSendVoiceMessages: true,
            canUseEmojis: true,
            canMentionUsers: true,
            canViewHistory: true,
            maxMessageLength: 500,
            floodProtection: 3000
        };
    }

    /**
     * Wysyła zdarzenie systemu
     */
    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(`ranks${eventName}`, { detail });
        document.dispatchEvent(event);
    }

    /**
     * Eksportuje konfigurację rang
     */
    exportRanks() {
        return {
            ranks: Array.from(this.ranks.entries()),
            userRanks: Array.from(this.userRanks.entries()),
            customFormats: Array.from(this.customFormats.entries())
        };
    }

    /**
     * Importuje konfigurację rang
     */
    importRanks(data) {
        try {
            if (data.ranks) {
                this.ranks = new Map(data.ranks);
            }
            if (data.userRanks) {
                this.userRanks = new Map(data.userRanks);
            }
            if (data.customFormats) {
                this.customFormats = new Map(data.customFormats);
            }
            
            this.saveCustomRanks();
            this.dispatchEvent('ranksImported', { data });
            return true;
        } catch (error) {
            console.error('Błąd podczas importu rang:', error);
            return false;
        }
    }
}

// Eksport dla użycia w innych modułach
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RanksSystem;
}