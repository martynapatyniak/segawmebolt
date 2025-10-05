/**
 * System zarządzania przesyłaniem plików z funkcją drag & drop
 * Obsługuje miniaturki, podgląd przed wysłaniem i modal do pełnego widoku
 */
class FileUploadSystem {
    constructor(chatInstance) {
        this.chat = chatInstance;
        this.config = {
            maxFileSize: 10 * 1024 * 1024, // 10MB
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'],
            thumbnailSize: 150,
            previewSize: 100
        };
        
        this.pendingFiles = [];
        this.init();
    }

    init() {
        this.setupDragAndDrop();
        this.setupFileInput();
        this.createPreviewArea();
        this.createModal();
        this.bindEvents();
    }

    setupDragAndDrop() {
        const chatContainer = document.querySelector('.chat-container');
        if (!chatContainer) return;

        // Zapobiegaj domyślnym zachowaniom
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            chatContainer.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        // Podświetlenie obszaru upuszczania
        ['dragenter', 'dragover'].forEach(eventName => {
            chatContainer.addEventListener(eventName, () => this.highlightDropZone(), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            chatContainer.addEventListener(eventName, () => this.unhighlightDropZone(), false);
        });

        // Obsługa upuszczonych plików
        chatContainer.addEventListener('drop', (e) => this.handleDrop(e), false);
    }

    setupFileInput() {
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        const fileBtn = document.getElementById('file-btn');
        if (fileBtn) {
            fileBtn.addEventListener('click', () => {
                if (fileInput) fileInput.click();
            });
        }
    }

    createPreviewArea() {
        const inputFooter = document.querySelector('.input-footer');
        if (!inputFooter) return;

        const previewArea = document.createElement('div');
        previewArea.className = 'file-preview-area';
        previewArea.innerHTML = `
            <div class="preview-header">
                <span class="preview-title">Pliki do wysłania:</span>
                <button class="clear-all-btn" title="Usuń wszystkie">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="preview-files"></div>
        `;
        
        inputFooter.parentNode.insertBefore(previewArea, inputFooter);
        
        // Bind clear all button
        const clearAllBtn = previewArea.querySelector('.clear-all-btn');
        clearAllBtn.addEventListener('click', () => this.clearAllPreviews());
    }

    createModal() {
        const modal = document.createElement('div');
        modal.className = 'file-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <span class="modal-title"></span>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="media-container"></div>
                </div>
                <div class="modal-footer">
                    <div class="file-info">
                        <span class="file-name"></span>
                        <span class="file-size"></span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Bind modal events
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        
        closeBtn.addEventListener('click', () => this.closeModal());
        overlay.addEventListener('click', () => this.closeModal());
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    highlightDropZone() {
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
            chatContainer.classList.add('drag-over');
        }
    }

    unhighlightDropZone() {
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
            chatContainer.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        const files = Array.from(e.dataTransfer.files);
        this.processFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.processFiles(files);
        e.target.value = ''; // Clear input
    }

    async processFiles(files) {
        for (const file of files) {
            if (this.validateFile(file)) {
                try {
                    const fileData = await this.createFileData(file);
                    this.addToPreview(fileData);
                } catch (error) {
                    console.error('Error processing file:', error);
                    this.showNotification(`Błąd podczas przetwarzania pliku ${file.name}`, 'error');
                }
            }
        }
    }

    validateFile(file) {
        if (file.size > this.config.maxFileSize) {
            this.showNotification(`Plik ${file.name} jest za duży (max ${this.formatFileSize(this.config.maxFileSize)})`, 'error');
            return false;
        }

        if (!this.config.allowedTypes.includes(file.type)) {
            this.showNotification(`Typ pliku ${file.type} nie jest obsługiwany`, 'error');
            return false;
        }

        return true;
    }

    async createFileData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const fileData = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: e.target.result,
                    isImage: file.type.startsWith('image/'),
                    isVideo: file.type.startsWith('video/'),
                    timestamp: new Date().toISOString()
                };
                
