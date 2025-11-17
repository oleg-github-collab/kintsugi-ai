// Theme Manager - Kintsugi AI
// Manages theme switching between Cyberpunk and Clean themes

class ThemeManager {
    constructor() {
        this.themes = {
            cyberpunk: {
                name: 'Cyberpunk',
                icon: '⚡',
                description: 'Neo-brutalism cyber aesthetic'
            },
            clean: {
                name: 'Clean',
                icon: '○',
                description: 'Olive & white minimalist'
            }
        };

        this.currentTheme = this.getStoredTheme() || 'cyberpunk';
        this.init();
    }

    init() {
        // Apply stored theme immediately
        this.applyTheme(this.currentTheme, false);

        // Create theme switcher UI
        this.createThemeSwitcher();

        // Listen for system theme changes
        this.watchSystemTheme();
    }

    getStoredTheme() {
        try {
            return localStorage.getItem('kintsugi-theme');
        } catch (e) {
            return null;
        }
    }

    setStoredTheme(theme) {
        try {
            localStorage.setItem('kintsugi-theme', theme);
        } catch (e) {
            console.warn('Could not save theme preference');
        }
    }

    applyTheme(themeName, animate = true) {
        const html = document.documentElement;
        const body = document.body;

        // Remove existing theme
        html.removeAttribute('data-theme');
        body.classList.remove('theme-transitioning');

        // Add transition class for smooth change
        if (animate) {
            body.classList.add('theme-transitioning');
            setTimeout(() => {
                body.classList.remove('theme-transitioning');
            }, 300);
        }

        // Apply new theme
        if (themeName === 'clean') {
            html.setAttribute('data-theme', 'clean');
        }

        this.currentTheme = themeName;
        this.setStoredTheme(themeName);

        // Update switcher UI
        this.updateSwitcherUI();

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('themechange', {
            detail: { theme: themeName }
        }));
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'cyberpunk' ? 'clean' : 'cyberpunk';
        this.applyTheme(newTheme);
    }

    createThemeSwitcher() {
        // Check if already created
        if (document.getElementById('theme-switcher')) return;

        const switcher = document.createElement('div');
        switcher.id = 'theme-switcher';
        switcher.className = 'theme-switcher';
        switcher.innerHTML = `
            <button
                class="theme-toggle-btn"
                onclick="window.themeManager.toggleTheme()"
                aria-label="Toggle theme"
                title="Switch theme"
            >
                <span class="theme-icon cyberpunk-icon">⚡</span>
                <span class="theme-icon clean-icon">○</span>
                <span class="theme-label"></span>
            </button>
        `;

        // Insert into nav container
        const navContainer = document.querySelector('.nav-container');
        if (navContainer) {
            // Insert before language switcher or at the end
            const langSwitcher = document.getElementById('language-switcher-container');
            if (langSwitcher) {
                navContainer.insertBefore(switcher, langSwitcher);
            } else {
                navContainer.appendChild(switcher);
            }
        }

        this.updateSwitcherUI();
    }

    updateSwitcherUI() {
        const switcher = document.getElementById('theme-switcher');
        if (!switcher) return;

        const label = switcher.querySelector('.theme-label');
        const cyberpunkIcon = switcher.querySelector('.cyberpunk-icon');
        const cleanIcon = switcher.querySelector('.clean-icon');

        if (this.currentTheme === 'cyberpunk') {
            switcher.setAttribute('data-active-theme', 'cyberpunk');
            if (label) label.textContent = 'Cyberpunk';
            if (cyberpunkIcon) cyberpunkIcon.style.opacity = '0';
            if (cleanIcon) cleanIcon.style.opacity = '1';
        } else {
            switcher.setAttribute('data-active-theme', 'clean');
            if (label) label.textContent = 'Clean';
            if (cyberpunkIcon) cyberpunkIcon.style.opacity = '1';
            if (cleanIcon) cleanIcon.style.opacity = '0';
        }
    }

    watchSystemTheme() {
        // Optional: respect system dark/light mode
        if (window.matchMedia) {
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            darkModeQuery.addEventListener('change', (e) => {
                // Only auto-switch if user hasn't manually set a theme
                if (!this.getStoredTheme()) {
                    this.applyTheme(e.matches ? 'cyberpunk' : 'clean');
                }
            });
        }
    }
}

// Initialize theme manager
window.themeManager = new ThemeManager();

// Add CSS for theme switcher
const style = document.createElement('style');
style.textContent = `
    .theme-switcher {
        display: flex;
        align-items: center;
        margin-left: 0.5rem;
    }

    .theme-toggle-btn {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: transparent;
        border: 2px solid var(--cyber-cyan, #6B7244);
        border-radius: 8px;
        color: var(--cyber-cyan, #6B7244);
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;
        overflow: hidden;
        min-height: 40px;
    }

    .theme-toggle-btn:hover {
        background: rgba(0, 255, 255, 0.1);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .theme-toggle-btn:active {
        transform: scale(0.98);
    }

    .theme-icon {
        font-size: 1.2rem;
        position: absolute;
        left: 0.75rem;
        transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .theme-label {
        margin-left: 1.5rem;
        letter-spacing: 0.05em;
        text-transform: uppercase;
    }

    /* Clean theme styles */
    [data-theme="clean"] .theme-toggle-btn {
        border-color: var(--primary-olive, #6B7244);
        color: var(--primary-olive, #6B7244);
    }

    [data-theme="clean"] .theme-toggle-btn:hover {
        background: rgba(107, 114, 68, 0.1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
        .theme-switcher {
            order: 2;
        }

        .theme-toggle-btn {
            padding: 0.5rem 0.75rem;
            min-width: 44px;
            min-height: 44px;
            border-radius: 8px;
        }

        .theme-label {
            display: none;
        }

        .theme-icon {
            position: static;
            margin: 0;
        }
    }

    /* Transition effect */
    body.theme-transitioning * {
        transition: background-color 0.3s ease,
                    border-color 0.3s ease,
                    color 0.3s ease,
                    box-shadow 0.3s ease !important;
    }
`;
document.head.appendChild(style);
