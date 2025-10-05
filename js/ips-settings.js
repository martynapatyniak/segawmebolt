/**
 * IPS Advanced Settings System
 * Zarządza zaawansowanymi ustawieniami chatu, formatowaniem grup i personalizacją
 */
class IPSSettingsSystem {
    constructor(chat) {
        this.chat = chat;
        this.settings = this.loadSettings();
        this.init();
    }

    init() {
        this.createSettingsModal();
        this.bindEvents();
        this.applySettings();
    }

    // Domyślne ustawienia
    getDefaultSettings() {
        return {
            // Formatowanie grup
            groupFormatting: {
                enabled: true,
                groups: {
                    admin: {
                        enabled: true,
                        messageBox: {
                            backgroundColor: '#ff000015',
                            borderColor: '#ff0000',
                            borderWidth: '2px',
                            borderRadius: '8px',
                            padding: '12px'
                        },
                        text: {
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#ff0000'
                        }
                    },
                    moderator: {
                        enabled: true,
                        messageBox: {
                            backgroundColor: '#00800015',
                            borderColor: '#008000',
                            borderWidth: '2px',
                            borderRadius: '8px',
                            padding: '12px'
                        },
                        text: {
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#008000'
                        }
                    },
                    vip: {
                        enabled: true,
                        messageBox: {
                            backgroundColor: '#ffd70015',
                            borderColor: '#ffd700',
                            borderWidth: '1px',
                            borderRadius: '6px',
                            padding: '10px'
                        },
                        text: {
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#b8860b'
                        }
                    },
                    user: {
                        enabled: false,
                        messageBox: {
                            backgroundColor: 'transparent',
                            borderColor: '#ddd',
                            borderWidth: '1px',
                            borderRadius: '4px',
                            padding: '8px'
                        },
                        text: {
                            fontSize: '13px',
                            fontWeight: 'normal',
                            color: '#333'
                        }
                    }
                }
            },
            // Funkcje wiadomości
            messageFeatures: {
                delete: {
                    enabled: true,
                    groups: ['admin', 'moderator']
                },
                edit: {
                    enabled: true,
                    groups: ['admin', 'moderator', 'vip', 'user']
                },
                quote: {
                    enabled: true,
                    groups: ['admin', 'moderator', 'vip', 'user']
                }
            },
            // Rozmiar chatu
            chatSize: {
                enabled: false,
                width: '100%',
                height: '600px',
                maxWidth: '1200px',
                maxHeight: '800px'
            },
            // Automatyczne usuwanie wiadomości
            autoDelete: {
                enabled: false,
                timeInMinutes: 60,
                groups: ['user'], // Które grupy dotyczą
                excludeGroups: ['admin', 'moderator'] // Które grupy wykluczyć
            },
            // Globalne ustawienia CSS
            globalCSS: {
                enabled: false,
                fontSize: '13px',
                fontWeight: 'normal',
                textColor: '#333333',
                backgroundColor: '#ffffff',
                borderRadius: '4px'
            }
        };
    }

