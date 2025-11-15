# 💬 MESSENGER - UI/UX СПЕЦИФІКАЦІЯ

## 🎯 ЗАГАЛЬНА КОНЦЕПЦІЯ

**Messenger** - повноцінний месенджер в neo-brutalism стилі з максимальною функціональністю та ідеальною мобільною адаптацією.

---

## 📱 MOBILE-FIRST ПІДХІД

### Breakpoints:
```css
mobile:  до 640px   (основний пріоритет)
tablet:  641-1024px
desktop: 1025px+
```

### Принципи:
1. **Touch-friendly** - всі кнопки мінімум 48x48px
2. **Swipe gestures** - навігація свайпами
3. **Bottom navigation** - основні дії внизу (легко досяжні)
4. **Progressive disclosure** - показувати тільки потрібне
5. **Offline-first** - кешування, оптимістичні оновлення

---

## 🏗️ СТРУКТУРА ЕКРАНІВ

### 1. CONVERSATIONS LIST (Список чатів)

#### Desktop Layout (1025px+):
```
┌─────────────────────────────────────────────────────────────┐
│ [☰] KINTSUGI MESSENGER    [🔍] [⚙️] [👤]                    │ 80px header
├──────────────────┬──────────────────────────────────────────┤
│                  │                                          │
│  CONVERSATIONS   │         SELECTED CHAT                    │
│     SIDEBAR      │           WINDOW                         │
│     320px        │                                          │
│                  │                                          │
│  [New Message]   │  Messages appear here                    │
│                  │                                          │
│  ┌────────────┐  │                                          │
│  │ 👤 John    │  │                                          │
│  │ Last msg...│  │                                          │
│  │ 2 min ago  │  │                                          │
│  └────────────┘  │                                          │
│                  │                                          │
│  [Alice]         │                                          │
│  [Bob]           │                                          │
│  [Group Chat]    │                                          │
│  ...             │                                          │
│                  │                                          │
│                  │  [Message Input]                         │
└──────────────────┴──────────────────────────────────────────┘
```

#### Mobile Layout (до 640px):
```
┌──────────────────────┐
│ KINTSUGI  [🔍] [+]  │ 60px header
├──────────────────────┤
│                      │
│  ┌────────────────┐  │ Conversation cards
│  │ 👤 John Doe    │  │ (swipeable)
│  │ Hey, how are.. │  │
│  │ 2 min ago   ●  │  │
│  └────────────────┘  │
│                      │
│  ┌────────────────┐  │
│  │ 👤 Alice       │  │
│  │ Thanks!        │  │
│  │ 1 hour ago     │  │
│  └────────────────┘  │
│                      │
│  [Bob]  [Group]      │
│                      │
├──────────────────────┤
│ [🏠][💬][📞][⚙️]   │ 60px bottom nav
└──────────────────────┘
```

---

### 2. CHAT WINDOW (Вікно розмови)

#### Desktop:
```
┌────────────────────────────────────────────────────────────┐
│ [←] 👤 John Doe                    [📞] [📹] [⋮]          │ Header
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────┐                         │
│  │ Hey! How are you?            │  ← Їхнє (зліва)        │
│  │ 10:45 AM                     │                         │
│  └──────────────────────────────┘                         │
│                                                            │
│                        ┌──────────────────────────────┐   │
│                        │ I'm good, thanks!            │   │ Моє (справа)
│                        │ 10:46 AM                  ✓✓ │   │
│                        └──────────────────────────────┘   │
│                                                            │
│  ┌──────────────────────────────┐                         │
│  │ [Image Preview]              │                         │
│  │ 📷 photo.jpg                 │                         │
│  └──────────────────────────────┘                         │
│                                                            │
│                        ┌──────────────────────────────┐   │
│                        │ Nice! 🔥                     │   │
│                        │ 10:47 AM                  ✓  │   │
│                        └──────────────────────────────┘   │
│                                                            │
│  John is typing...                                        │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ [+] [📎] [Type a message...          ] [😊] [🎤] [SEND]  │ Input
└────────────────────────────────────────────────────────────┘
```

