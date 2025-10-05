/**
 * Advanced Features System for IPS Chat
 * Handles file uploads, emojis, voice messages, and other advanced functionality
 */

class AdvancedFeaturesSystem {
    constructor(chatInstance) {
        this.chat = chatInstance;
        this.config = {
            maxFileSize: 10 * 1024 * 1024, // 10MB
            allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'text/plain', 'application/pdf'],
            maxVoiceLength: 60, // seconds
            emojiCategories: ['smileys', 'people', 'nature', 'food', 'activities', 'travel', 'objects', 'symbols', 'flags']
        };
        
        this.mediaRecorder = null;
        this.recordingChunks = [];
        this.isRecording = false;
        
        this.emojis = this.loadEmojis();
        this.init();
    }

    init() {
        this.setupFileUpload();
        this.setupEmojiPicker();
        this.setupVoiceRecording();
        this.setupImagePaste();
        this.setupDragAndDrop();
        this.bindEvents();
    }

    setupFileUpload() {
        // Create file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'file-upload';
        fileInput.style.display = 'none';
        fileInput.multiple = true;
        fileInput.accept = this.config.allowedFileTypes.join(',');
        document.body.appendChild(fileInput);

        // Create upload button
        const uploadBtn = document.createElement('button');
        uploadBtn.className = 'chat-tool-btn';
        uploadBtn.innerHTML = '📎';
        uploadBtn.title = 'Załącz plik';
        uploadBtn.onclick = () => fileInput.click();

        // Add to chat tools
        const chatTools = document.querySelector('.chat-tools');
        if (chatTools) {
            chatTools.appendChild(uploadBtn);
        }

        fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    }

    setupEmojiPicker() {
        // Create emoji button
        const emojiBtn = document.createElement('button');
        emojiBtn.className = 'chat-tool-btn';
        emojiBtn.innerHTML = '😀';
        emojiBtn.title = 'Emotki';
        emojiBtn.onclick = () => this.toggleEmojiPicker();

        // Add to chat tools
        const chatTools = document.querySelector('.chat-tools');
        if (chatTools) {
            chatTools.appendChild(emojiBtn);
        }

        // Create emoji picker
        this.createEmojiPicker();
    }

    setupVoiceRecording() {
        // Create voice button
        const voiceBtn = document.createElement('button');
        voiceBtn.className = 'chat-tool-btn voice-btn';
        voiceBtn.innerHTML = '🎤';
        voiceBtn.title = 'Nagraj wiadomość głosową';
        voiceBtn.onclick = () => this.toggleVoiceRecording();

        // Add to chat tools
        const chatTools = document.querySelector('.chat-tools');
        if (chatTools) {
            chatTools.appendChild(voiceBtn);
        }
    }

    setupImagePaste() {
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            messageInput.addEventListener('paste', (e) => this.handleImagePaste(e));
        }
    }

    setupDragAndDrop() {
        const chatContainer = document.querySelector('.chat-container');
        if (!chatContainer) return;

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            chatContainer.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        // Highlight drop area
        ['dragenter', 'dragover'].forEach(eventName => {
            chatContainer.addEventListener(eventName, () => this.highlight(chatContainer), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            chatContainer.addEventListener(eventName, () => this.unhighlight(chatContainer), false);
        });

        // Handle dropped files
        chatContainer.addEventListener('drop', (e) => this.handleDrop(e), false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    highlight(element) {
        element.classList.add('drag-over');
    }

    unhighlight(element) {
        element.classList.remove('drag-over');
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            this.handleFiles(files);
        }
    }

    handleFiles(files) {
        Array.from(files).forEach(file => {
            if (this.validateFile(file)) {
                this.processFile(file).then(fileData => {
                    this.sendFileMessage(fileData);
                }).catch(error => {
                    console.error('Error processing file:', error);
                    this.showNotification('Błąd podczas przetwarzania pliku', 'error');
                });
            }
        });
    }

    bindEvents() {
        // Close emoji picker when clicking outside
        document.addEventListener('click', (e) => {
            const emojiPicker = document.querySelector('.emoji-picker');
            const emojiBtn = document.querySelector('.chat-tool-btn');
            if (emojiPicker && emojiBtn && !emojiPicker.contains(e.target) && !emojiBtn.contains(e.target)) {
                emojiPicker.style.display = 'none';
            }
        });
    }

    async handleFileUpload(event) {
        const files = Array.from(event.target.files);
        
        for (const file of files) {
            if (!this.validateFile(file)) {
                continue;
            }

            try {
                const fileData = await this.processFile(file);
                this.sendFileMessage(fileData);
            } catch (error) {
                console.error('Error processing file:', error);
                this.showNotification('Błąd podczas przetwarzania pliku', 'error');
            }
        }

        // Clear input
        event.target.value = '';
    }

    validateFile(file) {
        if (file.size > this.config.maxFileSize) {
            this.showNotification(`Plik ${file.name} jest za duży (max ${this.config.maxFileSize / 1024 / 1024}MB)`, 'error');
            return false;
        }

        if (!this.config.allowedFileTypes.includes(file.type)) {
            this.showNotification(`Typ pliku ${file.type} nie jest obsługiwany`, 'error');
            return false;
        }

        return true;
    }

    async processFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                resolve({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: e.target.result,
                    isImage: file.type.startsWith('image/')
                });
            };
            
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    sendFileMessage(fileData) {
        const messageData = {
            type: 'file',
            content: fileData.name,
            fileData: fileData,
            timestamp: new Date().toISOString(),
            user: this.chat.currentUser
        };

        // Add to chat
        this.chat.addMessage(messageData);
        
        // Send to other users (in real implementation)
        console.log('Sending file message:', messageData);
    }

    createEmojiPicker() {
        const picker = document.createElement('div');
        picker.className = 'emoji-picker';
        picker.style.display = 'none';
        
        // Create categories
        const categories = document.createElement('div');
        categories.className = 'emoji-categories';
        
        this.config.emojiCategories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'emoji-category-btn';
            btn.textContent = this.getCategoryIcon(category);
            btn.title = this.getCategoryName(category);
            btn.onclick = () => this.showEmojiCategory(category);
            categories.appendChild(btn);
        });
        
        picker.appendChild(categories);
        
        // Create emoji grid
        const grid = document.createElement('div');
        grid.className = 'emoji-grid';
        picker.appendChild(grid);
        
        // Add to chat container
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
            chatContainer.appendChild(picker);
        }
        
        // Show default category
        this.showEmojiCategory('smileys');
    }

    toggleEmojiPicker() {
        const picker = document.querySelector('.emoji-picker');
        if (picker) {
            picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
        }
    }

    showEmojiCategory(category) {
        const grid = document.querySelector('.emoji-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        const emojis = this.emojis[category] || [];
        
        emojis.forEach(emoji => {
            const btn = document.createElement('button');
            btn.className = 'emoji-btn';
            btn.textContent = emoji;
            btn.title = emoji;
            btn.onclick = () => this.insertEmoji(emoji);
            grid.appendChild(btn);
        });
    }

    insertEmoji(emoji) {
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            const cursorPos = messageInput.selectionStart;
            const textBefore = messageInput.value.substring(0, cursorPos);
            const textAfter = messageInput.value.substring(messageInput.selectionEnd);
            
            messageInput.value = textBefore + emoji + textAfter;
            messageInput.focus();
            messageInput.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
            
            // Update character count
            if (this.chat.updateCharacterCount) {
                this.chat.updateCharacterCount();
            }
        }
        
        // Hide picker
        this.toggleEmojiPicker();
    }

    async toggleVoiceRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            await this.startRecording();
        }
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.recordingChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordingChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                this.processVoiceRecording();
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            
            // Update button
            const voiceBtn = document.querySelector('.voice-btn');
            if (voiceBtn) {
                voiceBtn.innerHTML = '⏹️';
                voiceBtn.title = 'Zatrzymaj nagrywanie';
                voiceBtn.classList.add('recording');
            }
            
            // Auto-stop after max length
            setTimeout(() => {
                if (this.isRecording) {
                    this.stopRecording();
                }
            }, this.config.maxVoiceLength * 1000);
            
        } catch (error) {
            console.error('Error starting recording:', error);
            this.showNotification('Nie można uzyskać dostępu do mikrofonu', 'error');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Update button
            const voiceBtn = document.querySelector('.voice-btn');
            if (voiceBtn) {
                voiceBtn.innerHTML = '🎤';
                voiceBtn.title = 'Nagraj wiadomość głosową';
                voiceBtn.classList.remove('recording');
            }
            
            // Stop all tracks
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    }

    processVoiceRecording() {
        const blob = new Blob(this.recordingChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(blob);
        
        const messageData = {
            type: 'voice',
            content: 'Wiadomość głosowa',
            audioData: {
                url: audioUrl,
                blob: blob,
                duration: this.calculateDuration()
            },
            timestamp: new Date().toISOString(),
            user: this.chat.currentUser
        };
        
        // Add to chat
        this.chat.addMessage(messageData);
        
        console.log('Voice message created:', messageData);
    }

    calculateDuration() {
        // Simple duration calculation (in real app, use proper audio analysis)
        return Math.min(this.recordingChunks.length * 0.1, this.config.maxVoiceLength);
    }

    async handleImagePaste(event) {
        const items = Array.from(event.clipboardData.items);
        
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                event.preventDefault();
                
                const file = item.getAsFile();
                if (file) {
                    try {
                        const fileData = await this.processFile(file);
                        this.sendFileMessage(fileData);
                    } catch (error) {
                        console.error('Error processing pasted image:', error);
                    }
                }
            }
        }
    }

    loadEmojis() {
        return {
            smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
            people: ['👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👩', '🧓', '👴', '👵', '🙍', '🙎', '🙅', '🙆', '💁', '🙋', '🧏', '🙇', '🤦', '🤷', '👮', '🕵️', '💂', '👷', '🤴', '👸', '👳', '👲'],
            nature: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇'],
            food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🍞'],
            activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️'],
            travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞'],
            objects: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️'],
            symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐'],
            flags: ['🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇦🇨', '🇦🇩', '🇦🇪', '🇦🇫', '🇦🇬', '🇦🇮', '🇦🇱', '🇦🇲', '🇦🇴', '🇦🇶', '🇦🇷', '🇦🇸', '🇦🇹', '🇦🇺', '🇦🇼', '🇦🇽', '🇦🇿', '🇧🇦', '🇧🇧', '🇧🇩', '🇧🇪', '🇧🇫']
        };
    }

    getCategoryIcon(category) {
        const icons = {
            smileys: '😀',
            people: '👤',
            nature: '🐶',
            food: '🍎',
            activities: '⚽',
            travel: '🚗',
            objects: '💻',
            symbols: '❤️',
            flags: '🏁'
        };
        return icons[category] || '😀';
    }

    getCategoryName(category) {
        const names = {
            smileys: 'Buźki',
            people: 'Ludzie',
            nature: 'Natura',
            food: 'Jedzenie',
            activities: 'Aktywności',
            travel: 'Podróże',
            objects: 'Przedmioty',
            symbols: 'Symbole',
            flags: 'Flagi'
        };
        return names[category] || 'Emotki';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    // Method to render file messages
    renderFileMessage(messageData) {
        const fileData = messageData.fileData;
        
        if (fileData.isImage) {
            return `
                <div class="file-message image-message">
                    <img src="${fileData.data}" alt="${fileData.name}" class="message-image" onclick="this.classList.toggle('fullscreen')">
                    <div class="file-info">
                        <span class="file-name">${fileData.name}</span>
                        <span class="file-size">${this.formatFileSize(fileData.size)}</span>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="file-message">
                    <div class="file-icon">📄</div>
                    <div class="file-info">
                        <span class="file-name">${fileData.name}</span>
                        <span class="file-size">${this.formatFileSize(fileData.size)}</span>
                    </div>
                    <button class="download-btn" onclick="this.downloadFile('${fileData.data}', '${fileData.name}')">⬇️</button>
                </div>
            `;
        }
    }

    // Method to render voice messages
    renderVoiceMessage(messageData) {
        const audioData = messageData.audioData;
        
        return `
            <div class="voice-message">
                <button class="play-btn" onclick="this.togglePlayback('${audioData.url}')">▶️</button>
                <div class="voice-info">
                    <span class="voice-duration">${Math.round(audioData.duration)}s</span>
                    <div class="voice-waveform"></div>
                </div>
            </div>
        `;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    downloadFile(dataUrl, filename) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        link.click();
    }

    togglePlayback(audioUrl) {
        // Simple audio playback toggle
        const audio = new Audio(audioUrl);
        audio.play();
    }
}

// Export for use in main.js
window.AdvancedFeaturesSystem = AdvancedFeaturesSystem;