    // Ładowanie ustawień
    loadSettings() {
        const saved = localStorage.getItem('ips_advanced_settings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return this.mergeSettings(this.getDefaultSettings(), parsed);
            } catch (error) {
                console.error('Error loading IPS settings:', error);
            }
        }
        return this.getDefaultSettings();
    }

    // Scalanie ustawień z domyślnymi
    mergeSettings(defaults, saved) {
        const merged = JSON.parse(JSON.stringify(defaults));
        
        function deepMerge(target, source) {
            for (const key in source) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!target[key]) target[key] = {};
                    deepMerge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
        
        deepMerge(merged, saved);
        return merged;
    }

    // Zapisywanie ustawień
    saveSettings() {
        try {
            localStorage.setItem('ips_advanced_settings', JSON.stringify(this.settings));
            this.applySettings();
            this.showNotification('Ustawienia zostały zapisane', 'success');
        } catch (error) {
            console.error('Error saving IPS settings:', error);
            this.showNotification('Błąd podczas zapisywania ustawień', 'error');
        }
    }

    // Stosowanie ustawień
    applySettings() {
        this.applyGroupFormatting();
        this.applyChatSize();
        this.applyGlobalCSS();
        this.setupAutoDelete();
        this.updateMessageFeatures();
    }

    // Formatowanie grup
    applyGroupFormatting() {
        if (!this.settings.groupFormatting.enabled) return;

        // Usuń poprzednie style
        const existingStyle = document.getElementById('ips-group-formatting');
        if (existingStyle) existingStyle.remove();

        // Utwórz nowe style
        const style = document.createElement('style');
        style.id = 'ips-group-formatting';
        
        let css = '';
        
        Object.entries(this.settings.groupFormatting.groups).forEach(([groupName, groupSettings]) => {
            if (!groupSettings.enabled) return;
            
            const selector = `.message[data-user-group="${groupName}"]`;
            
            css += `
                ${selector} {
                    background-color: ${groupSettings.messageBox.backgroundColor} !important;
                    border: ${groupSettings.messageBox.borderWidth} solid ${groupSettings.messageBox.borderColor} !important;
                    border-radius: ${groupSettings.messageBox.borderRadius} !important;
                    padding: ${groupSettings.messageBox.padding} !important;
                    margin-bottom: 8px !important;
                }
                
                ${selector} .message-text {
                    font-size: ${groupSettings.text.fontSize} !important;
                    font-weight: ${groupSettings.text.fontWeight} !important;
                    color: ${groupSettings.text.color} !important;
                }
                
                ${selector} .message-nick {
                    font-weight: ${groupSettings.text.fontWeight} !important;
                    color: ${groupSettings.text.color} !important;
                }
            `;
        });
        
        style.textContent = css;
        document.head.appendChild(style);
    }

    // Rozmiar chatu
    applyChatSize() {
        if (!this.settings.chatSize.enabled) return;

        const chatContainer = document.querySelector('.chat-container');
        const messagesContainer = document.querySelector('.messages-container');
        
        if (chatContainer) {
            chatContainer.style.width = this.settings.chatSize.width;
            chatContainer.style.maxWidth = this.settings.chatSize.maxWidth;
        }
        
        if (messagesContainer) {
            messagesContainer.style.height = this.settings.chatSize.height;
            messagesContainer.style.maxHeight = this.settings.chatSize.maxHeight;
        }
    }

    // Globalne CSS
    applyGlobalCSS() {
        if (!this.settings.globalCSS.enabled) return;

        const existingStyle = document.getElementById('ips-global-css');
        if (existingStyle) existingStyle.remove();

        const style = document.createElement('style');
        style.id = 'ips-global-css';
        
        style.textContent = `
            .message {
                font-size: ${this.settings.globalCSS.fontSize} !important;
                font-weight: ${this.settings.globalCSS.fontWeight} !important;
                color: ${this.settings.globalCSS.textColor} !important;
                background-color: ${this.settings.globalCSS.backgroundColor} !important;
                border-radius: ${this.settings.globalCSS.borderRadius} !important;
            }
        `;
        
        document.head.appendChild(style);
    }

    // Automatyczne usuwanie wiadomości
    setupAutoDelete() {
        if (!this.settings.autoDelete.enabled) return;

        const deleteTime = this.settings.autoDelete.timeInMinutes * 60 * 1000;
        
        // Sprawdzaj co minutę
        setInterval(() => {
            this.cleanupOldMessages(deleteTime);
        }, 60000);
    }

    cleanupOldMessages(maxAge) {
        const messages = document.querySelectorAll('.message');
        const now = Date.now();
        
        messages.forEach(message => {
            const timestamp = parseInt(message.dataset.timestamp);
            const userGroup = message.dataset.userGroup;
            
            if (!timestamp) return;
            
            // Sprawdź czy grupa powinna być usunięta
            const shouldDelete = this.settings.autoDelete.groups.includes(userGroup) &&
                               !this.settings.autoDelete.excludeGroups.includes(userGroup);
            
            if (shouldDelete && (now - timestamp) > maxAge) {
                message.remove();
            }
        });
    }

    // Aktualizacja funkcji wiadomości
    updateMessageFeatures() {
        // Ta funkcja będzie wywoływana przy renderowaniu wiadomości
        // aby sprawdzić uprawnienia do edycji/usuwania/cytowania
    }

    // Sprawdzenie uprawnień do funkcji
    canUseFeature(feature, userGroup) {
        const featureSettings = this.settings.messageFeatures[feature];
        return featureSettings && featureSettings.enabled && 
               featureSettings.groups.includes(userGroup);
    }

    // Tworzenie modala ustawień
    createSettingsModal() {
        const modal = document.createElement('div');
        modal.id = 'ips-advanced-settings-modal';
        modal.className = 'modal ips-settings-modal';
        modal.style.display = 'none';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🎨 Zaawansowane Ustawienia IPS</h2>
                    <button class="modal-close" id="ips-settings-close">×</button>
                </div>
                <div class="modal-body">
                    <div class="settings-sidebar">
                        <nav class="settings-nav">
                            <button class="settings-nav-btn active" data-section="group-formatting">
                                🎨 Formatowanie Grup
                            </button>
                            <button class="settings-nav-btn" data-section="message-features">
                                ⚙️ Funkcje Wiadomości
                            </button>
                            <button class="settings-nav-btn" data-section="chat-size">
                                📐 Rozmiar Chatu
                            </button>
                            <button class="settings-nav-btn" data-section="auto-delete">
                                🗑️ Auto-usuwanie
                            </button>
                            <button class="settings-nav-btn" data-section="global-css">
                                🎭 Globalne CSS
                            </button>
                        </nav>
                    </div>
                    <div class="settings-content">
                        <div id="settings-sections"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="ips-save-settings">Zapisz Ustawienia</button>
                    <button class="btn btn-secondary" id="ips-reset-settings">Przywróć Domyślne</button>
                    <button class="btn btn-secondary" id="ips-cancel-settings">Anuluj</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.settingsModal = modal;
    }

    // Pokazanie modala ustawień
    showSettings() {
        this.populateSettings();
        this.settingsModal.style.display = 'block';
        document.body.classList.add('modal-open');
    }

    // Ukrycie modala ustawień
    hideSettings() {
        this.settingsModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }

    // Wypełnienie ustawień
    populateSettings() {
        this.showSection('group-formatting');
    }

    // Pokazanie sekcji ustawień
    showSection(sectionName) {
        // Aktualizuj aktywny przycisk
        document.querySelectorAll('.settings-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Pokaż odpowiednią sekcję
        const sectionsContainer = document.getElementById('settings-sections');
        
        switch(sectionName) {
            case 'group-formatting':
                sectionsContainer.innerHTML = this.createGroupFormattingSection();
                break;
            case 'message-features':
                sectionsContainer.innerHTML = this.createMessageFeaturesSection();
                break;
            case 'chat-size':
                sectionsContainer.innerHTML = this.createChatSizeSection();
                break;
            case 'auto-delete':
                sectionsContainer.innerHTML = this.createAutoDeleteSection();
                break;
            case 'global-css':
                sectionsContainer.innerHTML = this.createGlobalCSSSection();
                break;
        }
    }

    // Sekcja formatowania grup
    createGroupFormattingSection() {
        const groups = this.settings.groupFormatting.groups;
        
        let html = `
            <div class="settings-section active">
                <h3>🎨 Indywidualne Formatowanie Grup</h3>
                <div class="setting-item">
                    <label class="setting-label">
                        <input type="checkbox" id="group-formatting-enabled" 
                               ${this.settings.groupFormatting.enabled ? 'checked' : ''}>
                        Włącz formatowanie grup
                    </label>
                </div>
        `;
        
        Object.entries(groups).forEach(([groupName, groupSettings]) => {
            const groupDisplayName = {
                admin: 'Administrator',
                moderator: 'Moderator', 
                vip: 'VIP',
                user: 'Użytkownik'
            }[groupName] || groupName;
            
            html += `
                <div class="group-settings" data-group="${groupName}">
                    <h4>${groupDisplayName}</h4>
                    <div class="setting-item">
                        <label class="setting-label">
                            <input type="checkbox" class="group-enabled" 
                                   ${groupSettings.enabled ? 'checked' : ''}>
                            Włącz formatowanie dla ${groupDisplayName.toLowerCase()}
                        </label>
                    </div>
                    
                    <div class="setting-group">
                        <h5>Box wiadomości</h5>
                        <div class="setting-row">
                            <label>Kolor tła:</label>
                            <input type="color" class="bg-color" value="${groupSettings.messageBox.backgroundColor.replace('15', '').replace('#', '#') || '#ffffff'}">
                        </div>
                        <div class="setting-row">
                            <label>Kolor ramki:</label>
                            <input type="color" class="border-color" value="${groupSettings.messageBox.borderColor}">
                        </div>
                        <div class="setting-row">
                            <label>Szerokość ramki:</label>
                            <input type="text" class="border-width" value="${groupSettings.messageBox.borderWidth}">
                        </div>
                        <div class="setting-row">
                            <label>Zaokrąglenie:</label>
                            <input type="text" class="border-radius" value="${groupSettings.messageBox.borderRadius}">
                        </div>
                    </div>
                    
                    <div class="setting-group">
                        <h5>Tekst</h5>
                        <div class="setting-row">
                            <label>Rozmiar fontu:</label>
                            <input type="text" class="font-size" value="${groupSettings.text.fontSize}">
                        </div>
                        <div class="setting-row">
                            <label>Grubość fontu:</label>
                            <select class="font-weight">
                                <option value="normal" ${groupSettings.text.fontWeight === 'normal' ? 'selected' : ''}>Normal</option>
                                <option value="bold" ${groupSettings.text.fontWeight === 'bold' ? 'selected' : ''}>Bold</option>
                                <option value="600" ${groupSettings.text.fontWeight === '600' ? 'selected' : ''}>Semi-bold</option>
                            </select>
                        </div>
                        <div class="setting-row">
                            <label>Kolor tekstu:</label>
                            <input type="color" class="text-color" value="${groupSettings.text.color}">
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    // Sekcja funkcji wiadomości
    createMessageFeaturesSection() {
        const features = this.settings.messageFeatures;
        
        return `
            <div class="settings-section active">
                <h3>⚙️ Funkcje Wiadomości</h3>
                <p>Konfiguracja funkcji usuwania, edytowania i cytowania wiadomości dla poszczególnych grup.</p>
                
                <div class="feature-settings">
                    <h4>🗑️ Usuwanie wiadomości</h4>
                    <div class="setting-item">
                        <label class="setting-label">
                            <input type="checkbox" id="delete-enabled" ${features.delete.enabled ? 'checked' : ''}>
                            Włącz funkcję usuwania
                        </label>
                    </div>
                    <div class="group-checkboxes">
                        ${['admin', 'moderator', 'vip', 'user'].map(group => `
                            <label class="setting-label">
                                <input type="checkbox" class="delete-group" value="${group}" 
                                       ${features.delete.groups.includes(group) ? 'checked' : ''}>
                                ${group.charAt(0).toUpperCase() + group.slice(1)}
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="feature-settings">
                    <h4>✏️ Edytowanie wiadomości</h4>
                    <div class="setting-item">
                        <label class="setting-label">
                            <input type="checkbox" id="edit-enabled" ${features.edit.enabled ? 'checked' : ''}>
                            Włącz funkcję edytowania
                        </label>
                    </div>
                    <div class="group-checkboxes">
                        ${['admin', 'moderator', 'vip', 'user'].map(group => `
                            <label class="setting-label">
                                <input type="checkbox" class="edit-group" value="${group}" 
                                       ${features.edit.groups.includes(group) ? 'checked' : ''}>
                                ${group.charAt(0).toUpperCase() + group.slice(1)}
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="feature-settings">
                    <h4>💬 Cytowanie wiadomości</h4>
                    <div class="setting-item">
                        <label class="setting-label">
                            <input type="checkbox" id="quote-enabled" ${features.quote.enabled ? 'checked' : ''}>
                            Włącz funkcję cytowania
                        </label>
                    </div>
                    <div class="group-checkboxes">
                        ${['admin', 'moderator', 'vip', 'user'].map(group => `
                            <label class="setting-label">
                                <input type="checkbox" class="quote-group" value="${group}" 
                                       ${features.quote.groups.includes(group) ? 'checked' : ''}>
                                ${group.charAt(0).toUpperCase() + group.slice(1)}
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Sekcja rozmiaru chatu
    createChatSizeSection() {
        const size = this.settings.chatSize;
        
        return `
            <div class="settings-section active">
                <h3>📐 Rozmiar Chatu</h3>
                <div class="setting-item">
                    <label class="setting-label">
                        <input type="checkbox" id="chat-size-enabled" ${size.enabled ? 'checked' : ''}>
                        Włącz niestandardowy rozmiar chatu
                    </label>
                </div>
                
                <div class="setting-group">
                    <div class="setting-row">
                        <label>Szerokość:</label>
                        <input type="text" id="chat-width" value="${size.width}" placeholder="100%">
                    </div>
                    <div class="setting-row">
                        <label>Wysokość:</label>
                        <input type="text" id="chat-height" value="${size.height}" placeholder="600px">
                    </div>
                    <div class="setting-row">
                        <label>Maksymalna szerokość:</label>
                        <input type="text" id="chat-max-width" value="${size.maxWidth}" placeholder="1200px">
                    </div>
                    <div class="setting-row">
                        <label>Maksymalna wysokość:</label>
                        <input type="text" id="chat-max-height" value="${size.maxHeight}" placeholder="800px">
                    </div>
                </div>
            </div>
        `;
    }

    // Sekcja automatycznego usuwania
    createAutoDeleteSection() {
        const autoDelete = this.settings.autoDelete;
        
        return `
            <div class="settings-section active">
                <h3>🗑️ Automatyczne Usuwanie</h3>
                <div class="setting-item">
                    <label class="setting-label">
                        <input type="checkbox" id="auto-delete-enabled" ${autoDelete.enabled ? 'checked' : ''}>
                        Włącz automatyczne usuwanie wiadomości
                    </label>
                </div>
                
                <div class="setting-group">
                    <div class="setting-row">
                        <label>Czas w minutach:</label>
                        <input type="number" id="auto-delete-time" value="${autoDelete.timeInMinutes}" min="1" max="10080">
                    </div>
                </div>
                
                <div class="setting-group">
                    <h5>Grupy do usuwania:</h5>
                    <div class="group-checkboxes">
                        ${['admin', 'moderator', 'vip', 'user'].map(group => `
                            <label class="setting-label">
                                <input type="checkbox" class="delete-target-group" value="${group}" 
                                       ${autoDelete.groups.includes(group) ? 'checked' : ''}>
                                ${group.charAt(0).toUpperCase() + group.slice(1)}
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="setting-group">
                    <h5>Grupy wykluczane:</h5>
                    <div class="group-checkboxes">
                        ${['admin', 'moderator', 'vip', 'user'].map(group => `
                            <label class="setting-label">
                                <input type="checkbox" class="delete-exclude-group" value="${group}" 
                                       ${autoDelete.excludeGroups.includes(group) ? 'checked' : ''}>
                                ${group.charAt(0).toUpperCase() + group.slice(1)}
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Sekcja globalnego CSS
    createGlobalCSSSection() {
        const css = this.settings.globalCSS;
        
        return `
            <div class="settings-section active">
                <h3>🎭 Globalne Ustawienia CSS</h3>
                <div class="setting-item">
                    <label class="setting-label">
                        <input type="checkbox" id="global-css-enabled" ${css.enabled ? 'checked' : ''}>
                        Włącz globalne ustawienia CSS
                    </label>
                </div>
                
                <div class="setting-group">
                    <div class="setting-row">
                        <label>Rozmiar fontu:</label>
                        <input type="text" id="global-font-size" value="${css.fontSize}" placeholder="13px">
                    </div>
                    <div class="setting-row">
                        <label>Grubość fontu:</label>
                        <select id="global-font-weight">
                            <option value="normal" ${css.fontWeight === 'normal' ? 'selected' : ''}>Normal</option>
                            <option value="bold" ${css.fontWeight === 'bold' ? 'selected' : ''}>Bold</option>
                            <option value="600" ${css.fontWeight === '600' ? 'selected' : ''}>Semi-bold</option>
                        </select>
                    </div>
                    <div class="setting-row">
                        <label>Kolor tekstu:</label>
                        <input type="color" id="global-text-color" value="${css.textColor}">
                    </div>
                    <div class="setting-row">
                        <label>Kolor tła:</label>
                        <input type="color" id="global-bg-color" value="${css.backgroundColor}">
                    </div>
                    <div class="setting-row">
                        <label>Zaokrąglenie:</label>
                        <input type="text" id="global-border-radius" value="${css.borderRadius}" placeholder="4px">
                    </div>
                </div>
            </div>
        `;
    }

    // Wiązanie eventów
    bindEvents() {
        // Event dla otwierania ustawień
        document.addEventListener('click', (e) => {
            if (e.target.matches('#ips-advanced-settings-btn')) {
                this.showSettings();
            }
        });

        // Eventy modala
        document.addEventListener('click', (e) => {
            if (e.target.matches('#ips-settings-close') || e.target.matches('#ips-cancel-settings')) {
                this.hideSettings();
            }
            
            if (e.target.matches('#ips-save-settings')) {
                this.collectAndSaveSettings();
            }
            
            if (e.target.matches('#ips-reset-settings')) {
                this.resetToDefaults();
            }
            
            if (e.target.matches('.settings-nav-btn')) {
                const section = e.target.dataset.section;
                this.showSection(section);
            }
        });

        // Zamknij modal przy kliknięciu w tło
        document.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.hideSettings();
            }
        });
    }

    // Zbieranie i zapisywanie ustawień
    collectAndSaveSettings() {
        // Formatowanie grup
        const groupFormattingEnabled = document.getElementById('group-formatting-enabled')?.checked || false;
        this.settings.groupFormatting.enabled = groupFormattingEnabled;
        
        // Zbierz ustawienia dla każdej grupy
        document.querySelectorAll('.group-settings').forEach(groupElement => {
            const groupName = groupElement.dataset.group;
            const groupSettings = this.settings.groupFormatting.groups[groupName];
            
            if (groupSettings) {
                groupSettings.enabled = groupElement.querySelector('.group-enabled')?.checked || false;
                
                // Box settings
                const bgColor = groupElement.querySelector('.bg-color')?.value || '#ffffff';
                groupSettings.messageBox.backgroundColor = bgColor + '15'; // Dodaj przezroczystość
                groupSettings.messageBox.borderColor = groupElement.querySelector('.border-color')?.value || '#ddd';
                groupSettings.messageBox.borderWidth = groupElement.querySelector('.border-width')?.value || '1px';
                groupSettings.messageBox.borderRadius = groupElement.querySelector('.border-radius')?.value || '4px';
                
                // Text settings
                groupSettings.text.fontSize = groupElement.querySelector('.font-size')?.value || '13px';
                groupSettings.text.fontWeight = groupElement.querySelector('.font-weight')?.value || 'normal';
                groupSettings.text.color = groupElement.querySelector('.text-color')?.value || '#333';
            }
        });

        // Funkcje wiadomości
        this.settings.messageFeatures.delete.enabled = document.getElementById('delete-enabled')?.checked || false;
        this.settings.messageFeatures.edit.enabled = document.getElementById('edit-enabled')?.checked || false;
        this.settings.messageFeatures.quote.enabled = document.getElementById('quote-enabled')?.checked || false;

        this.settings.messageFeatures.delete.groups = Array.from(document.querySelectorAll('.delete-group:checked')).map(cb => cb.value);
        this.settings.messageFeatures.edit.groups = Array.from(document.querySelectorAll('.edit-group:checked')).map(cb => cb.value);
        this.settings.messageFeatures.quote.groups = Array.from(document.querySelectorAll('.quote-group:checked')).map(cb => cb.value);

        // Rozmiar chatu
        this.settings.chatSize.enabled = document.getElementById('chat-size-enabled')?.checked || false;
        this.settings.chatSize.width = document.getElementById('chat-width')?.value || '100%';
        this.settings.chatSize.height = document.getElementById('chat-height')?.value || '600px';
        this.settings.chatSize.maxWidth = document.getElementById('chat-max-width')?.value || '1200px';
        this.settings.chatSize.maxHeight = document.getElementById('chat-max-height')?.value || '800px';

        // Auto-usuwanie
        this.settings.autoDelete.enabled = document.getElementById('auto-delete-enabled')?.checked || false;
        this.settings.autoDelete.timeInMinutes = parseInt(document.getElementById('auto-delete-time')?.value) || 60;
        this.settings.autoDelete.groups = Array.from(document.querySelectorAll('.delete-target-group:checked')).map(cb => cb.value);
        this.settings.autoDelete.excludeGroups = Array.from(document.querySelectorAll('.delete-exclude-group:checked')).map(cb => cb.value);

        // Globalne CSS
        this.settings.globalCSS.enabled = document.getElementById('global-css-enabled')?.checked || false;
        this.settings.globalCSS.fontSize = document.getElementById('global-font-size')?.value || '13px';
        this.settings.globalCSS.fontWeight = document.getElementById('global-font-weight')?.value || 'normal';
        this.settings.globalCSS.textColor = document.getElementById('global-text-color')?.value || '#333333';
        this.settings.globalCSS.backgroundColor = document.getElementById('global-bg-color')?.value || '#ffffff';
        this.settings.globalCSS.borderRadius = document.getElementById('global-border-radius')?.value || '4px';
        
        this.saveSettings();
        this.hideSettings();
    }

    // Reset do domyślnych
    resetToDefaults() {
        if (confirm('Czy na pewno chcesz przywrócić domyślne ustawienia? Wszystkie zmiany zostaną utracone.')) {
            this.settings = this.getDefaultSettings();
            this.saveSettings();
            this.populateSettings();
        }
    }

    // Pokazanie powiadomienia
    showNotification(message, type = 'info') {
        if (this.chat && this.chat.showNotification) {
            this.chat.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Eksport klasy
window.IPSSettingsSystem = IPSSettingsSystem;