                resolve(fileData);
            };
            
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    addToPreview(fileData) {
        this.pendingFiles.push(fileData);
        this.renderPreview();
    }

    renderPreview() {
        const previewArea = document.querySelector('.file-preview-area');
        const previewFiles = previewArea.querySelector('.preview-files');
        
        if (this.pendingFiles.length === 0) {
            previewArea.style.display = 'none';
            return;
        }
        
        previewArea.style.display = 'block';
        previewFiles.innerHTML = '';
        
        this.pendingFiles.forEach(fileData => {
            const previewItem = this.createPreviewItem(fileData);
            previewFiles.appendChild(previewItem);
        });
    }

    createPreviewItem(fileData) {
        const item = document.createElement('div');
        item.className = 'preview-item';
        item.dataset.fileId = fileData.id;
        
        let mediaElement = '';
        if (fileData.isImage) {
            mediaElement = `<img src="${fileData.data}" alt="${fileData.name}" class="preview-thumbnail">`;
        } else if (fileData.isVideo) {
            mediaElement = `<video src="${fileData.data}" class="preview-thumbnail" muted></video>`;
        } else {
            mediaElement = `<div class="file-icon"><i class="fas fa-file"></i></div>`;
        }
        
        item.innerHTML = `
            <div class="preview-media" onclick="fileUploadSystem.openModal('${fileData.id}')">
                ${mediaElement}
                <div class="preview-overlay">
                    <i class="fas fa-eye"></i>
                </div>
            </div>
            <div class="preview-info">
                <div class="file-name" title="${fileData.name}">${this.truncateFileName(fileData.name)}</div>
                <div class="file-size">${this.formatFileSize(fileData.size)}</div>
            </div>
            <button class="remove-preview" onclick="fileUploadSystem.removeFromPreview('${fileData.id}')" title="Usuń">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        return item;
    }

    removeFromPreview(fileId) {
        this.pendingFiles = this.pendingFiles.filter(file => file.id != fileId);
        this.renderPreview();
    }

    clearAllPreviews() {
        this.pendingFiles = [];
        this.renderPreview();
    }

    openModal(fileId) {
        const fileData = this.pendingFiles.find(file => file.id == fileId);
        if (!fileData) return;
        
        this.showModal(fileData.name, fileData.size, fileData.data, fileData.isImage);
    }

    openModalFromMessage(fileId, fileName, fileSize, fileData, isImage) {
        this.showModal(fileName, fileSize, fileData, isImage);
    }

    showModal(fileName, fileSize, fileData, isImage) {
        const modal = document.querySelector('.file-modal');
        const modalTitle = modal.querySelector('.modal-title');
        const mediaContainer = modal.querySelector('.media-container');
        const fileNameElement = modal.querySelector('.file-name');
        const fileSizeElement = modal.querySelector('.file-size');
        
        modalTitle.textContent = 'Podgląd pliku';
        fileNameElement.textContent = fileName;
        fileSizeElement.textContent = this.formatFileSize(fileSize);
        
        let mediaElement = '';
        if (isImage) {
            mediaElement = `<img src="${fileData}" alt="${fileName}" class="modal-image">`;
        } else {
            mediaElement = `<video src="${fileData}" controls class="modal-video"></video>`;
        }
        
        mediaContainer.innerHTML = mediaElement;
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    }

    closeModal() {
        const modal = document.querySelector('.file-modal');
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }

    sendPendingFiles() {
        if (this.pendingFiles.length === 0) return;
        
        this.pendingFiles.forEach(fileData => {
            this.sendFileMessage(fileData);
        });
        
        this.clearAllPreviews();
    }

    sendFileMessage(fileData) {
        const messageData = {
            id: Date.now() + Math.random(),
            type: 'file',
            content: fileData.name,
            fileData: fileData,
            timestamp: new Date().toISOString(),
            user: this.chat.currentUser,
            room: this.chat.currentRoom
        };

        this.chat.addMessage(messageData);
        console.log('File message sent:', messageData);
    }

    bindEvents() {
        // Wysyłanie plików wraz z wiadomością
        const sendBtn = document.getElementById('send-btn');
        if (sendBtn) {
            const originalSendMessage = this.chat.sendMessage.bind(this.chat);
            this.chat.sendMessage = () => {
                this.sendPendingFiles();
                originalSendMessage();
            };
        }
    }

    // Utility methods
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    truncateFileName(name, maxLength = 20) {
        if (name.length <= maxLength) return name;
        const ext = name.split('.').pop();
        const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
        const truncated = nameWithoutExt.substring(0, maxLength - ext.length - 4) + '...';
        return truncated + '.' + ext;
    }

    showNotification(message, type = 'info') {
        // Użyj systemu powiadomień z głównego chatu jeśli dostępny
        if (this.chat && typeof this.chat.showNotification === 'function') {
            this.chat.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Globalna instancja dla łatwego dostępu z HTML
let fileUploadSystem = null;