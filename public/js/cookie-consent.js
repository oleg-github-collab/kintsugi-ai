// Cookie Consent Management

(function() {
    const CONSENT_KEY = 'kintsugi_cookie_consent';
    const CONSENT_VERSION = '1.0';

    function hasConsent() {
        const consent = localStorage.getItem(CONSENT_KEY);
        if (!consent) return false;

        try {
            const data = JSON.parse(consent);
            return data.version === CONSENT_VERSION && data.accepted === true;
        } catch {
            return false;
        }
    }

    function setConsent(accepted) {
        const data = {
            version: CONSENT_VERSION,
            accepted: accepted,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
    }

    function showConsentModal() {
        const modal = document.createElement('div');
        modal.id = 'cookie-consent-modal';
        modal.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--digital-black);
            border-top: 4px solid var(--kintsugi-gold);
            padding: 2rem;
            z-index: 10001;
            box-shadow: 0 -8px 0px rgba(240, 255, 0, 0.4);
            animation: slideUp 0.5s ease-out;
        `;

        modal.innerHTML = `
            <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem;">
                <div style="display: flex; align-items: flex-start; gap: 2rem; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 300px;">
                        <h3 class="text-gold" style="font-size: 1.5rem; margin-bottom: 1rem; text-transform: uppercase;">
                            🍪 COOKIE POLICY
                        </h3>
                        <p style="color: var(--digital-white); line-height: 1.6; margin-bottom: 1rem;">
                            We use cookies and local storage to enhance your experience on Kintsugi AI. This includes:
                        </p>
                        <ul style="color: var(--cyber-cyan); line-height: 1.8; list-style: none; padding-left: 0;">
                            <li>✓ Authentication tokens to keep you logged in</li>
                            <li>✓ Conversation history and AI chat messages</li>
                            <li>✓ User preferences and settings</li>
                            <li>✓ Analytics to improve our service</li>
                        </ul>
                        <p style="color: #999; font-size: 0.9rem; margin-top: 1rem;">
                            By clicking "Accept", you consent to our use of cookies and local storage.
                            <a href="/privacy.html" class="text-cyan" style="text-decoration: underline;">Learn more</a>
                        </p>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 1rem; min-width: 250px;">
                        <button onclick="acceptCookies()" class="btn btn-primary interactive" style="width: 100%; padding: 1rem; font-size: 1.1rem; text-transform: uppercase; box-shadow: 6px 6px 0px rgba(240, 255, 0, 0.4);">
                            ✓ ACCEPT ALL
                        </button>
                        <button onclick="rejectCookies()" class="btn btn-secondary interactive" style="width: 100%; padding: 0.75rem; font-size: 1rem; text-transform: uppercase; box-shadow: 4px 4px 0px rgba(0, 255, 255, 0.3);">
                            ✗ DECLINE
                        </button>
                        <button onclick="customizeCookies()" class="btn btn-secondary interactive" style="width: 100%; padding: 0.75rem; font-size: 1rem; text-transform: uppercase; border: 2px dashed var(--cyber-cyan);">
                            ⚙ CUSTOMIZE
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUp {
                from {
                    transform: translateY(100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            @keyframes slideDown {
                from {
                    transform: translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateY(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(modal);

        // Add global functions
        window.acceptCookies = function() {
            setConsent(true);
            closeModal();
        };

        window.rejectCookies = function() {
            setConsent(false);
            closeModal();
            // Optionally redirect or show message
            alert('Some features may be limited without cookies.');
        };

        window.customizeCookies = function() {
            showCustomizeModal();
        };

        function closeModal() {
            modal.style.animation = 'slideDown 0.3s ease-out';
            setTimeout(() => {
                modal.remove();
            }, 300);
        }

        function showCustomizeModal() {
            closeModal();
            setTimeout(() => {
                const customModal = document.createElement('div');
                customModal.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.95);
                    z-index: 10002;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: fadeIn 0.3s ease-out;
                `;

                customModal.innerHTML = `
                    <div style="background: var(--digital-black); border: 4px solid var(--kintsugi-gold); padding: 2rem; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 0 40px rgba(240, 255, 0, 0.6);">
                        <h3 class="text-gold" style="font-size: 1.5rem; margin-bottom: 1.5rem; text-transform: uppercase;">
                            ⚙ CUSTOMIZE COOKIE PREFERENCES
                        </h3>

                        <div style="margin-bottom: 2rem;">
                            <div style="border: 2px solid var(--cyber-cyan); padding: 1rem; margin-bottom: 1rem;">
                                <label style="display: flex; align-items: center; gap: 1rem; cursor: pointer;">
                                    <input type="checkbox" id="essential-cookies" checked disabled style="width: 20px; height: 20px;">
                                    <div style="flex: 1;">
                                        <div class="text-cyan" style="font-weight: bold; margin-bottom: 0.5rem;">Essential Cookies (Required)</div>
                                        <div style="color: #999; font-size: 0.9rem;">Necessary for authentication and core functionality</div>
                                    </div>
                                </label>
                            </div>

                            <div style="border: 2px solid var(--cyber-cyan); padding: 1rem; margin-bottom: 1rem;">
                                <label style="display: flex; align-items: center; gap: 1rem; cursor: pointer;">
                                    <input type="checkbox" id="functional-cookies" checked style="width: 20px; height: 20px;">
                                    <div style="flex: 1;">
                                        <div class="text-cyan" style="font-weight: bold; margin-bottom: 0.5rem;">Functional Cookies</div>
                                        <div style="color: #999; font-size: 0.9rem;">Save your preferences, chat history, and settings</div>
                                    </div>
                                </label>
                            </div>

                            <div style="border: 2px solid var(--cyber-cyan); padding: 1rem; margin-bottom: 1rem;">
                                <label style="display: flex; align-items: center; gap: 1rem; cursor: pointer;">
                                    <input type="checkbox" id="analytics-cookies" checked style="width: 20px; height: 20px;">
                                    <div style="flex: 1;">
                                        <div class="text-cyan" style="font-weight: bold; margin-bottom: 0.5rem;">Analytics Cookies</div>
                                        <div style="color: #999; font-size: 0.9rem;">Help us understand how you use Kintsugi AI</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div style="display: flex; gap: 1rem;">
                            <button onclick="saveCustomPreferences()" class="btn btn-primary interactive" style="flex: 1; padding: 1rem; text-transform: uppercase;">
                                ✓ SAVE PREFERENCES
                            </button>
                            <button onclick="closeCustomModal()" class="btn btn-secondary interactive" style="padding: 1rem; text-transform: uppercase;">
                                CANCEL
                            </button>
                        </div>
                    </div>
                `;

                document.body.appendChild(customModal);

                window.saveCustomPreferences = function() {
                    const preferences = {
                        version: CONSENT_VERSION,
                        accepted: true,
                        timestamp: new Date().toISOString(),
                        essential: true,
                        functional: document.getElementById('functional-cookies').checked,
                        analytics: document.getElementById('analytics-cookies').checked
                    };
                    localStorage.setItem(CONSENT_KEY, JSON.stringify(preferences));
                    customModal.remove();
                };

                window.closeCustomModal = function() {
                    customModal.remove();
                    showConsentModal(); // Show main modal again
                };
            }, 300);
        }
    }

    // Check consent on page load
    if (!hasConsent()) {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', showConsentModal);
        } else {
            showConsentModal();
        }
    }
})();
