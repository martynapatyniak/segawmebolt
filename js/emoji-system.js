/**
 * System emotek dla chatu IPS
 * Obsługuje picker emotek, kategorie, wyszukiwanie i wstawianie do wiadomości
 */

class EmojiSystem {
    constructor(chat) {
        this.chat = chat;
        this.isPickerOpen = false;
        this.currentCategory = 'smileys';
        
        // Kategorie emotek
        this.categories = {
            smileys: {
                name: 'Uśmiechy i ludzie',
                icon: '😀',
                emojis: [
                    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
                    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
                    '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
                    '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
                    '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧',
                    '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'
                ]
            },
            animals: {
                name: 'Zwierzęta i natura',
                icon: '🐶',
                emojis: [
                    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
                    '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒',
                    '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇',
                    '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜',
                    '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕'
                ]
            },
            food: {
                name: 'Jedzenie i napoje',
                icon: '🍎',
                emojis: [
                    '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈',
                    '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦',
                    '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔',
                    '🍠', '🥐', '🥖', '🍞', '🥨', '🥯', '🧀', '🥚', '🍳', '🧈',
                    '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕'
                ]
            },
            activities: {
                name: 'Aktywności',
                icon: '⚽',
                emojis: [
                    '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
                    '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳',
                    '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️',
                    '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺'
                ]
            },
            travel: {
                name: 'Podróże i miejsca',
                icon: '🚗',
                emojis: [
                    '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
                    '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛺', '🚨',
                    '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞',
                    '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️'
                ]
            },
            objects: {
                name: 'Przedmioty',
                icon: '💎',
                emojis: [
                    '💎', '🔔', '🔕', '🎵', '🎶', '💰', '💴', '💵', '💶', '💷',
                    '💸', '💳', '🧾', '💹', '💱', '💲', '✉️', '📧', '📨', '📩',
                    '📤', '📥', '📦', '📫', '📪', '📬', '📭', '📮', '🗳️', '✏️',
                    '✒️', '🖋️', '🖊️', '🖌️', '🖍️', '📝', '💼', '📁', '📂', '🗂️'
                ]
            },
            symbols: {
                name: 'Symbole',
                icon: '❤️',
                emojis: [
                    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
                    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
                    '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
                    '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐'
                ]
            },
            flags: {
                name: 'Flagi',
                icon: '🏁',
                emojis: [
                    '🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇵🇱', '🇺🇸',
                    '🇬🇧', '🇩🇪', '🇫🇷', '🇪🇸', '🇮🇹', '🇷🇺', '🇨🇳', '🇯🇵', '🇰🇷', '🇮🇳',
                    '🇧🇷', '🇨🇦', '🇦🇺', '🇲🇽', '🇦🇷', '🇨🇱', '🇨🇴', '🇵🇪', '🇻🇪', '🇪🇨'
                ]
            }
        };
        
        this.init();
    }
    
    init() {
        this.createEmojiPicker();
        this.bindEvents();
    }
    
