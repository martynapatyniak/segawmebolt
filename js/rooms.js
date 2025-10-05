// System pokojów dla chatu IPS
class RoomsSystem {
    constructor(chat) {
        this.chat = chat;
        this.rooms = new Map();
        this.currentRoom = 'main';
        this.roomModal = null;
        this.joinModal = null;
        
        this.init();
    }
    
    init() {
        this.createDefaultRooms();
        this.createModals();
        this.bindEvents();
    }
    
    // Tworzenie domyślnych pokojów
    createDefaultRooms() {
        // Pokój główny
        this.createRoom({
            id: 'main',
            name: 'Główny',
            type: 'public',
            description: 'Główny pokój chatu',
            maxUsers: 0, // bez limitu
            password: null,
            owner: null,
            moderators: new Set(),
            allowedUsers: new Set(),
            bannedUsers: new Set(),
            settings: {
                allowFiles: true,
                allowVoice: true,
                allowLinks: true,
                slowMode: 0,
                requireApproval: false
            },
            createdAt: new Date(),
            isDefault: true
        });
        
        // Pokój VIP (przykład)
        if (ConfigUtils.get('rooms.createVipRoom', true)) {
            this.createRoom({
                id: 'vip',
                name: 'VIP',
                type: 'restricted',
                description: 'Pokój dla użytkowników VIP',
                maxUsers: 50,
                password: null,
                owner: null,
                moderators: new Set(),
                allowedUsers: new Set(),
                bannedUsers: new Set(),
                requiredRank: 'vip',
                settings: {
                    allowFiles: true,
                    allowVoice: true,
                    allowLinks: true,
                    slowMode: 0,
                    requireApproval: false
                },
                createdAt: new Date(),
                isDefault: true
            });
        }
    }
    
    // Tworzenie modali
    createModals() {
        this.createRoomModal();
        this.createJoinModal();
        this.createRoomSettingsModal();
    }
    
