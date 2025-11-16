// Kintsugi AI Platform - Main JavaScript

document.addEventListener("DOMContentLoaded", function() {

    // --- Matrix Rain Background ---
    const canvas = document.getElementById('matrix-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const matrix = "KINTSUGIASلM01";
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops = [];

        for (let i = 0; i < columns; i++) {
            drops[i] = Math.random() * -100;
        }

        function drawMatrix() {
            ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#F0FF00';
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = matrix[Math.floor(Math.random() * matrix.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }

        setInterval(drawMatrix, 50);

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    // --- Custom Cursor ---
    const cursorCross = document.querySelector('.cursor-cross');
    const cursorInvert = document.querySelector('.cursor-invert');

    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (cursorCross && cursorInvert) {
            cursorCross.style.left = mouseX + 'px';
            cursorCross.style.top = mouseY + 'px';

            cursorInvert.style.left = (mouseX - 40) + 'px';
            cursorInvert.style.top = (mouseY - 40) + 'px';
        }
    });

    // Cursor hover effect
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .interactive');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (cursorInvert) cursorInvert.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            if (cursorInvert) cursorInvert.classList.remove('hover');
        });
    });
    initMobileNavigation();
});

// Auth helpers
function getToken() {
    const token = localStorage.getItem('token');
    console.log('[AUTH] Getting token:', token ? 'EXISTS' : 'NULL');
    return token;
}

function setToken(token) {
    console.log('[AUTH] Setting token:', token);
    localStorage.setItem('token', token);
}

function removeToken() {
    console.log('[AUTH] Removing token');
    localStorage.removeItem('token');
}

function isAuthenticated() {
    const authenticated = !!getToken();
    console.log('[AUTH] Is authenticated:', authenticated);
    return authenticated;
}

function logout() {
    removeToken();
    window.location.href = '/';
}

// API Base URL
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080/api'
    : '/api';

function initMobileNavigation() {
    if (document.querySelector('.mobile-nav-overlay')) {
        return;
    }

    const navLinks = document.querySelector('.nav-links');
    const navContainer = navLinks?.closest('.nav-container');
    if (!navLinks || !navContainer) {
        return;
    }

    if (navContainer.querySelector('.mobile-menu-toggle')) {
        return;
    }

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'mobile-menu-toggle touch-target';
    toggle.setAttribute('aria-label', 'Open navigation menu');
    toggle.innerHTML = '<span></span><span></span><span></span>';
    navContainer.appendChild(toggle);

    const overlay = document.createElement('div');
    overlay.className = 'mobile-nav-overlay';
    overlay.innerHTML = `
        <div class="mobile-nav-panel ripple">
            <div class="mobile-nav-panel-header">
                <span>Menu</span>
                <button type="button" class="mobile-nav-close" aria-label="Close menu">&times;</button>
            </div>
            <div class="mobile-nav-panel-links"></div>
        </div>
    `;
    document.body.appendChild(overlay);

    const panelLinksContainer = overlay.querySelector('.mobile-nav-panel-links');
    const closeBtn = overlay.querySelector('.mobile-nav-close');

    const closeMobileNav = () => {
        overlay.classList.remove('open');
        document.documentElement.classList.remove('mobile-nav-open');
    };

    const openMobileNav = () => {
        overlay.classList.add('open');
        document.documentElement.classList.add('mobile-nav-open');
    };

    toggle.addEventListener('click', openMobileNav);
    closeBtn?.addEventListener('click', closeMobileNav);
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeMobileNav();
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMobileNav();
        }
    });
    window.addEventListener('resize', closeMobileNav);

    if (!panelLinksContainer) {
        return;
    }

    navLinks.querySelectorAll('a').forEach(link => {
        const clone = link.cloneNode(true);
        clone.classList.add('touch-target');
        clone.addEventListener('click', closeMobileNav);
        panelLinksContainer.appendChild(clone);
    });
}
