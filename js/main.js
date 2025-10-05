// Główna klasa chatu IPS
class IPSChat {
    constructor() {
        this.currentUser = null;
        this.currentRoom = 'main';
        this.messages = new Map();
        this.users = new Map();
        this.rooms = new Map();
        this.isConnected = false;
        this.isMinimized = false;
        this.soundEnabled = true;
        this.mentionSoundEnabled = true;
        this.typingTimer = null;
        this.lastMessageTime = 0;
        
        // Initialize stats
        this.stats = {
            messagesCount: 0,
            usersOnline: 0,
            totalUsers: 0
        };
        
        this.init();
    }
    
    // Inicjalizacja chatu po załadowaniu DOM
    init() {
        console.log('Inicjalizacja IPS Chat v' + ChatConfig.version);
        
        // Inicjalizuj komponenty
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeUser();
        this.initializeRooms();
        this.initializeActiveUsers(); // Dodaj inicjalizację aktywnych użytkowników
        
        // Initialize systems
        this.mentionsSystem = new MentionsSystem(this);
        this.roomsSystem = new RoomsSystem(this);
        this.ranksSystem = new RanksSystem(this);
        this.advancedFeatures = new AdvancedFeaturesSystem(this);
        this.adminPanel = new AdminPanelSystem(this);
        this.mobileOptimization = new MobileOptimizationSystem(this);
        
        // Initialize translation system
        if (typeof TranslationSystem !== 'undefined') {
            this.translation = new TranslationSystem(this);
        }
        
        // Initialize statistics system
        if (typeof StatisticsSystem !== 'undefined') {
            this.statistics = new StatisticsSystem(this);
        }
        
        // Initialize mobile responsive system
        if (typeof MobileResponsiveSystem !== 'undefined') {
            this.mobileResponsive = new MobileResponsiveSystem(this);
        }
        
        // Initialize Message Archive System
        if (typeof MessageArchiveSystem !== 'undefined') {
            this.messageArchive = new MessageArchiveSystem(this);
        }

        // Initialize IPS Settings System
        if (typeof IPSSettingsSystem !== 'undefined') {
            this.ipsSettings = new IPSSettingsSystem(this);
        }
        
        // Initialize Emoji System
        if (typeof EmojiSystem !== 'undefined') {
            this.emojiSystem = new EmojiSystem(this);
        }
        
        // Initialize File Upload System
        if (typeof FileUploadSystem !== 'undefined') {
            this.fileUploadSystem = new FileUploadSystem(this);
            fileUploadSystem = this.fileUploadSystem; // Global reference
        }
        
        // Load initial data after all systems are initialized
        this.loadInitialData();
        
        // Symulacja połączenia
        this.simulateConnection();
        
        console.log('IPS Chat zainicjalizowany pomyślnie');
    }
    
    // Inicjalizacja elementów DOM
    initializeElements() {
        this.elements = {
            container: document.getElementById('chat-container'),
            messagesContainer: document.getElementById('messages-list'),
            messagesList: document.getElementById('messages-list'),
            messageInput: document.getElementById('message-input'),
            sendBtn: document.getElementById('send-btn'),
            emojiBtn: document.getElementById('emoji-btn'),
            fileBtn: document.getElementById('file-btn'),
            onlineCount: document.getElementById('online-count'),
            usersList: document.getElementById('users-list'),
            usersDropdown: document.getElementById('users-dropdown'),
            roomTabs: document.getElementById('room-tabs'),
            announcement: document.getElementById('announcement'),
            announcementText: document.getElementById('announcement-text'),
            announcementClose: document.getElementById('announcement-close'),
            soundToggle: document.getElementById('sound-toggle'),
            minimizeChat: document.getElementById('minimize-chat'),
            fullscreenToggle: document.getElementById('fullscreen-toggle'),
            settingsBtn: document.getElementById('settings-btn'),
            charCount: document.getElementById('char-count'),
            typingIndicator: document.getElementById('typing-indicator'),
            scrollToBottom: document.getElementById('scroll-to-bottom'),
            quotePreview: document.getElementById('quote-preview'),
            filePreview: document.getElementById('file-preview'),
            topUsersList: document.getElementById('top-users-list'),
            postsToday: document.getElementById('posts-today'),
            postsTotal: document.getElementById('posts-total'),
            chatTools: document.querySelector('.chat-tools')
        };
        
        // Debug: Check if critical elements are found
        console.log('Element initialization check:', {
            sendBtn: this.elements.sendBtn,
            messageInput: this.elements.messageInput,
            sendBtnExists: !!this.elements.sendBtn,
            messageInputExists: !!this.elements.messageInput
        });
    }
    
    // Inicjalizacja nasłuchiwaczy zdarzeń
    initializeEventListeners() {
        // Wysyłanie wiadomości
        if (this.elements.sendBtn) {
            this.elements.sendBtn.addEventListener('click', () => {
                console.log('Send button clicked!');
                this.sendMessage();
            });
        } else {
            console.error('Send button not found! Cannot attach event listener.');
        }
        
        this.elements.messageInput.addEventListener('keydown', (e) => this.handleInputKeydown(e));
        this.elements.messageInput.addEventListener('input', () => this.handleInputChange());
        
        // Kontrolki chatu
        this.elements.soundToggle.addEventListener('click', () => this.toggleSound());
        this.elements.minimizeChat.addEventListener('click', () => this.toggleMinimize());
        this.elements.fullscreenToggle?.addEventListener('click', () => this.toggleFullscreen());
        this.elements.settingsBtn?.addEventListener('click', () => this.openSettings());
        
        // Emoji picker
        this.elements.emojiBtn?.addEventListener('click', () => this.toggleEmojiPicker());
        
        // Lista użytkowników
        this.elements.onlineCount.addEventListener('click', () => this.toggleUsersDropdown());
        
        // Ogłoszenie
        this.elements.announcementClose?.addEventListener('click', () => this.closeAnnouncement());
        
        // Scroll do dołu
        this.elements.scrollToBottom?.querySelector('button')?.addEventListener('click', () => this.scrollToBottom());
        
        // Scroll w wiadomościach
        this.elements.messagesList.addEventListener('scroll', () => this.handleScroll());
        
        // Obsługa akcji wiadomości (reakcje, odpowiedzi, edycja, usuwanie)
        this.elements.messagesList.addEventListener('click', (e) => this.handleMessageAction(e));
        
        // Kliknięcie poza dropdown
        document.addEventListener('click', (e) => this.handleDocumentClick(e));
        
        // Zmiana rozmiaru okna
        window.addEventListener('resize', () => this.handleResize());
        
        // Przed zamknięciem strony
        window.addEventListener('beforeunload', () => this.cleanup());
    }
    
    // Inicjalizacja użytkownika
    initializeUser() {
        // Symulacja użytkownika (w prawdziwej aplikacji pobrane z serwera)
        this.currentUser = {
            id: 'user_' + Date.now(),
            nick: 'TestUser' + Math.floor(Math.random() * 1000),
            avatar: null,
            country: 'PL',
            rank: 'user',
            group: 'user',
            isOnline: true,
            joinedAt: new Date(),
            lastActivity: new Date(),
            postsCount: 0,
            postsToday: 0
        };
        
        // Dodaj do listy użytkowników
        this.users.set(this.currentUser.id, this.currentUser);
        this.updateUsersList();
    }
    
