/**
 * Navigation functionality for the chat application
 */

class Navigation {
    constructor() {
        this.sidebar = document.querySelector('.sidebar');
        this.menuToggle = document.querySelector('.nav-menu-toggle');
        this.overlay = null;
        
        this.init();
    }
    
    init() {
        this.createOverlay();
        this.bindEvents();
        this.handleResize();
    }
    
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'sidebar-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(this.overlay);
    }
    
    bindEvents() {
        // Menu toggle button
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => this.toggleSidebar());
        }
        
        // Overlay click to close
        this.overlay.addEventListener('click', () => this.closeSidebar());
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.sidebar.classList.contains('open')) {
                this.closeSidebar();
            }
        });
        
        // Window resize handler
        window.addEventListener('resize', () => this.handleResize());
        
        // Navigation menu items
        this.bindNavigationItems();
    }
    
    bindNavigationItems() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const action = item.dataset.action;
                this.handleNavigation(action);
            });
        });
        
        // User dropdown
        const userDropdown = document.querySelector('.user-dropdown');
        const userAvatar = document.querySelector('.user-avatar');
        
        if (userAvatar && userDropdown) {
            userAvatar.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('show');
            });
            
            document.addEventListener('click', () => {
                userDropdown.classList.remove('show');
            });
        }
    }
    
    handleNavigation(action) {
        switch (action) {
            case 'home':
                this.navigateToHome();
                break;
            case 'rooms':
                this.showRooms();
                break;
            case 'users':
                this.showUsers();
                break;
            case 'settings':
                this.showSettings();
                break;
            case 'advanced-settings':
                this.showAdvancedSettings();
                break;
            case 'admin':
                this.showAdmin();
                break;
            case 'profile':
                this.showProfile();
                break;
            case 'logout':
                this.handleLogout();
                break;
            default:
                console.log('Unknown navigation action:', action);
        }
        
        // Close sidebar on mobile after navigation
        if (window.innerWidth <= 1024) {
            this.closeSidebar();
        }
    }
    
    navigateToHome() {
        // Switch to main room
        if (window.chatApp && window.chatApp.switchRoom) {
            window.chatApp.switchRoom('main');
        }
        this.updateActiveNavItem('home');
    }
    
    showRooms() {
        // Show rooms panel or modal
        console.log('Showing rooms');
        this.updateActiveNavItem('rooms');
    }
    
    showUsers() {
        // Show users list
        console.log('Showing users');
        this.updateActiveNavItem('users');
    }
    
    showSettings() {
        // Show settings modal
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            settingsModal.style.display = 'block';
        }
        this.updateActiveNavItem('settings');
    }
    
    showAdvancedSettings() {
        // Show advanced IPS settings modal
        if (window.chatApp && window.chatApp.ipsSettings) {
            window.chatApp.ipsSettings.openModal();
        } else {
            console.error('IPS Settings system not available');
        }
        this.updateActiveNavItem('advanced-settings');
    }
    
    showAdmin() {
        // Show admin panel
        const adminModal = document.getElementById('adminModal');
        if (adminModal) {
            adminModal.style.display = 'block';
        }
        this.updateActiveNavItem('admin');
    }
    
    showProfile() {
        // Show user profile
        console.log('Showing profile');
    }
    
    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            // Handle logout logic
            console.log('Logging out...');
            // window.location.href = '/login';
        }
    }
    
    updateActiveNavItem(activeAction) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (item.dataset.action === activeAction) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    toggleSidebar() {
        if (this.sidebar.classList.contains('open')) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }
    
    openSidebar() {
        this.sidebar.classList.add('open');
        this.overlay.style.opacity = '1';
        this.overlay.style.visibility = 'visible';
        document.body.style.overflow = 'hidden';
        
        // Focus management for accessibility
        const firstFocusable = this.sidebar.querySelector('a, button, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }
    
    closeSidebar() {
        this.sidebar.classList.remove('open');
        this.overlay.style.opacity = '0';
        this.overlay.style.visibility = 'hidden';
        document.body.style.overflow = '';
        
        // Return focus to menu toggle
        if (this.menuToggle) {
            this.menuToggle.focus();
        }
    }
    
    handleResize() {
        // Close sidebar on desktop
        if (window.innerWidth > 1024) {
            this.closeSidebar();
        }
    }
    
    // Public methods for external use
    setActiveRoom(roomId) {
        // Update navigation state based on active room
        console.log('Active room changed to:', roomId);
    }
    
    updateUserInfo(userInfo) {
        // Update user information in navigation
        const userName = document.querySelector('.user-name');
        const userAvatar = document.querySelector('.user-avatar');
        
        if (userName && userInfo.name) {
            userName.textContent = userInfo.name;
        }
        
        if (userAvatar && userInfo.name) {
            userAvatar.textContent = userInfo.name.charAt(0).toUpperCase();
        }
    }
    
    showNotification(count) {
        // Show notification badge
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navigation = new Navigation();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navigation;
}