/**
 * Mobile Responsive System for IPS Chat
 * Handles mobile-specific UI adaptations and touch interactions
 */

class MobileResponsiveSystem {
    constructor(chatInstance) {
        this.chat = chatInstance;
        this.isMobile = this.detectMobile();
        this.isTablet = this.detectTablet();
        this.orientation = this.getOrientation();
        
        this.touchStartY = 0;
        this.touchStartX = 0;
        this.isScrolling = false;
        
        this.init();
    }

    init() {
        this.setupViewport();
        this.adaptUIForMobile();
        this.setupTouchEvents();
        this.setupOrientationChange();
        this.setupKeyboardHandling();
        
        if (this.isMobile) {
            document.body.classList.add('mobile-device');
        }
        
        if (this.isTablet) {
            document.body.classList.add('tablet-device');
        }
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }

    detectTablet() {
        return /iPad|Android/i.test(navigator.userAgent) && 
               window.innerWidth >= 768 && window.innerWidth <= 1024;
    }

    getOrientation() {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }

    setupViewport() {
        // Ensure proper viewport meta tag
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }

    adaptUIForMobile() {
        if (!this.isMobile) return;

        // Adapt chat container
        this.adaptChatContainer();
        
        // Adapt message input
        this.adaptMessageInput();
        
        // Adapt user list
        this.adaptUserList();
        
        // Adapt modals
        this.adaptModals();
        
        // Adapt buttons and touch targets
        this.adaptTouchTargets();
    }

