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
            'features.messengerDesc': 'Real-time chat for instant messaging, reactions, and ephemeral stories.',
            'features.translation': 'TRANSLATION',
            'features.translationDesc': 'Professional book translation with context-aware AI technology.',
            'features.imagegen': 'IMAGE GENERATION',
            'features.imagegenDesc': 'Create stunning AI-generated images with DALL-E integration.',
            'features.video': 'VIDEO CALLS',
            'features.videoDesc': 'HD video conferencing for up to 50 participants with screen sharing.',
            'features.stories': 'STORIES',
            'features.storiesDesc': 'Share 24-hour ephemeral content with your contacts.',

            // Workflow Section
            'workflow.title': 'WORKFLOW',
            'workflow.subtitle': 'Tailor make your workspace: start a chat, invite collaborators, or drop a translation brief. Kintsugi tracks every token.',
            'workflow.step1Title': '1. Start a secure chat',
            'workflow.step1Desc': 'Launch a project space with streaming AI plus friends, or open a private messenger window.',
            'workflow.step2Title': '2. Invite + automate',
            'workflow.step2Desc': 'Generate link invites; once accepted, you appear in each other\'s contact list instantly.',
            'workflow.step3Title': '3. Translate with context',
            'workflow.step3Desc': 'Drop documents and get deep translation briefs tied back to your chat history.',
            'workflow.step4Title': '4. Monitor usage',
            'workflow.step4Desc': 'Visual dashboards track tokens, notifications, and translation timelines across platforms.',

            // Stats Section
            'stats.realtimeTitle': 'Realtime',
            'stats.realtimeDesc': 'Instant streaming responses across chat, messenger, and translation.',
            'stats.secureTitle': 'Secure',
            'stats.secureDesc': 'Token usage tracking, refresh windows, and encrypted storage.',
            'stats.supportTitle': 'Human Support',
            'stats.supportDesc': 'Our team provides concierge assistance for creators and teams.',
            'stats.platformTitle': 'Platform Ready',
            'stats.platformDesc': 'Works on desktop, tablet, and pocket devices with consistent controls.',

            // Pricing Section
            'pricing.title': 'CHOOSE YOUR TIER',
            'pricing.subtitle': 'All plans include 6-hour token resets and access to all three platforms',

            // CTA Section
            'cta.title': 'Ready to build with Kintsugi AI?',
            'cta.description': 'Sign up, import your team, and let the AI-powered platform orchestrate your conversations, translations, and automations.',
            'cta.createAccount': 'Create account',
            'cta.exploreDemos': 'Explore demos',

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
            'success.updated': 'Successfully updated',

            // Message Actions (context menu)
            'msgAction.reply': 'Reply',
            'msgAction.forward': 'Forward',
            'msgAction.copy': 'Copy',
            'msgAction.react': 'React',
            'msgAction.delete': 'Delete',
            'msgAction.deleteForMe': 'Delete for me',
            'msgAction.deleteForEveryone': 'Delete for everyone',
            'msgAction.edit': 'Edit',
            'msgAction.pin': 'Pin',
            'msgAction.unpin': 'Unpin',
            'msgAction.report': 'Report',
            'msgAction.replyingTo': 'Replying to',
            'msgAction.forwardTo': 'Forward to',
            'msgAction.selectContacts': 'Select contacts',

            // GIF Picker
            'gif.search': 'Search GIFs...',
            'gif.trending': 'Trending',
            'gif.searchResults': 'Search results',
            'gif.noResults': 'No GIFs found',
            'gif.poweredBy': 'Powered by Tenor',
            'gif.send': 'Send GIF',

            // Video Conference
            'video.startCall': 'Start Video Call',
            'video.joinCall': 'Join Call',
            'video.endCall': 'End Call',
            'video.muteAudio': 'Mute',
            'video.unmuteAudio': 'Unmute',
            'video.muteVideo': 'Turn Off Camera',
            'video.unmuteVideo': 'Turn On Camera',
            'video.shareScreen': 'Share Screen',
            'video.stopSharing': 'Stop Sharing',
            'video.participants': 'Participants',
            'video.fullScreen': 'Full Screen',
            'video.settings': 'Video Settings',
            'video.connecting': 'Connecting...',
            'video.callEnded': 'Call ended',
            'video.inviteOthers': 'Invite others',

            // Stories
            'stories.title': 'Stories',
            'stories.yourStory': 'Your Story',
            'stories.addStory': 'Add Story',
            'stories.viewStory': 'View Story',
            'stories.deleteStory': 'Delete Story',
            'stories.expiresIn': 'Expires in',
            'stories.expired': 'Expired',
            'stories.viewers': 'Viewers',
            'stories.noStories': 'No stories yet',
            'stories.uploadPhoto': 'Upload Photo',
            'stories.uploadVideo': 'Upload Video',
            'stories.addCaption': 'Add caption',

            // Group Management
            'group.create': 'Create Group',
            'group.edit': 'Edit Group',
            'group.leave': 'Leave Group',
            'group.delete': 'Delete Group',
            'group.addMembers': 'Add Members',
            'group.removeMember': 'Remove Member',
            'group.makeAdmin': 'Make Admin',
            'group.removeAdmin': 'Remove Admin',
            'group.groupInfo': 'Group Info',
            'group.groupName': 'Group Name',
            'group.groupDescription': 'Description',
            'group.groupAvatar': 'Group Avatar',
            'group.members': 'Members',
            'group.admins': 'Admins',
            'group.inviteLink': 'Invite Link',
            'group.generateLink': 'Generate Link',
            'group.copyLink': 'Copy Link',

            // Profile Sections
            'profile.editProfile': 'Edit Profile',
            'profile.changeBio': 'Change Bio',
            'profile.changeAvatar': 'Change Avatar',
            'profile.changePassword': 'Change Password',
            'profile.currentPassword': 'Current Password',
            'profile.newPassword': 'New Password',
            'profile.tokensUsed': 'Tokens Used',
            'profile.tokensRemaining': 'Tokens Remaining',
            'profile.subscriptionStatus': 'Subscription Status',
            'profile.subscriptionExpires': 'Expires',
            'profile.manageSubscription': 'Manage Subscription',

            // Translation Page
            'trans.sourceLanguage': 'Source Language',
            'trans.targetLanguage': 'Target Language',
            'trans.enterText': 'Enter text to translate',
            'trans.translating': 'Translating...',
            'trans.translated': 'Translated',
            'trans.detect': 'Detect Language',
            'trans.swap': 'Swap Languages',
            'trans.copy': 'Copy Translation',
            'trans.clear': 'Clear',
            'trans.characterCount': 'characters',
            'trans.service.deepl': 'DeepL',
            'trans.service.otranslator': 'o.translator',

            // Legal Pages
            'legal.privacyPolicy': 'Privacy Policy',
            'legal.termsOfService': 'Terms of Service',
            'legal.acceptableUse': 'Acceptable Use Policy',
            'legal.lastUpdated': 'Last Updated',
            'legal.backToHome': 'Back to Home',

            // Notifications
            'notif.newMessage': 'New message from',
            'notif.newReaction': 'reacted to your message',
            'notif.newStory': 'added a new story',
            'notif.addedToGroup': 'added you to',
            'notif.mentionedYou': 'mentioned you',
            'notif.callMissed': 'Missed call from',
            'notif.markRead': 'Mark as Read',
            'notif.markAllRead': 'Mark All as Read',
            'notif.clearAll': 'Clear All'
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
            'features.translationDesc': 'Професійний переклад книг з контекстно-усвідомленою AI технологією.',
            'features.imagegen': 'ГЕНЕРАЦІЯ ЗОБРАЖЕНЬ',
            'features.imagegenDesc': 'Створюйте приголомшливі зображення за допомогою інтеграції з DALL-E.',
            'features.video': 'ВІДЕОДЗВІНКИ',
            'features.videoDesc': 'HD відеоконференції до 50 учасників з демонстрацією екрану.',
            'features.stories': 'ІСТОРІЇ',
            'features.storiesDesc': 'Діліться 24-годинним ефемерним контентом зі своїми контактами.',

            // Розділ Робочого Процесу
            'workflow.title': 'РОБОЧИЙ ПРОЦЕС',
            'workflow.subtitle': 'Налаштуйте свій робочий простір: розпочніть чат, запросіть співробітників або надішліть бриф на переклад. Kintsugi відстежує кожен токен.',
            'workflow.step1Title': '1. Почніть безпечний чат',
            'workflow.step1Desc': 'Запустіть проектний простір зі стрімінговим AI та друзями, або відкрийте приватне вікно месенджера.',
            'workflow.step2Title': '2. Запросіть + автоматизуйте',
            'workflow.step2Desc': 'Створюйте запрошення за посиланням; після прийняття ви з\'являєтесь у списках контактів одразу.',
            'workflow.step3Title': '3. Перекладайте з контекстом',
            'workflow.step3Desc': 'Завантажуйте документи та отримуйте глибокі брифи перекладів, пов\'язані з вашою історією чату.',
            'workflow.step4Title': '4. Моніторте використання',
            'workflow.step4Desc': 'Візуальні панелі відстежують токени, сповіщення та часові лінії перекладів на всіх платформах.',

            // Розділ Статистики
            'stats.realtimeTitle': 'Реальний час',
            'stats.realtimeDesc': 'Миттєві потокові відповіді в чаті, месенджері та перекладі.',
            'stats.secureTitle': 'Безпека',
            'stats.secureDesc': 'Відстеження використання токенів, вікна оновлення та зашифроване сховище.',
            'stats.supportTitle': 'Людська підтримка',
            'stats.supportDesc': 'Наша команда надає консьєрж-допомогу для творців та команд.',
            'stats.platformTitle': 'Готова платформа',
            'stats.platformDesc': 'Працює на комп\'ютері, планшеті та кишенькових пристроях з послідовним керуванням.',

            // Розділ Тарифів
            'pricing.title': 'ОБЕРІТЬ СВІЙ ТАРИФ',
            'pricing.subtitle': 'Усі плани включають 6-годинне оновлення токенів та доступ до всіх трьох платформ',

            // Розділ CTA
            'cta.title': 'Готові створювати з Kintsugi AI?',
            'cta.description': 'Зареєструйтесь, імпортуйте свою команду, і нехай AI-платформа керує вашими розмовами, перекладами та автоматизаціями.',
            'cta.createAccount': 'Створити обліковий запис',
            'cta.exploreDemos': 'Дослідити демо',

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
            'success.updated': 'Успішно оновлено',

            // Дії з повідомленнями (контекстне меню)
            'msgAction.reply': 'Відповісти',
            'msgAction.forward': 'Переслати',
            'msgAction.copy': 'Копіювати',
            'msgAction.react': 'Реагувати',
            'msgAction.delete': 'Видалити',
            'msgAction.deleteForMe': 'Видалити для мене',
            'msgAction.deleteForEveryone': 'Видалити для всіх',
            'msgAction.edit': 'Редагувати',
            'msgAction.pin': 'Закріпити',
            'msgAction.unpin': 'Відкріпити',
            'msgAction.report': 'Поскаржитись',
            'msgAction.replyingTo': 'Відповідь на',
            'msgAction.forwardTo': 'Переслати до',
            'msgAction.selectContacts': 'Оберіть контакти',

            // GIF Пошук
            'gif.search': 'Пошук GIF...',
            'gif.trending': 'Популярні',
            'gif.searchResults': 'Результати пошуку',
            'gif.noResults': 'GIF не знайдено',
            'gif.poweredBy': 'Підтримується Tenor',
            'gif.send': 'Надіслати GIF',

            // Відеоконференція
            'video.startCall': 'Почати відеодзвінок',
            'video.joinCall': 'Приєднатися до дзвінка',
            'video.endCall': 'Завершити дзвінок',
            'video.muteAudio': 'Вимкнути мікрофон',
            'video.unmuteAudio': 'Увімкнути мікрофон',
            'video.muteVideo': 'Вимкнути камеру',
            'video.unmuteVideo': 'Увімкнути камеру',
            'video.shareScreen': 'Поділитися екраном',
            'video.stopSharing': 'Припинити демонстрацію',
            'video.participants': 'Учасники',
            'video.fullScreen': 'Повний екран',
            'video.settings': 'Налаштування відео',
            'video.connecting': 'Підключення...',
            'video.callEnded': 'Дзвінок завершено',
            'video.inviteOthers': 'Запросити інших',

            // Історії
            'stories.title': 'Історії',
            'stories.yourStory': 'Ваша історія',
            'stories.addStory': 'Додати історію',
            'stories.viewStory': 'Переглянути історію',
            'stories.deleteStory': 'Видалити історію',
            'stories.expiresIn': 'Закінчується через',
            'stories.expired': 'Закінчилась',
            'stories.viewers': 'Переглянули',
            'stories.noStories': 'Поки немає історій',
            'stories.uploadPhoto': 'Завантажити фото',
            'stories.uploadVideo': 'Завантажити відео',
            'stories.addCaption': 'Додати підпис',

            // Управління групами
            'group.create': 'Створити групу',
            'group.edit': 'Редагувати групу',
            'group.leave': 'Покинути групу',
            'group.delete': 'Видалити групу',
            'group.addMembers': 'Додати учасників',
            'group.removeMember': 'Видалити учасника',
            'group.makeAdmin': 'Зробити адміністратором',
            'group.removeAdmin': 'Забрати права адміна',
            'group.groupInfo': 'Інформація про групу',
            'group.groupName': 'Назва групи',
            'group.groupDescription': 'Опис',
            'group.groupAvatar': 'Аватар групи',
            'group.members': 'Учасники',
            'group.admins': 'Адміністратори',
            'group.inviteLink': 'Посилання для запрошення',
            'group.generateLink': 'Згенерувати посилання',
            'group.copyLink': 'Копіювати посилання',

            // Розділи профілю
            'profile.editProfile': 'Редагувати профіль',
            'profile.changeBio': 'Змінити біографію',
            'profile.changeAvatar': 'Змінити аватар',
            'profile.changePassword': 'Змінити пароль',
            'profile.currentPassword': 'Поточний пароль',
            'profile.newPassword': 'Новий пароль',
            'profile.tokensUsed': 'Використано токенів',
            'profile.tokensRemaining': 'Залишилось токенів',
            'profile.subscriptionStatus': 'Статус підписки',
            'profile.subscriptionExpires': 'Закінчується',
            'profile.manageSubscription': 'Керувати підпискою',

            // Сторінка перекладу
            'trans.sourceLanguage': 'Мова оригіналу',
            'trans.targetLanguage': 'Мова перекладу',
            'trans.enterText': 'Введіть текст для перекладу',
            'trans.translating': 'Перекладаємо...',
            'trans.translated': 'Перекладено',
            'trans.detect': 'Визначити мову',
            'trans.swap': 'Поміняти мови',
            'trans.copy': 'Копіювати переклад',
            'trans.clear': 'Очистити',
            'trans.characterCount': 'символів',
            'trans.service.deepl': 'DeepL',
            'trans.service.otranslator': 'o.translator',

            // Юридичні сторінки
            'legal.privacyPolicy': 'Політика конфіденційності',
            'legal.termsOfService': 'Умови використання',
            'legal.acceptableUse': 'Правила допустимого використання',
            'legal.lastUpdated': 'Останнє оновлення',
            'legal.backToHome': 'Повернутись на головну',

            // Сповіщення
            'notif.newMessage': 'Нове повідомлення від',
            'notif.newReaction': 'відреагував на ваше повідомлення',
            'notif.newStory': 'додав нову історію',
            'notif.addedToGroup': 'додав вас до',
            'notif.mentionedYou': 'згадав вас',
            'notif.callMissed': 'Пропущений дзвінок від',
            'notif.markRead': 'Позначити як прочитане',
            'notif.markAllRead': 'Позначити все як прочитане',
            'notif.clearAll': 'Очистити все'
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

            // Sección de Workflow
            'workflow.title': 'WORKFLOW',
            'workflow.subtitle': 'Personaliza tu espacio: inicia un chat, invita colaboradores o envía un brief de traducción. Kintsugi rastrea cada token.',
            'workflow.step1Title': '1. Inicia un chat seguro',
            'workflow.step1Desc': 'Abre un espacio de proyecto con IA en streaming y amigos o un chat privado.',
            'workflow.step2Title': '2. Invita y automatiza',
            'workflow.step2Desc': 'Crea enlaces de invitación; al aceptarlos, ambos aparecen mutuamente en contactos.',
            'workflow.step3Title': '3. Traduce con contexto',
            'workflow.step3Desc': 'Sube documentos y recibe briefs conectados a tu historial de chat.',
            'workflow.step4Title': '4. Controla el consumo',
            'workflow.step4Desc': 'Paneles visuales siguen tokens, notificaciones y traducciones en todas las plataformas.',

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
            'success.updated': 'Actualizado exitosamente',

            // Acciones de mensajes (menú contextual)
            'msgAction.reply': 'Responder',
            'msgAction.forward': 'Reenviar',
            'msgAction.copy': 'Copiar',
            'msgAction.react': 'Reaccionar',
            'msgAction.delete': 'Eliminar',
            'msgAction.deleteForMe': 'Eliminar para mí',
            'msgAction.deleteForEveryone': 'Eliminar para todos',
            'msgAction.edit': 'Editar',
            'msgAction.pin': 'Fijar',
            'msgAction.unpin': 'Desfijar',
            'msgAction.report': 'Reportar',
            'msgAction.replyingTo': 'Respondiendo a',
            'msgAction.forwardTo': 'Reenviar a',
            'msgAction.selectContacts': 'Seleccionar contactos',

            // Selector de GIF
            'gif.search': 'Buscar GIFs...',
            'gif.trending': 'Tendencias',
            'gif.searchResults': 'Resultados de búsqueda',
            'gif.noResults': 'No se encontraron GIFs',
            'gif.poweredBy': 'Desarrollado por Tenor',
            'gif.send': 'Enviar GIF',

            // Videoconferencia
            'video.startCall': 'Iniciar videollamada',
            'video.joinCall': 'Unirse a la llamada',
            'video.endCall': 'Finalizar llamada',
            'video.muteAudio': 'Silenciar',
            'video.unmuteAudio': 'Activar sonido',
            'video.muteVideo': 'Apagar cámara',
            'video.unmuteVideo': 'Encender cámara',
            'video.shareScreen': 'Compartir pantalla',
            'video.stopSharing': 'Dejar de compartir',
            'video.participants': 'Participantes',
            'video.fullScreen': 'Pantalla completa',
            'video.settings': 'Configuración de vídeo',
            'video.connecting': 'Conectando...',
            'video.callEnded': 'Llamada finalizada',
            'video.inviteOthers': 'Invitar a otros',

            // Historias
            'stories.title': 'Historias',
            'stories.yourStory': 'Tu historia',
            'stories.addStory': 'Añadir historia',
            'stories.viewStory': 'Ver historia',
            'stories.deleteStory': 'Eliminar historia',
            'stories.expiresIn': 'Expira en',
            'stories.expired': 'Expirada',
            'stories.viewers': 'Visualizaciones',
            'stories.noStories': 'No hay historias aún',
            'stories.uploadPhoto': 'Subir foto',
            'stories.uploadVideo': 'Subir vídeo',
            'stories.addCaption': 'Añadir descripción',

            // Gestión de grupos
            'group.create': 'Crear grupo',
            'group.edit': 'Editar grupo',
            'group.leave': 'Salir del grupo',
            'group.delete': 'Eliminar grupo',
            'group.addMembers': 'Añadir miembros',
            'group.removeMember': 'Eliminar miembro',
            'group.makeAdmin': 'Hacer administrador',
            'group.removeAdmin': 'Quitar administrador',
            'group.groupInfo': 'Información del grupo',
            'group.groupName': 'Nombre del grupo',
            'group.groupDescription': 'Descripción',
            'group.groupAvatar': 'Avatar del grupo',
            'group.members': 'Miembros',
            'group.admins': 'Administradores',
            'group.inviteLink': 'Enlace de invitación',
            'group.generateLink': 'Generar enlace',
            'group.copyLink': 'Copiar enlace',

            // Secciones de perfil
            'profile.editProfile': 'Editar perfil',
            'profile.changeBio': 'Cambiar biografía',
            'profile.changeAvatar': 'Cambiar avatar',
            'profile.changePassword': 'Cambiar contraseña',
            'profile.currentPassword': 'Contraseña actual',
            'profile.newPassword': 'Nueva contraseña',
            'profile.tokensUsed': 'Tokens utilizados',
            'profile.tokensRemaining': 'Tokens restantes',
            'profile.subscriptionStatus': 'Estado de suscripción',
            'profile.subscriptionExpires': 'Expira',
            'profile.manageSubscription': 'Gestionar suscripción',

            // Página de traducción
            'trans.sourceLanguage': 'Idioma origen',
            'trans.targetLanguage': 'Idioma destino',
            'trans.enterText': 'Introduce el texto a traducir',
            'trans.translating': 'Traduciendo...',
            'trans.translated': 'Traducido',
            'trans.detect': 'Detectar idioma',
            'trans.swap': 'Intercambiar idiomas',
            'trans.copy': 'Copiar traducción',
            'trans.clear': 'Limpiar',
            'trans.characterCount': 'caracteres',
            'trans.service.deepl': 'DeepL',
            'trans.service.otranslator': 'o.translator',

            // Páginas legales
            'legal.privacyPolicy': 'Política de privacidad',
            'legal.termsOfService': 'Términos de servicio',
            'legal.acceptableUse': 'Política de uso aceptable',
            'legal.lastUpdated': 'Última actualización',
            'legal.backToHome': 'Volver al inicio',

            // Notificaciones
            'notif.newMessage': 'Nuevo mensaje de',
            'notif.newReaction': 'reaccionó a tu mensaje',
            'notif.newStory': 'añadió una nueva historia',
            'notif.addedToGroup': 'te añadió a',
            'notif.mentionedYou': 'te mencionó',
            'notif.callMissed': 'Llamada perdida de',
            'notif.markRead': 'Marcar como leído',
            'notif.markAllRead': 'Marcar todo como leído',
            'notif.clearAll': 'Limpiar todo'
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

            // Section Flux de travail
            'workflow.title': 'WORKFLOW',
            'workflow.subtitle': 'Configurez votre espace : démarrez un chat, invitez des collaborateurs ou envoyez un brief de traduction. Kintsugi suit chaque jeton.',
            'workflow.step1Title': '1. Lancez un chat sécurisé',
            'workflow.step1Desc': 'Créez un espace projet avec une IA en streaming et vos partenaires, ou un chat privé.',
            'workflow.step2Title': '2. Invitez + automatisez',
            'workflow.step2Desc': 'Générez des liens d\'invitation ; une fois acceptés, vous apparaissez dans les contacts respectifs.',
            'workflow.step3Title': '3. Traduisez avec contexte',
            'workflow.step3Desc': 'Déposez des documents et recevez des briefs de traduction reliés à votre historique de chat.',
            'workflow.step4Title': '4. Surveillez l\'utilisation',
            'workflow.step4Desc': 'Des tableaux de bord visuels suivent les jetons, les notifications et les timelines de traduction.',

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
            'success.updated': 'Mis à jour avec succès',

            // Actions de messages (menu contextuel)
            'msgAction.reply': 'Répondre',
            'msgAction.forward': 'Transférer',
            'msgAction.copy': 'Copier',
            'msgAction.react': 'Réagir',
            'msgAction.delete': 'Supprimer',
            'msgAction.deleteForMe': 'Supprimer pour moi',
            'msgAction.deleteForEveryone': 'Supprimer pour tout le monde',
            'msgAction.edit': 'Modifier',
            'msgAction.pin': 'Épingler',
            'msgAction.unpin': 'Désépingler',
            'msgAction.report': 'Signaler',
            'msgAction.replyingTo': 'Répondre à',
            'msgAction.forwardTo': 'Transférer à',
            'msgAction.selectContacts': 'Sélectionner les contacts',

            // Sélecteur de GIF
            'gif.search': 'Rechercher des GIF...',
            'gif.trending': 'Tendances',
            'gif.searchResults': 'Résultats de recherche',
            'gif.noResults': 'Aucun GIF trouvé',
            'gif.poweredBy': 'Propulsé par Tenor',
            'gif.send': 'Envoyer le GIF',

            // Visioconférence
            'video.startCall': 'Démarrer un appel vidéo',
            'video.joinCall': 'Rejoindre l\'appel',
            'video.endCall': 'Terminer l\'appel',
            'video.muteAudio': 'Couper le micro',
            'video.unmuteAudio': 'Activer le micro',
            'video.muteVideo': 'Désactiver la caméra',
            'video.unmuteVideo': 'Activer la caméra',
            'video.shareScreen': 'Partager l\'écran',
            'video.stopSharing': 'Arrêter le partage',
            'video.participants': 'Participants',
            'video.fullScreen': 'Plein écran',
            'video.settings': 'Paramètres vidéo',
            'video.connecting': 'Connexion en cours...',
            'video.callEnded': 'Appel terminé',
            'video.inviteOthers': 'Inviter d\'autres personnes',

            // Histoires
            'stories.title': 'Histoires',
            'stories.yourStory': 'Votre histoire',
            'stories.addStory': 'Ajouter une histoire',
            'stories.viewStory': 'Voir l\'histoire',
            'stories.deleteStory': 'Supprimer l\'histoire',
            'stories.expiresIn': 'Expire dans',
            'stories.expired': 'Expiré',
            'stories.viewers': 'Vues',
            'stories.noStories': 'Pas encore d\'histoires',
            'stories.uploadPhoto': 'Télécharger une photo',
            'stories.uploadVideo': 'Télécharger une vidéo',
            'stories.addCaption': 'Ajouter une légende',

            // Gestion de groupe
            'group.create': 'Créer un groupe',
            'group.edit': 'Modifier le groupe',
            'group.leave': 'Quitter le groupe',
            'group.delete': 'Supprimer le groupe',
            'group.addMembers': 'Ajouter des membres',
            'group.removeMember': 'Retirer un membre',
            'group.makeAdmin': 'Nommer administrateur',
            'group.removeAdmin': 'Retirer l\'administrateur',
            'group.groupInfo': 'Informations du groupe',
            'group.groupName': 'Nom du groupe',
            'group.groupDescription': 'Description',
            'group.groupAvatar': 'Avatar du groupe',
            'group.members': 'Membres',
            'group.admins': 'Administrateurs',
            'group.inviteLink': 'Lien d\'invitation',
            'group.generateLink': 'Générer un lien',
            'group.copyLink': 'Copier le lien',

            // Sections de profil
            'profile.editProfile': 'Modifier le profil',
            'profile.changeBio': 'Modifier la biographie',
            'profile.changeAvatar': 'Modifier l\'avatar',
            'profile.changePassword': 'Changer le mot de passe',
            'profile.currentPassword': 'Mot de passe actuel',
            'profile.newPassword': 'Nouveau mot de passe',
            'profile.tokensUsed': 'Jetons utilisés',
            'profile.tokensRemaining': 'Jetons restants',
            'profile.subscriptionStatus': 'Statut d\'abonnement',
            'profile.subscriptionExpires': 'Expire',
            'profile.manageSubscription': 'Gérer l\'abonnement',

            // Page de traduction
            'trans.sourceLanguage': 'Langue source',
            'trans.targetLanguage': 'Langue cible',
            'trans.enterText': 'Entrez le texte à traduire',
            'trans.translating': 'Traduction en cours...',
            'trans.translated': 'Traduit',
            'trans.detect': 'Détecter la langue',
            'trans.swap': 'Inverser les langues',
            'trans.copy': 'Copier la traduction',
            'trans.clear': 'Effacer',
            'trans.characterCount': 'caractères',
            'trans.service.deepl': 'DeepL',
            'trans.service.otranslator': 'o.translator',

            // Pages légales
            'legal.privacyPolicy': 'Politique de confidentialité',
            'legal.termsOfService': 'Conditions d\'utilisation',
            'legal.acceptableUse': 'Politique d\'utilisation acceptable',
            'legal.lastUpdated': 'Dernière mise à jour',
            'legal.backToHome': 'Retour à l\'accueil',

            // Notifications
            'notif.newMessage': 'Nouveau message de',
            'notif.newReaction': 'a réagi à votre message',
            'notif.newStory': 'a ajouté une nouvelle histoire',
            'notif.addedToGroup': 'vous a ajouté à',
            'notif.mentionedYou': 'vous a mentionné',
            'notif.callMissed': 'Appel manqué de',
            'notif.markRead': 'Marquer comme lu',
            'notif.markAllRead': 'Tout marquer comme lu',
            'notif.clearAll': 'Tout effacer'
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

            // Workflow-Bereich
            'workflow.title': 'WORKFLOW',
            'workflow.subtitle': 'Gestalten Sie Ihren Workspace: Starten Sie einen Chat, laden Sie Mitarbeitende ein oder senden Sie einen Übersetzungsbrief. Kintsugi protokolliert jeden Token.',
            'workflow.step1Title': '1. Starten Sie einen sicheren Chat',
            'workflow.step1Desc': 'Öffnen Sie einen Projektbereich mit Streaming-KI und Freunden oder einem privaten Messenger.',
            'workflow.step2Title': '2. Einladen + automatisieren',
            'workflow.step2Desc': 'Generieren Sie Einladungslinks; nach Annahme tauchen Sie sofort in den Kontakteinstellungen auf.',
            'workflow.step3Title': '3. Übersetzen mit Kontext',
            'workflow.step3Desc': 'Laden Sie Dokumente hoch und erhalten Sie tiefgehende Übersetzungsbriefings mit Bezug zu Ihrem Chat-Verlauf.',
            'workflow.step4Title': '4. Verbrauch überwachen',
            'workflow.step4Desc': 'Visualisierte Dashboards verfolgen Token, Benachrichtigungen und Übersetzungszeitpläne.',

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
            'success.updated': 'Erfolgreich aktualisiert',

            // Nachrichtenaktionen (Kontextmenü)
            'msgAction.reply': 'Antworten',
            'msgAction.forward': 'Weiterleiten',
            'msgAction.copy': 'Kopieren',
            'msgAction.react': 'Reagieren',
            'msgAction.delete': 'Löschen',
            'msgAction.deleteForMe': 'Für mich löschen',
            'msgAction.deleteForEveryone': 'Für alle löschen',
            'msgAction.edit': 'Bearbeiten',
            'msgAction.pin': 'Anheften',
            'msgAction.unpin': 'Loslösen',
            'msgAction.report': 'Melden',
            'msgAction.replyingTo': 'Antworten an',
            'msgAction.forwardTo': 'Weiterleiten an',
            'msgAction.selectContacts': 'Kontakte auswählen',

            // GIF-Auswahl
            'gif.search': 'GIFs suchen...',
            'gif.trending': 'Angesagt',
            'gif.searchResults': 'Suchergebnisse',
            'gif.noResults': 'Keine GIFs gefunden',
            'gif.poweredBy': 'Bereitgestellt von Tenor',
            'gif.send': 'GIF senden',

            // Videokonferenz
            'video.startCall': 'Videoanruf starten',
            'video.joinCall': 'Anruf beitreten',
            'video.endCall': 'Anruf beenden',
            'video.muteAudio': 'Stumm schalten',
            'video.unmuteAudio': 'Stummschaltung aufheben',
            'video.muteVideo': 'Kamera ausschalten',
            'video.unmuteVideo': 'Kamera einschalten',
            'video.shareScreen': 'Bildschirm teilen',
            'video.stopSharing': 'Teilen beenden',
            'video.participants': 'Teilnehmer',
            'video.fullScreen': 'Vollbild',
            'video.settings': 'Videoeinstellungen',
            'video.connecting': 'Verbinde...',
            'video.callEnded': 'Anruf beendet',
            'video.inviteOthers': 'Andere einladen',

            // Geschichten
            'stories.title': 'Geschichten',
            'stories.yourStory': 'Deine Geschichte',
            'stories.addStory': 'Geschichte hinzufügen',
            'stories.viewStory': 'Geschichte ansehen',
            'stories.deleteStory': 'Geschichte löschen',
            'stories.expiresIn': 'Läuft ab in',
            'stories.expired': 'Abgelaufen',
            'stories.viewers': 'Zuschauer',
            'stories.noStories': 'Noch keine Geschichten',
            'stories.uploadPhoto': 'Foto hochladen',
            'stories.uploadVideo': 'Video hochladen',
            'stories.addCaption': 'Beschriftung hinzufügen',

            // Gruppenverwaltung
            'group.create': 'Gruppe erstellen',
            'group.edit': 'Gruppe bearbeiten',
            'group.leave': 'Gruppe verlassen',
            'group.delete': 'Gruppe löschen',
            'group.addMembers': 'Mitglieder hinzufügen',
            'group.removeMember': 'Mitglied entfernen',
            'group.makeAdmin': 'Zum Admin machen',
            'group.removeAdmin': 'Admin entfernen',
            'group.groupInfo': 'Gruppeninfo',
            'group.groupName': 'Gruppenname',
            'group.groupDescription': 'Beschreibung',
            'group.groupAvatar': 'Gruppenavatar',
            'group.members': 'Mitglieder',
            'group.admins': 'Administratoren',
            'group.inviteLink': 'Einladungslink',
            'group.generateLink': 'Link generieren',
            'group.copyLink': 'Link kopieren',

            // Profilbereiche
            'profile.editProfile': 'Profil bearbeiten',
            'profile.changeBio': 'Bio ändern',
            'profile.changeAvatar': 'Avatar ändern',
            'profile.changePassword': 'Passwort ändern',
            'profile.currentPassword': 'Aktuelles Passwort',
            'profile.newPassword': 'Neues Passwort',
            'profile.tokensUsed': 'Verwendete Token',
            'profile.tokensRemaining': 'Verbleibende Token',
            'profile.subscriptionStatus': 'Abonnementstatus',
            'profile.subscriptionExpires': 'Läuft ab',
            'profile.manageSubscription': 'Abonnement verwalten',

            // Übersetzungsseite
            'trans.sourceLanguage': 'Ausgangssprache',
            'trans.targetLanguage': 'Zielsprache',
            'trans.enterText': 'Text zum Übersetzen eingeben',
            'trans.translating': 'Übersetze...',
            'trans.translated': 'Übersetzt',
            'trans.detect': 'Sprache erkennen',
            'trans.swap': 'Sprachen tauschen',
            'trans.copy': 'Übersetzung kopieren',
            'trans.clear': 'Löschen',
            'trans.characterCount': 'Zeichen',
            'trans.service.deepl': 'DeepL',
            'trans.service.otranslator': 'o.translator',

            // Rechtliche Seiten
            'legal.privacyPolicy': 'Datenschutzrichtlinie',
            'legal.termsOfService': 'Nutzungsbedingungen',
            'legal.acceptableUse': 'Richtlinie für akzeptable Nutzung',
            'legal.lastUpdated': 'Zuletzt aktualisiert',
            'legal.backToHome': 'Zurück zur Startseite',

            // Benachrichtigungen
            'notif.newMessage': 'Neue Nachricht von',
            'notif.newReaction': 'hat auf Ihre Nachricht reagiert',
            'notif.newStory': 'hat eine neue Geschichte hinzugefügt',
            'notif.addedToGroup': 'hat Sie hinzugefügt zu',
            'notif.mentionedYou': 'hat Sie erwähnt',
            'notif.callMissed': 'Verpasster Anruf von',
            'notif.markRead': 'Als gelesen markieren',
            'notif.markAllRead': 'Alle als gelesen markieren',
            'notif.clearAll': 'Alle löschen'
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
                switcher.classList.toggle('open', dropdown.classList.contains('active'));
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                dropdown.classList.remove('active');
                switcher.classList.remove('open');
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
                    switcher.classList.remove('open');
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
