// Konfiguracja chatu IPS
const ChatConfig = {
    // Podstawowe ustawienia
    version: '1.0.0',
    debug: true,
    
    // Ustawienia serwera (symulacja)
    server: {
        url: 'ws://localhost:8080',
        reconnectInterval: 5000,
        maxReconnectAttempts: 10
    },
    
    // Ustawienia wiadomości
    messages: {
        maxLength: 2000,
        maxHistory: 100,
        autoDeleteAfter: 24 * 60 * 60 * 1000, // 24 godziny
        loadOnScroll: true,
        initialLoadCount: 50,
        antiFloodDelay: 1000, // ms między wiadomościami
        allowShiftEnter: true
    },
    
    // Ustawienia użytkowników
    users: {
        showCountryFlags: true,
        showRanks: true,
        showOnlineStatus: true,
        maxNickLength: 20,
        allowGuestUsers: true
    },
    
    // Ustawienia pokojów
    rooms: {
        allowPrivateRooms: true,
        maxRooms: 10,
        defaultRoom: 'main',
        allowRoomCreation: true
    },
    
    // Ustawienia plików
    files: {
        allowUpload: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/*', 'video/*', 'audio/*', 'text/*'],
        allowDragDrop: true,
        showThumbnails: true
    },
    
    // Ustawienia dźwięku
    audio: {
        enabled: true,
        messageSound: true,
        mentionSound: true,
        notificationVolume: 0.5,
        sounds: {
            message: 'sounds/message.mp3',
            mention: 'sounds/mention.mp3',
            join: 'sounds/join.mp3',
            leave: 'sounds/leave.mp3'
        }
    },
    
    // Ustawienia wyglądu
    appearance: {
        theme: 'light', // light, dark, auto
        fontSize: 14,
        fontWeight: 'normal',
        chatWidth: 800,
        chatHeight: 600,
        showAvatars: true,
        showTimestamps: true,
        showDate: true, // Pokazuj datę w wiadomościach
        timeFormat: '24h', // 12h, 24h
        dateFormat: 'DD.MM.YYYY'
    },
    
    // Ustawienia funkcji
    features: {
        mentions: true,
        quotes: true,
        reactions: true,
        voiceMessages: true,
        translation: false,
        wordFilter: true,
        antiSpam: true,
        messageEditing: true,
        messageDeletion: true
    },
    
    // Uprawnienia grup
    permissions: {
        guest: {
            canSendMessages: true,
            canUploadFiles: false,
            canCreateRooms: false,
            canUseVoice: false,
            canMention: true,
            canReact: true,
            messageLength: 500
        },
        user: {
            canSendMessages: true,
            canUploadFiles: true,
            canCreateRooms: false,
            canUseVoice: true,
            canMention: true,
            canReact: true,
            messageLength: 1000
        },
        vip: {
            canSendMessages: true,
            canUploadFiles: true,
            canCreateRooms: true,
            canUseVoice: true,
            canMention: true,
            canReact: true,
            messageLength: 2000
        },
        moderator: {
            canSendMessages: true,
            canUploadFiles: true,
            canCreateRooms: true,
            canUseVoice: true,
            canMention: true,
            canReact: true,
            canDeleteMessages: true,
            canEditMessages: true,
            canBanUsers: true,
            canMuteUsers: true,
            canWarnUsers: true,
            canAccessArchive: true,
            messageLength: 2000,
            banDuration: 7 * 24 * 60 * 60 * 1000 // 7 dni
        },
        admin: {
            canSendMessages: true,
            canUploadFiles: true,
            canCreateRooms: true,
            canUseVoice: true,
            canMention: true,
            canReact: true,
            canDeleteMessages: true,
            canEditMessages: true,
            canBanUsers: true,
            canMuteUsers: true,
            canWarnUsers: true,
            canAccessArchive: true,
            canManageSettings: true,
            canManageUsers: true,
            canManageRooms: true,
            canSendAnnouncements: true,
            canSendSystemMessages: true,
            messageLength: 2000,
            banDuration: Infinity
        }
    },
    
    // Filtr słów
    wordFilter: {
        enabled: true,
        words: [
            // Lista zakazanych słów
        ],
        replacements: {
            // słowo: zamiennik
        },
        action: 'replace' // replace, block, warn
    },
    
    // Ustawienia tłumaczenia
    translation: {
        enabled: false,
        defaultLanguage: 'pl',
        autoDetect: true,
        supportedLanguages: ['pl', 'en', 'de', 'fr', 'es', 'it', 'ru']
    },
    
    // Emotki
    emojis: {
        enabled: true,
        categories: {
            smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
            people: ['👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👩', '🧓', '👴', '👵', '🙍', '🙎', '🙅', '🙆', '💁', '🙋', '🧏', '🙇', '🤦', '🤷', '👮', '🕵️', '💂', '👷', '🤴', '👸', '👳', '👲'],
            nature: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇'],
            food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🍞'],
            activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️'],
            travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞'],
            objects: ['💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🧰', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🔩', '⚙️', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓'],
            symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐']
        }
    },
    
    // Ustawienia archiwum
    archive: {
        enabled: true,
        retentionDays: 365,
        searchEnabled: true,
        exportEnabled: true,
        importEnabled: true
    },
    
    // Ustawienia bezpieczeństwa
    security: {
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000, // 15 minut
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 godziny
        requireStrongPasswords: false,
        allowedDomains: [], // puste = wszystkie domeny
        blockedIPs: [],
        rateLimiting: {
            messages: 60, // wiadomości na minutę
            uploads: 10,  // uploady na minutę
            mentions: 20  // wzmianki na minutę
        }
    },
    
    // Ustawienia powiadomień
    notifications: {
        enabled: true,
        showDesktop: true,
        showInChat: true,
        mentionHighlight: true,
        newMessageIndicator: true,
        unreadCounter: true
    },
    
    // Ustawienia responsywności
    responsive: {
        breakpoints: {
            mobile: 768,
            tablet: 1024,
            desktop: 1200
        },
        mobileOptimizations: true,
        touchOptimizations: true
    },
    
    // Ustawienia deweloperskie
    development: {
        mockData: true,
        simulateLatency: 100,
        enableLogging: true,
        showDebugInfo: false
    }
};

// Funkcje pomocnicze dla konfiguracji
const ConfigUtils = {
    // Pobierz ustawienie z localStorage lub użyj domyślnej wartości
    get(path, defaultValue = null) {
        try {
            const stored = localStorage.getItem(`chat_config_${path}`);
            return stored ? JSON.parse(stored) : (defaultValue || this.getNestedValue(ChatConfig, path));
        } catch (e) {
            console.warn('Błąd podczas pobierania konfiguracji:', e);
            return defaultValue || this.getNestedValue(ChatConfig, path);
        }
    },
    
    // Zapisz ustawienie do localStorage
    set(path, value) {
        try {
            localStorage.setItem(`chat_config_${path}`, JSON.stringify(value));
            this.setNestedValue(ChatConfig, path, value);
            this.notifyChange(path, value);
        } catch (e) {
            console.error('Błąd podczas zapisywania konfiguracji:', e);
        }
    },
    
    // Pobierz zagnieżdżoną wartość z obiektu
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    },
    
    // Ustaw zagnieżdżoną wartość w obiekcie
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!current[key]) current[key] = {};
            return current[key];
        }, obj);
        target[lastKey] = value;
    },
    
    // Powiadom o zmianie konfiguracji
    notifyChange(path, value) {
        window.dispatchEvent(new CustomEvent('configChanged', {
            detail: { path, value }
        }));
    },
    
    // Zresetuj konfigurację do wartości domyślnych
    reset() {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('chat_config_'));
        keys.forEach(key => localStorage.removeItem(key));
        window.location.reload();
    },
    
    // Eksportuj konfigurację
    export() {
        const config = {};
        const keys = Object.keys(localStorage).filter(key => key.startsWith('chat_config_'));
        keys.forEach(key => {
            const path = key.replace('chat_config_', '');
            config[path] = JSON.parse(localStorage.getItem(key));
        });
        return config;
    },
    
    // Importuj konfigurację
    import(config) {
        Object.entries(config).forEach(([path, value]) => {
            this.set(path, value);
        });
    },
    
    // Sprawdź uprawnienia użytkownika
    hasPermission(userGroup, permission) {
        const permissions = this.get(`permissions.${userGroup}`, {});
        return permissions[permission] === true;
    },
    
    // Pobierz limit dla użytkownika
    getUserLimit(userGroup, limitType) {
        const permissions = this.get(`permissions.${userGroup}`, {});
        return permissions[limitType] || 0;
    }
};

// Nasłuchuj zmian konfiguracji
window.addEventListener('configChanged', (event) => {
    const { path, value } = event.detail;
    console.log(`Konfiguracja zmieniona: ${path} = ${value}`);
    
    // Zastosuj zmiany w czasie rzeczywistym
    switch (path) {
        case 'appearance.theme':
            document.body.className = value === 'dark' ? 'dark-mode' : '';
            break;
        case 'appearance.fontSize':
            document.documentElement.style.setProperty('--font-size-base', `${value}px`);
            break;
        case 'audio.enabled':
            // Włącz/wyłącz dźwięki
            break;
        // Dodaj więcej przypadków według potrzeb
    }
});

// Inicjalizacja konfiguracji
document.addEventListener('DOMContentLoaded', () => {
    // Zastosuj zapisane ustawienia
    const theme = ConfigUtils.get('appearance.theme');
    if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-mode');
    }
    
    const fontSize = ConfigUtils.get('appearance.fontSize');
    if (fontSize) {
        document.documentElement.style.setProperty('--font-size-base', `${fontSize}px`);
    }
    
    // Nasłuchuj zmian preferencji systemowych
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (ConfigUtils.get('appearance.theme') === 'auto') {
            document.body.classList.toggle('dark-mode', e.matches);
        }
    });
});

// Eksportuj do globalnego zasięgu
window.ChatConfig = ChatConfig;
window.ConfigUtils = ConfigUtils;