    adaptChatContainer() {
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
            chatContainer.classList.add('mobile-chat');
            
            // Add mobile header
            this.createMobileHeader();
            
            // Adjust chat messages area
            const messagesContainer = document.querySelector('.messages-container');
            if (messagesContainer) {
                messagesContainer.classList.add('mobile-messages');
            }
        }
    }

    createMobileHeader() {
        const chatContainer = document.querySelector('.chat-container');
        if (!chatContainer || document.querySelector('.mobile-header')) return;

        const mobileHeader = document.createElement('div');
        mobileHeader.className = 'mobile-header';
        mobileHeader.innerHTML = `
            <div class="mobile-header-left">
                <button class="mobile-menu-btn" onclick="mobileResponsive.toggleMobileMenu()">
                    <span class="hamburger-icon">☰</span>
                </button>
                <h3 class="mobile-chat-title">IPS Chat</h3>
            </div>
            <div class="mobile-header-right">
                <button class="mobile-users-btn" onclick="mobileResponsive.toggleUsersList()">
                    <span class="users-count">${this.getOnlineUsersCount()}</span>
                    <span class="users-icon">👥</span>
                </button>
            </div>
        `;
        
        chatContainer.insertBefore(mobileHeader, chatContainer.firstChild);
    }

    adaptMessageInput() {
        const messageInput = document.querySelector('#message-input');
        if (messageInput) {
            messageInput.classList.add('mobile-input');
            
            // Add mobile-specific placeholder
            if (this.isMobile) {
                messageInput.placeholder = 'Napisz wiadomość...';
            }
            
            // Adjust input container
            const inputContainer = messageInput.closest('.message-input-container');
            if (inputContainer) {
                inputContainer.classList.add('mobile-input-container');
            }
        }
    }

    adaptUserList() {
        const usersList = document.querySelector('.users-list');
        if (usersList) {
            usersList.classList.add('mobile-users-list');
            
            // Create overlay for mobile users list
            const overlay = document.createElement('div');
            overlay.className = 'mobile-overlay users-overlay';
            overlay.onclick = () => this.toggleUsersList();
            document.body.appendChild(overlay);
        }
    }

    adaptModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.add('mobile-modal');
            
            // Add swipe to close functionality
            this.addSwipeToClose(modal);
        });
    }

    adaptTouchTargets() {
        // Increase touch target size for buttons
        const buttons = document.querySelectorAll('button, .clickable');
        buttons.forEach(button => {
            if (this.isMobile) {
                button.classList.add('mobile-touch-target');
            }
        });
    }

    setupTouchEvents() {
        // Swipe gestures for navigation
        document.addEventListener('touchstart', (e) => {
            this.touchStartY = e.touches[0].clientY;
            this.touchStartX = e.touches[0].clientX;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!this.touchStartY || !this.touchStartX) return;
            
            const touchY = e.touches[0].clientY;
            const touchX = e.touches[0].clientX;
            const diffY = this.touchStartY - touchY;
            const diffX = this.touchStartX - touchX;
            
            // Detect horizontal swipe
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swipe left - could open user list
                    this.handleSwipeLeft();
                } else {
                    // Swipe right - could close user list
                    this.handleSwipeRight();
                }
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            this.touchStartY = 0;
            this.touchStartX = 0;
        }, { passive: true });
    }

    setupOrientationChange() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.orientation = this.getOrientation();
                this.handleOrientationChange();
            }, 100);
        });

        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    setupKeyboardHandling() {
        if (!this.isMobile) return;

        // Handle virtual keyboard
        let initialViewportHeight = window.innerHeight;
        
        window.addEventListener('resize', () => {
            const currentHeight = window.innerHeight;
            const heightDiff = initialViewportHeight - currentHeight;
            
            if (heightDiff > 150) {
                // Keyboard is likely open
                document.body.classList.add('keyboard-open');
                this.adjustForKeyboard(true);
            } else {
                // Keyboard is likely closed
                document.body.classList.remove('keyboard-open');
                this.adjustForKeyboard(false);
            }
        });
    }

    handleSwipeLeft() {
        if (this.isMobile) {
            this.showUsersList();
        }
    }

    handleSwipeRight() {
        if (this.isMobile) {
            this.hideUsersList();
        }
    }

    handleOrientationChange() {
        // Adjust UI based on orientation
        document.body.classList.remove('portrait', 'landscape');
        document.body.classList.add(this.orientation);
        
        // Recalculate dimensions
        setTimeout(() => {
            this.recalculateDimensions();
        }, 300);
    }

    handleResize() {
        // Update mobile detection on resize
        const wasMobile = this.isMobile;
        this.isMobile = this.detectMobile();
        
        if (wasMobile !== this.isMobile) {
            if (this.isMobile) {
                document.body.classList.add('mobile-device');
                this.adaptUIForMobile();
            } else {
                document.body.classList.remove('mobile-device');
            }
        }
    }

    adjustForKeyboard(isOpen) {
        const messagesContainer = document.querySelector('.messages-container');
        const inputContainer = document.querySelector('.message-input-container');
        
        if (isOpen) {
            if (messagesContainer) {
                messagesContainer.style.paddingBottom = '60px';
            }
            if (inputContainer) {
                inputContainer.style.position = 'fixed';
                inputContainer.style.bottom = '0';
            }
        } else {
            if (messagesContainer) {
                messagesContainer.style.paddingBottom = '';
            }
            if (inputContainer) {
                inputContainer.style.position = '';
                inputContainer.style.bottom = '';
            }
        }
    }

    toggleMobileMenu() {
        const mobileMenu = document.querySelector('.mobile-menu');
        if (!mobileMenu) {
            this.createMobileMenu();
        }
        
        document.body.classList.toggle('mobile-menu-open');
    }

    createMobileMenu() {
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        mobileMenu.innerHTML = `
            <div class="mobile-menu-content">
                <div class="mobile-menu-header">
                    <h3>Menu</h3>
                    <button class="mobile-menu-close" onclick="mobileResponsive.toggleMobileMenu()">×</button>
                </div>
                <div class="mobile-menu-items">
                    <button class="mobile-menu-item" onclick="mobileResponsive.showRooms()">
                        🏠 Pokoje
                    </button>
                    <button class="mobile-menu-item" onclick="mobileResponsive.showSettings()">
                        ⚙️ Ustawienia
                    </button>
                    <button class="mobile-menu-item" onclick="mobileResponsive.showStatistics()">
                        📊 Statystyki
                    </button>
                    <button class="mobile-menu-item" onclick="mobileResponsive.toggleSound()">
                        🔊 Dźwięk
                    </button>
                </div>
            </div>
            <div class="mobile-menu-overlay" onclick="mobileResponsive.toggleMobileMenu()"></div>
        `;
        
        document.body.appendChild(mobileMenu);
    }

    toggleUsersList() {
        document.body.classList.toggle('mobile-users-open');
        
        // Update users count
        const usersCount = document.querySelector('.users-count');
        if (usersCount) {
            usersCount.textContent = this.getOnlineUsersCount();
        }
    }

    showUsersList() {
        document.body.classList.add('mobile-users-open');
    }

    hideUsersList() {
        document.body.classList.remove('mobile-users-open');
    }

    addSwipeToClose(modal) {
        let startY = 0;
        
        modal.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        modal.addEventListener('touchmove', (e) => {
            const currentY = e.touches[0].clientY;
            const diff = startY - currentY;
            
            if (diff < -100) { // Swipe down
                modal.style.display = 'none';
            }
        }, { passive: true });
    }

    recalculateDimensions() {
        // Recalculate chat container height
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer && this.isMobile) {
            const headerHeight = document.querySelector('.mobile-header')?.offsetHeight || 0;
            const inputHeight = document.querySelector('.message-input-container')?.offsetHeight || 0;
            const availableHeight = window.innerHeight - headerHeight - inputHeight;
            
            const messagesContainer = document.querySelector('.messages-container');
            if (messagesContainer) {
                messagesContainer.style.height = `${availableHeight}px`;
            }
        }
    }

    getOnlineUsersCount() {
        const usersList = document.querySelectorAll('.user-item.online');
        return usersList.length || 1;
    }

    // Public API methods
    showRooms() {
        if (this.chat.rooms) {
            this.chat.rooms.showRoomsModal();
        }
        this.toggleMobileMenu();
    }

    showSettings() {
        if (this.chat.settings) {
            this.chat.settings.showSettingsModal();
        }
        this.toggleMobileMenu();
    }

    showStatistics() {
        if (this.chat.statistics) {
            this.chat.statistics.showStatistics();
        }
        this.toggleMobileMenu();
    }

    toggleSound() {
        if (this.chat.toggleSound) {
            this.chat.toggleSound();
        }
        this.toggleMobileMenu();
    }

    // Utility methods
    isMobileDevice() {
        return this.isMobile;
    }

    isTabletDevice() {
        return this.isTablet;
    }

    getCurrentOrientation() {
        return this.orientation;
    }
}

// Export for use in main.js
window.MobileResponsiveSystem = MobileResponsiveSystem;