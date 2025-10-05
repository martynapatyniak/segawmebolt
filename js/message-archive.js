/**
 * Message Archive System for IPS Chat
 * Handles message archiving, search, and management
 */

class MessageArchiveSystem {
    constructor(chatInstance) {
        this.chat = chatInstance;
        this.isEnabled = true;
        this.maxArchiveSize = 10000; // Maximum number of archived messages
        this.archiveData = this.loadArchive();
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.startAutoArchiving();
    }

    bindEvents() {
        // Listen for new messages to archive
        document.addEventListener('messageAdded', (event) => {
            if (this.isEnabled) {
                this.archiveMessage(event.detail);
            }
        });

        // Listen for message deletions
        document.addEventListener('messageDeleted', (event) => {
            this.markMessageAsDeleted(event.detail.messageId);
        });
    }

    archiveMessage(messageData) {
        const archivedMessage = {
            id: messageData.id || this.generateMessageId(),
            content: messageData.content,
            author: messageData.author,
            timestamp: messageData.timestamp || Date.now(),
            room: messageData.room || 'general',
            type: messageData.type || 'text',
            attachments: messageData.attachments || [],
            mentions: messageData.mentions || [],
            reactions: messageData.reactions || {},
            edited: messageData.edited || false,
            deleted: false,
            archivedAt: Date.now()
        };

        this.archiveData.messages.unshift(archivedMessage);

        // Maintain archive size limit
        if (this.archiveData.messages.length > this.maxArchiveSize) {
            this.archiveData.messages = this.archiveData.messages.slice(0, this.maxArchiveSize);
        }

        this.saveArchive();
        this.updateArchiveStats();
    }

    markMessageAsDeleted(messageId) {
        const message = this.archiveData.messages.find(msg => msg.id === messageId);
        if (message) {
            message.deleted = true;
            message.deletedAt = Date.now();
            this.saveArchive();
        }
    }

    searchMessages(query, filters = {}) {
        let results = this.archiveData.messages;

        // Text search
        if (query && query.trim()) {
            const searchTerm = query.toLowerCase();
            results = results.filter(msg => 
                msg.content.toLowerCase().includes(searchTerm) ||
                msg.author.toLowerCase().includes(searchTerm)
            );
        }

        // Apply filters
        if (filters.author) {
            results = results.filter(msg => 
                msg.author.toLowerCase().includes(filters.author.toLowerCase())
            );
        }

        if (filters.room) {
            results = results.filter(msg => msg.room === filters.room);
        }

        if (filters.dateFrom) {
            results = results.filter(msg => msg.timestamp >= filters.dateFrom);
        }

        if (filters.dateTo) {
            results = results.filter(msg => msg.timestamp <= filters.dateTo);
        }

        if (filters.type) {
            results = results.filter(msg => msg.type === filters.type);
        }

        if (filters.showDeleted === false) {
            results = results.filter(msg => !msg.deleted);
        }

        return results.sort((a, b) => b.timestamp - a.timestamp);
    }

    exportArchive(format = 'json', filters = {}) {
        const messages = this.searchMessages('', filters);
        
        switch (format) {
            case 'json':
                return this.exportAsJSON(messages);
            case 'csv':
                return this.exportAsCSV(messages);
            case 'txt':
                return this.exportAsText(messages);
            default:
                return this.exportAsJSON(messages);
        }
    }

