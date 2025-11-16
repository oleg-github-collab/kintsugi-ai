/**
 * Kintsugi AI - Internationalization System
 * Supports: English, Ukrainian, Spanish, French, German
 */

(function() {
    'use strict';

    // Language translations
    const translations = {
        en: {
            // Navigation
            'nav.home': 'HOME',
            'nav.login': 'LOGIN',
            'nav.signup': 'SIGN UP',
            'nav.logout': 'LOGOUT',
            'nav.profile': 'PROFILE',
            'nav.settings': 'SETTINGS',
            'nav.dashboard': 'DASHBOARD',

            // Common UI
            'common.back': 'BACK',
            'common.next': 'NEXT',
            'common.save': 'SAVE',
            'common.cancel': 'CANCEL',
            'common.delete': 'DELETE',
            'common.edit': 'EDIT',
            'common.send': 'SEND',
            'common.submit': 'SUBMIT',
            'common.close': 'CLOSE',
            'common.loading': 'Loading...',
            'common.error': 'Error',
            'common.success': 'Success',
            'common.confirm': 'CONFIRM',
            'common.search': 'Search',
            'common.filter': 'Filter',
            'common.sort': 'Sort',

            // Features
            'features.aichat': 'AI CHAT',
            'features.messenger': 'MESSENGER',
            'features.video': 'VIDEO CALL',
            'features.translation': 'TRANSLATION',
            'features.imagegen': 'IMAGE GEN',
            'features.stories': 'STORIES',

            // Auth
            'auth.username': 'Username',
            'auth.email': 'Email',
            'auth.password': 'Password',
            'auth.confirmPassword': 'Confirm Password',
            'auth.forgotPassword': 'Forgot Password?',
            'auth.rememberMe': 'Remember Me',
            'auth.signin': 'Sign In',
            'auth.signup': 'Sign Up',
            'auth.signout': 'Sign Out',
            'auth.createAccount': 'Create Account',
            'auth.haveAccount': 'Already have an account?',
            'auth.noAccount': "Don't have an account?",

            // Messages
            'msg.typeMessage': 'Type a message...',
            'msg.newMessage': 'New Message',
            'msg.noMessages': 'No messages yet',
            'msg.online': 'Online',
            'msg.offline': 'Offline',
            'msg.typing': 'typing...',
            'msg.sent': 'Sent',
            'msg.delivered': 'Delivered',
            'msg.read': 'Read',

            // Settings
            'settings.general': 'General',
            'settings.privacy': 'Privacy',
            'settings.notifications': 'Notifications',
            'settings.language': 'Language',
            'settings.theme': 'Theme',
            'settings.account': 'Account',
            'settings.subscription': 'Subscription',

            // Subscription
            'sub.free': 'FREE',
            'sub.basic': 'BASIC',
            'sub.epic': 'EPIC',
            'sub.upgrade': 'UPGRADE',
            'sub.manage': 'MANAGE SUBSCRIPTION',
            'sub.tokens': 'Tokens',
            'sub.unlimited': 'Unlimited',

            // Footer
            'footer.terms': 'Terms',
            'footer.privacy': 'Privacy',
            'footer.aup': 'AUP',
            'footer.contact': 'Contact',
            'footer.about': 'About',

            // Errors
            'error.generic': 'Something went wrong',
            'error.network': 'Network error',
            'error.unauthorized': 'Unauthorized',
            'error.notfound': 'Not found',
            'error.validation': 'Validation error',

            // Success messages
            'success.saved': 'Successfully saved',
            'success.deleted': 'Successfully deleted',
            'success.sent': 'Successfully sent',
            'success.updated': 'Successfully updated'
        },

        uk: {
            // Навігація
            'nav.home': 'ГОЛОВНА',
            'nav.login': 'УВІЙТИ',
            'nav.signup': 'РЕЄСТРАЦІЯ',
            'nav.logout': 'ВИЙТИ',
            'nav.profile': 'ПРОФІЛЬ',
            'nav.settings': 'НАЛАШТУВАННЯ',
            'nav.dashboard': 'ПАНЕЛЬ',

            // Загальний UI
            'common.back': 'НАЗАД',
            'common.next': 'ДАЛІ',
            'common.save': 'ЗБЕРЕГТИ',
            'common.cancel': 'СКАСУВАТИ',
            'common.delete': 'ВИДАЛИТИ',
            'common.edit': 'РЕДАГУВАТИ',
            'common.send': 'НАДІСЛАТИ',
            'common.submit': 'ПІДТВЕРДИТИ',
            'common.close': 'ЗАКРИТИ',
            'common.loading': 'Завантаження...',
            'common.error': 'Помилка',
            'common.success': 'Успіх',
            'common.confirm': 'ПІДТВЕРДИТИ',
            'common.search': 'Пошук',
            'common.filter': 'Фільтр',
            'common.sort': 'Сортування',

            // Функції
            'features.aichat': 'AI ЧАТ',
            'features.messenger': 'МЕСЕНДЖЕР',
            'features.video': 'ВІДЕОДЗВІНОК',
            'features.translation': 'ПЕРЕКЛАД',
            'features.imagegen': 'ГЕНЕРАЦІЯ ЗОБРАЖЕНЬ',
            'features.stories': 'ІСТОРІЇ',

            // Автентифікація
            'auth.username': "Ім'я користувача",
            'auth.email': 'Електронна пошта',
            'auth.password': 'Пароль',
            'auth.confirmPassword': 'Підтвердити пароль',
            'auth.forgotPassword': 'Забули пароль?',
            'auth.rememberMe': "Запам'ятати мене",
            'auth.signin': 'Увійти',
            'auth.signup': 'Зареєструватися',
            'auth.signout': 'Вийти',
            'auth.createAccount': 'Створити обліковий запис',
            'auth.haveAccount': 'Вже є обліковий запис?',
            'auth.noAccount': 'Немає облікового запису?',

            // Повідомлення
            'msg.typeMessage': 'Введіть повідомлення...',
            'msg.newMessage': 'Нове повідомлення',
            'msg.noMessages': 'Поки немає повідомлень',
            'msg.online': 'В мережі',
            'msg.offline': 'Не в мережі',
            'msg.typing': 'друкує...',
            'msg.sent': 'Надіслано',
            'msg.delivered': 'Доставлено',
            'msg.read': 'Прочитано',

            // Налаштування
            'settings.general': 'Загальні',
            'settings.privacy': 'Приватність',
            'settings.notifications': 'Сповіщення',
            'settings.language': 'Мова',
            'settings.theme': 'Тема',
            'settings.account': 'Обліковий запис',
            'settings.subscription': 'Підписка',

            // Підписка
            'sub.free': 'БЕЗКОШТОВНО',
            'sub.basic': 'БАЗОВИЙ',
            'sub.epic': 'ЕПІЧНИЙ',
            'sub.upgrade': 'ПОКРАЩИТИ',
            'sub.manage': 'КЕРУВАТИ ПІДПИСКОЮ',
            'sub.tokens': 'Токени',
            'sub.unlimited': 'Необмежено',

            // Футер
            'footer.terms': 'Умови',
            'footer.privacy': 'Конфіденційність',
            'footer.aup': 'Правила використання',
            'footer.contact': 'Контакт',
            'footer.about': 'Про нас',

            // Помилки
            'error.generic': 'Щось пішло не так',
            'error.network': 'Помилка мережі',
            'error.unauthorized': 'Не авторизовано',
            'error.notfound': 'Не знайдено',
            'error.validation': 'Помилка валідації',

            // Повідомлення про успіх
            'success.saved': 'Успішно збережено',
            'success.deleted': 'Успішно видалено',
            'success.sent': 'Успішно надіслано',
            'success.updated': 'Успішно оновлено'
        },

        es: {
            // Navegación
            'nav.home': 'INICIO',
            'nav.login': 'INICIAR SESIÓN',
            'nav.signup': 'REGISTRARSE',
            'nav.logout': 'CERRAR SESIÓN',
            'nav.profile': 'PERFIL',
            'nav.settings': 'CONFIGURACIÓN',
            'nav.dashboard': 'PANEL',

            // UI común
            'common.back': 'ATRÁS',
            'common.next': 'SIGUIENTE',
            'common.save': 'GUARDAR',
            'common.cancel': 'CANCELAR',
            'common.delete': 'ELIMINAR',
            'common.edit': 'EDITAR',
            'common.send': 'ENVIAR',
            'common.submit': 'ENVIAR',
            'common.close': 'CERRAR',
            'common.loading': 'Cargando...',
            'common.error': 'Error',
            'common.success': 'Éxito',
            'common.confirm': 'CONFIRMAR',
            'common.search': 'Buscar',
            'common.filter': 'Filtrar',
            'common.sort': 'Ordenar',

            // Funciones
            'features.aichat': 'CHAT IA',
            'features.messenger': 'MENSAJERO',
            'features.video': 'VIDEOLLAMADA',
            'features.translation': 'TRADUCCIÓN',
            'features.imagegen': 'GEN. IMÁGENES',
            'features.stories': 'HISTORIAS',

            // Autenticación
            'auth.username': 'Usuario',
            'auth.email': 'Correo electrónico',
            'auth.password': 'Contraseña',
            'auth.confirmPassword': 'Confirmar contraseña',
            'auth.forgotPassword': '¿Olvidaste tu contraseña?',
            'auth.rememberMe': 'Recuérdame',
            'auth.signin': 'Iniciar sesión',
            'auth.signup': 'Registrarse',
            'auth.signout': 'Cerrar sesión',
            'auth.createAccount': 'Crear cuenta',
            'auth.haveAccount': '¿Ya tienes una cuenta?',
            'auth.noAccount': '¿No tienes una cuenta?',

            // Mensajes
            'msg.typeMessage': 'Escribe un mensaje...',
            'msg.newMessage': 'Nuevo mensaje',
            'msg.noMessages': 'No hay mensajes aún',
            'msg.online': 'En línea',
            'msg.offline': 'Desconectado',
            'msg.typing': 'escribiendo...',
            'msg.sent': 'Enviado',
            'msg.delivered': 'Entregado',
            'msg.read': 'Leído',

            // Configuración
            'settings.general': 'General',
            'settings.privacy': 'Privacidad',
            'settings.notifications': 'Notificaciones',
            'settings.language': 'Idioma',
            'settings.theme': 'Tema',
            'settings.account': 'Cuenta',
            'settings.subscription': 'Suscripción',

            // Suscripción
            'sub.free': 'GRATIS',
            'sub.basic': 'BÁSICO',
            'sub.epic': 'ÉPICO',
            'sub.upgrade': 'MEJORAR',
            'sub.manage': 'GESTIONAR SUSCRIPCIÓN',
            'sub.tokens': 'Tokens',
            'sub.unlimited': 'Ilimitado',

            // Pie de página
            'footer.terms': 'Términos',
            'footer.privacy': 'Privacidad',
            'footer.aup': 'Política de uso',
            'footer.contact': 'Contacto',
            'footer.about': 'Acerca de',

            // Errores
            'error.generic': 'Algo salió mal',
            'error.network': 'Error de red',
            'error.unauthorized': 'No autorizado',
            'error.notfound': 'No encontrado',
            'error.validation': 'Error de validación',

            // Mensajes de éxito
            'success.saved': 'Guardado exitosamente',
            'success.deleted': 'Eliminado exitosamente',
            'success.sent': 'Enviado exitosamente',
            'success.updated': 'Actualizado exitosamente'
        },

        fr: {
            // Navigation
            'nav.home': 'ACCUEIL',
            'nav.login': 'CONNEXION',
            'nav.signup': "S'INSCRIRE",
            'nav.logout': 'DÉCONNEXION',
            'nav.profile': 'PROFIL',
            'nav.settings': 'PARAMÈTRES',
            'nav.dashboard': 'TABLEAU DE BORD',

            // UI commune
            'common.back': 'RETOUR',
            'common.next': 'SUIVANT',
            'common.save': 'ENREGISTRER',
            'common.cancel': 'ANNULER',
            'common.delete': 'SUPPRIMER',
            'common.edit': 'MODIFIER',
            'common.send': 'ENVOYER',
            'common.submit': 'SOUMETTRE',
            'common.close': 'FERMER',
            'common.loading': 'Chargement...',
            'common.error': 'Erreur',
            'common.success': 'Succès',
            'common.confirm': 'CONFIRMER',
            'common.search': 'Rechercher',
            'common.filter': 'Filtrer',
            'common.sort': 'Trier',

            // Fonctionnalités
            'features.aichat': 'CHAT IA',
            'features.messenger': 'MESSAGERIE',
            'features.video': 'APPEL VIDÉO',
            'features.translation': 'TRADUCTION',
            'features.imagegen': 'GEN. IMAGES',
            'features.stories': 'HISTOIRES',

            // Authentification
            'auth.username': 'Nom d\'utilisateur',
            'auth.email': 'Email',
            'auth.password': 'Mot de passe',
            'auth.confirmPassword': 'Confirmer le mot de passe',
            'auth.forgotPassword': 'Mot de passe oublié?',
            'auth.rememberMe': 'Se souvenir de moi',
            'auth.signin': 'Se connecter',
            'auth.signup': 'S\'inscrire',
            'auth.signout': 'Se déconnecter',
            'auth.createAccount': 'Créer un compte',
            'auth.haveAccount': 'Vous avez déjà un compte?',
            'auth.noAccount': 'Vous n\'avez pas de compte?',

            // Messages
            'msg.typeMessage': 'Tapez un message...',
            'msg.newMessage': 'Nouveau message',
            'msg.noMessages': 'Pas encore de messages',
            'msg.online': 'En ligne',
            'msg.offline': 'Hors ligne',
            'msg.typing': 'en train d\'écrire...',
            'msg.sent': 'Envoyé',
            'msg.delivered': 'Livré',
            'msg.read': 'Lu',

            // Paramètres
            'settings.general': 'Général',
            'settings.privacy': 'Confidentialité',
            'settings.notifications': 'Notifications',
            'settings.language': 'Langue',
            'settings.theme': 'Thème',
            'settings.account': 'Compte',
            'settings.subscription': 'Abonnement',

            // Abonnement
            'sub.free': 'GRATUIT',
            'sub.basic': 'BASIQUE',
            'sub.epic': 'ÉPIQUE',
            'sub.upgrade': 'AMÉLIORER',
            'sub.manage': 'GÉRER L\'ABONNEMENT',
            'sub.tokens': 'Jetons',
            'sub.unlimited': 'Illimité',

            // Pied de page
            'footer.terms': 'Conditions',
            'footer.privacy': 'Confidentialité',
            'footer.aup': 'Politique d\'utilisation',
            'footer.contact': 'Contact',
            'footer.about': 'À propos',

            // Erreurs
            'error.generic': 'Quelque chose s\'est mal passé',
            'error.network': 'Erreur réseau',
            'error.unauthorized': 'Non autorisé',
            'error.notfound': 'Non trouvé',
            'error.validation': 'Erreur de validation',

            // Messages de succès
            'success.saved': 'Enregistré avec succès',
            'success.deleted': 'Supprimé avec succès',
            'success.sent': 'Envoyé avec succès',
            'success.updated': 'Mis à jour avec succès'
        },

        de: {
            // Navigation
            'nav.home': 'STARTSEITE',
            'nav.login': 'ANMELDEN',
            'nav.signup': 'REGISTRIEREN',
            'nav.logout': 'ABMELDEN',
            'nav.profile': 'PROFIL',
            'nav.settings': 'EINSTELLUNGEN',
            'nav.dashboard': 'DASHBOARD',

            // Allgemeine UI
            'common.back': 'ZURÜCK',
            'common.next': 'WEITER',
            'common.save': 'SPEICHERN',
            'common.cancel': 'ABBRECHEN',
            'common.delete': 'LÖSCHEN',
            'common.edit': 'BEARBEITEN',
            'common.send': 'SENDEN',
            'common.submit': 'ABSENDEN',
            'common.close': 'SCHLIESSEN',
            'common.loading': 'Lädt...',
            'common.error': 'Fehler',
            'common.success': 'Erfolg',
            'common.confirm': 'BESTÄTIGEN',
            'common.search': 'Suchen',
            'common.filter': 'Filter',
            'common.sort': 'Sortieren',

            // Funktionen
            'features.aichat': 'KI-CHAT',
            'features.messenger': 'MESSENGER',
            'features.video': 'VIDEOANRUF',
            'features.translation': 'ÜBERSETZUNG',
            'features.imagegen': 'BILD-GEN',
            'features.stories': 'GESCHICHTEN',

            // Authentifizierung
            'auth.username': 'Benutzername',
            'auth.email': 'E-Mail',
            'auth.password': 'Passwort',
            'auth.confirmPassword': 'Passwort bestätigen',
            'auth.forgotPassword': 'Passwort vergessen?',
            'auth.rememberMe': 'Angemeldet bleiben',
            'auth.signin': 'Anmelden',
            'auth.signup': 'Registrieren',
            'auth.signout': 'Abmelden',
            'auth.createAccount': 'Konto erstellen',
            'auth.haveAccount': 'Haben Sie bereits ein Konto?',
            'auth.noAccount': 'Kein Konto?',

            // Nachrichten
            'msg.typeMessage': 'Nachricht eingeben...',
            'msg.newMessage': 'Neue Nachricht',
            'msg.noMessages': 'Noch keine Nachrichten',
            'msg.online': 'Online',
            'msg.offline': 'Offline',
            'msg.typing': 'tippt...',
            'msg.sent': 'Gesendet',
            'msg.delivered': 'Zugestellt',
            'msg.read': 'Gelesen',

            // Einstellungen
            'settings.general': 'Allgemein',
            'settings.privacy': 'Datenschutz',
            'settings.notifications': 'Benachrichtigungen',
            'settings.language': 'Sprache',
            'settings.theme': 'Thema',
            'settings.account': 'Konto',
            'settings.subscription': 'Abonnement',

            // Abonnement
            'sub.free': 'KOSTENLOS',
            'sub.basic': 'BASIS',
            'sub.epic': 'EPISCH',
            'sub.upgrade': 'UPGRADE',
            'sub.manage': 'ABONNEMENT VERWALTEN',
            'sub.tokens': 'Token',
            'sub.unlimited': 'Unbegrenzt',

            // Fußzeile
            'footer.terms': 'Bedingungen',
            'footer.privacy': 'Datenschutz',
            'footer.aup': 'Nutzungsrichtlinien',
            'footer.contact': 'Kontakt',
            'footer.about': 'Über uns',

            // Fehler
            'error.generic': 'Etwas ist schief gelaufen',
            'error.network': 'Netzwerkfehler',
            'error.unauthorized': 'Nicht autorisiert',
            'error.notfound': 'Nicht gefunden',
            'error.validation': 'Validierungsfehler',

            // Erfolgsmeldungen
            'success.saved': 'Erfolgreich gespeichert',
            'success.deleted': 'Erfolgreich gelöscht',
            'success.sent': 'Erfolgreich gesendet',
            'success.updated': 'Erfolgreich aktualisiert'
        }
    };

    // I18n class
    class I18n {
        constructor() {
            this.currentLanguage = this.detectLanguage();
            this.loadLanguage(this.currentLanguage);
        }

        // Detect browser language
        detectLanguage() {
            // Check localStorage first
            const savedLang = localStorage.getItem('kintsugi_language');
            if (savedLang && translations[savedLang]) {
                return savedLang;
            }

            // Detect from browser
            const browserLang = navigator.language || navigator.userLanguage;
            const langCode = browserLang.split('-')[0]; // Get 'en' from 'en-US'

            // Return detected language if supported, otherwise default to English
            return translations[langCode] ? langCode : 'en';
        }

        // Load language
        loadLanguage(lang) {
            if (translations[lang]) {
                this.currentLanguage = lang;
                localStorage.setItem('kintsugi_language', lang);
                this.updatePageContent();
                this.dispatchLanguageChange();
            }
        }

        // Get translation
        t(key, fallback = '') {
            const translation = translations[this.currentLanguage][key];
            return translation || fallback || key;
        }

        // Get current language
        getLanguage() {
            return this.currentLanguage;
        }

        // Get available languages
        getAvailableLanguages() {
            return {
                en: 'English',
                uk: 'Українська',
                es: 'Español',
                fr: 'Français',
                de: 'Deutsch'
            };
        }

        // Update all elements with data-i18n attribute
        updatePageContent() {
            const elements = document.querySelectorAll('[data-i18n]');
            elements.forEach(element => {
                const key = element.getAttribute('data-i18n');
                const translation = this.t(key);

                // Check if element has data-i18n-attr (for attributes like placeholder)
                const attr = element.getAttribute('data-i18n-attr');
                if (attr) {
                    element.setAttribute(attr, translation);
                } else {
                    element.textContent = translation;
                }
            });

            // Update HTML lang attribute
            document.documentElement.lang = this.currentLanguage;
        }

        // Dispatch language change event
        dispatchLanguageChange() {
            const event = new CustomEvent('languageChanged', {
                detail: { language: this.currentLanguage }
            });
            window.dispatchEvent(event);
        }

        // Create language switcher UI
        createLanguageSwitcher(containerSelector) {
            const container = document.querySelector(containerSelector);
            if (!container) return;

            const languages = this.getAvailableLanguages();
            const switcher = document.createElement('div');
            switcher.className = 'language-switcher';
            switcher.innerHTML = `
                <style>
                    .language-switcher {
                        position: relative;
                        display: inline-block;
                    }
                    .language-switcher-btn {
                        background: rgba(0, 255, 255, 0.1);
                        border: 2px solid var(--cyber-cyan);
                        color: var(--cyber-cyan);
                        padding: 0.5rem 1rem;
                        cursor: pointer;
                        font-family: 'Courier New', monospace;
                        font-weight: bold;
                        text-transform: uppercase;
                        transition: all 0.3s ease;
                    }
                    .language-switcher-btn:hover {
                        background: rgba(0, 255, 255, 0.2);
                        box-shadow: 0 0 10px var(--cyber-cyan);
                    }
                    .language-switcher-dropdown {
                        position: absolute;
                        top: 100%;
                        left: 0;
                        right: 0;
                        background: rgba(0, 0, 0, 0.95);
                        border: 2px solid var(--cyber-cyan);
                        border-top: none;
                        display: none;
                        z-index: 1000;
                        max-height: 300px;
                        overflow-y: auto;
                    }
                    .language-switcher-dropdown.active {
                        display: block;
                    }
                    .language-option {
                        padding: 0.75rem 1rem;
                        cursor: pointer;
                        color: #ccc;
                        transition: all 0.2s ease;
                        border-bottom: 1px solid rgba(0, 255, 255, 0.1);
                    }
                    .language-option:hover {
                        background: rgba(0, 255, 255, 0.1);
                        color: var(--cyber-cyan);
                    }
                    .language-option.active {
                        background: rgba(0, 255, 255, 0.2);
                        color: var(--cyber-cyan);
                        font-weight: bold;
                    }
                    .language-flag {
                        font-size: 1.2rem;
                        margin-right: 0.5rem;
                    }
                </style>
                <button class="language-switcher-btn">
                    🌐 ${languages[this.currentLanguage]}
                </button>
                <div class="language-switcher-dropdown">
                    ${Object.entries(languages).map(([code, name]) => `
                        <div class="language-option ${code === this.currentLanguage ? 'active' : ''}" data-lang="${code}">
                            ${this.getLanguageFlag(code)} ${name}
                        </div>
                    `).join('')}
                </div>
            `;

            const btn = switcher.querySelector('.language-switcher-btn');
            const dropdown = switcher.querySelector('.language-switcher-dropdown');

            // Toggle dropdown
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                dropdown.classList.remove('active');
            });

            // Language selection
            switcher.querySelectorAll('.language-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const lang = option.getAttribute('data-lang');
                    this.loadLanguage(lang);

                    // Update button text
                    btn.innerHTML = `🌐 ${languages[lang]}`;

                    // Update active state
                    switcher.querySelectorAll('.language-option').forEach(opt => {
                        opt.classList.remove('active');
                    });
                    option.classList.add('active');

                    dropdown.classList.remove('active');
                });
            });

            container.appendChild(switcher);
        }

        // Get language flag emoji
        getLanguageFlag(code) {
            const flags = {
                en: '🇺🇸',
                uk: '🇺🇦',
                es: '🇪🇸',
                fr: '🇫🇷',
                de: '🇩🇪'
            };
            return flags[code] || '🌐';
        }
    }

    // Initialize and export
    const i18n = new I18n();
    window.I18n = i18n;

    // Auto-update on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            i18n.updatePageContent();
        });
    } else {
        i18n.updatePageContent();
    }

    // Export for use in modules
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = I18n;
    }
})();
