class Navigation {
    constructor() {
        this.hamburgerMenu = document.querySelector('.hamburger-menu');
        this.dropdownMenu = document.querySelector('.dropdown-menu');
        this.dropdownClose = document.querySelector('.dropdown-close');
        this.navItems = document.querySelectorAll('.nav-item');
        this.isMenuOpen = false;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setActiveNavItem();
    }

    bindEvents() {
        // Hamburger menu toggle
        if (this.hamburgerMenu) {
            this.hamburgerMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu();
            });
        }

        // Close button
        if (this.dropdownClose) {
            this.dropdownClose.addEventListener('click', () => this.closeMenu());
        }

        // Navigation items
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleNavClick(e));
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.dropdownMenu?.contains(e.target) && !this.hamburgerMenu?.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Responsive behavior
        window.addEventListener('resize', () => this.handleResize());
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        
        if (this.isMenuOpen) {
            this.openMenu();
        } else {
            this.closeMenu();
        }
    }

    openMenu() {
        this.isMenuOpen = true;
        this.hamburgerMenu?.classList.add('active');
        this.dropdownMenu?.classList.add('show');
        
        // Focus first menu item for accessibility
        const firstNavItem = this.dropdownMenu?.querySelector('.nav-item');
        if (firstNavItem) {
            firstNavItem.focus();
        }
    }

    closeMenu() {
        this.isMenuOpen = false;
        this.hamburgerMenu?.classList.remove('active');
        this.dropdownMenu?.classList.remove('show');
    }

    handleNavClick(e) {
        const item = e.currentTarget;
        const href = item.getAttribute('href');
        const action = item.getAttribute('data-action');

        // Remove active class from all items
        this.navItems.forEach(navItem => navItem.classList.remove('active'));
        
        // Add active class to clicked item
        item.classList.add('active');

        // Handle different navigation actions
        if (action) {
            e.preventDefault();
            this.handleAction(action);
        } else if (href && href.startsWith('#')) {
            e.preventDefault();
            this.navigateToSection(href.substring(1));
        }

        // Close menu after navigation (especially on mobile)
        this.closeMenu();
    }

    handleAction(action) {
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
            case 'admin':
                this.showAdminPanel();
                break;
            case 'profile':
                this.showProfile();
                break;
            case 'logout':
                this.logout();
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    navigateToHome() {
        // Show main chat view
        console.log('Navigating to home');
    }

    showRooms() {
        // Show rooms list or toggle rooms panel
        console.log('Showing rooms');
    }

    showUsers() {
        // Show users list
        console.log('Showing users');
    }

    showSettings() {
        // Open settings modal
        const settingsModal = document.querySelector('#settingsModal');
        if (settingsModal) {
            settingsModal.style.display = 'block';
        }
    }

    showAdminPanel() {
        // Open admin panel modal
        const adminModal = document.querySelector('#adminModal');
        if (adminModal) {
            adminModal.style.display = 'block';
        }
    }

    showProfile() {
        // Show user profile
        console.log('Showing profile');
    }

    logout() {
        // Handle logout
        if (confirm('Czy na pewno chcesz się wylogować?')) {
            console.log('Logging out...');
            // Add logout logic here
        }
    }

    navigateToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }

    setActiveNavItem() {
        // Set active navigation item based on current page/section
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;

        this.navItems.forEach(item => {
            const href = item.getAttribute('href');
            const action = item.getAttribute('data-action');
            
            if (href === currentPath || href === currentHash || action === 'home') {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    handleKeydown(e) {
        if (!this.isMenuOpen) return;

        switch (e.key) {
            case 'Escape':
                this.closeMenu();
                this.hamburgerMenu?.focus();
                break;
            case 'Tab':
                this.handleTabNavigation(e);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.focusNextItem();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.focusPreviousItem();
                break;
        }
    }

    handleTabNavigation(e) {
        const focusableElements = this.dropdownMenu?.querySelectorAll(
            'a, button, [tabindex]:not([tabindex="-1"])'
        );
        
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    focusNextItem() {
        const items = Array.from(this.dropdownMenu?.querySelectorAll('.nav-item') || []);
        const currentIndex = items.indexOf(document.activeElement);
        const nextIndex = (currentIndex + 1) % items.length;
        items[nextIndex]?.focus();
    }

    focusPreviousItem() {
        const items = Array.from(this.dropdownMenu?.querySelectorAll('.nav-item') || []);
        const currentIndex = items.indexOf(document.activeElement);
        const previousIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
        items[previousIndex]?.focus();
    }

    handleResize() {
        // Close menu on resize to prevent layout issues
        if (window.innerWidth > 768 && this.isMenuOpen) {
            this.closeMenu();
        }
    }

    // Public methods for external use
    updateUserInfo(userInfo) {
        const userName = document.querySelector('.user-name');
        const userStatus = document.querySelector('.user-status');
        const userAvatar = document.querySelector('.user-avatar');

        if (userName && userInfo.name) {
            userName.textContent = userInfo.name;
        }

        if (userStatus && userInfo.status) {
            userStatus.textContent = userInfo.status;
        }

        if (userAvatar && userInfo.name) {
            userAvatar.textContent = userInfo.name.charAt(0).toUpperCase();
        }
    }

    updateNotifications(count) {
        // Update notification badge if exists
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

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navigation;
}