    // Modal tworzenia pokoju
    createRoomModal() {
        this.roomModal = document.createElement('div');
        this.roomModal.className = 'modal room-modal';
        this.roomModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Utwórz nowy pokój</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="create-room-form">
                        <div class="form-group">
                            <label for="room-name">Nazwa pokoju *</label>
                            <input type="text" id="room-name" name="name" required maxlength="50">
                        </div>
                        
                        <div class="form-group">
                            <label for="room-description">Opis</label>
                            <textarea id="room-description" name="description" maxlength="200"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="room-type">Typ pokoju</label>
                            <select id="room-type" name="type">
                                <option value="public">Publiczny</option>
                                <option value="private">Prywatny</option>
                                <option value="password">Chroniony hasłem</option>
                            </select>
                        </div>
                        
                        <div class="form-group password-group" style="display: none;">
                            <label for="room-password">Hasło</label>
                            <input type="password" id="room-password" name="password">
                        </div>
                        
                        <div class="form-group">
                            <label for="room-max-users">Maksymalna liczba użytkowników (0 = bez limitu)</label>
                            <input type="number" id="room-max-users" name="maxUsers" min="0" max="1000" value="0">
                        </div>
                        
                        <div class="form-group">
                            <label>Ustawienia pokoju</label>
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" name="allowFiles" checked>
                                    <span>Zezwalaj na pliki</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="allowVoice" checked>
                                    <span>Zezwalaj na wiadomości głosowe</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="allowLinks" checked>
                                    <span>Zezwalaj na linki</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="requireApproval">
                                    <span>Wymagaj zatwierdzenia do dołączenia</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group private-users-group" style="display: none;">
                            <label>Użytkownicy z dostępem</label>
                            <div class="users-selector">
                                <input type="text" id="user-search" placeholder="Wyszukaj użytkownika...">
                                <div class="users-list" id="available-users"></div>
                                <div class="selected-users" id="selected-users"></div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Anuluj</button>
                    <button type="submit" form="create-room-form" class="btn btn-primary">Utwórz pokój</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.roomModal);
        this.bindRoomModalEvents();
    }
    
    // Modal dołączania do pokoju
    createJoinModal() {
        this.joinModal = document.createElement('div');
        this.joinModal.className = 'modal join-modal';
        this.joinModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Dołącz do pokoju</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="join-room-form">
                        <div class="form-group">
                            <label for="join-room-id">ID pokoju lub nazwa</label>
                            <input type="text" id="join-room-id" name="roomId" required>
                        </div>
                        
                        <div class="form-group password-group" style="display: none;">
                            <label for="join-room-password">Hasło</label>
                            <input type="password" id="join-room-password" name="password">
                        </div>
                        
                        <div class="room-info" id="room-info" style="display: none;">
                            <h4>Informacje o pokoju</h4>
                            <div class="room-details"></div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Anuluj</button>
                    <button type="submit" form="join-room-form" class="btn btn-primary">Dołącz</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.joinModal);
        this.bindJoinModalEvents();
    }
    
    // Modal ustawień pokoju
    createRoomSettingsModal() {
        this.settingsModal = document.createElement('div');
        this.settingsModal.className = 'modal room-settings-modal';
        this.settingsModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Ustawienia pokoju</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="tabs">
                        <div class="tab-buttons">
                            <button class="tab-btn active" data-tab="general">Ogólne</button>
                            <button class="tab-btn" data-tab="permissions">Uprawnienia</button>
                            <button class="tab-btn" data-tab="users">Użytkownicy</button>
                            <button class="tab-btn" data-tab="moderation">Moderacja</button>
                        </div>
                        
                        <div class="tab-content">
                            <div class="tab-pane active" id="general-tab">
                                <!-- Zawartość zakładki ogólnej -->
                            </div>
                            <div class="tab-pane" id="permissions-tab">
                                <!-- Zawartość zakładki uprawnień -->
                            </div>
                            <div class="tab-pane" id="users-tab">
                                <!-- Zawartość zakładki użytkowników -->
                            </div>
                            <div class="tab-pane" id="moderation-tab">
                                <!-- Zawartość zakładki moderacji -->
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Anuluj</button>
                    <button type="button" class="btn btn-primary" id="save-room-settings">Zapisz</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.settingsModal);
        this.bindSettingsModalEvents();
    }
    
    // Bindowanie zdarzeń
    bindEvents() {
        // Przycisk tworzenia pokoju (używa klasy zamiast ID)
        const createRoomBtn = document.querySelector('.add-room-btn');
        console.log('createRoomBtn found:', createRoomBtn); // Debug log
        if (createRoomBtn) {
            createRoomBtn.addEventListener('click', () => {
                console.log('Add room button clicked'); // Debug log
                this.showCreateRoomModal();
            });
        } else {
            console.error('Add room button not found');
        }
        
        // Przycisk dołączania do pokoju
        const joinRoomBtn = document.getElementById('join-room-btn');
        if (joinRoomBtn) {
            joinRoomBtn.addEventListener('click', () => this.showJoinRoomModal());
        }
        
        // Kliknięcia w karty pokojów
        this.chat.elements.roomTabs.addEventListener('click', (e) => {
            const tab = e.target.closest('.tab');
            if (tab) {
                const roomId = tab.dataset.room;
                if (roomId) {
                    this.switchRoom(roomId);
                }
            }
            
            // Menu kontekstowe pokoju
            const menuBtn = e.target.closest('.room-menu-btn');
            if (menuBtn) {
                e.stopPropagation();
                this.showRoomContextMenu(menuBtn);
            }
        });
    }
    
    // Bindowanie zdarzeń modala tworzenia pokoju
    bindRoomModalEvents() {
        const modal = this.roomModal;
        const form = modal.querySelector('#create-room-form');
        const typeSelect = modal.querySelector('#room-type');
        const passwordGroup = modal.querySelector('.password-group');
        const privateUsersGroup = modal.querySelector('.private-users-group');
        
        // Zmiana typu pokoju
        typeSelect.addEventListener('change', () => {
            const type = typeSelect.value;
            passwordGroup.style.display = type === 'password' ? 'block' : 'none';
            privateUsersGroup.style.display = type === 'private' ? 'block' : 'none';
        });
        
        // Wysłanie formularza
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreateRoom(form);
        });
        
        // Zamknięcie modala
        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.hideModal(modal);
        });
        
        modal.querySelector('[data-dismiss="modal"]').addEventListener('click', () => {
            this.hideModal(modal);
        });
        
        // Wyszukiwanie użytkowników
        const userSearch = modal.querySelector('#user-search');
        if (userSearch) {
            userSearch.addEventListener('input', (e) => {
                this.searchUsersForRoom(e.target.value);
            });
        }
    }
    
    // Bindowanie zdarzeń modala dołączania
    bindJoinModalEvents() {
        const modal = this.joinModal;
        const form = modal.querySelector('#join-room-form');
        const roomIdInput = modal.querySelector('#join-room-id');
        
        // Wyszukiwanie pokoju
        roomIdInput.addEventListener('input', (e) => {
            this.searchRoomInfo(e.target.value);
        });
        
        // Wysłanie formularza
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleJoinRoom(form);
        });
        
        // Zamknięcie modala
        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.hideModal(modal);
        });
        
        modal.querySelector('[data-dismiss="modal"]').addEventListener('click', () => {
            this.hideModal(modal);
        });
    }
    
    // Bindowanie zdarzeń modala ustawień
    bindSettingsModalEvents() {
        const modal = this.settingsModal;
        
        // Przełączanie zakładek
        modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                this.switchSettingsTab(tabId);
            });
        });
        
        // Zapisywanie ustawień
        modal.querySelector('#save-room-settings').addEventListener('click', () => {
            this.saveRoomSettings();
        });
        
        // Zamknięcie modala
        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.hideModal(modal);
        });
        
        modal.querySelector('[data-dismiss="modal"]').addEventListener('click', () => {
            this.hideModal(modal);
        });
    }
    
    // Tworzenie pokoju
    createRoom(roomData) {
        const room = {
            id: roomData.id || this.generateRoomId(),
            name: roomData.name,
            type: roomData.type || 'public',
            description: roomData.description || '',
            maxUsers: roomData.maxUsers || 0,
            password: roomData.password || null,
            owner: roomData.owner || this.chat.currentUser.id,
            moderators: roomData.moderators || new Set(),
            allowedUsers: roomData.allowedUsers || new Set(),
            bannedUsers: roomData.bannedUsers || new Set(),
            requiredRank: roomData.requiredRank || null,
            settings: {
                allowFiles: roomData.settings?.allowFiles ?? true,
                allowVoice: roomData.settings?.allowVoice ?? true,
                allowLinks: roomData.settings?.allowLinks ?? true,
                slowMode: roomData.settings?.slowMode ?? 0,
                requireApproval: roomData.settings?.requireApproval ?? false,
                ...roomData.settings
            },
            users: new Set(),
            messages: [],
            unreadCount: 0,
            isActive: false,
            createdAt: roomData.createdAt || new Date(),
            isDefault: roomData.isDefault || false
        };
        
        this.rooms.set(room.id, room);
        this.chat.rooms.set(room.id, room);
        
        // Dodaj właściciela do pokoju
        if (room.owner) {
            room.users.add(room.owner);
        }
        
        this.updateRoomTabs();
        
        return room;
    }
    
    // Usuwanie pokoju
    deleteRoom(roomId) {
        const room = this.rooms.get(roomId);
        if (!room || room.isDefault) {
            return false;
        }
        
        // Sprawdź uprawnienia
        if (!this.canManageRoom(room)) {
            this.chat.showError('Nie masz uprawnień do usunięcia tego pokoju');
            return false;
        }
        
        // Przenieś użytkowników do pokoju głównego
        room.users.forEach(userId => {
            if (userId === this.chat.currentUser.id && this.currentRoom === roomId) {
                this.switchRoom('main');
            }
        });
        
        // Usuń pokój
        this.rooms.delete(roomId);
        this.chat.rooms.delete(roomId);
        
        this.updateRoomTabs();
        
        return true;
    }
    
    // Dołączanie do pokoju
    joinRoom(roomId, password = null) {
        const room = this.rooms.get(roomId);
        if (!room) {
            this.chat.showError('Pokój nie istnieje');
            return false;
        }
        
        // Sprawdź czy użytkownik może dołączyć
        if (!this.canJoinRoom(room, password)) {
            return false;
        }
        
        // Dodaj użytkownika do pokoju
        room.users.add(this.chat.currentUser.id);
        
        // Przełącz na pokój
        this.switchRoom(roomId);
        
        // Wyślij wiadomość systemową
        this.chat.addSystemMessage(`${this.chat.currentUser.nick} dołączył do pokoju`);
        
        return true;
    }
    
    // Opuszczanie pokoju
    leaveRoom(roomId) {
        const room = this.rooms.get(roomId);
        if (!room || room.isDefault) {
            return false;
        }
        
        // Usuń użytkownika z pokoju
        room.users.delete(this.chat.currentUser.id);
        
        // Jeśli to aktualny pokój, przełącz na główny
        if (this.currentRoom === roomId) {
            this.switchRoom('main');
        }
        
        // Jeśli pokój jest pusty i nie jest domyślny, usuń go
        if (room.users.size === 0 && !room.isDefault && room.type === 'private') {
            this.deleteRoom(roomId);
        }
        
        this.updateRoomTabs();
        
        return true;
    }
    
    // Przełączanie pokoju
    switchRoom(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return false;
        
        // Sprawdź czy użytkownik może wejść do pokoju
        if (!room.users.has(this.chat.currentUser.id) && !this.canJoinRoom(room)) {
            this.chat.showError('Nie masz dostępu do tego pokoju');
            return false;
        }
        
        // Dodaj użytkownika do pokoju jeśli nie jest
        if (!room.users.has(this.chat.currentUser.id)) {
            room.users.add(this.chat.currentUser.id);
        }
        
        this.currentRoom = roomId;
        this.chat.currentRoom = roomId;
        room.unreadCount = 0;
        
        this.updateRoomTabs();
        this.chat.rerenderMessages();
        
        // Aktualizuj tytuł chatu
        this.updateChatTitle(room);
        
        return true;
    }
    
    // Sprawdzenie czy użytkownik może dołączyć do pokoju
    canJoinRoom(room, password = null) {
        const user = this.chat.currentUser;
        
        // Sprawdź ban
        if (room.bannedUsers.has(user.id)) {
            this.chat.showError('Zostałeś zbanowany w tym pokoju');
            return false;
        }
        
        // Sprawdź limit użytkowników
        if (room.maxUsers > 0 && room.users.size >= room.maxUsers) {
            this.chat.showError('Pokój jest pełny');
            return false;
        }
        
        // Sprawdź typ pokoju
        switch (room.type) {
            case 'public':
                return true;
                
            case 'private':
                if (!room.allowedUsers.has(user.id) && room.owner !== user.id) {
                    this.chat.showError('Nie masz dostępu do tego prywatnego pokoju');
                    return false;
                }
                break;
                
            case 'password':
                if (!password || room.password !== password) {
                    this.chat.showError('Nieprawidłowe hasło');
                    return false;
                }
                break;
                
            case 'restricted':
                if (room.requiredRank && !this.hasRequiredRank(user, room.requiredRank)) {
                    this.chat.showError(`Wymagana ranga: ${room.requiredRank}`);
                    return false;
                }
                break;
        }
        
        return true;
    }
    
    // Sprawdzenie czy użytkownik może zarządzać pokojem
    canManageRoom(room) {
        const user = this.chat.currentUser;
        
        return room.owner === user.id || 
               room.moderators.has(user.id) ||
               ConfigUtils.hasPermission(user.group, 'canManageRooms');
    }
    
    // Sprawdzenie wymaganej rangi
    hasRequiredRank(user, requiredRank) {
        const rankHierarchy = ['user', 'vip', 'premium', 'moderator', 'admin'];
        const userRankIndex = rankHierarchy.indexOf(user.rank);
        const requiredRankIndex = rankHierarchy.indexOf(requiredRank);
        
        return userRankIndex >= requiredRankIndex;
    }
    
    // Aktualizacja kart pokojów
    updateRoomTabs() {
        const container = this.chat.elements.roomTabs;
        container.innerHTML = '';
        
        // Dodaj karty pokojów (bez dodatkowego przycisku tworzenia)
        this.rooms.forEach(room => {
            if (room.users.has(this.chat.currentUser.id) || room.type === 'public') {
                const tab = this.createRoomTab(room);
                container.appendChild(tab);
            }
        });
        
        // Dodaj przycisk dołączania do pokoju
        const joinBtn = document.createElement('button');
        joinBtn.className = 'join-room-btn';
        joinBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i>';
        joinBtn.title = 'Dołącz do pokoju';
        joinBtn.addEventListener('click', () => this.showJoinRoomModal());
        container.appendChild(joinBtn);
    }
    
    // Tworzenie karty pokoju
    createRoomTab(room) {
        const tab = document.createElement('div');
        tab.className = `tab ${room.id === this.currentRoom ? 'active' : ''}`;
        tab.dataset.room = room.id;
        
        tab.innerHTML = `
            <span class="room-name">${this.chat.escapeHtml(room.name)}</span>
            ${room.unreadCount > 0 ? `<span class="unread-count">${room.unreadCount}</span>` : ''}
            ${room.type === 'private' ? '<i class="fas fa-lock room-type-icon"></i>' : ''}
            ${room.type === 'password' ? '<i class="fas fa-key room-type-icon"></i>' : ''}
            ${this.canManageRoom(room) ? '<button class="room-menu-btn"><i class="fas fa-ellipsis-v"></i></button>' : ''}
        `;
        
        return tab;
    }
    
    // Pokazanie menu kontekstowego pokoju
    showRoomContextMenu(button) {
        const roomId = button.closest('.tab').dataset.room;
        const room = this.rooms.get(roomId);
        
        if (!room) return;
        
        const menu = document.createElement('div');
        menu.className = 'context-menu room-context-menu';
        
        const menuItems = [];
        
        if (this.canManageRoom(room)) {
            menuItems.push(
                { text: 'Ustawienia pokoju', icon: 'fas fa-cog', action: () => this.showRoomSettings(roomId) },
                { text: 'Zarządzaj użytkownikami', icon: 'fas fa-users', action: () => this.showUserManagement(roomId) }
            );
            
            if (!room.isDefault) {
                menuItems.push({ text: 'Usuń pokój', icon: 'fas fa-trash', action: () => this.confirmDeleteRoom(roomId), danger: true });
            }
        }
        
        if (!room.isDefault) {
            menuItems.push({ text: 'Opuść pokój', icon: 'fas fa-sign-out-alt', action: () => this.leaveRoom(roomId) });
        }
        
        menuItems.push({ text: 'Informacje o pokoju', icon: 'fas fa-info-circle', action: () => this.showRoomInfo(roomId) });
        
        menu.innerHTML = menuItems.map(item => `
            <div class="menu-item ${item.danger ? 'danger' : ''}" data-action="${item.action}">
                <i class="${item.icon}"></i>
                <span>${item.text}</span>
            </div>
        `).join('');
        
        // Pozycjonowanie menu
        const rect = button.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = `${rect.bottom + 5}px`;
        menu.style.left = `${rect.left}px`;
        
        document.body.appendChild(menu);
        
        // Obsługa kliknięć
        menu.addEventListener('click', (e) => {
            const item = e.target.closest('.menu-item');
            if (item) {
                const actionIndex = Array.from(menu.children).indexOf(item);
                menuItems[actionIndex].action();
                document.body.removeChild(menu);
            }
        });
        
        // Zamknięcie menu po kliknięciu poza nim
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                if (document.body.contains(menu)) {
                    document.body.removeChild(menu);
                }
                document.removeEventListener('click', closeMenu);
            });
        }, 10);
    }
    
    // Pokazanie modala tworzenia pokoju
    showCreateRoomModal() {
        console.log('showCreateRoomModal called'); // Debug log
        if (!this.roomModal) {
            console.error('roomModal not found');
            return;
        }
        this.showModal(this.roomModal);
        this.populateUsersList();
    }
    
    // Pokazanie modala dołączania do pokoju
    showJoinRoomModal() {
        this.showModal(this.joinModal);
    }
    
    // Pokazanie ustawień pokoju
    showRoomSettings(roomId) {
        const room = this.rooms.get(roomId);
        if (!room || !this.canManageRoom(room)) return;
        
        this.currentSettingsRoom = roomId;
        this.populateRoomSettings(room);
        this.showModal(this.settingsModal);
    }
    
    // Obsługa tworzenia pokoju
    handleCreateRoom(form) {
        const formData = new FormData(form);
        const roomData = {
            name: formData.get('name'),
            description: formData.get('description'),
            type: formData.get('type'),
            password: formData.get('password'),
            maxUsers: parseInt(formData.get('maxUsers')) || 0,
            settings: {
                allowFiles: formData.has('allowFiles'),
                allowVoice: formData.has('allowVoice'),
                allowLinks: formData.has('allowLinks'),
                requireApproval: formData.has('requireApproval')
            }
        };
        
        // Walidacja
        if (!roomData.name.trim()) {
            this.chat.showError('Nazwa pokoju jest wymagana');
            return;
        }
        
        if (roomData.type === 'password' && !roomData.password) {
            this.chat.showError('Hasło jest wymagane dla pokoju chronionego hasłem');
            return;
        }
        
        // Pobierz wybranych użytkowników dla pokoju prywatnego
        if (roomData.type === 'private') {
            roomData.allowedUsers = new Set(this.getSelectedUsers());
        }
        
        // Utwórz pokój
        const room = this.createRoom(roomData);
        
        // Dołącz do pokoju
        this.joinRoom(room.id);
        
        // Zamknij modal
        this.hideModal(this.roomModal);
        
        // Wyczyść formularz
        form.reset();
        
        this.chat.addSystemMessage(`Pokój "${room.name}" został utworzony`);
    }
    
    // Obsługa dołączania do pokoju
    handleJoinRoom(form) {
        const formData = new FormData(form);
        const roomId = formData.get('roomId');
        const password = formData.get('password');
        
        if (this.joinRoom(roomId, password)) {
            this.hideModal(this.joinModal);
            form.reset();
        }
    }
    
    // Funkcje pomocnicze
    generateRoomId() {
        return 'room_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    showModal(modal) {
        modal.classList.add('show');
        document.body.classList.add('modal-open');
    }
    
    hideModal(modal) {
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
    }
    
    updateChatTitle(room) {
        const titleElement = document.querySelector('.chat-title');
        if (titleElement) {
            titleElement.textContent = room.name;
        }
    }
    
    populateUsersList() {
        // Implementacja wypełniania listy użytkowników
    }
    
    searchUsersForRoom(query) {
        // Implementacja wyszukiwania użytkowników
    }
    
    searchRoomInfo(roomId) {
        // Implementacja wyszukiwania informacji o pokoju
    }
    
    getSelectedUsers() {
        // Implementacja pobierania wybranych użytkowników
        return [];
    }
    
    populateRoomSettings(room) {
        // Implementacja wypełniania ustawień pokoju
    }
    
    switchSettingsTab(tabId) {
        // Implementacja przełączania zakładek ustawień
    }
    
    saveRoomSettings() {
        // Implementacja zapisywania ustawień pokoju
    }
    
    showUserManagement(roomId) {
        // Implementacja zarządzania użytkownikami
    }
    
    confirmDeleteRoom(roomId) {
        if (confirm('Czy na pewno chcesz usunąć ten pokój?')) {
            this.deleteRoom(roomId);
        }
    }
    
    showRoomInfo(roomId) {
        // Implementacja pokazywania informacji o pokoju
    }
}

// Eksport klasy
window.RoomsSystem = RoomsSystem;