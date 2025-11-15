# 🗺️ KINTSUGI AI - ПЛАН РЕАЛІЗАЦІЇ

## ✅ ЩО ГОТОВО

### 📚 Документація (100% Complete):
1. **README.md** - Загальний огляд
2. **docs/ARCHITECTURE.md** - Детальна архітектура 7 модулів
3. **docs/DEVELOPMENT_PLAN.md** - 5-тижневий план
4. **docs/modules/AUTH.md** - Готовий код AUTH модуля
5. **docs/UI_MESSENGER_SPEC.md** - Повна UI/UX специфікація месенджера ⭐
6. **docs/UI_CHAT_SPEC.md** - Повна UI/UX специфікація AI чату ⭐
7. **docs/HOW_TO_ADD_MODULE.md** - Гайд додавання модулів

### 🎨 UI/UX Специфікації (2.2MB):
- **Messenger**: 50+ компонентів, mobile-first, swipe gestures
- **AI Chat**: 40+ компонентів, code highlighting, streaming

---

## 🎯 ПРІОРИТЕТИ РЕАЛІЗАЦІЇ

### PHASE 1: BACKEND CORE (Week 1)

#### День 1-2: Foundation
```bash
✅ AUTH Module (код готовий в docs/modules/AUTH.md)
   - models.go
   - repository.go
   - service.go
   - handler.go
   - middleware.go
   - routes.go

⏳ Database Setup
   - PostgreSQL на Railway
   - Redis для sessions
   - Migrations (SQL готовий в docs/ARCHITECTURE.md)
```

#### День 3-4: AI CHAT Backend
```go
// backend/internal/modules/chat/

✅ models.go
type Chat struct {
    ID        uuid.UUID
    UserID    uuid.UUID
    Model     string    // gpt-4o, o1, etc
    Title     string
    CreatedAt time.Time
}

type Message struct {
    ID         uuid.UUID
    ChatID     uuid.UUID
    Role       string    // user | assistant | system
    Content    string
    TokensUsed int
    CreatedAt  time.Time
}

✅ service.go
func (s *ChatService) SendMessage(
    chatID uuid.UUID,
    content string,
    model string,
) (chan string, error) {
    // 1. Save user message
    // 2. Stream from OpenAI
    // 3. Return channel with chunks
    // 4. Save AI response when complete
}

✅ handler.go
func (h *ChatHandler) SendMessage(c *fiber.Ctx) error {
    // Server-Sent Events (SSE) для streaming
    c.Set("Content-Type", "text/event-stream")
    c.Set("Cache-Control", "no-cache")
    c.Set("Connection", "keep-alive")

    stream := h.service.SendMessage(chatID, content, model)

    for chunk := range stream {
        fmt.Fprintf(c.Response().BodyWriter(), "data: %s\n\n", chunk)
        c.Response().Flush()
    }
}
```

#### День 5-7: MESSENGER Backend
```go
// backend/internal/modules/messenger/

✅ WebSocket Hub
type Hub struct {
    clients    map[*Client]bool
    broadcast  chan *Message
    register   chan *Client
    unregister chan *Client
    rooms      map[string]map[*Client]bool
}

✅ Events
type MessageEvent struct {
    Type    string // message.send | message.edit | message.delete | reaction.add
    Payload interface{}
}

✅ Handlers
POST   /api/messenger/conversations
GET    /api/messenger/conversations
POST   /api/messenger/conversations/:id/messages
WS     /ws/messenger
```

---

### PHASE 2: FRONTEND CORE (Week 2)

#### День 1-2: Design System Components
```tsx
// frontend/components/ui/

✅ Button.tsx (Neo-brutalism)
✅ Input.tsx
✅ Card.tsx
✅ Modal.tsx
✅ Toast.tsx
✅ Dropdown.tsx
✅ Tabs.tsx
```

#### День 3-4: AI Chat Frontend
```tsx
// frontend/app/(chat)/

✅ page.tsx - Chat list + window
✅ components/ChatSidebar.tsx
✅ components/ChatWindow.tsx
✅ components/ChatMessage.tsx (з Markdown)
✅ components/ChatInput.tsx
✅ components/ModelSelector.tsx
✅ components/CodeBlock.tsx (syntax highlighting)

// Hooks
✅ hooks/useChat.ts
✅ hooks/useStreaming.ts
✅ lib/openai-stream.ts
```

#### День 5-7: Messenger Frontend
```tsx
// frontend/app/(messenger)/

✅ page.tsx - Conversation list + chat
✅ components/ConversationList.tsx
✅ components/MessageBubble.tsx
✅ components/MessageInput.tsx
✅ components/ReactionPicker.tsx
✅ components/VoiceRecorder.tsx

// Hooks
✅ hooks/useMessenger.ts
✅ hooks/useWebSocket.ts
✅ lib/websocket-client.ts
```

---

### PHASE 3: MOBILE ADAPTATION (Week 3)

