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

// Initialize theme manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.themeManager = new ThemeManager();
    });
} else {
    window.themeManager = new ThemeManager();
}

// Add CSS for theme switcher
const style = document.createElement('style');
style.textContent = `
    .theme-switcher {
        display: flex;
        align-items: center;
        margin-left: 0.75rem;
    }

    .theme-toggle-btn {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.625rem 1.25rem;
        background: rgba(0, 0, 0, 0.3);
        border: 2px solid var(--cyber-cyan);
        border-radius: 10px;
        color: var(--cyber-cyan);
        font-weight: 700;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        min-height: 42px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
    }

    .theme-toggle-btn::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.05));
        opacity: 0;
        transition: opacity 0.25s ease;
    }

    .theme-toggle-btn:hover::before {
        opacity: 1;
    }

    .theme-toggle-btn:hover {
        background: rgba(0, 255, 255, 0.15);
        border-color: var(--neon-pink);
        box-shadow: 0 0 30px rgba(0, 255, 255, 0.4), 0 4px 16px rgba(0, 0, 0, 0.3);
        transform: translateY(-2px);
    }

    .theme-toggle-btn:active {
        transform: translateY(0) scale(0.98);
        box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
    }

    .theme-icon {
        font-size: 1.25rem;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        filter: drop-shadow(0 0 8px currentColor);
        position: relative;
        z-index: 1;
    }

    .theme-icon.cyberpunk-icon {
        color: var(--kintsugi-gold);
    }

    .theme-icon.clean-icon {
        color: var(--accent-sage, #A8B88A);
    }

    .theme-label {
        position: relative;
        z-index: 1;
        font-weight: 700;
        text-shadow: 0 0 10px currentColor;
    }

    /* Clean theme styles */
    [data-theme="clean"] .theme-toggle-btn {
        background: var(--background-elevated);
        border: 1px solid var(--border-medium);
        color: var(--primary-olive);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        letter-spacing: 0.02em;
    }

    [data-theme="clean"] .theme-toggle-btn::before {
        display: none;
    }

    [data-theme="clean"] .theme-toggle-btn:hover {
        background: var(--background-secondary);
        border-color: var(--primary-olive);
        box-shadow: 0 2px 12px rgba(107, 114, 68, 0.15);
        transform: translateY(-1px);
    }

    [data-theme="clean"] .theme-icon {
        filter: none;
        text-shadow: none;
    }

    [data-theme="clean"] .theme-label {
        text-shadow: none;
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
        .theme-switcher {
            order: 2;
            margin-left: 0.5rem;
        }

        .theme-toggle-btn {
            padding: 0.625rem;
            min-width: 44px;
            min-height: 44px;
            gap: 0;
            border-radius: 8px;
        }

        .theme-label {
            display: none;
        }

        .theme-icon {
            margin: 0;
        }
    }

    /* Transition effect */
    body.theme-transitioning * {
        transition: background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                    border-color 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                    color 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                    box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
`;
document.head.appendChild(style);