    // Inicjalizacja pokojów
    initializeRooms() {
        // Domyślny pokój główny
        this.rooms.set('main', {
            id: 'main',
            name: 'Główny',
            type: 'public',
            users: new Set([this.currentUser.id]),
            messages: [],
            unreadCount: 0,
            isActive: true
        });
        
        this.updateRoomTabs();
    }
    
    // Ładowanie początkowych danych
    loadInitialData() {
        // Load settings from localStorage
        const savedSettings = localStorage.getItem('chatSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            this.soundEnabled = settings.soundEnabled !== undefined ? settings.soundEnabled : true;
            this.mentionSoundEnabled = settings.mentionSoundEnabled !== undefined ? settings.mentionSoundEnabled : true;
        }
        
        // Symulacja ładowania historii wiadomości
        if (ChatConfig.development.mockData) {
            this.loadMockMessages();
        }
        
        // Aktualizuj statystyki
        this.updateStats();
        
        // Pokaż ogłoszenie jeśli jest
        this.showAnnouncement();
    }
    
    // Symulacja połączenia z serwerem
    simulateConnection() {
        console.log('simulateConnection started, isConnected:', this.isConnected);
        setTimeout(() => {
            this.isConnected = true;
            console.log('Connection established, isConnected:', this.isConnected);
            this.addSystemMessage('Połączono z chatem');
            this.updateOnlineUsers();
        }, 1000);
    }
    
    // Obsługa klawiatury w polu tekstowym
    handleInputKeydown(e) {
        const shiftEnterEnabled = ConfigUtils.get('messages.allowShiftEnter', true);
        
        if (e.key === 'Enter') {
            if (shiftEnterEnabled && e.shiftKey) {
                // Shift+Enter = nowa linia
                return;
            } else if (!shiftEnterEnabled || !e.shiftKey) {
                // Enter = wyślij wiadomość
                e.preventDefault();
                this.sendMessage();
            }
        }
        
        // Obsługa @mentions
        if (e.key === '@') {
            setTimeout(() => this.handleMentionTrigger(), 10);
        }
        
        // Wskaźnik pisania
        this.handleTypingIndicator();
    }
    
    // Obsługa zmian w polu tekstowym
    handleInputChange() {
        const text = this.elements.messageInput.value;
        const maxLength = ConfigUtils.getUserLimit(this.currentUser.group, 'messageLength');
        
        // Aktualizuj licznik znaków
        this.elements.charCount.textContent = text.length;
        
        // Zmień kolor licznika przy przekroczeniu limitu
        const counter = this.elements.charCount.parentElement;
        counter.classList.remove('warning', 'danger');
        
        if (text.length > maxLength * 0.9) {
            counter.classList.add('warning');
        }
        if (text.length > maxLength) {
            counter.classList.add('danger');
        }
        
        // Włącz/wyłącz przycisk wysyłania
        const shouldDisable = text.trim().length === 0 || text.length > maxLength;
        console.log('Button disabled check:', {
            textLength: text.length,
            trimmedLength: text.trim().length,
            maxLength: maxLength,
            shouldDisable: shouldDisable
        });
        this.elements.sendBtn.disabled = shouldDisable;
        
        // Auto-resize textarea
        this.autoResizeTextarea();
    }
    