#### Responsive Breakpoints:
```css
/* Mobile: до 640px */
- Bottom navigation
- Swipe gestures
- Full-screen modals
- Touch-friendly (48px+ buttons)

/* Tablet: 641-1024px */
- Collapsible sidebar
- Adaptive grid
- Hybrid touch/keyboard

/* Desktop: 1025px+ */
- Split view
- Keyboard shortcuts
- Multi-column
```

#### Mobile-Specific Components:
```tsx
✅ MobileNav.tsx
✅ MobileHeader.tsx
✅ SwipeableCard.tsx
✅ MobileMessageInput.tsx
✅ VoiceInputModal.tsx
✅ BottomSheet.tsx
```

---

### PHASE 4: ADVANCED FEATURES (Week 4)

#### AI Chat:
```tsx
✅ Token usage tracking
✅ Chat export (MD, JSON, PDF)
✅ System prompt editor
✅ Temperature/settings control
✅ Code execution (future)
✅ Conversation branching
```

#### Messenger:
```tsx
✅ Voice messages
✅ Image/file upload
✅ Read receipts
✅ Typing indicators
✅ Message search
✅ Stories (24h)
```

---

## 📦 КОМПОНЕНТИ ДЕТАЛЬНО

### 1. ChatMessage Component (AI Chat)

**Desktop**:
```tsx
<AIMessage>
  {/* Model badge */}
  <div>🤖 GPT-4O</div>

  {/* Content (Markdown) */}
  <MarkdownRenderer>
    {/* Text */}
    {/* Code blocks з syntax highlighting */}
    {/* Lists, tables, links */}
  </MarkdownRenderer>

  {/* Actions */}
  <div>
    <Button>📋 Copy</Button>
    <Button>🔄 Regenerate</Button>
    <Button>✏️ Edit & Retry</Button>
  </div>

  {/* Meta */}
  <div>
    <span>12:45 PM</span>
    <span>1,250 tokens</span>
    <span>2.3s</span>
  </div>
</AIMessage>
```

**Mobile**:
```tsx
<AIMessage mobile>
  {/* Compact badge */}
  <div>🤖 GPT-4O</div>

  {/* Content (simplified) */}
  <div>{content}</div>

  {/* Inline actions */}
  <div>
    <Button size="sm">Copy</Button>
    <Button size="sm">Regen</Button>
  </div>
</AIMessage>
```

---

### 2. MessageBubble Component (Messenger)

**Desktop**:
```tsx
<MessageBubble incoming>
  {/* Avatar (group chats) */}
  {isGroup && <Avatar />}

  {/* Bubble */}
  <div>
    {/* Reply-to */}
    {replyTo && <ReplyPreview />}

    {/* Content */}
    <div>{content}</div>

    {/* Media */}
    {media && <MediaPreview />}

    {/* Reactions */}
    {reactions.map(r => <Reaction emoji={r.emoji} count={r.count} />)}

    {/* Timestamp */}
    <span>10:45 AM</span>
  </div>

  {/* Context menu (hover) */}
  <ContextMenu>
    <MenuItem>Reply</MenuItem>
    <MenuItem>React</MenuItem>
    <MenuItem>Forward</MenuItem>
    <MenuItem>Copy</MenuItem>
  </ContextMenu>
</MessageBubble>
```

**Mobile (Swipeable)**:
```tsx
<Swipeable onSwipeRight={() => reply(message)}>
  <MessageBubble>
    {/* Compact version */}
    <div>{content}</div>
    <span>10:45</span>

    {/* Long-press → context menu */}
  </MessageBubble>
</Swipeable>
```

---

## 🔧 ТЕХНІЧНА ІМПЛЕМЕНТАЦІЯ

### Backend Streaming (AI Chat)

```go
// OpenAI Streaming
func (s *ChatService) StreamChatCompletion(messages []Message) (<-chan string, error) {
    req := openai.ChatCompletionRequest{
        Model:    "gpt-4o",
        Messages: messages,
        Stream:   true,
    }

    stream, err := s.openaiClient.CreateChatCompletionStream(context.Background(), req)
    if err != nil {
        return nil, err
    }

    responseChan := make(chan string)

    go func() {
        defer close(responseChan)
        defer stream.Close()

        var fullResponse strings.Builder

        for {
            response, err := stream.Recv()
            if errors.Is(err, io.EOF) {
                // Save complete message to database
                s.saveMessage(fullResponse.String())
                return
            }

            if err != nil {
                log.Printf("Stream error: %v", err)
                return
            }

            chunk := response.Choices[0].Delta.Content
            fullResponse.WriteString(chunk)

            // Send chunk to client
            responseChan <- chunk
        }
    }()

    return responseChan, nil
}
```

### Frontend Streaming (AI Chat)

```typescript
// SSE Client
const streamChatMessage = async (chatId: string, content: string) => {
  const response = await fetch('/api/chats/' + chatId + '/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  let fullContent = '';

  while (true) {
    const { done, value } = await reader!.read();

    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        fullContent += data;

        // Update UI (з типінг ефектом)
        setStreamingContent(fullContent);
      }
    }
  }
};
```

