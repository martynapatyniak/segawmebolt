// System @mentions dla chatu IPS
class MentionsSystem {
    constructor(chat) {
        this.chat = chat;
        this.dropdown = null;
        this.isVisible = false;
        this.selectedIndex = -1;
        this.currentQuery = '';
        this.currentMatches = [];
        this.mentionStartPos = -1;
        
        this.init();
    }
    
    init() {
        this.createDropdown();
        this.bindEvents();
    }
    
    // Tworzenie dropdown dla mentions
    createDropdown() {
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'mentions-dropdown';
        this.dropdown.innerHTML = `
            <div class="mentions-list"></div>
        `;
        
        // Dodaj do kontenera chatu
        this.chat.elements.container.appendChild(this.dropdown);
    }
    
    // Bindowanie zdarzeń
    bindEvents() {
        const input = this.chat.elements.messageInput;
        
        // Obsługa wpisywania
        input.addEventListener('input', (e) => this.handleInput(e));
        input.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Kliknięcie poza dropdown
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.mentions-dropdown') && !e.target.closest('#message-input')) {
                this.hide();
            }
        });
    }
    
    // Obsługa wpisywania tekstu
    handleInput(e) {
        const input = e.target;
        const text = input.value;
        const cursorPos = input.selectionStart;
        
        // Znajdź @ przed kursorem
        const textBeforeCursor = text.substring(0, cursorPos);
        const mentionMatch = this.findMentionAtCursor(textBeforeCursor);
        
        if (mentionMatch) {
            this.mentionStartPos = mentionMatch.start;
            this.currentQuery = mentionMatch.query;
            this.searchUsers(this.currentQuery);
        } else {
            this.hide();
        }
    }
    
    // Obsługa klawiszy
    handleKeydown(e) {
        if (!this.isVisible) return;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectNext();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.selectPrevious();
                break;
            case 'Enter':
            case 'Tab':
                e.preventDefault();
                this.insertSelectedMention();
                break;
            case 'Escape':
                e.preventDefault();
                this.hide();
                break;
        }
    }
    
    // Znajdowanie mention przy kursorze
    findMentionAtCursor(text) {
        // Szukaj ostatniego @ przed kursorem
        const mentionRegex = /@(\w*)$/;
        const match = text.match(mentionRegex);
        
        if (match) {
            return {
                start: text.length - match[0].length,
                query: match[1],
                fullMatch: match[0]
            };
        }
        
        return null;
    }
    
    // Wyszukiwanie użytkowników
    searchUsers(query) {
        const users = Array.from(this.chat.users.values());
        
        // Filtruj użytkowników na podstawie zapytania
        this.currentMatches = users.filter(user => {
            if (!query) return true; // Pokaż wszystkich jeśli brak zapytania
            return user.nick.toLowerCase().includes(query.toLowerCase());
        });
        
        // Sortuj wyniki - dokładne dopasowania na początku
        this.currentMatches.sort((a, b) => {
            const aStarts = a.nick.toLowerCase().startsWith(query.toLowerCase());
            const bStarts = b.nick.toLowerCase().startsWith(query.toLowerCase());
            
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            
            return a.nick.localeCompare(b.nick);
        });
        
        // Ograniczenie wyników
        const maxResults = ConfigUtils.get('mentions.maxResults', 10);
        this.currentMatches = this.currentMatches.slice(0, maxResults);
        
        if (this.currentMatches.length > 0) {
            this.show();
            this.render();
        } else {
            this.hide();
        }
    }
    
    // Pokazanie dropdown
    show() {
        if (this.isVisible) return;
        
        this.isVisible = true;
        this.selectedIndex = 0;
        
        // Najpierw pokaż dropdown bez animacji, żeby obliczyć wysokość
        this.dropdown.style.visibility = 'hidden';
        this.dropdown.style.display = 'block';
        
        // Pozycjonuj dropdown
        this.positionDropdown();
        
        // Teraz pokaż z animacją
        this.dropdown.style.visibility = 'visible';
        this.dropdown.classList.add('show');
    }
    
    // Ukrycie dropdown
    hide() {
        if (!this.isVisible) return;
        
        this.isVisible = false;
        this.selectedIndex = -1;
        this.currentQuery = '';
        this.currentMatches = [];
        this.mentionStartPos = -1;
        this.dropdown.classList.remove('show', 'below-input');
        
        // Ukryj dropdown po animacji
        setTimeout(() => {
            if (!this.isVisible) {
                this.dropdown.style.display = 'none';
            }
        }, 200);
    }
    
    // Pozycjonowanie dropdown
    positionDropdown() {
        const input = this.chat.elements.messageInput;
        const inputRect = input.getBoundingClientRect();
        const containerRect = this.chat.elements.container.getBoundingClientRect();
        
        // Oblicz wysokość dropdown
        const dropdownHeight = this.dropdown.offsetHeight || 200; // fallback jeśli nie ma wysokości
        
        // Pozycja względem kontenera chatu
        let top = inputRect.top - containerRect.top - dropdownHeight - 10;
        const left = inputRect.left - containerRect.left;
        
        // Sprawdź czy dropdown mieści się nad inputem
        if (top < 10) {
            // Jeśli nie ma miejsca nad inputem, pokaż pod nim
            top = inputRect.bottom - containerRect.top + 5;
            this.dropdown.classList.add('below-input');
        } else {
            this.dropdown.classList.remove('below-input');
        }
        
        // Ustaw pozycję
        this.dropdown.style.top = `${top}px`;
        this.dropdown.style.left = `${left}px`;
        this.dropdown.style.width = `${Math.min(300, Math.max(250, inputRect.width))}px`;
        
        // Upewnij się, że dropdown nie wychodzi poza kontener
        const maxHeight = containerRect.height - top - 20;
        if (maxHeight > 0 && maxHeight < 200) {
            this.dropdown.style.maxHeight = `${maxHeight}px`;
        } else {
            this.dropdown.style.maxHeight = '200px';
        }
    }
    
    // Renderowanie listy użytkowników
    render() {
        const list = this.dropdown.querySelector('.mentions-list');
        list.innerHTML = '';
        
        this.currentMatches.forEach((user, index) => {
            const item = document.createElement('div');
            item.className = `mention-item ${index === this.selectedIndex ? 'selected' : ''}`;
            item.dataset.index = index;
            
            item.innerHTML = `
                <div class="mention-avatar" style="background-color: ${this.chat.getUserColor(user.id)}">
                    ${user.avatar ? `<img src="${user.avatar}" alt="${user.nick}">` : user.nick.charAt(0).toUpperCase()}
                </div>
                <div class="mention-info">
                    <div class="mention-nick">${this.highlightQuery(user.nick, this.currentQuery)}</div>
                    <div class="mention-details">
                        ${user.country ? `<span class="country-flag" style="background-image: url('flags/${user.country.toLowerCase()}.svg')"></span>` : ''}
                        ${user.rank && user.rank !== 'user' ? `<span class="user-rank ${user.rank}">${this.chat.getRankName(user.rank)}</span>` : ''}
                        <span class="user-status ${user.isOnline ? 'online' : 'offline'}">
                            ${user.isOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>
            `;
            
            // Obsługa kliknięcia
            item.addEventListener('click', () => {
                this.selectedIndex = index;
                this.insertSelectedMention();
            });
            
            // Obsługa hover
            item.addEventListener('mouseenter', () => {
                this.selectedIndex = index;
                this.updateSelection();
            });
            
            list.appendChild(item);
        });
    }
    
    // Podświetlanie zapytania w nicku
    highlightQuery(nick, query) {
        if (!query) return this.chat.escapeHtml(nick);
        
        const escapedNick = this.chat.escapeHtml(nick);
        const escapedQuery = this.chat.escapeHtml(query);
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        
        return escapedNick.replace(regex, '<mark>$1</mark>');
    }
    
    // Wybór następnego elementu
    selectNext() {
        if (this.currentMatches.length === 0) return;
        
        this.selectedIndex = (this.selectedIndex + 1) % this.currentMatches.length;
        this.updateSelection();
    }
    
    // Wybór poprzedniego elementu
    selectPrevious() {
        if (this.currentMatches.length === 0) return;
        
        this.selectedIndex = this.selectedIndex <= 0 ? 
            this.currentMatches.length - 1 : 
            this.selectedIndex - 1;
        this.updateSelection();
    }
    
    // Aktualizacja wizualnego wyboru
    updateSelection() {
        const items = this.dropdown.querySelectorAll('.mention-item');
        items.forEach((item, index) => {
            item.classList.toggle('selected', index === this.selectedIndex);
        });
        
        // Przewiń do wybranego elementu
        const selectedItem = items[this.selectedIndex];
        if (selectedItem) {
            selectedItem.scrollIntoView({ block: 'nearest' });
        }
    }
    
    // Wstawienie wybranego mention
    insertSelectedMention() {
        if (this.selectedIndex < 0 || this.selectedIndex >= this.currentMatches.length) {
            return;
        }
        
        const selectedUser = this.currentMatches[this.selectedIndex];
        const input = this.chat.elements.messageInput;
        const text = input.value;
        const cursorPos = input.selectionStart;
        
        // Znajdź pozycję @ do zastąpienia
        const beforeMention = text.substring(0, this.mentionStartPos);
        const afterCursor = text.substring(cursorPos);
        
        // Wstaw mention
        const mentionText = `@${selectedUser.nick} `;
        const newText = beforeMention + mentionText + afterCursor;
        const newCursorPos = beforeMention.length + mentionText.length;
        
        // Aktualizuj pole tekstowe
        input.value = newText;
        input.setSelectionRange(newCursorPos, newCursorPos);
        
        // Wywołaj zdarzenie input dla aktualizacji licznika znaków
        input.dispatchEvent(new Event('input'));
        
        // Ukryj dropdown
        this.hide();
        
        // Przywróć focus
        input.focus();
        
        // Zapisz statystykę mention
        this.recordMentionUsage(selectedUser);
    }
    
    // Zapisywanie statystyki użycia mention
    recordMentionUsage(user) {
        // W prawdziwej aplikacji tutaj byłoby zapisywanie statystyk
        console.log(`Mention użyty dla użytkownika: ${user.nick}`);
        
        // Można dodać do lokalnych statystyk
        const stats = JSON.parse(localStorage.getItem('mentionStats') || '{}');
        stats[user.id] = (stats[user.id] || 0) + 1;
        localStorage.setItem('mentionStats', JSON.stringify(stats));
    }
    
    // Pobieranie sugerowanych użytkowników na podstawie historii
    getSuggestedUsers() {
        const stats = JSON.parse(localStorage.getItem('mentionStats') || '{}');
        const users = Array.from(this.chat.users.values());
        
        // Sortuj według częstości użycia
        return users.sort((a, b) => {
            const aCount = stats[a.id] || 0;
            const bCount = stats[b.id] || 0;
            return bCount - aCount;
        });
    }
    
    // Sprawdzenie czy mention jest włączony
    isEnabled() {
        return ConfigUtils.get('mentions.enabled', true);
    }
    
    // Sprawdzenie czy użytkownik może używać mentions
    canUseMentions(user) {
        return ConfigUtils.hasPermission(user.group, 'canUseMentions');
    }
    
    // Parsowanie mentions w tekście
    static parseMentions(text, users) {
        const mentionRegex = /@(\w+)/g;
        const mentions = [];
        let match;
        
        while ((match = mentionRegex.exec(text)) !== null) {
            const nick = match[1];
            const user = Array.from(users.values()).find(u => 
                u.nick.toLowerCase() === nick.toLowerCase()
            );
            
            if (user) {
                mentions.push({
                    nick: nick,
                    user: user,
                    start: match.index,
                    end: match.index + match[0].length
                });
            }
        }
        
        return mentions;
    }
    
    // Formatowanie mentions w HTML
    static formatMentions(text, users, currentUserId) {
        const mentions = MentionsSystem.parseMentions(text, users);
        let formatted = text;
        let offset = 0;
        
        mentions.forEach(mention => {
            const isCurrentUser = mention.user.id === currentUserId;
            const className = `mention ${isCurrentUser ? 'mention-self' : ''}`;
            const replacement = `<span class="${className}" data-user-id="${mention.user.id}">@${mention.nick}</span>`;
            
            const start = mention.start + offset;
            const end = mention.end + offset;
            
            formatted = formatted.substring(0, start) + replacement + formatted.substring(end);
            offset += replacement.length - (mention.end - mention.start);
        });
        
        return formatted;
    }
    
    // Sprawdzenie czy tekst zawiera mention dla użytkownika
    static containsMentionFor(text, user) {
        const mentionRegex = new RegExp(`@${user.nick}\\b`, 'i');
        return mentionRegex.test(text);
    }
    
    // Pobieranie wszystkich mentions z tekstu
    static extractMentions(text) {
        const mentionRegex = /@(\w+)/g;
        const mentions = [];
        let match;
        
        while ((match = mentionRegex.exec(text)) !== null) {
            mentions.push(match[1]);
        }
        
        return mentions;
    }
}

// Eksport klasy
window.MentionsSystem = MentionsSystem;