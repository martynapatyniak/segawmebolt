/**
 * Translation System for IPS Chat
 * Handles automatic and manual message translation
 */

class TranslationSystem {
    constructor(chatInstance) {
        this.chat = chatInstance;
        this.isEnabled = ConfigUtils.get('features.enableTranslation', true);
        this.autoTranslate = ConfigUtils.get('translation.autoTranslate', false);
        this.targetLanguage = ConfigUtils.get('translation.targetLanguage', 'pl');
        this.apiKey = ConfigUtils.get('translation.apiKey', ''); // Google Translate API key
        
        this.supportedLanguages = {
            'pl': 'Polski',
            'en': 'English',
            'de': 'Deutsch',
            'fr': 'Français',
            'es': 'Español',
            'it': 'Italiano',
            'ru': 'Русский',
            'uk': 'Українська',
            'cs': 'Čeština',
            'sk': 'Slovenčina'
        };
        
        this.init();
    }

    init() {
        if (!this.isEnabled) return;
        
        this.createTranslationUI();
        this.bindEvents();
    }

    createTranslationUI() {
        // Add translation button to chat tools
        const chatTools = document.querySelector('.chat-tools');
        if (chatTools) {
            const translateBtn = document.createElement('button');
            translateBtn.className = 'chat-tool-btn translation-btn';
            translateBtn.innerHTML = '🌐';
            translateBtn.title = 'Ustawienia tłumaczenia';
            translateBtn.onclick = () => this.showTranslationSettings();
            chatTools.appendChild(translateBtn);
        }

        // Create translation settings modal
        this.createTranslationModal();
    }