#### Mobile:
```
┌──────────────────────┐
│ [←] John  [📞][⋮]   │ 60px header
├──────────────────────┤
│                      │
│ ┌─────────────────┐  │ Message bubble
│ │ Hey!            │  │ (swipe для опцій)
│ │ 10:45        ❤️ │  │
│ └─────────────────┘  │
│                      │
│       ┌───────────┐  │
│       │ I'm good! │  │
│       │ 10:46  ✓✓ │  │
│       └───────────┘  │
│                      │
│ [Image]              │ Media preview
│ 📷 photo.jpg         │ (tap to expand)
│                      │
│       ┌───────────┐  │
│       │ Nice! 🔥  │  │
│       │ 10:47  ✓  │  │
│       └───────────┘  │
│                      │
│ John typing...       │
│                      │
├──────────────────────┤
│[+][Type...  ][😊][▶]│ 60px input
└──────────────────────┘
```

---

## 🎨 COMPONENTS ДЕТАЛЬНО

### ConversationCard (Картка чату в списку)

#### Desktop версія:
```tsx
<div className="
  flex items-center gap-4 p-4
  border-3 border-digital-white
  hover:border-kintsugi-gold
  hover:shadow-neo
  transition-all cursor-pointer
  bg-digital-black
">
  {/* Avatar */}
  <div className="relative">
    <img
      src={avatar}
      className="w-14 h-14 border-3 border-cyber-cyan"
      alt={name}
    />
    {isOnline && (
      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-matrix-green border-2 border-digital-black rounded-full" />
    )}
  </div>

  {/* Content */}
  <div className="flex-1 min-w-0">
    <div className="flex justify-between items-start mb-1">
      <h3 className="font-mono font-bold uppercase text-digital-white truncate">
        {name}
      </h3>
      <span className="text-xs text-digital-white/60 font-mono whitespace-nowrap ml-2">
        {timestamp}
      </span>
    </div>

    <p className="text-sm text-digital-white/80 font-mono truncate">
      {lastMessage}
    </p>
  </div>

  {/* Indicators */}
  <div className="flex flex-col items-end gap-2">
    {unreadCount > 0 && (
      <div className="
        min-w-[24px] h-6 px-2
        flex items-center justify-center
        bg-cyber-pink border-2 border-digital-black
        font-mono font-bold text-xs
      ">
        {unreadCount}
      </div>
    )}
    {isPinned && <span className="text-kintsugi-gold text-lg">📌</span>}
  </div>
</div>
```

#### Mobile версія (swipeable):
```tsx
<Swipeable
  onSwipeLeft={() => showQuickActions('archive', 'delete')}
  onSwipeRight={() => showQuickActions('pin', 'mute')}
>
  <div className="
    flex items-center gap-3 p-3
    border-b-2 border-digital-white/20
    active:bg-digital-white/5
    transition-colors
  ">
    {/* Avatar (smaller) */}
    <div className="relative">
      <img
        src={avatar}
        className="w-12 h-12 border-2 border-cyber-cyan"
      />
      {isOnline && <OnlineBadge />}
    </div>

    {/* Content */}
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-baseline mb-1">
        <h3 className="font-mono font-bold text-sm uppercase truncate">
          {name}
        </h3>
        <span className="text-xs text-digital-white/50 ml-2 flex-shrink-0">
          {shortTime}
        </span>
      </div>

      <p className="text-xs text-digital-white/70 truncate font-mono">
        {lastMessage}
      </p>
    </div>

    {/* Unread badge */}
    {unreadCount > 0 && (
      <div className="w-5 h-5 bg-cyber-pink rounded-full flex items-center justify-center text-xs font-bold">
        {unreadCount > 9 ? '9+' : unreadCount}
      </div>
    )}
  </div>
</Swipeable>
```

---

### MessageBubble (Повідомлення)