    // Auto-resize textarea
    autoResizeTextarea() {
        const textarea = this.elements.messageInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
    
    // Wysyłanie wiadomości
    sendMessage() {
        console.log('sendMessage called');
        const text = this.elements.messageInput.value.trim();
        console.log('Message text:', text);
        console.log('isConnected:', this.isConnected);
        
        if (!text || !this.isConnected) {
            console.log('Returning early - no text or not connected');
            return;
        }
        
        // Sprawdź uprawnienia
        if (!this.hasPermission('canSendMessages')) {
            console.log('No permission to send messages');
            this.showError('Nie masz uprawnień do wysyłania wiadomości');
            return;
        }
        
        console.log('Permissions OK, creating message...');
        
        // Sprawdź limit długości wiadomości
        const maxLength = this.getUserLimit('maxMessageLength');
        if (text.length > maxLength) {
            this.showError(`Wiadomość jest za długa. Maksymalnie ${maxLength} znaków.`);
            return;
        }
        
        // Sprawdź anti-flood
        const floodProtection = this.getUserLimit('floodProtection');
        const now = Date.now();
        if (this.lastMessageTime && (now - this.lastMessageTime) < floodProtection) {
            const remainingTime = Math.ceil((floodProtection - (now - this.lastMessageTime)) / 1000);
            this.showError(`Poczekaj ${remainingTime} sekund przed wysłaniem kolejnej wiadomości`);
            return;
        }
        
        // Utwórz wiadomość
        const message = {
            id: 'msg_' + Date.now(),
            author: this.currentUser,
            text: text,
            timestamp: new Date(),
            room: this.currentRoom,
            type: 'user',
            edited: false,
            reactions: new Map(),
            quote: this.getCurrentQuote()
        };
        
        // Wyczyść pole tekstowe i quote
        this.elements.messageInput.value = '';
        this.clearQuote();
        this.autoResizeTextarea();
        this.handleInputChange();
        
        // Dodaj wiadomość
        this.addMessage(message);
        
        // Aktualizuj statystyki
        this.currentUser.postsCount++;
        this.currentUser.postsToday++;
        this.updateStats();
        
        // Zapisz czas ostatniej wiadomości
        this.lastMessageTime = now;
        
        // Symulacja wysłania na serwer
        this.simulateMessageSent(message);
    }
    
    // Dodawanie wiadomości do chatu
    addMessage(messageData, prepend = false) {
        // Store message in room data structure
        const roomName = messageData.room || this.currentRoom || 'main';
        const room = this.rooms.get(roomName);
        if (room) {
            if (prepend) {
                room.messages.unshift(messageData);
            } else {
                room.messages.push(messageData);
            }
        }
        
        const messageElement = this.renderMessage(messageData);
        this.elements.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        // Update message count
        this.stats.messagesCount++;
        this.updateStats();
        
        // Play notification sound if enabled and message is from another user
        const user = messageData.user || messageData.author;
        if (this.soundEnabled && user && this.currentUser && user.id !== this.currentUser.id) {
            this.playNotificationSound();
        }
        
        // Check for mentions
        const messageText = messageData.text || messageData.content || '';
        if (this.currentUser && this.isMentioned(messageText, this.currentUser.nick)) {
            this.handleMention(messageData);
        }
    }
    
    // Renderowanie wiadomości
    renderMessage(messageData, prepend = false) {
        const messageElement = this.createMessageElement(messageData);
        
        // Dodaj klasę rangi do wiadomości
        const user = messageData.user || messageData.author;
        if (this.ranksSystem && user && user.id) {
            const userRankId = this.ranksSystem.getUserRankId(user.id);
            messageElement.classList.add(userRankId);
        }
        
        // Handle different message types with advanced features
        if (messageData.type === 'file') {
            // Use new file upload system for rendering
            if (this.fileUploadSystem) {
                const fileContent = this.renderFileMessage(messageData);
                const contentElement = messageElement.querySelector('.message-text');
                if (contentElement) {
                    contentElement.innerHTML = fileContent;
                }
            } else if (this.advancedFeatures) {
                // Fallback to advanced features
                const fileContent = this.advancedFeatures.renderFileMessage(messageData);
                const contentElement = messageElement.querySelector('.message-text');
                if (contentElement) {
                    contentElement.innerHTML = fileContent;
                }
            }
        } else if (messageData.type === 'voice' && this.advancedFeatures) {
            const voiceContent = this.advancedFeatures.renderVoiceMessage(messageData);
            const contentElement = messageElement.querySelector('.message-text');
            if (contentElement) {
                contentElement.innerHTML = voiceContent;
            }
        }
        
        if (prepend) {
            this.elements.messagesList.insertBefore(messageElement, this.elements.messagesList.firstChild);
        } else {
            this.elements.messagesList.appendChild(messageElement);
        }
        
        // Animacja pojawienia się
        if (!prepend) {
            messageElement.classList.add('slide-in-up');
        }
        
        return messageElement;
    }
    
    // Tworzenie elementu wiadomości
    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}`;
        messageDiv.dataset.messageId = message.id;
        
        // Dodaj klasy dla grup i rang
        const author = message.author || message.user;
        if (author && author.group) {
            messageDiv.classList.add(`group-${author.group}`);
        }
        
        // Dodaj klasę rangi dla indywidualnego formatowania
        if (author && author.rank) {
            messageDiv.classList.add(author.rank);
        }
        
        // Sprawdź czy to własna wiadomość
        if (author && this.currentUser && author.id === this.currentUser.id) {
            messageDiv.classList.add('own');
        }
        
        // Sprawdź czy to cytowana wiadomość
        if (message.quote) {
            messageDiv.classList.add('quoted');
        }
        
        if (message.type === 'system') {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-text">${this.escapeHtml(message.text || message.content)}</div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = this.createUserMessageHTML(message);
        }
        
        return messageDiv;
    }
    
    // Tworzenie HTML dla wiadomości użytkownika
    createUserMessageHTML(message) {
        const author = message.author || message.user;
        const showFlags = ConfigUtils.get('users.showCountryFlags', true);
        const showRanks = ConfigUtils.get('users.showRanks', true);
        const showAvatars = ConfigUtils.get('appearance.showAvatars', true);
        const showTimestamps = ConfigUtils.get('appearance.showTimestamps', true);
        
        let html = '';
        
        // Avatar
        if (showAvatars) {
            html += `
                <div class="message-avatar" style="background-color: ${this.getUserColor(author.id)}">
                    ${author.avatar ? `<img src="${author.avatar}" alt="${author.nick}">` : author.nick.charAt(0).toUpperCase()}
                </div>
            `;
        }
        
        // Zawartość wiadomości
        html += '<div class="message-content">';
        
        // Header wiadomości
        html += '<div class="message-header">';
        html += '<div class="message-author">';
        
        // Flaga kraju
        if (showFlags && author.country) {
            const flagUrl = `flags/${author.country.toLowerCase()}.svg`;
            html += `<span class="country-flag" style="background-image: url('${flagUrl}'); display: inline-block; width: 16px; height: 12px; margin-right: 4px; background-size: cover; background-position: center; border-radius: 2px;"></span>`;
        }
        
        // Nick
        html += `<span class="user-nick">${this.escapeHtml(author.nick)}</span>`;
        
        // Ranga
        if (showRanks && author.rank && author.rank !== 'user') {
            html += `<span class="user-rank ${author.rank}">${this.getRankName(author.rank)}</span>`;
        }
        
        html += '</div>';
        
        // Czas
        if (showTimestamps) {
            html += `<span class="message-time">${this.formatTime(message.timestamp)}</span>`;
        }
        
        html += '</div>';
        
        // Cytowanie
        if (message.quote) {
            html += `
                <div class="quote-block">
                    <div class="quote-author">${this.escapeHtml(message.quote.author)}</div>
                    <div class="quote-text">${this.escapeHtml(message.quote.text)}</div>
                </div>
            `;
        }
        
        // Tekst wiadomości
        html += `<div class="message-text">${this.formatMessageText(message.text || message.content)}</div>`;
        
        // Reakcje
        if (message.reactions && message.reactions.size > 0) {
            html += '<div class="message-reactions">';
            message.reactions.forEach((users, emoji) => {
                const isActive = users.has(this.currentUser.id);
                html += `
                    <div class="reaction ${isActive ? 'active' : ''}" data-emoji="${emoji}">
                        <span>${emoji}</span>
                        <span>${users.size}</span>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        // Akcje wiadomości
        if (this.canManageMessage(message)) {
            html += `
                <div class="message-actions">
                    <button class="action-btn" data-action="quote" title="Cytuj">
                        <i class="fas fa-quote-right"></i>
                    </button>
                    <button class="action-btn" data-action="react" title="Reaguj">
                        <i class="fas fa-smile"></i>
                    </button>
                    ${this.canEditMessage(message) ? '<button class="action-btn" data-action="edit" title="Edytuj"><i class="fas fa-edit"></i></button>' : ''}
                    ${this.canDeleteMessage(message) ? '<button class="action-btn" data-action="delete" title="Usuń"><i class="fas fa-trash"></i></button>' : ''}
                </div>
            `;
        }
        
        html += '</div>';
        