    createTranslationModal() {
        const modal = document.createElement('div');
        modal.className = 'modal translation-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🌐 Ustawienia tłumaczenia</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="auto-translate" ${this.autoTranslate ? 'checked' : ''}>
                            Automatyczne tłumaczenie wiadomości
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label for="target-language">Język docelowy:</label>
                        <select id="target-language">
                            ${Object.entries(this.supportedLanguages).map(([code, name]) => 
                                `<option value="${code}" ${code === this.targetLanguage ? 'selected' : ''}>${name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="translation-api-key">Klucz API Google Translate:</label>
                        <input type="password" id="translation-api-key" value="${this.apiKey}" 
                               placeholder="Wprowadź klucz API">
                        <small>Wymagany do automatycznego tłumaczenia</small>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="translationSystem.saveSettings()">Zapisz</button>
                    <button class="btn btn-secondary" onclick="translationSystem.closeModal()">Anuluj</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.modal = modal;
    }

    bindEvents() {
        // Add translation buttons to existing messages
        this.addTranslationButtons();
        
        // Listen for new messages
        document.addEventListener('messageAdded', (e) => {
            this.handleNewMessage(e.detail.message);
        });
    }

    addTranslationButtons() {
        const messages = document.querySelectorAll('.message:not(.system)');
        messages.forEach(messageElement => {
            this.addTranslationButton(messageElement);
        });
    }

    addTranslationButton(messageElement) {
        const messageActions = messageElement.querySelector('.message-actions');
        if (!messageActions) return;

        const translateBtn = document.createElement('button');
        translateBtn.className = 'action-btn translate-btn';
        translateBtn.innerHTML = '🌐';
        translateBtn.title = 'Przetłumacz wiadomość';
        translateBtn.onclick = () => this.translateMessage(messageElement);
        
        messageActions.appendChild(translateBtn);
    }

    async translateMessage(messageElement) {
        const messageId = messageElement.dataset.messageId;
        const messageText = messageElement.querySelector('.message-text');
        if (!messageText) return;

        const originalText = messageText.textContent;
        const translateBtn = messageElement.querySelector('.translate-btn');
        
        // Check if already translated
        if (messageElement.classList.contains('translated')) {
            this.toggleTranslation(messageElement);
            return;
        }

        try {
            translateBtn.innerHTML = '⏳';
            translateBtn.disabled = true;

            const translatedText = await this.performTranslation(originalText, this.targetLanguage);
            
            if (translatedText && translatedText !== originalText) {
                // Store original text
                messageElement.dataset.originalText = originalText;
                messageElement.dataset.translatedText = translatedText;
                
                // Show translated text
                messageText.innerHTML = `
                    <div class="translated-content">
                        <div class="translation-text">${this.escapeHtml(translatedText)}</div>
                        <div class="translation-info">
                            <small>Przetłumaczono na ${this.supportedLanguages[this.targetLanguage]}</small>
                        </div>
                    </div>
                `;
                
                messageElement.classList.add('translated');
                translateBtn.innerHTML = '🔄';
                translateBtn.title = 'Pokaż oryginalny tekst';
            } else {
                this.showNotification('Nie udało się przetłumaczyć wiadomości', 'error');
            }
        } catch (error) {
            console.error('Translation error:', error);
            this.showNotification('Błąd podczas tłumaczenia', 'error');
        } finally {
            translateBtn.innerHTML = '🌐';
            translateBtn.disabled = false;
        }
    }

    toggleTranslation(messageElement) {
        const messageText = messageElement.querySelector('.message-text');
        const translateBtn = messageElement.querySelector('.translate-btn');
        
        if (messageElement.classList.contains('showing-original')) {
            // Show translation
            messageText.innerHTML = `
                <div class="translated-content">
                    <div class="translation-text">${this.escapeHtml(messageElement.dataset.translatedText)}</div>
                    <div class="translation-info">
                        <small>Przetłumaczono na ${this.supportedLanguages[this.targetLanguage]}</small>
                    </div>
                </div>
            `;
            messageElement.classList.remove('showing-original');
            translateBtn.title = 'Pokaż oryginalny tekst';
        } else {
            // Show original
            messageText.textContent = messageElement.dataset.originalText;
            messageElement.classList.add('showing-original');
            translateBtn.title = 'Pokaż tłumaczenie';
        }
    }

    async performTranslation(text, targetLang) {
        if (!this.apiKey) {
            // Fallback to simple mock translation for demo
            return this.mockTranslation(text, targetLang);
        }

        try {
            const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: text,
                    target: targetLang,
                    format: 'text'
                })
            });

            const data = await response.json();
            
            if (data.data && data.data.translations && data.data.translations[0]) {
                return data.data.translations[0].translatedText;
            }
        } catch (error) {
            console.error('Google Translate API error:', error);
        }

        // Fallback to mock translation
        return this.mockTranslation(text, targetLang);
    }

    mockTranslation(text, targetLang) {
        // Simple mock translation for demo purposes
        const mockTranslations = {
            'en': {
                'Witaj': 'Hello',
                'Dzień dobry': 'Good day',
                'Jak się masz?': 'How are you?',
                'Dziękuję': 'Thank you',
                'Miłego dnia': 'Have a nice day'
            },
            'de': {
                'Witaj': 'Hallo',
                'Dzień dobry': 'Guten Tag',
                'Jak się masz?': 'Wie geht es dir?',
                'Dziękuję': 'Danke',
                'Miłego dnia': 'Schönen Tag'
            }
        };

        const translations = mockTranslations[targetLang];
        if (translations && translations[text]) {
            return translations[text];
        }

        // Return text with translation indicator for demo
        return `[${targetLang.toUpperCase()}] ${text}`;
    }

    handleNewMessage(message) {
        if (this.autoTranslate && message.type === 'user') {
            setTimeout(() => {
                const messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
                if (messageElement) {
                    this.translateMessage(messageElement);
                }
            }, 500);
        }
    }

    showTranslationSettings() {
        this.modal.style.display = 'block';
    }

    closeModal() {
        this.modal.style.display = 'none';
    }

    saveSettings() {
        const autoTranslate = document.getElementById('auto-translate').checked;
        const targetLanguage = document.getElementById('target-language').value;
        const apiKey = document.getElementById('translation-api-key').value;

        this.autoTranslate = autoTranslate;
        this.targetLanguage = targetLanguage;
        this.apiKey = apiKey;

        // Save to config
        ConfigUtils.set('translation.autoTranslate', autoTranslate);
        ConfigUtils.set('translation.targetLanguage', targetLanguage);
        ConfigUtils.set('translation.apiKey', apiKey);

        this.showNotification('Ustawienia tłumaczenia zostały zapisane', 'success');
        this.closeModal();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // Use existing notification system
        if (this.chat.advancedFeatures && this.chat.advancedFeatures.showNotification) {
            this.chat.advancedFeatures.showNotification(message, type);
        }
    }
}

// Export for use in main.js
window.TranslationSystem = TranslationSystem;