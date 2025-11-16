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
            'common.home': 'HOME',
            'common.chat': 'CHAT',
            'common.messenger': 'MESSENGER',
            'common.translation': 'TRANSLATION',
            'common.profile': 'PROFILE',
            'common.startFree': 'START FREE',
            'common.viewFeatures': 'VIEW FEATURES',
            'common.saveChanges': 'SAVE CHANGES',
            'common.comingSoon': 'COMING SOON',

            // Hero Section
            'hero.subtitle': 'ALL-IN-ONE AI PLATFORM',
            'hero.tagline': 'Chat • Messenger • Translation',
            'hero.description': 'Unified AI platform combining advanced chat models, real-time messenger, and professional translation.',

            // Features Section
            'features.title': 'THREE PLATFORMS IN ONE',
            'features.aichat': 'AI CHAT',
            'features.aichatDesc': 'Access powerful AI models with real-time streaming responses. Basic and Epic tiers available.',
            'features.messenger': 'MESSENGER',
            'features.messengerDesc': 'Secure real-time messaging with group chats, video calls, and file sharing.',
            'features.translation': 'TRANSLATION',
            'features.translationDesc': 'Professional-grade translation powered by DeepL and o.translator for 100+ languages.',
            'features.imagegen': 'IMAGE GENERATION',
            'features.imagegenDesc': 'Create stunning AI-generated images with DALL-E integration.',
            'features.video': 'VIDEO CALLS',
            'features.videoDesc': 'HD video conferencing for up to 50 participants with screen sharing.',
            'features.stories': 'STORIES',
            'features.storiesDesc': 'Share 24-hour ephemeral content with your contacts.',

            // Auth Pages
            'auth.loginTitle': 'LOGIN TO YOUR ACCOUNT',
            'auth.signupTitle': 'CREATE YOUR ACCOUNT',
            'auth.authenticate': 'AUTHENTICATE',
            'auth.logIn': 'Log In',
            'auth.createOne': 'Create one',
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

            // Messenger
            'messenger.title': 'MESSENGER',
            'messenger.find': 'FIND USERS',
            'messenger.invite': 'INVITE FRIENDS',
            'messenger.createGroup': 'CREATE GROUP',
            'messenger.searchConversations': 'Search conversations...',
            'messenger.typeMessage': 'Type a message...',

            // Chat
            'chat.history': 'CHAT HISTORY',
            'chat.newChat': 'NEW CHAT',
            'chat.welcome': 'Welcome to Kintsugi AI',
            'chat.welcomeDesc': 'Start a conversation with our AI assistant',
            'chat.typeMessage': 'Type your message...',

            // Profile
            'profile.usageStats': 'USAGE STATISTICS',
            'profile.accountInfo': 'ACCOUNT INFORMATION',
            'profile.security': 'SECURITY',

            // Translation
            'translation.title': 'TRANSLATION',
            'translation.description': 'Professional translation service',

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
            'common.home': 'ГОЛОВНА',
            'common.chat': 'ЧАТ',
            'common.messenger': 'МЕСЕНДЖЕР',
            'common.translation': 'ПЕРЕКЛАД',
            'common.profile': 'ПРОФІЛЬ',
            'common.startFree': 'ПОЧАТИ БЕЗКОШТОВНО',
            'common.viewFeatures': 'ПЕРЕГЛЯНУТИ МОЖЛИВОСТІ',
            'common.saveChanges': 'ЗБЕРЕГТИ ЗМІНИ',
            'common.comingSoon': 'НЕЗАБАРОМ',

            // Секція Героя
            'hero.subtitle': 'ПЛАТФОРМА AI ВСЕ-В-ОДНОМУ',
            'hero.tagline': 'Чат • Месенджер • Переклад',
            'hero.description': 'Єдина AI платформа, що поєднує передові моделі чату, месенджер у реальному часі та професійний переклад.',

            // Секція Можливостей
            'features.title': 'ТРИ ПЛАТФОРМИ В ОДНІЙ',
            'features.aichat': 'AI ЧАТ',
            'features.aichatDesc': 'Доступ до потужних моделей AI з відповідями у реальному часі. Доступні базовий та епічний рівні.',
            'features.messenger': 'МЕСЕНДЖЕР',
            'features.messengerDesc': 'Захищений обмін повідомленнями у реальному часі з груповими чатами, відеодзвінками та обміном файлами.',
            'features.translation': 'ПЕРЕКЛАД',
            'features.translationDesc': 'Професійний переклад на основі DeepL та o.translator для понад 100 мов.',
            'features.imagegen': 'ГЕНЕРАЦІЯ ЗОБРАЖЕНЬ',
            'features.imagegenDesc': 'Створюйте приголомшливі зображення за допомогою інтеграції з DALL-E.',
            'features.video': 'ВІДЕОДЗВІНКИ',
            'features.videoDesc': 'HD відеоконференції до 50 учасників з демонстрацією екрану.',
            'features.stories': 'ІСТОРІЇ',
            'features.storiesDesc': 'Діліться 24-годинним ефемерним контентом зі своїми контактами.',

            // Сторінки Автентифікації
            'auth.loginTitle': 'УВІЙТИ ДО ОБЛІКОВОГО ЗАПИСУ',
            'auth.signupTitle': 'СТВОРИТИ ОБЛІКОВИЙ ЗАПИС',
            'auth.authenticate': 'АВТЕНТИФІКУВАТИ',
            'auth.logIn': 'Увійти',
            'auth.createOne': 'Створити обліковий запис',
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

            // Месенджер
            'messenger.title': 'МЕСЕНДЖЕР',
            'messenger.find': 'ЗНАЙТИ КОРИСТУВАЧІВ',
            'messenger.invite': 'ЗАПРОСИТИ ДРУЗІВ',
            'messenger.createGroup': 'СТВОРИТИ ГРУПУ',
            'messenger.searchConversations': 'Пошук бесід...',
            'messenger.typeMessage': 'Введіть повідомлення...',

            // Чат
            'chat.history': 'ІСТОРІЯ ЧАТУ',
            'chat.newChat': 'НОВИЙ ЧАТ',
            'chat.welcome': 'Ласкаво просимо до Kintsugi AI',
            'chat.welcomeDesc': 'Почніть розмову з нашим AI асистентом',
            'chat.typeMessage': 'Введіть ваше повідомлення...',

            // Профіль
            'profile.usageStats': 'СТАТИСТИКА ВИКОРИСТАННЯ',
            'profile.accountInfo': 'ІНФОРМАЦІЯ ПРО ОБЛІКОВИЙ ЗАПИС',
            'profile.security': 'БЕЗПЕКА',

            // Переклад
            'translation.title': 'ПЕРЕКЛАД',
            'translation.description': 'Професійний сервіс перекладу',

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
            'common.home': 'INICIO',
            'common.chat': 'CHAT',
            'common.messenger': 'MENSAJERO',
            'common.translation': 'TRADUCCIÓN',
            'common.profile': 'PERFIL',
            'common.startFree': 'EMPEZAR GRATIS',
            'common.viewFeatures': 'VER CARACTERÍSTICAS',
            'common.saveChanges': 'GUARDAR CAMBIOS',
            'common.comingSoon': 'PRÓXIMAMENTE',

            // Sección Hero
            'hero.subtitle': 'PLATAFORMA AI TODO EN UNO',
            'hero.tagline': 'Chat • Mensajero • Traducción',
            'hero.description': 'Plataforma AI unificada que combina modelos de chat avanzados, mensajería en tiempo real y traducción profesional.',

            // Sección de Características
            'features.title': 'TRES PLATAFORMAS EN UNA',
            'features.aichat': 'CHAT IA',
            'features.aichatDesc': 'Accede a potentes modelos de IA con respuestas en tiempo real. Niveles básico y épico disponibles.',
            'features.messenger': 'MENSAJERO',
            'features.messengerDesc': 'Mensajería segura en tiempo real con chats grupales, videollamadas y compartir archivos.',
            'features.translation': 'TRADUCCIÓN',
            'features.translationDesc': 'Traducción de nivel profesional impulsada por DeepL y o.translator para más de 100 idiomas.',
            'features.imagegen': 'GENERACIÓN DE IMÁGENES',
            'features.imagegenDesc': 'Crea imágenes impresionantes generadas por IA con integración DALL-E.',
            'features.video': 'VIDEOLLAMADAS',
            'features.videoDesc': 'Videoconferencia HD para hasta 50 participantes con compartir pantalla.',
            'features.stories': 'HISTORIAS',
            'features.storiesDesc': 'Comparte contenido efímero de 24 horas con tus contactos.',

            // Páginas de Autenticación
            'auth.loginTitle': 'INICIAR SESIÓN EN TU CUENTA',
            'auth.signupTitle': 'CREAR TU CUENTA',
            'auth.authenticate': 'AUTENTICAR',
            'auth.logIn': 'Iniciar Sesión',
            'auth.createOne': 'Crear una',
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

            // Mensajero
            'messenger.title': 'MENSAJERO',
            'messenger.find': 'BUSCAR USUARIOS',
            'messenger.invite': 'INVITAR AMIGOS',
            'messenger.createGroup': 'CREAR GRUPO',
            'messenger.searchConversations': 'Buscar conversaciones...',
            'messenger.typeMessage': 'Escribe un mensaje...',

            // Chat
            'chat.history': 'HISTORIAL DE CHAT',
            'chat.newChat': 'NUEVO CHAT',
            'chat.welcome': 'Bienvenido a Kintsugi AI',
            'chat.welcomeDesc': 'Inicia una conversación con nuestro asistente IA',
            'chat.typeMessage': 'Escribe tu mensaje...',

            // Perfil
            'profile.usageStats': 'ESTADÍSTICAS DE USO',
            'profile.accountInfo': 'INFORMACIÓN DE LA CUENTA',
            'profile.security': 'SEGURIDAD',

            // Traducción
            'translation.title': 'TRADUCCIÓN',
            'translation.description': 'Servicio de traducción profesional',

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
            'common.home': 'ACCUEIL',
            'common.chat': 'CHAT',
            'common.messenger': 'MESSAGERIE',
            'common.translation': 'TRADUCTION',
            'common.profile': 'PROFIL',
            'common.startFree': 'COMMENCER GRATUITEMENT',
            'common.viewFeatures': 'VOIR LES FONCTIONNALITÉS',
            'common.saveChanges': 'ENREGISTRER LES MODIFICATIONS',
            'common.comingSoon': 'PROCHAINEMENT',

            // Section Hero
            'hero.subtitle': 'PLATEFORME IA TOUT-EN-UN',
            'hero.tagline': 'Chat • Messagerie • Traduction',
            'hero.description': 'Plateforme IA unifiée combinant des modèles de chat avancés, une messagerie en temps réel et une traduction professionnelle.',

            // Section Fonctionnalités
            'features.title': 'TROIS PLATEFORMES EN UNE',
            'features.aichat': 'CHAT IA',
            'features.aichatDesc': 'Accédez à des modèles IA puissants avec des réponses en temps réel. Niveaux de base et épique disponibles.',
            'features.messenger': 'MESSAGERIE',
            'features.messengerDesc': 'Messagerie sécurisée en temps réel avec chats de groupe, appels vidéo et partage de fichiers.',
            'features.translation': 'TRADUCTION',
            'features.translationDesc': 'Traduction de qualité professionnelle alimentée par DeepL et o.translator pour plus de 100 langues.',
            'features.imagegen': 'GÉNÉRATION D\'IMAGES',
            'features.imagegenDesc': 'Créez des images époustouflantes générées par IA avec l\'intégration DALL-E.',
            'features.video': 'APPELS VIDÉO',
            'features.videoDesc': 'Visioconférence HD jusqu\'à 50 participants avec partage d\'écran.',
            'features.stories': 'HISTOIRES',
            'features.storiesDesc': 'Partagez du contenu éphémère de 24 heures avec vos contacts.',

            // Pages d'Authentification
            'auth.loginTitle': 'CONNECTEZ-VOUS À VOTRE COMPTE',
            'auth.signupTitle': 'CRÉEZ VOTRE COMPTE',
            'auth.authenticate': 'S\'AUTHENTIFIER',
            'auth.logIn': 'Se Connecter',
            'auth.createOne': 'En créer un',
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

            // Messagerie
            'messenger.title': 'MESSAGERIE',
            'messenger.find': 'TROUVER DES UTILISATEURS',
            'messenger.invite': 'INVITER DES AMIS',
            'messenger.createGroup': 'CRÉER UN GROUPE',
            'messenger.searchConversations': 'Rechercher des conversations...',
            'messenger.typeMessage': 'Tapez un message...',

            // Chat
            'chat.history': 'HISTORIQUE DU CHAT',
            'chat.newChat': 'NOUVEAU CHAT',
            'chat.welcome': 'Bienvenue sur Kintsugi AI',
            'chat.welcomeDesc': 'Commencez une conversation avec notre assistant IA',
            'chat.typeMessage': 'Tapez votre message...',

            // Profil
            'profile.usageStats': 'STATISTIQUES D\'UTILISATION',
            'profile.accountInfo': 'INFORMATIONS DU COMPTE',
            'profile.security': 'SÉCURITÉ',

            // Traduction
            'translation.title': 'TRADUCTION',
            'translation.description': 'Service de traduction professionnelle',

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
            'common.home': 'STARTSEITE',
            'common.chat': 'CHAT',
            'common.messenger': 'MESSENGER',
            'common.translation': 'ÜBERSETZUNG',
            'common.profile': 'PROFIL',
            'common.startFree': 'KOSTENLOS STARTEN',
            'common.viewFeatures': 'FUNKTIONEN ANZEIGEN',
            'common.saveChanges': 'ÄNDERUNGEN SPEICHERN',
            'common.comingSoon': 'DEMNÄCHST',

            // Hero-Bereich
            'hero.subtitle': 'ALLES-IN-EINEM KI-PLATTFORM',
            'hero.tagline': 'Chat • Messenger • Übersetzung',
            'hero.description': 'Einheitliche KI-Plattform, die fortschrittliche Chat-Modelle, Echtzeit-Messenger und professionelle Übersetzung kombiniert.',

            // Funktionsbereich
            'features.title': 'DREI PLATTFORMEN IN EINER',
            'features.aichat': 'KI-CHAT',
            'features.aichatDesc': 'Zugriff auf leistungsstarke KI-Modelle mit Echtzeit-Streaming-Antworten. Basis- und Epic-Stufen verfügbar.',
            'features.messenger': 'MESSENGER',
            'features.messengerDesc': 'Sichere Echtzeit-Nachrichten mit Gruppenchats, Videoanrufen und Dateifreigabe.',
            'features.translation': 'ÜBERSETZUNG',
            'features.translationDesc': 'Professionelle Übersetzung auf Basis von DeepL und o.translator für über 100 Sprachen.',
            'features.imagegen': 'BILDGENERIERUNG',
            'features.imagegenDesc': 'Erstellen Sie atemberaubende KI-generierte Bilder mit DALL-E-Integration.',
            'features.video': 'VIDEOANRUFE',
            'features.videoDesc': 'HD-Videokonferenzen für bis zu 50 Teilnehmer mit Bildschirmfreigabe.',
            'features.stories': 'GESCHICHTEN',
            'features.storiesDesc': 'Teilen Sie 24-Stunden-Inhalte mit Ihren Kontakten.',

            // Authentifizierungsseiten
            'auth.loginTitle': 'IN IHR KONTO EINLOGGEN',
            'auth.signupTitle': 'IHR KONTO ERSTELLEN',
            'auth.authenticate': 'AUTHENTIFIZIEREN',
            'auth.logIn': 'Einloggen',
            'auth.createOne': 'Eines erstellen',
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

            // Messenger
            'messenger.title': 'MESSENGER',
            'messenger.find': 'BENUTZER FINDEN',
            'messenger.invite': 'FREUNDE EINLADEN',
            'messenger.createGroup': 'GRUPPE ERSTELLEN',
            'messenger.searchConversations': 'Unterhaltungen durchsuchen...',
            'messenger.typeMessage': 'Nachricht eingeben...',

            // Chat
            'chat.history': 'CHAT-VERLAUF',
            'chat.newChat': 'NEUER CHAT',
            'chat.welcome': 'Willkommen bei Kintsugi AI',
            'chat.welcomeDesc': 'Starten Sie ein Gespräch mit unserem KI-Assistenten',
            'chat.typeMessage': 'Geben Sie Ihre Nachricht ein...',

            // Profil
            'profile.usageStats': 'NUTZUNGSSTATISTIKEN',
            'profile.accountInfo': 'KONTOINFORMATIONEN',
            'profile.security': 'SICHERHEIT',

            // Übersetzung
            'translation.title': 'ÜBERSETZUNG',
            'translation.description': 'Professioneller Übersetzungsservice',

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