        return html;
    }
    
    // Formatowanie tekstu wiadomości
    formatMessageText(text) {
        let formatted = this.escapeHtml(text);
        
        // Formatowanie @mentions z użyciem systemu mentions
        if (this.mentionsSystem && this.currentUser) {
            formatted = MentionsSystem.formatMentions(formatted, this.users, this.currentUser.id);
        } else {
            // Fallback dla podstawowego formatowania mentions
            formatted = formatted.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
        }
        
        // Formatowanie linków
        formatted = formatted.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
        
        // Formatowanie emotek - użyj systemu emoji jeśli dostępny
        if (this.emojiSystem && typeof EmojiSystem.formatEmojis === 'function') {
            formatted = EmojiSystem.formatEmojis(formatted);
        } else {
            // Fallback dla podstawowego formatowania emotek
            formatted = formatted.replace(/:\)/g, '😊');
            formatted = formatted.replace(/:\(/g, '😢');
            formatted = formatted.replace(/:D/g, '😃');
            formatted = formatted.replace(/:P/g, '😛');
        }
        
        // Zachowaj łamanie linii
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
    }
    
    // Dodawanie wiadomości systemowej
    addSystemMessage(text) {
        const message = {
            id: 'sys_' + Date.now(),
            text: text,
            timestamp: new Date(),
            room: this.currentRoom,
            type: 'system'
        };
        
        this.addMessage(message);
    }
    
    // Przełączanie dźwięku
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const icon = this.elements.soundToggle.querySelector('i');
        
        if (this.soundEnabled) {
            icon.className = 'fas fa-volume-up';
            this.elements.soundToggle.classList.remove('active');
        } else {
            icon.className = 'fas fa-volume-mute';
            this.elements.soundToggle.classList.add('active');
        }
        
        ConfigUtils.set('audio.enabled', this.soundEnabled);
    }
    
    // Przełączanie minimalizacji
    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        this.elements.container.classList.toggle('minimized', this.isMinimized);

        const icon = this.elements.minimizeChat.querySelector('i');
        icon.className = this.isMinimized ? 'fas fa-plus' : 'fas fa-minus';
        
        // Add click listener to minimized chat for expanding
        if (this.isMinimized) {
            this.elements.container.addEventListener('click', this.handleMinimizedClick.bind(this));
            // Hide sidebar and navigation when minimized
            const sidebar = document.querySelector('.sidebar');
            const navigation = document.querySelector('.top-navigation');
            if (sidebar) sidebar.style.display = 'none';
            if (navigation) navigation.style.display = 'none';
        } else {
            this.elements.container.removeEventListener('click', this.handleMinimizedClick.bind(this));
            // Show sidebar and navigation when expanded
            const sidebar = document.querySelector('.sidebar');
            const navigation = document.querySelector('.top-navigation');
            if (sidebar) sidebar.style.display = '';
            if (navigation) navigation.style.display = '';
        }
    }
    
    // Przełączanie trybu pełnoekranowego
    toggleFullscreen() {
        const appContainer = document.querySelector('.app-container');
        const isFullscreen = appContainer.classList.contains('fullscreen-chat');
        
        appContainer.classList.toggle('fullscreen-chat', !isFullscreen);
        
        const icon = this.elements.fullscreenToggle.querySelector('i');
        icon.className = !isFullscreen ? 'fas fa-compress' : 'fas fa-expand';
        
        // Update button title
        this.elements.fullscreenToggle.title = !isFullscreen ? 'Wyjdź z pełnego ekranu' : 'Pełny ekran';
        
        // Trigger resize event to update layout
        window.dispatchEvent(new Event('resize'));
    }
    
    // Handle click on minimized chat to expand
    handleMinimizedClick(e) {
        // Prevent expanding if clicking on controls
        if (e.target.closest('.chat-controls')) {
            return;
        }
        
        if (this.isMinimized) {
            this.toggleMinimize();
        }
    }
    
    // Przełączanie dropdown użytkowników
    toggleUsersDropdown() {
        this.elements.usersDropdown.classList.toggle('show');
    }
    
    // Toggle emoji picker
    toggleEmojiPicker() {
        const emojiPicker = document.getElementById('emoji-picker');
        if (emojiPicker) {
            const isVisible = emojiPicker.style.display !== 'none';
            emojiPicker.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                this.initializeEmojiPicker();
            }
        }
    }

    // Initialize emoji picker with emojis
    initializeEmojiPicker() {
        const emojiGrid = document.getElementById('emoji-grid');
        if (!emojiGrid || emojiGrid.children.length > 0) return;

        const emojis = [
            '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
            '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
            '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
            '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
            '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
            '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
            '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏',
            '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔'
        ];

        emojis.forEach(emoji => {
            const emojiBtn = document.createElement('button');
            emojiBtn.className = 'emoji-item';
            emojiBtn.textContent = emoji;
            emojiBtn.onclick = () => this.insertEmoji(emoji);
            emojiGrid.appendChild(emojiBtn);
        });
    }

    // Insert emoji into message input
    insertEmoji(emoji) {
        const messageInput = this.elements.messageInput;
        const start = messageInput.selectionStart;
        const end = messageInput.selectionEnd;
        const text = messageInput.value;
        
        messageInput.value = text.substring(0, start) + emoji + text.substring(end);
        messageInput.selectionStart = messageInput.selectionEnd = start + emoji.length;
        
        // Close emoji picker
        const emojiPicker = document.getElementById('emoji-picker');
        if (emojiPicker) {
            emojiPicker.style.display = 'none';
        }
        
        // Focus back on input
        messageInput.focus();
        
        // Update character count
        this.handleInputChange();
    }
    
    // Zamykanie ogłoszenia
    closeAnnouncement() {
        this.elements.announcement.style.display = 'none';
    }
    
    // Przewijanie do dołu
    scrollToBottom() {
        this.elements.messagesList.scrollTop = this.elements.messagesList.scrollHeight;
        this.elements.scrollToBottom.style.display = 'none';
    }
    
    // Sprawdzenie czy przewinięte do dołu
    isScrolledToBottom() {
        const container = this.elements.messagesList;
        return container.scrollTop + container.clientHeight >= container.scrollHeight - 10;
    }
    
    // Pokazanie przycisku przewijania do dołu
    showScrollToBottomButton() {
        this.elements.scrollToBottom.style.display = 'block';
    }
    
    // Obsługa przewijania
    handleScroll() {
        if (this.isScrolledToBottom()) {
            this.elements.scrollToBottom.style.display = 'none';
        }
        
        // Ładowanie starszych wiadomości przy przewijaniu do góry
        if (this.elements.messagesList.scrollTop === 0) {
            this.loadOlderMessages();
        }
    }
    
    // Obsługa kliknięcia w dokument
    handleDocumentClick(e) {
        // Zamknij dropdown użytkowników
        if (!e.target.closest('.online-users')) {
            this.elements.usersDropdown.classList.remove('show');
        }
    }
    
    // Aktualizacja listy użytkowników
    updateUsersList() {
        const onlineUsers = Array.from(this.users.values()).filter(user => user.isOnline);
        this.elements.onlineCount.textContent = onlineUsers.length;
        
        this.elements.usersList.innerHTML = '';
        onlineUsers.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user-item';
            userElement.innerHTML = `
                <div class="user-avatar" style="background-color: ${this.getUserColor(user.id)}">
                    ${user.avatar ? `<img src="${user.avatar}" alt="${user.nick}">` : user.nick.charAt(0).toUpperCase()}
                </div>
                <div class="user-info">
                    <div class="user-nick">${this.escapeHtml(user.nick)}</div>
                    <div class="user-status ${user.isOnline ? 'online' : 'offline'}">
                        ${user.isOnline ? 'Online' : 'Offline'}
                    </div>
                </div>
            `;
            this.elements.usersList.appendChild(userElement);
        });
    }
    
    // Aktualizacja kart pokojów
    updateRoomTabs() {
        if (this.roomsSystem) {
            this.roomsSystem.updateRoomTabs();
            return;
        }
        
        // Fallback dla podstawowej aktualizacji kart
        this.elements.roomTabs.innerHTML = '';
        
        this.rooms.forEach(room => {
            const tabElement = document.createElement('div');
            tabElement.className = `tab ${room.id === this.currentRoom ? 'active' : ''}`;
            tabElement.dataset.room = room.id;
            
            tabElement.innerHTML = `
                <span>${this.escapeHtml(room.name)}</span>
                ${room.unreadCount > 0 ? `<span class="unread-count">${room.unreadCount}</span>` : ''}
            `;
            
            tabElement.addEventListener('click', () => this.switchRoom(room.id));
            this.elements.roomTabs.appendChild(tabElement);
        });
    }
    
    // Przełączanie pokoju
    switchRoom(roomId) {
        if (this.roomsSystem) {
            return this.roomsSystem.switchRoom(roomId);
        }
        
        // Fallback dla podstawowego przełączania pokojów
        if (roomId === this.currentRoom) return;
        
        const room = this.rooms.get(roomId);
        if (!room) return;
        
        this.currentRoom = roomId;
        room.unreadCount = 0;
        
        this.updateRoomTabs();
        this.rerenderMessages();
    }
    
    // Ponowne renderowanie wiadomości
    rerenderMessages() {
        this.elements.messagesList.innerHTML = '';
        
        const room = this.rooms.get(this.currentRoom);
        if (!room) return;
        
        room.messages.forEach(message => {
            this.renderMessage(message);
        });
        
        this.scrollToBottom();
    }
    
    // Aktualizacja statystyk
    updateStats() {
        this.elements.postsToday.textContent = this.currentUser.postsToday;
        this.elements.postsTotal.textContent = this.currentUser.postsCount;
    }
    
    // Pokazanie ogłoszenia
    showAnnouncement() {
        // Symulacja ogłoszenia
        if (Math.random() > 0.7) {
            this.elements.announcementText.textContent = 'Witamy w nowym systemie chatu IPS!';
            this.elements.announcement.style.display = 'block';
        }
    }
    
    // Funkcje pomocnicze
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    getUserColor(userId) {
        const colors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6f42c1', '#e83e8c', '#fd7e14'];
        const hash = userId.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        return colors[Math.abs(hash) % colors.length];
    }
    
    formatTime(date) {
        const format = ConfigUtils.get('appearance.timeFormat', '24h');
        const showDate = ConfigUtils.get('appearance.showDate', true);
        
        const timeOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: format === '12h'
        };
        
        const dateOptions = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        };
        
        const now = new Date();
        const messageDate = new Date(date);
        const isToday = now.toDateString() === messageDate.toDateString();
        const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === messageDate.toDateString();
        
        const timeStr = messageDate.toLocaleTimeString('pl-PL', timeOptions);
        
        if (!showDate || isToday) {
            return timeStr;
        } else if (isYesterday) {
            return `wczoraj ${timeStr}`;
        } else {
            const dateStr = messageDate.toLocaleDateString('pl-PL', dateOptions);
            return `${dateStr} ${timeStr}`;
        }
    }
    
    getRankName(rank) {
        const ranks = {
            admin: 'Admin',
            moderator: 'Mod',
            vip: 'VIP',
            premium: 'Premium'
        };
        return ranks[rank] || rank;
    }
    
    // Sprawdzanie uprawnień
    canManageMessage(message) {
        return true; // Podstawowa implementacja
    }
    
    canEditMessage(message) {
        return message.author.id === this.currentUser.id || 
               ConfigUtils.hasPermission(this.currentUser.group, 'canEditMessages');
    }
    
    canDeleteMessage(message) {
        return message.author.id === this.currentUser.id || 
               ConfigUtils.hasPermission(this.currentUser.group, 'canDeleteMessages');
    }
    
    // Ładowanie danych testowych
    loadMockMessages() {
        const mockMessages = [
            {
                id: 'msg_1',
                author: {
                    id: 'user_1',
                    nick: 'Admin',
                    country: 'PL',
                    rank: 'admin',
                    group: 'admin'
                },
                text: 'Witajcie w nowym systemie chatu! System rang jest już aktywny.',
                timestamp: new Date(Date.now() - 300000),
                room: 'main',
                type: 'user'
            },
            {
                id: 'msg_2',
                author: {
                    id: 'user_2',
                    nick: 'Moderator',
                    country: 'PL',
                    rank: 'moderator',
                    group: 'moderator'
                },
                text: 'Pamiętajcie o przestrzeganiu regulaminu chatu.',
                timestamp: new Date(Date.now() - 240000),
                room: 'main',
                type: 'user'
            },
            {
                id: 'msg_3',
                author: {
                    id: 'user_3',
                    nick: 'VIPUser',
                    country: 'DE',
                    rank: 'vip',
                    group: 'vip'
                },
                text: 'Świetnie wygląda ten nowy system! @Admin dziękuję za implementację.',
                timestamp: new Date(Date.now() - 180000),
                room: 'main',
                type: 'user'
            },
            {
                id: 'msg_4',
                author: {
                    id: 'user_4',
                    nick: 'RegularUser',
                    country: 'FR',
                    rank: 'user',
                    group: 'user'
                },
                text: 'Jak mogę uzyskać rangę VIP?',
                timestamp: new Date(Date.now() - 120000),
                room: 'main',
                type: 'user'
            },
            {
                id: 'msg_5',
                author: {
                    id: 'user_5',
                    nick: 'Guest',
                    country: 'ES',
                    rank: 'guest',
                    group: 'guest'
                },
                text: 'Cześć wszystkim! Jestem nowy tutaj.',
                timestamp: new Date(Date.now() - 60000),
                room: 'main',
                type: 'user'
            }
        ];
        
        mockMessages.forEach(message => {
            this.addMessage(message);
        });
    }
    
    // Symulacja wysłania wiadomości
    simulateMessageSent(message) {
        // W prawdziwej aplikacji tutaj byłoby wysłanie na serwer
        console.log('Wiadomość wysłana:', message);
    }
    
    // Odtwarzanie dźwięku wiadomości
    playMessageSound(message) {
        if (!this.soundEnabled) return;
        
        // Implementacja odtwarzania dźwięku
        // W prawdziwej aplikacji tutaj byłoby odtwarzanie pliku audio
        console.log('Odtwarzanie dźwięku dla wiadomości:', message.id);
    }
    
    // Odtwarzanie dźwięku powiadomienia
    playNotificationSound() {
        if (!this.soundEnabled) return;
        
        // Implementacja odtwarzania dźwięku powiadomienia
        console.log('Odtwarzanie dźwięku powiadomienia');
    }
    
    // Sprawdzenie czy użytkownik został wspomniany
    isMentioned(message) {
        if (this.mentionsSystem) {
            return MentionsSystem.containsMentionFor(message.text, this.currentUser);
        }
        return message.text.includes('@' + this.currentUser.nick);
    }
    
    // Obsługa wspomnienia
    handleMention(message) {
        if (this.mentionSoundEnabled) {
            // Odtwórz dźwięk wspomnienia
            console.log('Zostałeś wspomniany w wiadomości:', message.id);
        }
    }
    
    // Obsługa wskaźnika pisania
    handleTypingIndicator() {
        // Implementacja wskaźnika pisania
        clearTimeout(this.typingTimer);
        this.typingTimer = setTimeout(() => {
            // Wyślij informację o zakończeniu pisania
        }, 1000);
    }
    
    // Obsługa @mentions
    handleMentionTrigger() {
        const text = this.elements.messageInput.value;
        const cursorPos = this.elements.messageInput.selectionStart;
        const textBeforeCursor = text.substring(0, cursorPos);
        const match = textBeforeCursor.match(/@(\w*)$/);
        
        if (match) {
            const query = match[1].toLowerCase();
            this.showMentionsDropdown(query);
        } else {
            this.hideMentionsDropdown();
        }
    }
    
    // Pokazanie dropdown mentions
    showMentionsDropdown(query) {
        // Implementacja dropdown dla @mentions
        console.log('Pokaż mentions dla:', query);
    }
    
    // Ukrycie dropdown mentions
    hideMentionsDropdown() {
        // Implementacja ukrycia dropdown
    }
    
    // Pobieranie aktualnego cytowania
    getCurrentQuote() {
        return this.currentQuote || null;
    }
    
    // Czyszczenie cytowania
    clearQuote() {
        this.currentQuote = null;
        this.elements.quotePreview.style.display = 'none';
    }
    
    // Ładowanie starszych wiadomości
    loadOlderMessages() {
        // Implementacja ładowania starszych wiadomości
        console.log('Ładowanie starszych wiadomości...');
    }
    
    // Pokazanie błędu
    showError(message) {
        // Implementacja pokazywania błędów
        console.error('Błąd chatu:', message);
        alert(message); // Tymczasowe rozwiązanie
    }
    
    // Otwieranie ustawień
    openSettings() {
        // Check if settings panel already exists
        let settingsPanel = document.getElementById('settings-panel');
        if (settingsPanel) {
            settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
            return;
        }

        // Create settings panel
        settingsPanel = document.createElement('div');
        settingsPanel.id = 'settings-panel';
        settingsPanel.className = 'settings-panel';
        settingsPanel.innerHTML = `
            <div class="settings-content">
                <div class="settings-header">
                    <h3>Ustawienia chatu</h3>
                    <button class="close-btn" id="close-settings">✕</button>
                </div>
                <div class="settings-body">
                    <div class="setting-group">
                        <label>
                            <input type="checkbox" id="sound-enabled" ${this.soundEnabled ? 'checked' : ''}> 
                            Dźwięki wiadomości
                        </label>
                    </div>
                    <div class="setting-group">
                        <label>
                            <input type="checkbox" id="mention-sound-enabled" ${this.mentionSoundEnabled ? 'checked' : ''}> 
                            Dźwięki oznaczeń (@)
                        </label>
                    </div>
                    <div class="setting-group">
                        <label>
                            <input type="checkbox" id="mentions-enabled" checked> 
                            Powiadomienia o wzmiankach
                        </label>
                    </div>
                    <div class="setting-group">
                        <label>
                            Motyw:
                            <select id="theme-select">
                                <option value="light">Jasny</option>
                                <option value="dark">Ciemny</option>
                            </select>
                        </label>
                    </div>
                </div>
                <div class="settings-footer">
                    <button class="btn primary" id="save-settings">Zapisz</button>
                    <button class="btn secondary" id="cancel-settings">Anuluj</button>
                </div>
            </div>
        `;

        document.body.appendChild(settingsPanel);

        // Add event listeners
        document.getElementById('close-settings').onclick = () => this.closeSettings();
        document.getElementById('cancel-settings').onclick = () => this.closeSettings();
        document.getElementById('save-settings').onclick = () => this.saveSettings();
        
        // Close on outside click
        settingsPanel.onclick = (e) => {
            if (e.target === settingsPanel) {
                this.closeSettings();
            }
        };
    }

    // Close settings panel
    closeSettings() {
        const settingsPanel = document.getElementById('settings-panel');
        if (settingsPanel) {
            settingsPanel.remove();
        }
    }

    // Save settings
    saveSettings() {
        const soundEnabled = document.getElementById('sound-enabled').checked;
        const mentionSoundEnabled = document.getElementById('mention-sound-enabled').checked;
        const mentionsEnabled = document.getElementById('mentions-enabled').checked;
        const theme = document.getElementById('theme-select').value;

        // Apply settings
        this.soundEnabled = soundEnabled;
        this.mentionSoundEnabled = mentionSoundEnabled;
        
        // Save to localStorage
        localStorage.setItem('chatSettings', JSON.stringify({
            soundEnabled,
            mentionSoundEnabled,
            mentionsEnabled,
            theme
        }));

        this.closeSettings();
        this.addSystemMessage('Ustawienia zostały zapisane');
    }
    
    // Aktualizacja użytkowników online
    updateOnlineUsers() {
        // Symulacja użytkowników online
        const mockUsers = [
            { id: 'user_1', nick: 'Admin', country: 'PL', rank: 'admin', group: 'admin', isOnline: true },
            { id: 'user_2', nick: 'Moderator', country: 'PL', rank: 'moderator', group: 'moderator', isOnline: true },
            { id: 'user_3', nick: 'User123', country: 'DE', rank: 'user', group: 'user', isOnline: true }
        ];
        
        mockUsers.forEach(user => {
            this.users.set(user.id, user);
        });
        
        this.updateUsersList();
    }
    
    // Obsługa zmiany rozmiaru okna
    handleResize() {
        // Implementacja responsywności
        this.autoResizeTextarea();
    }
    
    // Sprawdź uprawnienia użytkownika
    hasPermission(permission) {
        if (this.ranksSystem) {
            return this.ranksSystem.hasPermission(this.currentUser.id, permission);
        }
        
        // Fallback - podstawowe uprawnienia
        const basicPermissions = {
            canSendMessages: true,
            canSendPrivateMessages: true,
            canCreateRooms: true,
            canJoinPrivateRooms: true,
            canUploadFiles: true,
            canSendVoiceMessages: true,
            canUseEmojis: true,
            canMentionUsers: true,
            canViewHistory: true
        };
        
        return basicPermissions[permission] || false;
    }

    // Pobierz limit użytkownika
    getUserLimit(limitType) {
        if (this.ranksSystem) {
            return this.ranksSystem.getUserLimit(this.currentUser.id, limitType);
        }
        
        // Fallback - podstawowe limity
        const basicLimits = {
            maxMessageLength: 500,
            floodProtection: 3000
        };
        
        return basicLimits[limitType];
    }

    // Aktualizuj licznik znaków
    updateCharacterCount() {
        const text = this.elements.messageInput.value;
        const maxLength = this.getUserLimit('maxMessageLength');
        const remaining = maxLength - text.length;
        
        if (this.elements.charCounter) {
            this.elements.charCounter.textContent = `${text.length}/${maxLength}`;
            
            // Zmień kolor w zależności od pozostałych znaków
            if (remaining < 50) {
                this.elements.charCounter.style.color = '#f44336';
            } else if (remaining < 100) {
                this.elements.charCounter.style.color = '#ff9800';
            } else {
                this.elements.charCounter.style.color = 'var(--text-secondary)';
            }
        }
    }

    // Obsługa akcji wiadomości
    handleMessageAction(e) {
        console.log('handleMessageAction called', e.target);
        
        const actionBtn = e.target.closest('.action-btn');
        if (!actionBtn) {
            console.log('No action button found');
            return;
        }
        
        console.log('Action button found:', actionBtn);
        
        const action = actionBtn.dataset.action;
        const messageElement = actionBtn.closest('.message');
        const messageId = messageElement?.dataset.messageId;
        
        console.log('Action details:', { action, messageId, messageElement });
        
        if (!messageId) {
            console.error('No message ID found');
            return;
        }
        
        switch (action) {
            case 'quote':
                console.log('Executing quote action');
                this.quoteMessage(messageId);
                break;
            case 'react':
                console.log('Executing react action');
                this.showReactionPicker(messageId, actionBtn);
                break;
            case 'edit':
                console.log('Executing edit action');
                this.editMessage(messageId);
                break;
            case 'delete':
                console.log('Executing delete action');
                this.deleteMessage(messageId);
                break;
            default:
                console.log('Unknown action:', action);
        }
    }
    
    // Cytowanie wiadomości
    quoteMessage(messageId) {
        console.log('quoteMessage called with ID:', messageId);
        
        // Znajdź wiadomość w aktualnym pokoju
        const room = this.rooms.get(this.currentRoom);
        if (!room) {
            console.error('No current room found');
            return;
        }
        
        const message = room.messages.find(msg => msg.id === messageId);
        if (!message) {
            console.error('Message not found in room:', messageId);
            return;
        }
        
        console.log('Found message for quoting:', message);
        
        // Pokaż podgląd cytowania
        const quotePreview = this.elements.quotePreview;
        if (!quotePreview) {
            console.error('Quote preview element not found');
            return;
        }
        
        quotePreview.innerHTML = `
            <div class="quote-content">
                <div class="quote-author">${this.escapeHtml(message.author.nick)}</div>
                <div class="quote-text">${this.escapeHtml(message.text.substring(0, 100))}${message.text.length > 100 ? '...' : ''}</div>
                <button class="quote-close" onclick="this.parentElement.parentElement.style.display='none'">✕</button>
            </div>
        `;
        quotePreview.style.display = 'block';
        
        // Ustaw focus na pole tekstowe
        this.elements.messageInput.focus();
        
        // Zapisz cytowaną wiadomość
        this.currentQuote = {
            id: messageId,
            author: message.author.nick,
            text: message.text
        };
        
        console.log('Quote set successfully:', this.currentQuote);
    }
    
    // Pokazanie selektora reakcji
    showReactionPicker(messageId, button) {
        console.log('showReactionPicker called with:', messageId, button);
        
        // Usuń istniejący picker jeśli istnieje
        const existingPicker = document.querySelector('.reaction-picker');
        if (existingPicker) {
            existingPicker.remove();
        }
        
        // Utwórz nowy picker
        const picker = document.createElement('div');
        picker.className = 'reaction-picker';
        picker.innerHTML = `
            <div class="reaction-options">
                <button class="reaction-option" data-emoji="👍">👍</button>
                <button class="reaction-option" data-emoji="❤️">❤️</button>
                <button class="reaction-option" data-emoji="😂">😂</button>
                <button class="reaction-option" data-emoji="😮">😮</button>
                <button class="reaction-option" data-emoji="😢">😢</button>
                <button class="reaction-option" data-emoji="😡">😡</button>
            </div>
        `;
        
        // Pozycjonuj picker
        const rect = button.getBoundingClientRect();
        picker.style.position = 'fixed';
        picker.style.top = (rect.top - 50) + 'px';
        picker.style.left = rect.left + 'px';
        picker.style.zIndex = '1000';
        picker.style.backgroundColor = 'white';
        picker.style.border = '1px solid #ccc';
        picker.style.borderRadius = '8px';
        picker.style.padding = '8px';
        picker.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        
        document.body.appendChild(picker);
        
        console.log('Reaction picker created and positioned');
        
        // Obsługa kliknięć w reakcje
        picker.addEventListener('click', (e) => {
            const option = e.target.closest('.reaction-option');
            if (option) {
                const emoji = option.dataset.emoji;
                console.log('Reaction selected:', emoji);
                this.addReaction(messageId, emoji);
                picker.remove();
            }
        });
        
        // Usuń picker po kliknięciu poza nim
        setTimeout(() => {
            document.addEventListener('click', function removePicker(e) {
                if (!picker.contains(e.target)) {
                    picker.remove();
                    document.removeEventListener('click', removePicker);
                }
            });
        }, 100);
    }
    
    // Dodanie reakcji do wiadomości
    addReaction(messageId, emoji) {
        // Znajdź wiadomość
        const room = this.rooms.get(this.currentRoom);
        if (!room) return;
        
        const message = room.messages.find(msg => msg.id === messageId);
        if (!message) return;
        
        // Inicjalizuj reakcje jeśli nie istnieją
        if (!message.reactions) {
            message.reactions = new Map();
        }
        
        // Dodaj lub usuń reakcję
        if (!message.reactions.has(emoji)) {
            message.reactions.set(emoji, new Set());
        }
        
        const users = message.reactions.get(emoji);
        if (users.has(this.currentUser.id)) {
            users.delete(this.currentUser.id);
            if (users.size === 0) {
                message.reactions.delete(emoji);
            }
        } else {
            users.add(this.currentUser.id);
        }
        
        // Odśwież wyświetlanie wiadomości
        this.refreshMessage(messageId);
    }
    
    // Edycja wiadomości
    editMessage(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageElement) return;
        
        const textElement = messageElement.querySelector('.message-text');
        if (!textElement) return;
        
        // Znajdź oryginalną wiadomość
        const room = this.rooms.get(this.currentRoom);
        const message = room?.messages.find(msg => msg.id === messageId);
        if (!message) return;
        
        // Utwórz pole edycji
        const editInput = document.createElement('textarea');
        editInput.className = 'edit-input';
        editInput.value = message.text;
        editInput.style.width = '100%';
        editInput.style.minHeight = '60px';
        
        // Utwórz przyciski
        const editControls = document.createElement('div');
        editControls.className = 'edit-controls';
        editControls.innerHTML = `
            <button class="btn btn-sm btn-primary save-edit">Zapisz</button>
            <button class="btn btn-sm btn-secondary cancel-edit">Anuluj</button>
        `;
        
        // Zastąp tekst polem edycji
        const originalText = textElement.innerHTML;
        textElement.innerHTML = '';
        textElement.appendChild(editInput);
        textElement.appendChild(editControls);
        
        editInput.focus();
        
        // Obsługa zapisywania
        editControls.querySelector('.save-edit').onclick = () => {
            const newText = editInput.value.trim();
            if (newText && newText !== message.text) {
                message.text = newText;
                message.edited = true;
                message.editedAt = new Date();
                this.refreshMessage(messageId);
                this.addSystemMessage(`Wiadomość została edytowana`);
            } else {
                textElement.innerHTML = originalText;
            }
        };
        
        // Obsługa anulowania
        editControls.querySelector('.cancel-edit').onclick = () => {
            textElement.innerHTML = originalText;
        };
    }
    
    // Usuwanie wiadomości
    deleteMessage(messageId) {
        if (!confirm('Czy na pewno chcesz usunąć tę wiadomość?')) {
            return;
        }
        
        // Znajdź i usuń wiadomość z pokoju
        const room = this.rooms.get(this.currentRoom);
        if (room) {
            const messageIndex = room.messages.findIndex(msg => msg.id === messageId);
            if (messageIndex !== -1) {
                room.messages.splice(messageIndex, 1);
            }
        }
        
        // Usuń element z DOM
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            messageElement.remove();
        }
        
        this.addSystemMessage('Wiadomość została usunięta');
    }
    
    // Odświeżenie wyświetlania wiadomości
    refreshMessage(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageElement) return;
        
        const room = this.rooms.get(this.currentRoom);
        const message = room?.messages.find(msg => msg.id === messageId);
        if (!message) return;
        
        // Odtwórz HTML wiadomości
        const newElement = this.createMessageElement(message);
        messageElement.replaceWith(newElement);
    }
    
    // Pobieranie aktualnego cytowania
    getCurrentQuote() {
        return this.currentQuote || null;
    }
    
    // Czyszczenie cytowania
    clearQuote() {
        this.elements.quotePreview.style.display = 'none';
        this.currentQuote = null;
    }
    
    // Czyszczenie przed zamknięciem
    cleanup() {
        // Czyszczenie timerów i nasłuchiwaczy
        if (this.typingTimer) {
            clearTimeout(this.typingTimer);
        }
    }

    // Inicjalizacja aktywnych użytkowników
    initializeActiveUsers() {
        this.activeUsers = new Map();
        this.setupActiveUsersEventListeners();
        this.loadSampleUsers(); // Załaduj przykładowych użytkowników
        this.updateActiveUsersCounter();
    }

    // Konfiguracja event listenerów dla aktywnych użytkowników
    setupActiveUsersEventListeners() {
        const counter = document.getElementById('activeUsersCounter');
        const dropdown = document.getElementById('usersDropdown');
        
        if (counter && dropdown) {
            // Toggle dropdown po kliknięciu
            counter.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleUsersDropdown();
            });
            
            // Zamknij dropdown po kliknięciu poza nim
            document.addEventListener('click', (e) => {
                if (!counter.contains(e.target) && !dropdown.contains(e.target)) {
                    this.hideUsersDropdown();
                }
            });
            
            // Zapobiegaj zamknięciu przy kliknięciu w dropdown
            dropdown.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    // Toggle dropdown z listą użytkowników
    toggleUsersDropdown() {
        const dropdown = document.getElementById('usersDropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }

    // Ukryj dropdown
    hideUsersDropdown() {
        const dropdown = document.getElementById('usersDropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    }

    // Aktualizuj licznik aktywnych użytkowników
    updateActiveUsersCounter() {
        const countElement = document.querySelector('.users-count');
        if (countElement) {
            countElement.textContent = this.activeUsers.size;
        }
        this.renderUsersList();
    }

    // Renderuj listę użytkowników w dropdown
    renderUsersList() {
        const usersList = document.getElementById('usersList');
        if (!usersList) return;

        usersList.innerHTML = '';

        if (this.activeUsers.size === 0) {
            usersList.innerHTML = '<div class="no-users">Brak aktywnych użytkowników</div>';
            return;
        }

        this.activeUsers.forEach((user, userId) => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.innerHTML = `
                <div class="user-item-avatar">${user.name.charAt(0).toUpperCase()}</div>
                <div class="user-item-info">
                    <div class="user-item-name">${user.name}</div>
                    <div class="user-item-status">Online</div>
                </div>
            `;
            
            // Dodaj event listener dla kliknięcia na użytkownika
            userItem.addEventListener('click', () => {
                this.onUserClick(userId, user);
            });
            
            usersList.appendChild(userItem);
        });
    }

    // Obsługa kliknięcia na użytkownika
    onUserClick(userId, user) {
        console.log('Kliknięto użytkownika:', user.name);
        // Tutaj można dodać funkcjonalność np. otwarcie prywatnej rozmowy
        this.hideUsersDropdown();
    }

    // Dodaj użytkownika do listy aktywnych
    addActiveUser(userId, userData) {
        this.activeUsers.set(userId, {
            id: userId,
            name: userData.name,
            avatar: userData.avatar || null,
            status: userData.status || 'online',
            joinTime: new Date()
        });
        this.updateActiveUsersCounter();
    }

    // Usuń użytkownika z listy aktywnych
    removeActiveUser(userId) {
        this.activeUsers.delete(userId);
        this.updateActiveUsersCounter();
    }

    // Załaduj przykładowych użytkowników (do testów)
    loadSampleUsers() {
        const sampleUsers = [
            { id: 'user1', name: 'Anna Kowalska' },
            { id: 'user2', name: 'Jan Nowak' },
            { id: 'user3', name: 'Maria Wiśniewska' },
            { id: 'user4', name: 'Piotr Wójcik' },
            { id: 'user5', name: 'Katarzyna Kamińska' }
        ];

        sampleUsers.forEach(user => {
            this.addActiveUser(user.id, user);
        });
    }
    
    // Renderowanie wiadomości z plikami
    renderFileMessage(messageData) {
        const fileData = messageData.fileData;
        if (!fileData) return this.escapeHtml(messageData.content || 'Plik');
        
        const fileId = fileData.id || Date.now();
        
        if (fileData.isImage) {
            return `
                <div class="message-file image">
                    <img src="${fileData.data}" 
                         alt="${fileData.name}" 
                         class="message-file-thumbnail"
                         onclick="fileUploadSystem.openModalFromMessage('${fileId}', '${fileData.name}', '${fileData.size}', '${fileData.data}', true)"
                         loading="lazy">
                </div>
            `;
        } else if (fileData.isVideo) {
            return `
                <div class="message-file video">
                    <video src="${fileData.data}" 
                           class="message-file-thumbnail"
                           onclick="fileUploadSystem.openModalFromMessage('${fileId}', '${fileData.name}', '${fileData.size}', '${fileData.data}', false)"
                           muted>
                    </video>
                </div>
            `;
        } else {
            return `
                <div class="message-file">
                    <div class="message-file-info">
                        <div class="message-file-icon">
                            <i class="fas fa-file"></i>
                        </div>
                        <div class="message-file-details">
                            <div class="message-file-name">${this.escapeHtml(fileData.name)}</div>
                            <div class="message-file-size">${this.formatFileSize(fileData.size)}</div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Formatowanie rozmiaru pliku
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Inicjalizacja chatu po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
    window.ipsChat = new IPSChat();
    window.chatApp = window.ipsChat; // Global reference for navigation
});

// Eksport dla innych modułów
window.IPSChat = IPSChat;