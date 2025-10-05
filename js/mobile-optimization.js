/**
 * Mobile Optimization System for IPS Chat
 * Handles responsive design, touch interactions, and mobile-specific features
 */

class MobileOptimizationSystem {
    constructor(chatInstance) {
        this.chat = chatInstance;
        this.isMobile = this.detectMobile();
        this.isTablet = this.detectTablet();
        this.orientation = this.getOrientation();
        
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.isScrolling = false;
        
        this.init();
    }

    init() {
        if (this.isMobile || this.isTablet) {
            this.setupMobileFeatures();
            this.setupTouchEvents();
            this.setupViewportHandling();
            this.setupMobileUI();
            this.setupSwipeGestures();
        }
        
        this.setupResponsiveHandling();
        this.bindEvents();
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768);
    }

    detectTablet() {
        return /iPad|Android/i.test(navigator.userAgent) && 
               (window.innerWidth > 768 && window.innerWidth <= 1024);
    }

    getOrientation() {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }

    setupMobileFeatures() {
        // Add mobile class to body
        document.body.classList.add('mobile-device');
        
        // Prevent zoom on input focus
        this.preventZoomOnInputFocus();
        
        // Setup mobile-specific meta tags
        this.setupMobileMetaTags();
        
        // Setup mobile keyboard handling
        this.setupMobileKeyboard();
        
        // Setup pull-to-refresh
        this.setupPullToRefresh();
    }

    setupMobileMetaTags() {
        // Ensure proper viewport meta tag
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        
        // Add mobile web app meta tags
        const metaTags = [
            { name: 'mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
            { name: 'theme-color', content: '#1a1a1a' }
        ];
        
        metaTags.forEach(tag => {
            let meta = document.querySelector(`meta[name="${tag.name}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.name = tag.name;
                meta.content = tag.content;
                document.head.appendChild(meta);
            }
        });
    }

    preventZoomOnInputFocus() {
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                if (this.isMobile) {
                    // Temporarily disable zoom
                    const viewport = document.querySelector('meta[name="viewport"]');
                    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
                }
            });
            
            input.addEventListener('blur', () => {
                if (this.isMobile) {
                    // Re-enable zoom
                    const viewport = document.querySelector('meta[name="viewport"]');
                    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
                }
            });
        });
    }

    setupMobileKeyboard() {
        const messageInput = document.getElementById('message-input');
        if (!messageInput) return;
        
        let initialViewportHeight = window.innerHeight;
        
        // Handle virtual keyboard
        window.addEventListener('resize', () => {
            const currentHeight = window.innerHeight;
            const heightDifference = initialViewportHeight - currentHeight;
            
            if (heightDifference > 150) {
                // Keyboard is likely open
                document.body.classList.add('keyboard-open');
                this.adjustForKeyboard(true);
            } else {
                // Keyboard is likely closed
                document.body.classList.remove('keyboard-open');
                this.adjustForKeyboard(false);
            }
        });
        
        // Handle input focus/blur
        messageInput.addEventListener('focus', () => {
            setTimeout(() => {
                this.scrollToBottom();
            }, 300);
        });
    }

    adjustForKeyboard(isOpen) {
        const chatContainer = document.querySelector('.chat-container');
        const messagesContainer = document.querySelector('.messages-container');
        
        if (isOpen) {
            chatContainer.style.height = '100vh';
            messagesContainer.style.paddingBottom = '60px';
            this.scrollToBottom();
        } else {
            chatContainer.style.height = '';
            messagesContainer.style.paddingBottom = '';
        }
    }

    setupTouchEvents() {
        const chatContainer = document.querySelector('.chat-container');
        if (!chatContainer) return;
        
        // Touch event handlers
        chatContainer.addEventListener('touchstart', (e) => {
            this.handleTouchStart(e);
        }, { passive: true });
        
        chatContainer.addEventListener('touchmove', (e) => {
            this.handleTouchMove(e);
        }, { passive: false });
        
        chatContainer.addEventListener('touchend', (e) => {
            this.handleTouchEnd(e);
        }, { passive: true });
    }

    handleTouchStart(e) {
        this.touchStartY = e.touches[0].clientY;
        this.isScrolling = false;
    }

    handleTouchMove(e) {
        if (!this.touchStartY) return;
        
        this.touchEndY = e.touches[0].clientY;
        const diff = this.touchStartY - this.touchEndY;
        
        if (Math.abs(diff) > 10) {
            this.isScrolling = true;
        }
        
        // Prevent overscroll
        const messagesContainer = document.querySelector('.messages-container');
        if (messagesContainer) {
            const scrollTop = messagesContainer.scrollTop;
            const scrollHeight = messagesContainer.scrollHeight;
            const clientHeight = messagesContainer.clientHeight;
            
            if ((scrollTop === 0 && diff < 0) || 
                (scrollTop + clientHeight >= scrollHeight && diff > 0)) {
                e.preventDefault();
            }
        }
    }

    handleTouchEnd(e) {
        if (!this.touchStartY || !this.touchEndY) return;
        
        const diff = this.touchStartY - this.touchEndY;
        const threshold = 50;
        
        if (Math.abs(diff) > threshold && !this.isScrolling) {
            if (diff > 0) {
                // Swipe up
                this.handleSwipeUp();
            } else {
                // Swipe down
                this.handleSwipeDown();
            }
        }
        
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.isScrolling = false;
    }

    setupSwipeGestures() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            const threshold = 100;
            
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    // Swipe left - show user list
                    this.toggleUserList(true);
                } else {
                    // Swipe right - hide user list
                    this.toggleUserList(false);
                }
            }
        }, { passive: true });
    }

    setupPullToRefresh() {
        const messagesContainer = document.querySelector('.messages-container');
        if (!messagesContainer) return;
        
        let startY = 0;
        let isPulling = false;
        let pullDistance = 0;
        
        const refreshIndicator = document.createElement('div');
        refreshIndicator.className = 'pull-refresh-indicator';
        refreshIndicator.innerHTML = '↓ Pociągnij aby odświeżyć';
        messagesContainer.insertBefore(refreshIndicator, messagesContainer.firstChild);
        
        messagesContainer.addEventListener('touchstart', (e) => {
            if (messagesContainer.scrollTop === 0) {
                startY = e.touches[0].clientY;
                isPulling = true;
            }
        }, { passive: true });
        
        messagesContainer.addEventListener('touchmove', (e) => {
            if (!isPulling) return;
            
            const currentY = e.touches[0].clientY;
            pullDistance = currentY - startY;
            
            if (pullDistance > 0 && messagesContainer.scrollTop === 0) {
                e.preventDefault();
                
                const maxPull = 100;
                const normalizedDistance = Math.min(pullDistance, maxPull);
                
                refreshIndicator.style.transform = `translateY(${normalizedDistance}px)`;
                refreshIndicator.style.opacity = normalizedDistance / maxPull;
                
                if (normalizedDistance >= maxPull) {
                    refreshIndicator.innerHTML = '↑ Puść aby odświeżyć';
                    refreshIndicator.classList.add('ready');
                } else {
                    refreshIndicator.innerHTML = '↓ Pociągnij aby odświeżyć';
                    refreshIndicator.classList.remove('ready');
                }
            }
        }, { passive: false });
        
        messagesContainer.addEventListener('touchend', () => {
            if (isPulling && pullDistance >= 100) {
                this.refreshMessages();
            }
            
            // Reset
            refreshIndicator.style.transform = '';
            refreshIndicator.style.opacity = '';
            refreshIndicator.classList.remove('ready');
            isPulling = false;
            pullDistance = 0;
        }, { passive: true });
    }

    setupViewportHandling() {
        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    setupMobileUI() {
        // Add mobile-specific UI elements
        this.createMobileHeader();
        this.createMobileNavigation();
        this.setupMobileUserList();
        this.setupMobileEmojiPicker();
    }

    createMobileHeader() {
        const chatHeader = document.querySelector('.chat-header');
        if (!chatHeader) return;
        
        // Add hamburger menu
        const menuBtn = document.createElement('button');
        menuBtn.className = 'mobile-menu-btn';
        menuBtn.innerHTML = '☰';
        menuBtn.onclick = () => this.toggleMobileMenu();
        
        chatHeader.insertBefore(menuBtn, chatHeader.firstChild);
        
        // Add back button for rooms
        const backBtn = document.createElement('button');
        backBtn.className = 'mobile-back-btn';
        backBtn.innerHTML = '←';
        backBtn.style.display = 'none';
        backBtn.onclick = () => this.goBack();
        
        chatHeader.insertBefore(backBtn, chatHeader.firstChild);
    }

    createMobileNavigation() {
        const mobileNav = document.createElement('div');
        mobileNav.className = 'mobile-navigation';
        mobileNav.innerHTML = `
            <div class="mobile-nav-overlay"></div>
            <div class="mobile-nav-content">
                <div class="mobile-nav-header">
                    <h3>Menu</h3>
                    <button class="mobile-nav-close">✕</button>
                </div>
                <div class="mobile-nav-items">
                    <button class="mobile-nav-item" data-action="rooms">🏠 Pokoje</button>
                    <button class="mobile-nav-item" data-action="users">👥 Użytkownicy</button>
                    <button class="mobile-nav-item" data-action="settings">⚙️ Ustawienia</button>
                    <button class="mobile-nav-item" data-action="profile">👤 Profil</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(mobileNav);
        
        // Bind events
        mobileNav.querySelector('.mobile-nav-close').onclick = () => this.closeMobileMenu();
        mobileNav.querySelector('.mobile-nav-overlay').onclick = () => this.closeMobileMenu();
        
        mobileNav.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.onclick = () => {
                this.handleMobileNavAction(item.dataset.action);
                this.closeMobileMenu();
            };
        });
    }

    setupMobileUserList() {
        const userList = document.querySelector('.user-list');
        if (!userList) return;
        
        // Make user list toggleable on mobile
        userList.classList.add('mobile-hidden');
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'user-list-close';
        closeBtn.innerHTML = '✕';
        closeBtn.onclick = () => this.toggleUserList(false);
        
        userList.insertBefore(closeBtn, userList.firstChild);
    }

    setupMobileEmojiPicker() {
        // Adjust emoji picker for mobile
        const emojiBtn = document.querySelector('.emoji-btn');
        if (emojiBtn && this.isMobile) {
            emojiBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showMobileEmojiPicker();
            });
        }
    }

    setupResponsiveHandling() {
        // Handle responsive breakpoints
        this.updateResponsiveClasses();
        
        window.addEventListener('resize', () => {
            this.updateResponsiveClasses();
        });
    }

    updateResponsiveClasses() {
        const width = window.innerWidth;
        const body = document.body;
        
        body.classList.toggle('mobile', width <= 768);
        body.classList.toggle('tablet', width > 768 && width <= 1024);
        body.classList.toggle('desktop', width > 1024);
    }

    bindEvents() {
        // Prevent context menu on long press
        document.addEventListener('contextmenu', (e) => {
            if (this.isMobile) {
                e.preventDefault();
            }
        });
        
        // Handle double tap to zoom prevention
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    // Mobile-specific methods
    toggleMobileMenu() {
        const mobileNav = document.querySelector('.mobile-navigation');
        if (mobileNav) {
            mobileNav.classList.toggle('active');
        }
    }

    closeMobileMenu() {
        const mobileNav = document.querySelector('.mobile-navigation');
        if (mobileNav) {
            mobileNav.classList.remove('active');
        }
    }

    handleMobileNavAction(action) {
        switch (action) {
            case 'rooms':
                this.showRooms();
                break;
            case 'users':
                this.toggleUserList(true);
                break;
            case 'settings':
                this.showSettings();
                break;
            case 'profile':
                this.showProfile();
                break;
        }
    }

    toggleUserList(show) {
        const userList = document.querySelector('.user-list');
        if (!userList) return;
        
        if (show) {
            userList.classList.remove('mobile-hidden');
            userList.classList.add('mobile-visible');
        } else {
            userList.classList.add('mobile-hidden');
            userList.classList.remove('mobile-visible');
        }
    }

    handleOrientationChange() {
        const newOrientation = this.getOrientation();
        
        if (newOrientation !== this.orientation) {
            this.orientation = newOrientation;
            
            // Adjust UI for new orientation
            this.adjustForOrientation();
            
            // Scroll to bottom after orientation change
            setTimeout(() => {
                this.scrollToBottom();
            }, 300);
        }
    }

    adjustForOrientation() {
        const body = document.body;
        body.classList.toggle('portrait', this.orientation === 'portrait');
        body.classList.toggle('landscape', this.orientation === 'landscape');
        
        // Adjust emoji picker size
        const emojiPicker = document.querySelector('.emoji-picker');
        if (emojiPicker && this.isMobile) {
            if (this.orientation === 'landscape') {
                emojiPicker.style.height = '200px';
            } else {
                emojiPicker.style.height = '300px';
            }
        }
    }

    handleResize() {
        // Update mobile detection
        this.isMobile = this.detectMobile();
        this.isTablet = this.detectTablet();
        
        // Update responsive classes
        this.updateResponsiveClasses();
        
        // Adjust UI elements
        this.adjustUIForSize();
    }

    adjustUIForSize() {
        const width = window.innerWidth;
        
        // Adjust message input area
        const messageInputContainer = document.querySelector('.message-input-container');
        if (messageInputContainer) {
            if (width <= 480) {
                messageInputContainer.classList.add('compact');
            } else {
                messageInputContainer.classList.remove('compact');
            }
        }
        
        // Adjust admin panel for mobile
        const adminPanel = document.querySelector('.admin-panel-content');
        if (adminPanel && width <= 768) {
            adminPanel.classList.add('mobile-layout');
        } else if (adminPanel) {
            adminPanel.classList.remove('mobile-layout');
        }
    }

    handleSwipeUp() {
        // Hide mobile keyboard or show more options
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
            document.activeElement.blur();
        }
    }

    handleSwipeDown() {
        // Show user list or refresh
        if (this.isMobile) {
            this.toggleUserList(true);
        }
    }

    scrollToBottom() {
        const messagesContainer = document.querySelector('.messages-container');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    refreshMessages() {
        // Implement message refresh logic
        if (this.chat && this.chat.loadMockData) {
            this.chat.loadMockData();
        }
        
        // Show refresh feedback
        this.showRefreshFeedback();
    }

    showRefreshFeedback() {
        const indicator = document.querySelector('.pull-refresh-indicator');
        if (indicator) {
            indicator.innerHTML = '✓ Odświeżono';
            indicator.classList.add('success');
            
            setTimeout(() => {
                indicator.innerHTML = '↓ Pociągnij aby odświeżyć';
                indicator.classList.remove('success');
            }, 1000);
        }
    }

    showMobileEmojiPicker() {
        // Create mobile-optimized emoji picker
        const picker = document.createElement('div');
        picker.className = 'mobile-emoji-picker';
        picker.innerHTML = `
            <div class="mobile-emoji-header">
                <h3>Wybierz emoji</h3>
                <button class="mobile-emoji-close">✕</button>
            </div>
            <div class="mobile-emoji-content">
                <!-- Emoji content will be populated here -->
            </div>
        `;
        
        document.body.appendChild(picker);
        
        // Bind close event
        picker.querySelector('.mobile-emoji-close').onclick = () => {
            document.body.removeChild(picker);
        };
        
        // Populate with emojis
        this.populateMobileEmojis(picker.querySelector('.mobile-emoji-content'));
    }

    populateMobileEmojis(container) {
        const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'];
        
        emojis.forEach(emoji => {
            const emojiBtn = document.createElement('button');
            emojiBtn.className = 'mobile-emoji-btn';
            emojiBtn.textContent = emoji;
            emojiBtn.onclick = () => {
                this.insertEmoji(emoji);
                document.body.removeChild(container.closest('.mobile-emoji-picker'));
            };
            container.appendChild(emojiBtn);
        });
    }

    insertEmoji(emoji) {
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            const start = messageInput.selectionStart;
            const end = messageInput.selectionEnd;
            const text = messageInput.value;
            
            messageInput.value = text.substring(0, start) + emoji + text.substring(end);
            messageInput.selectionStart = messageInput.selectionEnd = start + emoji.length;
            messageInput.focus();
        }
    }

    // Utility methods
    goBack() {
        // Implement back navigation
        window.history.back();
    }

    showRooms() {
        // Show rooms interface
        console.log('Showing rooms');
    }

    showSettings() {
        // Show settings interface
        console.log('Showing settings');
    }

    showProfile() {
        // Show profile interface
        console.log('Showing profile');
    }

    // Public API
    isMobileDevice() {
        return this.isMobile;
    }

    isTabletDevice() {
        return this.isTablet;
    }

    getCurrentOrientation() {
        return this.orientation;
    }

    enableMobileMode() {
        document.body.classList.add('mobile-device');
        this.setupMobileFeatures();
    }

    disableMobileMode() {
        document.body.classList.remove('mobile-device');
    }
}

// Make available globally
window.MobileOptimizationSystem = MobileOptimizationSystem;