#### Вхідне повідомлення (від співрозмовника):
```tsx
<div className="flex gap-2 mb-4 items-end">
  {/* Avatar (тільки для групових чатів) */}
  {isGroup && (
    <img src={senderAvatar} className="w-8 h-8 border-2 border-cyber-cyan" />
  )}

  <div className="flex flex-col max-w-[70%]">
    {/* Ім'я (групові чати) */}
    {isGroup && (
      <span className="text-xs text-cyber-cyan font-mono font-bold uppercase mb-1 ml-3">
        {senderName}
      </span>
    )}

    {/* Bubble */}
    <div className="
      border-3 border-kintsugi-gold
      bg-kintsugi-gold/5
      p-4
      shadow-neo
      relative
      group
    ">
      {/* Reply-to (якщо це відповідь) */}
      {replyTo && (
        <div className="mb-2 pb-2 border-b-2 border-kintsugi-gold/30">
          <div className="text-xs text-digital-white/60 font-mono">
            ↩ Reply to {replyTo.sender}
          </div>
          <div className="text-xs text-digital-white/40 truncate">
            {replyTo.content}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="text-digital-white font-mono whitespace-pre-wrap break-words">
        {content}
      </div>

      {/* Media (якщо є) */}
      {media && <MediaPreview media={media} />}

      {/* Reactions */}
      {reactions.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {reactions.map(r => (
            <button className="
              px-2 py-1
              bg-digital-black/50
              border-2 border-kintsugi-gold
              text-xs
              hover:scale-110 transition-transform
            ">
              {r.emoji} {r.count}
            </button>
          ))}
        </div>
      )}

      {/* Timestamp + Edit indicator */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-digital-white/40 font-mono">
          {timestamp}
        </span>
        {isEdited && (
          <span className="text-xs text-digital-white/30 italic">edited</span>
        )}
      </div>

      {/* Context menu (показується при ховері/довгому тапі) */}
      <MessageContextMenu
        onReply={() => {}}
        onReact={() => {}}
        onForward={() => {}}
        onCopy={() => {}}
      />
    </div>
  </div>
</div>
```

#### Вихідне повідомлення (моє):
```tsx
<div className="flex gap-2 mb-4 items-end justify-end">
  <div className="flex flex-col max-w-[70%] items-end">
    {/* Bubble */}
    <div className="
      border-3 border-cyber-pink
      bg-cyber-pink/5
      p-4
      shadow-neo-pink
      relative
      group
    ">
      {/* Same as incoming, але стиль інший */}
      <div className="text-digital-white font-mono whitespace-pre-wrap break-words">
        {content}
      </div>

      {/* Timestamp + Status */}
      <div className="flex items-center gap-2 mt-2 justify-end">
        <span className="text-xs text-digital-white/40 font-mono">
          {timestamp}
        </span>

        {/* Delivery status */}
        <DeliveryStatus status={deliveryStatus} />
      </div>
    </div>
  </div>
</div>
```

#### DeliveryStatus:
```tsx
const DeliveryStatus = ({ status }) => {
  const icons = {
    sending: '⏳',
    sent: '✓',
    delivered: '✓✓',
    read: '✓✓', // blue color
    failed: '⚠️'
  };

  const colors = {
    sending: 'text-digital-white/30',
    sent: 'text-digital-white/50',
    delivered: 'text-digital-white/70',
    read: 'text-cyber-cyan',
    failed: 'text-neon-orange'
  };

  return (
    <span className={`text-sm ${colors[status]}`}>
      {icons[status]}
    </span>
  );
};
```

---

### MessageInput (Поле вводу)

#### Desktop:
```tsx
<div className="
  border-t-3 border-digital-white
  bg-digital-black
  p-4
">
  {/* Reply preview (якщо відповідаємо) */}
  {replyingTo && (
    <div className="mb-3 flex items-center justify-between p-2 border-l-4 border-cyber-cyan bg-cyber-cyan/5">
      <div className="flex-1 min-w-0">
        <div className="text-xs text-cyber-cyan font-bold">↩ Reply to {replyingTo.sender}</div>
        <div className="text-xs text-digital-white/60 truncate">{replyingTo.content}</div>
      </div>
      <button onClick={cancelReply} className="ml-2 text-digital-white/50 hover:text-digital-white">
        ✕
      </button>
    </div>
  )}

  <div className="flex items-end gap-3">
    {/* Attachments */}
    <button className="
      w-12 h-12
      border-3 border-cyber-cyan
      bg-digital-black
      hover:bg-cyber-cyan hover:text-digital-black
      transition-all
      flex items-center justify-center
      text-xl
    ">
      +
    </button>

    {/* Input */}
    <div className="flex-1 relative">
      <TextareaAutosize
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown} // Ctrl+Enter to send
        placeholder="TYPE A MESSAGE..."
        className="
          w-full
          bg-digital-black
          border-3 border-digital-white
          focus:border-kintsugi-gold
          p-3 pr-12
          text-digital-white
          font-mono
          uppercase
          placeholder-digital-white/30
          resize-none
          max-h-[200px]
          transition-colors
        "
        maxRows={6}
      />

      {/* Emoji picker */}
      <button
        onClick={toggleEmojiPicker}
        className="absolute right-3 top-3 text-xl hover:scale-110 transition-transform"
      >
        😊
      </button>
    </div>

    {/* Voice/Send */}
    {message.trim() ? (
      <button
        onClick={sendMessage}
        className="
          w-12 h-12
          border-3 border-kintsugi-gold
          bg-kintsugi-gold
          text-digital-black
          font-bold
          uppercase
          shadow-neo
          hover:shadow-none hover:translate-x-1 hover:translate-y-1
          transition-all
        "
      >
        ▶
      </button>
    ) : (
      <button className="
        w-12 h-12
        border-3 border-neon-orange
        hover:bg-neon-orange hover:text-digital-black
        transition-all
        text-xl
      ">
        🎤
      </button>
    )}
  </div>

  {/* Typing indicator */}
  {someoneTyping && (
    <div className="mt-2 text-xs text-digital-white/50 font-mono">
      {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
    </div>
  )}
</div>
```