    exportAsJSON(messages) {
        const exportData = {
            exportDate: new Date().toISOString(),
            totalMessages: messages.length,
            messages: messages
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        this.downloadFile(blob, `chat-archive-${this.formatDate(new Date())}.json`);
    }

    exportAsCSV(messages) {
        const headers = ['ID', 'Author', 'Content', 'Timestamp', 'Room', 'Type', 'Deleted'];
        const csvContent = [
            headers.join(','),
            ...messages.map(msg => [
                msg.id,
                `"${msg.author}"`,
                `"${msg.content.replace(/"/g, '""')}"`,
                new Date(msg.timestamp).toISOString(),
                msg.room,
                msg.type,
                msg.deleted
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        this.downloadFile(blob, `chat-archive-${this.formatDate(new Date())}.csv`);
    }

    exportAsText(messages) {
        const textContent = messages.map(msg => {
            const date = new Date(msg.timestamp).toLocaleString();
            const deletedMark = msg.deleted ? ' [USUNIĘTA]' : '';
            return `[${date}] ${msg.author} (${msg.room}): ${msg.content}${deletedMark}`;
        }).join('\n');

        const blob = new Blob([textContent], { type: 'text/plain' });
        this.downloadFile(blob, `chat-archive-${this.formatDate(new Date())}.txt`);
    }

    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    getArchiveStats() {
        const stats = {
            totalMessages: this.archiveData.messages.length,
            deletedMessages: this.archiveData.messages.filter(msg => msg.deleted).length,
            messagesByRoom: {},
            messagesByAuthor: {},
            messagesByType: {},
            oldestMessage: null,
            newestMessage: null
        };

        this.archiveData.messages.forEach(msg => {
            // By room
            stats.messagesByRoom[msg.room] = (stats.messagesByRoom[msg.room] || 0) + 1;
            
            // By author
            stats.messagesByAuthor[msg.author] = (stats.messagesByAuthor[msg.author] || 0) + 1;
            
            // By type
            stats.messagesByType[msg.type] = (stats.messagesByType[msg.type] || 0) + 1;
            
            // Oldest/newest
            if (!stats.oldestMessage || msg.timestamp < stats.oldestMessage.timestamp) {
                stats.oldestMessage = msg;
            }
            if (!stats.newestMessage || msg.timestamp > stats.newestMessage.timestamp) {
                stats.newestMessage = msg;
            }
        });

        return stats;
    }

    cleanupArchive(olderThanDays = 30) {
        const cutoffDate = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
        const originalCount = this.archiveData.messages.length;
        
        this.archiveData.messages = this.archiveData.messages.filter(msg => 
            msg.timestamp > cutoffDate
        );
        
        const removedCount = originalCount - this.archiveData.messages.length;
        this.saveArchive();
        
        return {
            removedCount,
            remainingCount: this.archiveData.messages.length
        };
    }

    restoreMessage(messageId) {
        const message = this.archiveData.messages.find(msg => msg.id === messageId);
        if (message && message.deleted) {
            message.deleted = false;
            delete message.deletedAt;
            this.saveArchive();
            
            // Notify chat system to restore message
            document.dispatchEvent(new CustomEvent('messageRestored', {
                detail: { messageId, message }
            }));
            
            return true;
        }
        return false;
    }

    permanentlyDeleteMessage(messageId) {
        const index = this.archiveData.messages.findIndex(msg => msg.id === messageId);
        if (index !== -1) {
            this.archiveData.messages.splice(index, 1);
            this.saveArchive();
            return true;
        }
        return false;
    }

    loadArchive() {
        try {
            const saved = localStorage.getItem('messageArchive');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading message archive:', error);
        }
        
        return {
            messages: [],
            stats: {
                totalArchived: 0,
                lastCleanup: Date.now()
            }
        };
    }

    saveArchive() {
        try {
            localStorage.setItem('messageArchive', JSON.stringify(this.archiveData));
        } catch (error) {
            console.error('Error saving message archive:', error);
        }
    }

    updateArchiveStats() {
        this.archiveData.stats.totalArchived = this.archiveData.messages.length;
        this.archiveData.stats.lastUpdate = Date.now();
    }

    startAutoArchiving() {
        // Auto-cleanup every 24 hours
        setInterval(() => {
            const stats = this.getArchiveStats();
            if (stats.totalMessages > this.maxArchiveSize * 0.9) {
                this.cleanupArchive(90); // Remove messages older than 90 days
            }
        }, 24 * 60 * 60 * 1000);
    }

    generateMessageId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    // Public API methods
    getMessages(limit = 100, offset = 0) {
        return this.archiveData.messages.slice(offset, offset + limit);
    }

    getMessageById(messageId) {
        return this.archiveData.messages.find(msg => msg.id === messageId);
    }

    getMessagesByAuthor(author, limit = 100) {
        return this.archiveData.messages
            .filter(msg => msg.author === author)
            .slice(0, limit);
    }

    getMessagesByRoom(room, limit = 100) {
        return this.archiveData.messages
            .filter(msg => msg.room === room)
            .slice(0, limit);
    }

    getDeletedMessages(limit = 100) {
        return this.archiveData.messages
            .filter(msg => msg.deleted)
            .slice(0, limit);
    }
}

// Make available globally
window.MessageArchiveSystem = MessageArchiveSystem;