    createEmojiPicker() {
        const picker = document.createElement('div');
        picker.id = 'emoji-picker';
        picker.className = 'emoji-picker';
        picker.style.display = 'none';
        
        picker.innerHTML = `
            <div class="emoji-picker-header">
                <div class="emoji-search">
                    <input type="text" placeholder="Szukaj emotek..." id="emoji-search">
                    <i class="fas fa-search"></i>
                </div>
            </div>
            <div class="emoji-picker-categories">
                ${Object.entries(this.categories).map(([key, category]) => 
                    `<button class="emoji-category ${key === this.currentCategory ? 'active' : ''}" 
                             data-category="${key}" title="${category.name}">
                        ${category.icon}
                    </button>`
                ).join('')}
            </div>
            <div class="emoji-picker-content">
                <div class="emoji-grid" id="emoji-grid">
                    ${this.renderEmojiGrid(this.currentCategory)}
                </div>
            </div>
            <div class="emoji-picker-footer">
                <div class="emoji-preview">
                    <span class="emoji-preview-char"></span>
                    <span class="emoji-preview-name">Wybierz emotkę</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(picker);
        this.picker = picker;
    }
    
    renderEmojiGrid(category) {
        const emojis = this.categories[category].emojis;
        return emojis.map(emoji => 
            `<button class="emoji-item" data-emoji="${emoji}" title="${this.getEmojiName(emoji)}">
                ${emoji}
            </button>`
        ).join('');
    }
    
    bindEvents() {
        // Przycisk emoji w input area
        const emojiBtn = document.getElementById('emoji-btn');
        if (emojiBtn) {
            emojiBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.togglePicker();
            });
        }
        
        // Kategorie
        this.picker.addEventListener('click', (e) => {
            if (e.target.classList.contains('emoji-category')) {
                this.switchCategory(e.target.dataset.category);
            }
            
            if (e.target.classList.contains('emoji-item')) {
                this.insertEmoji(e.target.dataset.emoji);
            }
        });
        
        // Wyszukiwanie
        const searchInput = this.picker.querySelector('#emoji-search');
        searchInput.addEventListener('input', (e) => {
            this.searchEmojis(e.target.value);
        });
        
        // Podgląd emoji
        this.picker.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('emoji-item')) {
                this.showEmojiPreview(e.target.dataset.emoji);
            }
        });
        
        // Zamknij picker po kliknięciu poza nim
        document.addEventListener('click', (e) => {
            if (this.isPickerOpen && !this.picker.contains(e.target) && !e.target.closest('#emoji-btn')) {
                this.closePicker();
            }
        });
        
        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isPickerOpen) {
                this.closePicker();
            }
        });
    }
    
    togglePicker() {
        if (this.isPickerOpen) {
            this.closePicker();
        } else {
            this.openPicker();
        }
    }
    
    openPicker() {
        const emojiBtn = document.getElementById('emoji-btn');
        const rect = emojiBtn.getBoundingClientRect();
        
        this.picker.style.display = 'block';
        this.picker.style.position = 'fixed';
        this.picker.style.bottom = (window.innerHeight - rect.top + 10) + 'px';
        this.picker.style.left = rect.left + 'px';
        this.picker.style.zIndex = '1000';
        
        // Sprawdź czy picker mieści się na ekranie
        const pickerRect = this.picker.getBoundingClientRect();
        if (pickerRect.right > window.innerWidth) {
            this.picker.style.left = (window.innerWidth - pickerRect.width - 10) + 'px';
        }
        
        this.isPickerOpen = true;
        
        // Focus na search
        setTimeout(() => {
            this.picker.querySelector('#emoji-search').focus();
        }, 100);
    }
    
    closePicker() {
        this.picker.style.display = 'none';
        this.isPickerOpen = false;
        
        // Wyczyść wyszukiwanie
        const searchInput = this.picker.querySelector('#emoji-search');
        searchInput.value = '';
        this.switchCategory(this.currentCategory);
    }
    
    switchCategory(category) {
        this.currentCategory = category;
        
        // Aktualizuj aktywną kategorię
        this.picker.querySelectorAll('.emoji-category').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        
        // Aktualizuj grid
        const grid = this.picker.querySelector('#emoji-grid');
        grid.innerHTML = this.renderEmojiGrid(category);
    }
    
    searchEmojis(query) {
        if (!query.trim()) {
            this.switchCategory(this.currentCategory);
            return;
        }
        
        const allEmojis = [];
        Object.values(this.categories).forEach(category => {
            allEmojis.push(...category.emojis);
        });
        
        // Proste wyszukiwanie - można rozszerzyć o nazwy emoji
        const filtered = allEmojis.filter(emoji => {
            const name = this.getEmojiName(emoji).toLowerCase();
            return name.includes(query.toLowerCase());
        });
        
        const grid = this.picker.querySelector('#emoji-grid');
        grid.innerHTML = filtered.map(emoji => 
            `<button class="emoji-item" data-emoji="${emoji}" title="${this.getEmojiName(emoji)}">
                ${emoji}
            </button>`
        ).join('');
    }
    
    insertEmoji(emoji) {
        const messageInput = document.getElementById('message-input');
        if (!messageInput) return;
        
        const start = messageInput.selectionStart;
        const end = messageInput.selectionEnd;
        const text = messageInput.value;
        
        const newText = text.substring(0, start) + emoji + text.substring(end);
        messageInput.value = newText;
        
        // Ustaw kursor po emoji
        const newPosition = start + emoji.length;
        messageInput.setSelectionRange(newPosition, newPosition);
        messageInput.focus();
        
        // Aktualizuj licznik znaków
        if (this.chat.updateCharCounter) {
            this.chat.updateCharCounter();
        }
        
        this.closePicker();
    }
    
    showEmojiPreview(emoji) {
        const previewChar = this.picker.querySelector('.emoji-preview-char');
        const previewName = this.picker.querySelector('.emoji-preview-name');
        
        previewChar.textContent = emoji;
        previewName.textContent = this.getEmojiName(emoji);
    }
    
    getEmojiName(emoji) {
        // Mapowanie podstawowych emoji na nazwy
        const emojiNames = {
            '😀': 'Uśmiech',
            '😃': 'Szeroki uśmiech',
            '😄': 'Uśmiech z otwartymi oczami',
            '😁': 'Szczerzący się',
            '😆': 'Śmiech',
            '😅': 'Nerwowy śmiech',
            '🤣': 'Płacz ze śmiechu',
            '😂': 'Łzy radości',
            '🙂': 'Lekki uśmiech',
            '🙃': 'Odwrócony uśmiech',
            '😉': 'Mrugnięcie',
            '😊': 'Zadowolony',
            '😇': 'Anioł',
            '🥰': 'Zakochany',
            '😍': 'Serduszka w oczach',
            '🤩': 'Gwiazdy w oczach',
            '😘': 'Całus',
            '😗': 'Całowanie',
            '😚': 'Całus z zamkniętymi oczami',
            '😙': 'Całus z uśmiechem',
            '😋': 'Smakowity',
            '😛': 'Język',
            '😜': 'Język z mrugnięciem',
            '🤪': 'Szalony',
            '😝': 'Język z zamkniętymi oczami',
            '🤑': 'Pieniądze',
            '🤗': 'Przytulanie',
            '🤭': 'Zakrywanie ust',
            '🤫': 'Cisza',
            '🤔': 'Myślenie',
            '❤️': 'Czerwone serce',
            '💙': 'Niebieskie serce',
            '💚': 'Zielone serce',
            '💛': 'Żółte serce',
            '💜': 'Fioletowe serce',
            '🖤': 'Czarne serce',
            '🤍': 'Białe serce',
            '🤎': 'Brązowe serce',
            '👍': 'Kciuk w górę',
            '👎': 'Kciuk w dół',
            '👌': 'OK',
            '✌️': 'Znak pokoju',
            '🤞': 'Skrzyżowane palce',
            '🤟': 'Kocham cię',
            '🤘': 'Rock',
            '🤙': 'Zadzwoń',
            '👈': 'Wskazywanie w lewo',
            '👉': 'Wskazywanie w prawo',
            '👆': 'Wskazywanie w górę',
            '👇': 'Wskazywanie w dół',
            '☝️': 'Palec w górę',
            '✋': 'Podniesiona ręka',
            '🤚': 'Tylna strona ręki',
            '🖐️': 'Ręka z rozłożonymi palcami',
            '🖖': 'Vulcan salute',
            '👋': 'Machanie',
            '🤝': 'Uścisk dłoni',
            '🙏': 'Modlitwa',
            '🔥': 'Ogień',
            '💯': '100',
            '💢': 'Złość',
            '💥': 'Wybuch',
            '💫': 'Zawroty głowy',
            '💦': 'Krople potu',
            '💨': 'Pędzenie',
            '🕳️': 'Dziura',
            '💣': 'Bomba',
            '💤': 'Spanie'
        };
        
        return emojiNames[emoji] || 'Emotka';
    }
    
    // Rozszerzone formatowanie emotek w tekście
    static formatEmojis(text) {
        // Podstawowe emotikony tekstowe na emoji
        const textEmojis = {
            ':)': '🙂',
            ':-)': '🙂',
            ':(': '😢',
            ':-(': '😢',
            ':D': '😃',
            ':-D': '😃',
            ':P': '😛',
            ':-P': '😛',
            ';)': '😉',
            ';-)': '😉',
            ':o': '😮',
            ':-o': '😮',
            ':O': '😮',
            ':-O': '😮',
            ':|': '😐',
            ':-|': '😐',
            ':*': '😘',
            ':-*': '😘',
            '<3': '❤️',
            '</3': '💔',
            ':heart:': '❤️',
            ':fire:': '🔥',
            ':100:': '💯',
            ':thumbsup:': '👍',
            ':thumbsdown:': '👎',
            ':ok:': '👌',
            ':clap:': '👏',
            ':pray:': '🙏'
        };
        
        let formatted = text;
        
        // Zamień emotikony tekstowe
        Object.entries(textEmojis).forEach(([textEmoji, emoji]) => {
            const regex = new RegExp(textEmoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            formatted = formatted.replace(regex, emoji);
        });
        
        return formatted;
    }
}

// Export dla użycia w innych modułach
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmojiSystem;
}