#### Mobile (компактна версія):
```tsx
<div className="
  fixed bottom-0 left-0 right-0
  border-t-3 border-digital-white
  bg-digital-black
  p-3
  safe-area-inset-bottom
">
  {/* Reply preview (якщо є) */}
  {replyingTo && <ReplyPreview />}

  <div className="flex items-center gap-2">
    {/* Attachment */}
    <button className="w-10 h-10 border-2 border-cyber-cyan flex items-center justify-center text-lg">
      +
    </button>

    {/* Input */}
    <input
      type="text"
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      placeholder="Type..."
      className="
        flex-1
        bg-digital-black
        border-2 border-digital-white
        focus:border-kintsugi-gold
        p-2
        text-digital-white
        font-mono
        text-sm
      "
    />

    {/* Emoji */}
    <button onClick={toggleEmoji} className="text-lg">
      😊
    </button>

    {/* Send/Voice */}
    {message.trim() ? (
      <button onClick={sendMessage} className="
        w-10 h-10
        bg-kintsugi-gold
        border-2 border-kintsugi-gold
        text-digital-black
        font-bold
      ">
        ▶
      </button>
    ) : (
      <button onTouchStart={startVoice} onTouchEnd={stopVoice} className="
        w-10 h-10
        border-2 border-neon-orange
        text-neon-orange
      ">
        🎤
      </button>
    )}
  </div>
</div>
```

---

## 🎭 INTERACTIONS (Взаємодії)

### 1. Swipe Gestures (Mobile)

#### На картці чату в списку:
```typescript
// Свайп вліво → швидкі дії (архів, видалити)
onSwipeLeft: () => {
  showActions(['Archive', 'Delete']);
}

// Свайп вправо → швидкі дії (пін, mute)
onSwipeRight: () => {
  showActions(['Pin', 'Mute']);
}
```

#### На повідомленні:
```typescript
// Свайп вправо → reply
onSwipeRight: (message) => {
  setReplyingTo(message);
  focusInput();
}

// Довгий тап → контекстне меню
onLongPress: (message) => {
  showContextMenu([
    'Reply', 'Forward', 'Copy', 'React',
    'Edit' (якщо моє), 'Delete' (якщо моє)
  ]);
}
```

### 2. Context Menu (Контекстне меню)

```tsx
<ContextMenu message={message}>
  <MenuItem icon="↩" onClick={() => reply(message)}>
    Reply
  </MenuItem>

  <MenuItem icon="❤️" onClick={() => openReactionPicker(message)}>
    React
  </MenuItem>

  <MenuItem icon="➜" onClick={() => forward(message)}>
    Forward
  </MenuItem>

  <MenuItem icon="📋" onClick={() => copyText(message)}>
    Copy
  </MenuItem>

  {message.isMine && (
    <>
      <MenuItem icon="✏️" onClick={() => edit(message)}>
        Edit
      </MenuItem>

      <MenuItem icon="🗑️" onClick={() => deleteMessage(message)} danger>
        Delete
      </MenuItem>
    </>
  )}
</ContextMenu>
```

### 3. Reaction Picker

```tsx
<ReactionPicker onSelect={(emoji) => addReaction(messageId, emoji)}>
  <div className="flex gap-2 p-3 border-3 border-kintsugi-gold bg-digital-black shadow-neo">
    {['❤️', '👍', '😂', '😮', '😢', '😡', '🔥', '✅'].map(emoji => (
      <button
        key={emoji}
        onClick={() => onSelect(emoji)}
        className="
          text-2xl
          hover:scale-125
          transition-transform
          p-2
          hover:bg-digital-white/10
        "
      >
        {emoji}
      </button>
    ))}

    <button className="text-xl p-2 border-2 border-digital-white/30">
      +
    </button>
  </div>
</ReactionPicker>
```