### WebSocket Client (Messenger)

```typescript
// WebSocket Hook
const useMessenger = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const wsRef = useRef<WebSocket>();

  useEffect(() => {
    const ws = new WebSocket(`wss://api.kintsugi.ai/ws/messenger?conversation=${conversationId}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'message.new':
          setMessages(prev => [...prev, data.payload]);
          playNotificationSound();
          break;

        case 'message.edited':
          setMessages(prev => prev.map(m =>
            m.id === data.payload.id ? data.payload : m
          ));
          break;

        case 'message.deleted':
          setMessages(prev => prev.map(m =>
            m.id === data.payload.id ? { ...m, isDeleted: true } : m
          ));
          break;

        case 'reaction.added':
          // Update message reactions
          break;

        case 'user.typing':
          setTypingUsers(data.payload.userIds);
          break;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Reconnect logic
      setTimeout(() => connectWebSocket(), 3000);
    };

    wsRef.current = ws;

    return () => ws.close();
  }, [conversationId]);

  const sendMessage = (content: string) => {
    wsRef.current?.send(JSON.stringify({
      type: 'message.send',
      payload: { content },
    }));
  };

  return { messages, sendMessage };
};
```

---

## 🎨 STYLING SYSTEM

### Tailwind Classes (Neo-Brutalism)

```typescript
// Button variants
const buttonVariants = {
  primary: `
    border-3 border-kintsugi-gold
    bg-kintsugi-gold
    text-digital-black
    font-bold uppercase
    shadow-neo
    hover:shadow-none hover:translate-x-1 hover:translate-y-1
    transition-all
  `,

  secondary: `
    border-3 border-cyber-pink
    text-cyber-pink
    hover:bg-cyber-pink hover:text-digital-black
    font-bold uppercase
    transition-all
  `,

  ghost: `
    border-2 border-digital-white/30
    text-digital-white
    hover:border-kintsugi-gold hover:text-kintsugi-gold
    transition-all
  `,
};

// Message bubble variants
const messageBubbleVariants = {
  incoming: `
    border-3 border-kintsugi-gold
    bg-kintsugi-gold/5
    shadow-neo
  `,

  outgoing: `
    border-3 border-cyber-pink
    bg-cyber-pink/5
    shadow-neo-pink
  `,

  ai: `
    border-3 border-kintsugi-gold
    bg-gradient-to-br from-kintsugi-gold/5 to-transparent
    shadow-neo
  `,
};
```

---

## 📱 MOBILE GESTURES

### Swipe Actions

```typescript
// React Hook
const useSwipeable = (onSwipeLeft, onSwipeRight) => {
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;

    const swipeDistance = touchStartX.current - touchEndX.current;
    const threshold = 100;

    if (swipeDistance > threshold) {
      // Swipe left
      onSwipeLeft?.();
    } else if (swipeDistance < -threshold) {
      // Swipe right
      onSwipeRight?.();
    }
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
};

// Usage
<div {...useSwipeable(
  () => showActions(['Delete', 'Archive']),
  () => showActions(['Pin', 'Mute'])
)}>
  <MessageBubble />
</div>
```

---

## 🚀 НАСТУПНІ КРОКИ

### Сьогодні (Day 1):
1. **Setup Backend**
   ```bash
   cd backend
   go mod download
   cp .env.example .env
   # Заповнити OPENAI_API_KEY, DATABASE_URL
   go run cmd/api/main.go
   ```

2. **Імплементувати AUTH Module**
   - Код готовий в `docs/modules/AUTH.md`
   - Copy-paste + адаптація

3. **Database Migrations**
   - SQL готовий в `docs/ARCHITECTURE.md`
   - Створити `migrations/001_initial.sql`

### Завтра (Day 2):
1. **CHAT Module Backend**
   - models.go, service.go, handler.go
   - OpenAI streaming integration

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Design System Components**
   - Button, Input, Card (neo-brutalism)

### Далі (Days 3-7):
- MESSENGER Module backend
- WebSocket Hub
- Frontend AI Chat
- Frontend Messenger
- Mobile adaptation

---

## ✅ CHECKLIST

### Backend:
- [ ] AUTH працює (login, register, JWT)
- [ ] CHAT streaming працює
- [ ] MESSENGER WebSocket працює
- [ ] Database migrations виконані
- [ ] Redis налаштований

### Frontend:
- [ ] Design system components готові
- [ ] AI Chat UI працює
- [ ] Streaming відображається
- [ ] Messenger real-time працює
- [ ] Mobile responsive

### Testing:
- [ ] Desktop Chrome
- [ ] Mobile Safari
- [ ] Mobile Chrome
- [ ] Tablet iPad

---

**Готово до реалізації!** 🚀

**Версія**: 1.0.0
**Створено**: 2025-01-15
**Статус**: 📋 Specification Complete → 💻 Ready to Code