### 4. Voice Recording

```tsx
const VoiceRecorder = () => {
  return (
    <div className="
      fixed inset-0
      bg-digital-black/95
      flex flex-col items-center justify-center
      z-50
    ">
      {/* Waveform animation */}
      <div className="mb-8">
        <Waveform isRecording={true} />
      </div>

      {/* Timer */}
      <div className="text-4xl font-mono text-kintsugi-gold mb-12">
        {formatTime(duration)}
      </div>

      {/* Controls */}
      <div className="flex gap-6">
        {/* Cancel */}
        <button className="
          w-16 h-16
          border-3 border-neon-orange
          text-neon-orange
          text-2xl
          hover:bg-neon-orange hover:text-digital-black
        ">
          ✕
        </button>

        {/* Pause */}
        <button className="
          w-16 h-16
          border-3 border-cyber-cyan
          text-cyber-cyan
          text-2xl
        ">
          ⏸
        </button>

        {/* Send */}
        <button className="
          w-16 h-16
          bg-kintsugi-gold
          border-3 border-kintsugi-gold
          text-digital-black
          text-2xl
          shadow-neo
        ">
          ▶
        </button>
      </div>

      {/* Hint */}
      <div className="mt-8 text-sm text-digital-white/50 font-mono uppercase">
        Tap to stop • Swipe up to cancel
      </div>
    </div>
  );
};
```

---

## 🎨 ANIMATIONS & TRANSITIONS

### Message appear animation:
```css
@keyframes messageAppear {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.message-bubble {
  animation: messageAppear 0.3s ease-out;
}
```

### Typing indicator:
```tsx
const TypingIndicator = () => (
  <div className="flex gap-1 p-3">
    <div className="w-2 h-2 bg-kintsugi-gold rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
    <div className="w-2 h-2 bg-kintsugi-gold rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
    <div className="w-2 h-2 bg-kintsugi-gold rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
  </div>
);
```

### Scroll to bottom button:
```tsx
{showScrollButton && (
  <button
    onClick={scrollToBottom}
    className="
      fixed bottom-24 right-6
      w-12 h-12
      bg-cyber-cyan
      border-3 border-digital-black
      shadow-neo-cyan
      text-digital-black
      text-xl
      hover:translate-y-1
      transition-transform
    "
  >
    ↓
  </button>
)}
```

---

## 📊 STATE MANAGEMENT

```typescript
interface MessengerState {
  // Conversations
  conversations: Conversation[];
  selectedConversationId: string | null;

  // Messages
  messages: Record<string, Message[]>; // conversationId → messages[]
  loadingMessages: boolean;

  // Input
  messageText: string;
  replyingTo: Message | null;
  editingMessage: Message | null;

  // UI
  emojiPickerOpen: boolean;
  attachmentModalOpen: boolean;
  contextMenuOpen: { messageId: string; position: { x: number; y: number } } | null;

  // Real-time
  typingUsers: Record<string, string[]>; // conversationId → userIds[]
  onlineUsers: Set<string>;

  // Voice
  isRecordingVoice: boolean;
  voiceRecordingDuration: number;
}

// Actions
const messengerStore = create<MessengerState>((set, get) => ({
  // ... state

  sendMessage: async (content: string, attachments?: File[]) => {
    const { selectedConversationId } = get();

    // Optimistic update
    const tempMessage = createTempMessage(content);
    set(state => ({
      messages: {
        ...state.messages,
        [selectedConversationId]: [...state.messages[selectedConversationId], tempMessage]
      }
    }));

    // Send via WebSocket
    ws.send({
      type: 'message.send',
      conversationId: selectedConversationId,
      content,
      tempId: tempMessage.id
    });
  },

  receiveMessage: (message: Message) => {
    set(state => ({
      messages: {
        ...state.messages,
        [message.conversationId]: [...state.messages[message.conversationId], message]
      }
    }));

    // Play sound notification
    playNotificationSound();

    // Show desktop notification (якщо не в фокусі)
    if (!document.hasFocus()) {
      showDesktopNotification(message);
    }
  },

  // ... інші actions
}));
```

---

**Далі створю специфікацію для AI чату!**

**Версія**: 1.0.0
**Статус**: 🎨 Design Spec Complete
