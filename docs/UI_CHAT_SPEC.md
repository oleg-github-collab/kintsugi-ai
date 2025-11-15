# 🤖 AI CHAT - UI/UX СПЕЦИФІКАЦІЯ

## 🎯 ЗАГАЛЬНА КОНЦЕПЦІЯ

**AI Chat** - інтерфейс для спілкування з різними моделями OpenAI (GPT-4o, o1, o3-mini) в neo-brutalism стилі з акцентом на продуктивність і зручність для складних задач (кодинг, аналіз, креатив).

---

## 🆚 РІЗНИЦЯ МІЖ MESSENGER І AI CHAT

### Messenger:
- 👥 Спілкування з людьми
- 💬 Короткі повідомлення
- 📱 Більше на мобільних
- ⚡ Швидкість важлива
- 🎨 Casual, легкий

### AI Chat:
- 🤖 Спілкування з AI
- 📝 Довгі запити/відповіді
- 💻 Більше на desktop
- 🧠 Якість важливіша за швидкість
- 🎯 Професійний, продуктивний

---

## 📱 АДАПТАЦІЯ

### Desktop (1025px+) - ОСНОВНИЙ ФОКУС
- Повноекранний режим
- Split view (чати + розмова)
- Багато інструментів
- Keyboard shortcuts

### Tablet (641-1024px)
- Адаптивний layout
- Collapsible sidebar
- Touch + keyboard

### Mobile (до 640px)
- Simplified UI
- Essential features only
- Easy voice input
- Quick model switching

---

## 🏗️ СТРУКТУРА ЕКРАНІВ

### 1. CHATS LIST + CHAT WINDOW (Desktop)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ [☰] KINTSUGI AI          [⚡ gpt-4o ▾]    [New Chat +] [⚙️] [👤]          │ 80px header
├──────────────────┬─────────────────────────────────────────────────────────┤
│                  │ ┌─────────────────────────────────────────────────────┐ │
│  📝 CHATS        │ │ [💡] System Prompt: You are a helpful assistant   │ │ System prompt
│     280px        │ │ [Edit] [Clear]                                      │ │
│                  │ └─────────────────────────────────────────────────────┘ │
│  🔍 [Search...]  │                                                         │
│                  │                                                         │
│  [+] New Chat    │  ┌──────────────────────────────────────────────────┐  │
│                  │  │ 👤 YOU                              12:45 PM      │  │
│  ┌────────────┐  │  │ How to implement binary search in Python?        │  │
│  │ 🟢 Chat 1  │  │  │                                                  │  │
│  │ Binary s.. │  │  └──────────────────────────────────────────────────┘  │
│  │ 2 min ago  │  │                                                         │
│  └────────────┘  │  ┌──────────────────────────────────────────────────┐  │
│                  │  │ 🤖 GPT-4O                          12:45 PM       │  │
│  [Python help]   │  │ Here's a clean implementation...                 │  │ Messages
│  [Code review]   │  │                                                  │  │
│  [Creative...]   │  │ ```python                                        │  │
│  ...             │  │ def binary_search(arr, target):                  │  │
│                  │  │     left, right = 0, len(arr) - 1                │  │
│                  │  │     ...                                          │  │
│  📊 STATS        │  │ ```                                              │  │
│  ┌────────────┐  │  │                                                  │  │
│  │ Tokens:    │  │  │ [📋 Copy] [🔄 Regenerate] [✏️ Edit]            │  │
│  │ 1,250/500k │  │  └──────────────────────────────────────────────────┘  │
│  │ ████░░░░░  │  │                                                         │
│  └────────────┘  │  ┌──────────────────────────────────────────────────┐  │
│                  │  │ 👤 YOU                              12:46 PM      │  │
│  Reset: 5h 30m   │  │ Can you add error handling?                      │  │
│                  │  └──────────────────────────────────────────────────┘  │
│                  │                                                         │
│                  │  [AI is typing... ▓▓▓]                                 │
│                  │                                                         │
├──────────────────┼─────────────────────────────────────────────────────────┤
│                  │ [📎] [📷] [🎤] [Type your message...        ] [SEND ▶] │ Input
│                  │ [⌨️ Shortcuts] [Shift+Enter: New line] [Ctrl+K: Clear] │
└──────────────────┴─────────────────────────────────────────────────────────┘
```

### 2. MOBILE LAYOUT

```
┌──────────────────────┐
│ KINTSUGI [⚙️] [+]   │ 60px header
│ [gpt-4o ▾]  50k/500k│
├──────────────────────┤
│                      │
│ ┌──────────────────┐ │ Message (user)
│ │ 👤 YOU           │ │
│ │ How to implem... │ │
│ │ 12:45 PM         │ │
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │ Message (AI)
│ │ 🤖 GPT-4O        │ │ Streaming...
│ │ Here's a clean   │ │
│ │ implementation.  │ │
│ │                  │ │
│ │ ```python        │ │ Code block
│ │ def binary...    │ │ (horizontal scroll)
│ │ ```              │ │
│ │                  │ │
│ │ [Copy] [Regen]   │ │
│ │ 12:45 PM         │ │
│ └──────────────────┘ │
│                      │
│ [AI typing... ▓]     │
│                      │
├──────────────────────┤
│[📎][Type...  ][🎤][▶]│ 60px input
├──────────────────────┤
│ [💬][🤖][📞][⚙️]   │ 60px nav
└──────────────────────┘
```

---

## 🎨 КОМПОНЕНТИ ДЕТАЛЬНО

### ChatSidebar (Список чатів)

```tsx
const ChatSidebar = () => {
  return (
    <div className="w-[280px] border-r-3 border-digital-white bg-digital-black flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b-3 border-digital-white">
        <h2 className="text-xl font-bold uppercase font-mono text-kintsugi-gold mb-4">
          📝 AI CHATS
        </h2>

        {/* Search */}
        <input
          type="text"
          placeholder="SEARCH CHATS..."
          className="
            w-full
            bg-digital-black
            border-2 border-digital-white
            focus:border-kintsugi-gold
            p-2
            text-sm
            font-mono
            uppercase
            placeholder-digital-white/30
          "
        />
      </div>

      {/* New Chat Button */}
      <button className="
        m-4
        p-3
        border-3 border-kintsugi-gold
        bg-kintsugi-gold
        text-digital-black
        font-bold
        uppercase
        shadow-neo
        hover:shadow-none hover:translate-x-1 hover:translate-y-1
        transition-all
      ">
        + NEW CHAT
      </button>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto">
        {chats.map(chat => (
          <ChatCard
            key={chat.id}
            chat={chat}
            isActive={chat.id === activeChat}
            onClick={() => selectChat(chat.id)}
          />
        ))}
      </div>

      {/* Stats Footer */}
      <div className="p-4 border-t-3 border-digital-white bg-digital-black/50">
        <div className="mb-3">
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-digital-white/60">TOKENS USED</span>
            <span className="text-cyber-cyan font-bold">
              {formatNumber(tokensUsed)}/{formatNumber(tokensLimit)}
            </span>
          </div>
          <div className="h-2 bg-digital-black border-2 border-digital-white">
            <div
              className="h-full bg-cyber-cyan"
              style={{ width: `${(tokensUsed / tokensLimit) * 100}%` }}
            />
          </div>
        </div>

        <div className="text-xs text-digital-white/50 font-mono">
          Reset in: {timeUntilReset}
        </div>
      </div>
    </div>
  );
};
```

### ChatCard (Картка чату)

```tsx
const ChatCard = ({ chat, isActive, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        p-3 mx-2 mb-2
        border-2
        cursor-pointer
        transition-all
        font-mono
        ${isActive
          ? 'border-kintsugi-gold bg-kintsugi-gold/10 shadow-neo'
          : 'border-digital-white/30 hover:border-kintsugi-gold/50'
        }
      `}
    >
      {/* Status indicator */}
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${
          chat.status === 'active' ? 'bg-matrix-green animate-pulse' :
          chat.status === 'error' ? 'bg-neon-orange' :
          'bg-digital-white/30'
        }`} />
        <span className="text-xs text-digital-white/60 uppercase">
          {chat.model}
        </span>
      </div>

      {/* Title */}
      <h3 className="
        font-bold
        text-sm
        uppercase
        text-digital-white
        truncate
        mb-1
      ">
        {chat.title || 'New Chat'}
      </h3>

      {/* Preview */}
      <p className="text-xs text-digital-white/60 truncate">
        {chat.lastMessage?.content || 'No messages yet'}
      </p>

      {/* Metadata */}
      <div className="flex justify-between items-center mt-2 text-xs">
        <span className="text-digital-white/40">
          {chat.messageCount} msgs
        </span>
        <span className="text-digital-white/40">
          {formatRelativeTime(chat.updatedAt)}
        </span>
      </div>
    </div>
  );
};
```

---

### ChatHeader (Хедер чату)

```tsx
const ChatHeader = () => {
  return (
    <div className="h-20 border-b-3 border-digital-white bg-digital-black px-6 flex items-center justify-between">
      {/* Left: Model Selector */}
      <div className="flex items-center gap-4">
        <ModelSelector
          value={selectedModel}
          onChange={setSelectedModel}
        />

        {/* Token Counter (compact) */}
        <div className="text-xs font-mono">
          <span className="text-digital-white/60">Tokens:</span>
          <span className="ml-1 text-cyber-cyan font-bold">
            {formatNumber(tokensUsed)}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Export */}
        <button className="
          px-3 py-2
          border-2 border-cyber-cyan
          text-cyber-cyan
          text-sm
          uppercase
          font-bold
          hover:bg-cyber-cyan hover:text-digital-black
          transition-all
        ">
          Export
        </button>

        {/* Share */}
        <button className="
          px-3 py-2
          border-2 border-cyber-pink
          text-cyber-pink
          text-sm
          uppercase
          font-bold
          hover:bg-cyber-pink hover:text-digital-black
          transition-all
        ">
          Share
        </button>

        {/* Settings */}
        <button className="
          w-10 h-10
          border-2 border-digital-white
          text-digital-white
          hover:border-kintsugi-gold hover:text-kintsugi-gold
          transition-all
          text-lg
        ">
          ⚙️
        </button>
      </div>
    </div>
  );
};
```

### ModelSelector (Вибір моделі)

```tsx
const ModelSelector = ({ value, onChange }) => {
  const models = [
    { id: 'gpt-4o', name: 'GPT-4O', icon: '⚡', tier: 'free', speed: 'fast' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', icon: '🚀', tier: 'pro', speed: 'fast' },
    { id: 'o1', name: 'O1', icon: '🧠', tier: 'pro', speed: 'slow', reasoning: true },
    { id: 'o3-mini', name: 'O3-mini', icon: '💎', tier: 'ultra', speed: 'medium' },
  ];

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="
        flex items-center gap-3
        px-4 py-2
        border-3 border-kintsugi-gold
        bg-digital-black
        hover:bg-kintsugi-gold hover:text-digital-black
        transition-all
        shadow-neo
      ">
        <span className="text-xl">{models.find(m => m.id === value)?.icon}</span>
        <div className="text-left">
          <div className="font-bold uppercase text-sm">
            {models.find(m => m.id === value)?.name}
          </div>
          <div className="text-xs text-digital-white/60">
            {models.find(m => m.id === value)?.speed} • {models.find(m => m.id === value)?.tier}
          </div>
        </div>
        <span className="ml-2">▾</span>
      </Menu.Button>

      <Menu.Items className="
        absolute top-full left-0 mt-2
        w-80
        bg-digital-black
        border-3 border-kintsugi-gold
        shadow-neo
        z-50
      ">
        {models.map(model => (
          <Menu.Item key={model.id}>
            {({ active }) => (
              <button
                onClick={() => onChange(model.id)}
                className={`
                  w-full px-4 py-3
                  flex items-center gap-3
                  border-b-2 border-digital-white/20
                  last:border-b-0
                  ${active ? 'bg-kintsugi-gold/10' : ''}
                  ${value === model.id ? 'bg-kintsugi-gold/20 border-l-4 border-l-kintsugi-gold' : ''}
                  transition-colors
                `}
              >
                <span className="text-2xl">{model.icon}</span>

                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase text-sm">
                      {model.name}
                    </span>

                    {/* Tier badge */}
                    <span className={`
                      px-2 py-0.5
                      text-xs
                      font-bold
                      uppercase
                      border-2
                      ${model.tier === 'free' ? 'border-matrix-green text-matrix-green' :
                        model.tier === 'pro' ? 'border-cyber-cyan text-cyber-cyan' :
                        'border-electric-purple text-electric-purple'}
                    `}>
                      {model.tier}
                    </span>
                  </div>

                  {/* Features */}
                  <div className="flex gap-2 mt-1 text-xs text-digital-white/60">
                    <span>{model.speed} speed</span>
                    {model.reasoning && <span>• reasoning</span>}
                  </div>
                </div>

                {value === model.id && (
                  <span className="text-kintsugi-gold">✓</span>
                )}
              </button>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>
  );
};
```

---

### SystemPromptEditor (Редактор system prompt)

```tsx
const SystemPromptEditor = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [prompt, setPrompt] = useState(defaultSystemPrompt);

  const presets = [
    { name: 'Default', prompt: 'You are a helpful assistant.' },
    { name: 'Code Expert', prompt: 'You are an expert programmer...' },
    { name: 'Creative Writer', prompt: 'You are a creative writing assistant...' },
    { name: 'Data Analyst', prompt: 'You are a data analysis expert...' },
  ];

  return (
    <div className="p-4 border-b-3 border-digital-white/30 bg-gradient-to-r from-electric-purple/5 to-transparent">
      <div className="flex items-start gap-3">
        <span className="text-2xl">💡</span>

        <div className="flex-1">
          {isEditing ? (
            <>
              {/* Textarea */}
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="
                  w-full
                  min-h-[100px]
                  bg-digital-black
                  border-2 border-electric-purple
                  p-3
                  text-sm
                  font-mono
                  text-digital-white
                  resize-none
                "
                placeholder="Enter system prompt..."
              />

              {/* Presets */}
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className="text-xs text-digital-white/60 font-mono">PRESETS:</span>
                {presets.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => setPrompt(preset.prompt)}
                    className="
                      px-2 py-1
                      border-2 border-electric-purple/50
                      text-electric-purple
                      text-xs
                      uppercase
                      font-bold
                      hover:bg-electric-purple hover:text-digital-black
                      transition-all
                    "
                  >
                    {preset.name}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    savePrompt(prompt);
                    setIsEditing(false);
                  }}
                  className="
                    px-4 py-2
                    bg-kintsugi-gold
                    border-2 border-kintsugi-gold
                    text-digital-black
                    text-sm
                    uppercase
                    font-bold
                    shadow-neo
                  "
                >
                  Save
                </button>

                <button
                  onClick={() => setIsEditing(false)}
                  className="
                    px-4 py-2
                    border-2 border-digital-white
                    text-digital-white
                    text-sm
                    uppercase
                    font-bold
                  "
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Display mode */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-electric-purple font-bold uppercase mb-1">
                    System Prompt:
                  </div>
                  <p className="text-sm text-digital-white/80 font-mono">
                    {prompt || 'No system prompt set'}
                  </p>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="
                    px-3 py-1
                    border-2 border-electric-purple
                    text-electric-purple
                    text-xs
                    uppercase
                    font-bold
                    hover:bg-electric-purple hover:text-digital-black
                  "
                >
                  Edit
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
```

---

### ChatMessage (Повідомлення в AI чаті)

#### User Message:
```tsx
const UserMessage = ({ message }) => {
  return (
    <div className="flex justify-end mb-6 group">
      <div className="max-w-[85%] relative">
        {/* Message bubble */}
        <div className="
          border-3 border-cyber-pink
          bg-cyber-pink/5
          p-4
          shadow-neo-pink
          relative
        ">
          {/* Attachments preview */}
          {message.attachments?.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {message.attachments.map(file => (
                <AttachmentPreview key={file.id} file={file} />
              ))}
            </div>
          )}

          {/* Content */}
          <div className="text-digital-white font-mono whitespace-pre-wrap">
            {message.content}
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-end gap-2 mt-2">
            <span className="text-xs text-digital-white/40">
              {formatTime(message.createdAt)}
            </span>

            {/* Edit indicator */}
            {message.isEdited && (
              <span className="text-xs text-digital-white/30 italic">
                edited
              </span>
            )}
          </div>

          {/* Actions (show on hover) */}
          <div className="
            absolute -left-12 top-2
            opacity-0 group-hover:opacity-100
            transition-opacity
            flex flex-col gap-1
          ">
            <button
              onClick={() => editMessage(message)}
              className="
                w-9 h-9
                border-2 border-cyber-cyan
                bg-digital-black
                text-cyber-cyan
                hover:bg-cyber-cyan hover:text-digital-black
                text-sm
              "
              title="Edit"
            >
              ✏️
            </button>

            <button
              onClick={() => deleteMessage(message)}
              className="
                w-9 h-9
                border-2 border-neon-orange
                bg-digital-black
                text-neon-orange
                hover:bg-neon-orange hover:text-digital-black
                text-sm
              "
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

#### AI Message (з streaming):
```tsx
const AIMessage = ({ message, isStreaming }) => {
  return (
    <div className="flex justify-start mb-6 group">
      <div className="max-w-[90%] relative">
        {/* Model badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{getModelIcon(message.model)}</span>
          <span className="text-xs font-mono font-bold uppercase text-kintsugi-gold">
            {message.model}
          </span>
          {isStreaming && (
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-kintsugi-gold rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
              <div className="w-1 h-1 bg-kintsugi-gold rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
              <div className="w-1 h-1 bg-kintsugi-gold rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
            </div>
          )}
        </div>

        {/* Message bubble */}
        <div className="
          border-3 border-kintsugi-gold
          bg-kintsugi-gold/5
          p-5
          shadow-neo
          relative
        ">
          {/* Content (Markdown support) */}
          <div className="prose prose-invert max-w-none">
            <MarkdownRenderer content={message.content} />
          </div>

          {/* Streaming cursor */}
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-kintsugi-gold ml-1 animate-blink" />
          )}

          {/* Metadata */}
          <div className="flex items-center gap-3 mt-4 pt-3 border-t-2 border-kintsugi-gold/20">
            <span className="text-xs text-digital-white/40 font-mono">
              {formatTime(message.createdAt)}
            </span>

            {/* Token count */}
            {message.tokensUsed && (
              <span className="text-xs text-cyber-cyan font-mono">
                {formatNumber(message.tokensUsed)} tokens
              </span>
            )}

            {/* Generation time */}
            {message.generationTime && (
              <span className="text-xs text-digital-white/40 font-mono">
                {message.generationTime}s
              </span>
            )}
          </div>

          {/* Actions */}
          {!isStreaming && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => copyToClipboard(message.content)}
                className="
                  px-3 py-1.5
                  border-2 border-cyber-cyan
                  text-cyber-cyan
                  text-xs
                  uppercase
                  font-bold
                  hover:bg-cyber-cyan hover:text-digital-black
                  transition-all
                "
              >
                📋 Copy
              </button>

              <button
                onClick={() => regenerateResponse(message)}
                className="
                  px-3 py-1.5
                  border-2 border-electric-purple
                  text-electric-purple
                  text-xs
                  uppercase
                  font-bold
                  hover:bg-electric-purple hover:text-digital-black
                  transition-all
                "
              >
                🔄 Regenerate
              </button>

              {/* Edit (для AI відповіді - змінити промпт і перегенерувати) */}
              <button
                onClick={() => editAndRegenerate(message)}
                className="
                  px-3 py-1.5
                  border-2 border-neon-orange
                  text-neon-orange
                  text-xs
                  uppercase
                  font-bold
                  hover:bg-neon-orange hover:text-digital-black
                  transition-all
                "
              >
                ✏️ Edit & Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

---

### MarkdownRenderer (Рендер відповіді з кодом)

```tsx
const MarkdownRenderer = ({ content }) => {
  return (
    <ReactMarkdown
      components={{
        // Code blocks
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';

          return !inline ? (
            <CodeBlock
              language={language}
              value={String(children).replace(/\n$/, '')}
              {...props}
            />
          ) : (
            <code
              className="
                px-1.5 py-0.5
                bg-digital-black
                border border-kintsugi-gold
                text-kintsugi-gold
                font-mono
                text-sm
              "
              {...props}
            >
              {children}
            </code>
          );
        },

        // Links
        a({ children, href, ...props }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="
                text-cyber-cyan
                underline
                hover:text-kintsugi-gold
                transition-colors
              "
              {...props}
            >
              {children}
            </a>
          );
        },

        // Lists
        ul({ children, ...props }) {
          return (
            <ul className="list-disc list-inside space-y-1 my-2" {...props}>
              {children}
            </ul>
          );
        },

        // Tables
        table({ children, ...props }) {
          return (
            <div className="overflow-x-auto my-4">
              <table className="border-2 border-digital-white w-full" {...props}>
                {children}
              </table>
            </div>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
```

### CodeBlock (Блок коду з підсвіткою)

```tsx
const CodeBlock = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 relative group">
      {/* Header */}
      <div className="
        flex items-center justify-between
        px-4 py-2
        bg-digital-black
        border-3 border-t-3 border-l-3 border-r-3 border-kintsugi-gold
      ">
        <span className="text-xs font-mono font-bold uppercase text-kintsugi-gold">
          {language || 'code'}
        </span>

        <button
          onClick={copyCode}
          className="
            px-3 py-1
            border-2 border-cyber-cyan
            bg-digital-black
            text-cyber-cyan
            text-xs
            uppercase
            font-bold
            opacity-0 group-hover:opacity-100
            transition-opacity
            hover:bg-cyber-cyan hover:text-digital-black
          "
        >
          {copied ? '✓ Copied' : '📋 Copy'}
        </button>
      </div>

      {/* Code */}
      <SyntaxHighlighter
        language={language}
        style={nightOwl} // or custom neo-brutalism theme
        customStyle={{
          margin: 0,
          border: '3px solid #F0FF00',
          borderTop: 'none',
          padding: '1rem',
          fontSize: '0.875rem',
          fontFamily: '"Courier New", monospace',
        }}
        showLineNumbers={value.split('\n').length > 10}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};
```

---

### ChatInput (Поле вводу для AI)

```tsx
const ChatInput = () => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const textareaRef = useRef(null);

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return;

    await sendMessage({
      content: message,
      attachments,
      model: selectedModel,
    });

    setMessage('');
    setAttachments([]);
  };

  const handleKeyDown = (e) => {
    // Ctrl/Cmd + Enter to send
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }

    // Ctrl/Cmd + K to clear
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setMessage('');
    }
  };

  const handlePaste = async (e) => {
    const items = e.clipboardData.items;

    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        setAttachments(prev => [...prev, file]);
      }
    }
  };

  return (
    <div className="border-t-3 border-digital-white bg-digital-black">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="p-3 border-b-2 border-digital-white/20 flex gap-2 flex-wrap">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="
                relative
                border-2 border-cyber-cyan
                p-2
                flex items-center gap-2
                bg-cyber-cyan/5
              "
            >
              <span className="text-sm font-mono">
                {file.type.startsWith('image/') ? '🖼️' : '📄'} {file.name}
              </span>

              <button
                onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                className="text-neon-orange hover:text-digital-white"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-end gap-3">
          {/* Attachment button */}
          <label className="
            w-12 h-12
            border-3 border-cyber-cyan
            flex items-center justify-center
            cursor-pointer
            hover:bg-cyber-cyan hover:text-digital-black
            transition-all
            text-xl
            flex-shrink-0
          ">
            📎
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.txt,.doc,.docx"
              onChange={(e) => setAttachments(prev => [...prev, ...Array.from(e.target.files)])}
              className="hidden"
            />
          </label>

          {/* Camera (mobile) */}
          <label className="
            w-12 h-12
            border-3 border-electric-purple
            flex items-center justify-center
            cursor-pointer
            hover:bg-electric-purple hover:text-digital-black
            transition-all
            text-xl
            flex-shrink-0
            md:hidden
          ">
            📷
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setAttachments(prev => [...prev, ...Array.from(e.target.files)])}
              className="hidden"
            />
          </label>

          {/* Textarea */}
          <div className="flex-1 relative">
            <TextareaAutosize
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="TYPE YOUR MESSAGE... (Ctrl+Enter to send)"
              className="
                w-full
                bg-digital-black
                border-3 border-digital-white
                focus:border-kintsugi-gold
                p-4
                pr-12
                text-digital-white
                font-mono
                placeholder-digital-white/30
                resize-none
                max-h-[300px]
                transition-colors
              "
              minRows={1}
              maxRows={10}
            />

            {/* Character count (for long messages) */}
            {message.length > 1000 && (
              <div className="absolute bottom-2 right-2 text-xs text-digital-white/40 font-mono">
                {message.length}
              </div>
            )}
          </div>

          {/* Voice input */}
          <button
            onClick={() => setIsVoiceMode(true)}
            className="
              w-12 h-12
              border-3 border-neon-orange
              text-neon-orange
              hover:bg-neon-orange hover:text-digital-black
              transition-all
              text-xl
              flex-shrink-0
            "
          >
            🎤
          </button>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!message.trim() && attachments.length === 0}
            className="
              w-12 h-12
              border-3 border-kintsugi-gold
              bg-kintsugi-gold
              text-digital-black
              font-bold
              text-xl
              shadow-neo
              hover:shadow-none hover:translate-x-1 hover:translate-y-1
              transition-all
              disabled:opacity-30 disabled:cursor-not-allowed
              flex-shrink-0
            "
          >
            ▶
          </button>
        </div>

        {/* Shortcuts hint */}
        <div className="mt-2 flex items-center gap-4 text-xs text-digital-white/40 font-mono">
          <span>⌨️ Shortcuts:</span>
          <span>Ctrl+Enter: Send</span>
          <span>Ctrl+K: Clear</span>
          <span>Shift+Enter: New line</span>
        </div>
      </div>
    </div>
  );
};
```

---

## 🎛️ ДОДАТКОВІ ФІЧІ

### 1. Chat Settings Modal

```tsx
const ChatSettingsModal = () => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="
        w-full max-w-2xl
        bg-digital-black
        border-3 border-kintsugi-gold
        shadow-neo
        p-6
      ">
        <h2 className="text-2xl font-bold uppercase font-mono text-kintsugi-gold mb-6">
          ⚙️ Chat Settings
        </h2>

        {/* Temperature */}
        <div className="mb-6">
          <label className="block text-sm font-mono font-bold uppercase mb-2">
            Temperature: {temperature}
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-digital-white/60 mt-1">
            <span>Precise</span>
            <span>Balanced</span>
            <span>Creative</span>
          </div>
        </div>

        {/* Max tokens */}
        <div className="mb-6">
          <label className="block text-sm font-mono font-bold uppercase mb-2">
            Max Tokens: {maxTokens}
          </label>
          <input
            type="number"
            value={maxTokens}
            onChange={(e) => setMaxTokens(e.target.value)}
            className="
              w-full
              bg-digital-black
              border-2 border-digital-white
              p-2
              text-digital-white
              font-mono
            "
          />
        </div>

        {/* Top P */}
        <div className="mb-6">
          <label className="block text-sm font-mono font-bold uppercase mb-2">
            Top P: {topP}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={topP}
            onChange={(e) => setTopP(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Save */}
        <div className="flex gap-3">
          <button
            onClick={saveSettings}
            className="
              flex-1
              py-3
              bg-kintsugi-gold
              border-3 border-kintsugi-gold
              text-digital-black
              font-bold
              uppercase
              shadow-neo
            "
          >
            Save
          </button>

          <button
            onClick={onClose}
            className="
              flex-1
              py-3
              border-3 border-digital-white
              text-digital-white
              font-bold
              uppercase
            "
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};
```

### 2. Export Chat Modal

```tsx
const ExportChatModal = () => {
  const exportFormats = [
    { id: 'markdown', name: 'Markdown', icon: '📝', extension: '.md' },
    { id: 'json', name: 'JSON', icon: '📊', extension: '.json' },
    { id: 'pdf', name: 'PDF', icon: '📄', extension: '.pdf' },
    { id: 'html', name: 'HTML', icon: '🌐', extension: '.html' },
  ];

  return (
    <Modal>
      <div className="w-full max-w-lg bg-digital-black border-3 border-cyber-cyan shadow-neo-cyan p-6">
        <h2 className="text-2xl font-bold uppercase mb-6 text-cyber-cyan">
          Export Chat
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {exportFormats.map(format => (
            <button
              key={format.id}
              onClick={() => exportChat(format.id)}
              className="
                p-4
                border-3 border-cyber-cyan
                hover:bg-cyber-cyan hover:text-digital-black
                transition-all
                text-left
              "
            >
              <div className="text-3xl mb-2">{format.icon}</div>
              <div className="font-bold uppercase text-sm">{format.name}</div>
              <div className="text-xs text-digital-white/60">{format.extension}</div>
            </button>
          ))}
        </div>

        {/* Options */}
        <div className="mb-6 space-y-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked />
            <span className="text-sm font-mono">Include timestamps</span>
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked />
            <span className="text-sm font-mono">Include system prompts</span>
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            <span className="text-sm font-mono">Include metadata</span>
          </label>
        </div>
      </div>
    </Modal>
  );
};
```

---

## 📱 MOBILE СПЕЦИФІКАЦІЯ ДЕТАЛЬНО

### Mobile Chat List

```tsx
const MobileChatList = () => {
  return (
    <div className="h-screen flex flex-col bg-digital-black">
      {/* Header */}
      <div className="h-14 border-b-2 border-digital-white px-4 flex items-center justify-between flex-shrink-0">
        <h1 className="font-bold uppercase text-lg text-kintsugi-gold">AI CHATS</h1>

        <div className="flex gap-2">
          <button className="w-9 h-9 border-2 border-digital-white text-lg">
            🔍
          </button>
          <button className="w-9 h-9 bg-kintsugi-gold border-2 border-kintsugi-gold text-lg">
            +
          </button>
        </div>
      </div>

      {/* Model selector (sticky) */}
      <div className="p-3 border-b-2 border-digital-white/30 bg-digital-black/50 backdrop-blur flex-shrink-0">
        <select className="
          w-full
          bg-digital-black
          border-2 border-kintsugi-gold
          p-2
          text-sm
          font-mono
          uppercase
          font-bold
        ">
          <option>⚡ GPT-4O</option>
          <option>🚀 GPT-4 Turbo</option>
          <option>🧠 O1</option>
          <option>💎 O3-mini</option>
        </select>
      </div>

      {/* Chats list (scrollable) */}
      <div className="flex-1 overflow-y-auto">
        {chats.map(chat => (
          <MobileChatCard key={chat.id} chat={chat} />
        ))}
      </div>

      {/* Bottom nav */}
      <div className="h-14 border-t-2 border-digital-white flex items-center justify-around flex-shrink-0 bg-digital-black">
        <button className="flex flex-col items-center text-digital-white/60">
          <span className="text-xl">💬</span>
          <span className="text-xs font-mono">Msgs</span>
        </button>

        <button className="flex flex-col items-center text-kintsugi-gold">
          <span className="text-xl">🤖</span>
          <span className="text-xs font-mono">AI</span>
        </button>

        <button className="flex flex-col items-center text-digital-white/60">
          <span className="text-xl">📞</span>
          <span className="text-xs font-mono">Calls</span>
        </button>

        <button className="flex flex-col items-center text-digital-white/60">
          <span className="text-xl">⚙️</span>
          <span className="text-xs font-mono">Settings</span>
        </button>
      </div>
    </div>
  );
};
```

### Mobile Chat Window

```tsx
const MobileChatWindow = () => {
  return (
    <div className="h-screen flex flex-col bg-digital-black">
      {/* Header */}
      <div className="h-14 border-b-2 border-digital-white px-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={goBack} className="text-xl">
          ←
        </button>

        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm uppercase truncate">
            {chatTitle}
          </div>
          <div className="text-xs text-digital-white/60">
            {selectedModel}
          </div>
        </div>

        <button className="w-9 h-9 border-2 border-digital-white text-lg">
          ⋮
        </button>
      </div>

      {/* System prompt (collapsible) */}
      {showSystemPrompt && (
        <div className="p-3 bg-electric-purple/5 border-b-2 border-electric-purple/30 text-xs font-mono">
          <div className="flex items-start gap-2">
            <span>💡</span>
            <div className="flex-1">{systemPrompt}</div>
            <button onClick={() => setShowSystemPrompt(false)}>✕</button>
          </div>
        </div>
      )}

      {/* Messages (scrollable) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {messages.map(msg => (
          <MobileMessage key={msg.id} message={msg} />
        ))}

        {isGenerating && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t-2 border-digital-white p-3 flex-shrink-0 safe-area-inset-bottom">
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 border-2 border-cyber-cyan text-lg">
            +
          </button>

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type..."
            className="
              flex-1
              bg-digital-black
              border-2 border-digital-white
              focus:border-kintsugi-gold
              p-2
              text-sm
              font-mono
            "
          />

          <button
            onClick={toggleVoice}
            className="w-9 h-9 border-2 border-neon-orange text-neon-orange text-lg"
          >
            🎤
          </button>

          <button
            onClick={sendMessage}
            disabled={!message.trim()}
            className="
              w-9 h-9
              bg-kintsugi-gold
              border-2 border-kintsugi-gold
              text-digital-black
              font-bold
              disabled:opacity-30
            "
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
};
```

### Mobile Message Component

```tsx
const MobileMessage = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Model badge (AI only) */}
        {!isUser && (
          <div className="flex items-center gap-1 mb-1">
            <span className="text-sm">{getModelIcon(message.model)}</span>
            <span className="text-xs font-mono font-bold uppercase text-kintsugi-gold">
              {message.model}
            </span>
          </div>
        )}

        {/* Bubble */}
        <div className={`
          border-2 p-3
          ${isUser
            ? 'border-cyber-pink bg-cyber-pink/5'
            : 'border-kintsugi-gold bg-kintsugi-gold/5'
          }
        `}>
          {/* Content */}
          <div className="text-sm font-mono whitespace-pre-wrap break-words">
            {isUser ? (
              message.content
            ) : (
              <MarkdownRenderer content={message.content} />
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-2 mt-2 text-xs text-digital-white/40">
            <span>{formatTime(message.createdAt)}</span>
            {message.tokensUsed && (
              <span className="text-cyber-cyan">• {formatNumber(message.tokensUsed)}t</span>
            )}
          </div>
        </div>

        {/* Actions (AI messages) */}
        {!isUser && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => copyToClipboard(message.content)}
              className="text-xs px-2 py-1 border border-cyber-cyan text-cyber-cyan"
            >
              Copy
            </button>

            <button
              onClick={() => regenerate(message)}
              className="text-xs px-2 py-1 border border-electric-purple text-electric-purple"
            >
              Regen
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## 🎮 INTERACTIONS & GESTURES

### Voice Input (Mobile)

```tsx
const VoiceInputModal = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');

  return (
    <div className="fixed inset-0 bg-digital-black z-50 flex flex-col items-center justify-center p-6">
      {/* Waveform */}
      <div className="mb-8">
        {isRecording ? (
          <div className="flex items-center gap-2">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-kintsugi-gold"
                style={{
                  height: `${Math.random() * 60 + 20}px`,
                  animation: 'pulse 0.5s infinite',
                  animationDelay: `${i * 0.05}s`
                }}
              />
            ))}
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full border-4 border-neon-orange flex items-center justify-center text-4xl">
            🎤
          </div>
        )}
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="
          w-full max-w-md
          p-4
          border-2 border-kintsugi-gold
          bg-kintsugi-gold/5
          mb-8
          text-sm
          font-mono
        ">
          {transcript}
        </div>
      )}

      {/* Timer */}
      <div className="text-3xl font-mono text-kintsugi-gold mb-8">
        {formatTime(duration)}
      </div>

      {/* Controls */}
      <div className="flex gap-6">
        {/* Cancel */}
        <button
          onClick={cancel}
          className="
            w-16 h-16
            border-3 border-neon-orange
            text-neon-orange
            text-xl
          "
        >
          ✕
        </button>

        {/* Pause/Resume */}
        <button
          onClick={togglePause}
          className="
            w-16 h-16
            border-3 border-cyber-cyan
            text-cyber-cyan
            text-xl
          "
        >
          {isPaused ? '▶' : '⏸'}
        </button>

        {/* Send */}
        <button
          onClick={sendVoiceMessage}
          className="
            w-16 h-16
            bg-kintsugi-gold
            border-3 border-kintsugi-gold
            text-digital-black
            text-xl
          "
        >
          ✓
        </button>
      </div>

      {/* Hint */}
      <div className="mt-8 text-xs text-digital-white/50 font-mono text-center">
        Tap anywhere to stop
        <br />
        Swipe down to cancel
      </div>
    </div>
  );
};
```

### Long-press Context Menu (Mobile)

```tsx
const MessageContextMenu = ({ message, position, onClose }) => {
  const actions = [
    { icon: '📋', label: 'Copy', action: () => copy(message) },
    { icon: '🔄', label: 'Regenerate', action: () => regenerate(message), aiOnly: true },
    { icon: '✏️', label: 'Edit', action: () => edit(message), userOnly: true },
    { icon: '🗑️', label: 'Delete', action: () => deleteMsg(message), danger: true },
  ];

  return (
    <div
      className="
        fixed
        bg-digital-black
        border-3 border-kintsugi-gold
        shadow-neo
        z-50
        min-w-[200px]
      "
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      {actions.map(action => {
        if (action.aiOnly && message.role === 'user') return null;
        if (action.userOnly && message.role === 'assistant') return null;

        return (
          <button
            key={action.label}
            onClick={() => {
              action.action();
              onClose();
            }}
            className={`
              w-full
              px-4 py-3
              flex items-center gap-3
              border-b-2 border-digital-white/20
              last:border-b-0
              hover:bg-kintsugi-gold/10
              transition-colors
              text-left
              ${action.danger ? 'text-neon-orange' : ''}
            `}
          >
            <span className="text-xl">{action.icon}</span>
            <span className="font-mono font-bold uppercase text-sm">
              {action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
```

---

## 🎨 ADVANCED FEATURES

### 1. Streaming Animation

```tsx
const StreamingText = ({ content, isComplete }) => {
  const [displayedContent, setDisplayedContent] = useState('');

  useEffect(() => {
    if (isComplete) {
      setDisplayedContent(content);
      return;
    }

    // Simulate typing effect
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < content.length) {
        setDisplayedContent(content.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 20); // 20ms per character

    return () => clearInterval(interval);
  }, [content, isComplete]);

  return (
    <div className="relative">
      {displayedContent}
      {!isComplete && (
        <span className="inline-block w-2 h-4 bg-kintsugi-gold ml-1 animate-blink" />
      )}
    </div>
  );
};
```

### 2. Token Usage Visualization

```tsx
const TokenUsageBar = ({ used, limit, resetTime }) => {
  const percentage = (used / limit) * 100;
  const isNearLimit = percentage > 80;

  return (
    <div className="p-4 bg-digital-black/50 border-2 border-digital-white/30">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-mono text-digital-white/60">
          TOKEN USAGE
        </span>
        <span className={`text-xs font-mono font-bold ${
          isNearLimit ? 'text-neon-orange' : 'text-cyber-cyan'
        }`}>
          {formatNumber(used)} / {formatNumber(limit)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-digital-black border-2 border-digital-white relative overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isNearLimit ? 'bg-neon-orange' : 'bg-cyber-cyan'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />

        {/* Animated stripes */}
        {isNearLimit && (
          <div className="
            absolute inset-0
            bg-gradient-to-r from-transparent via-digital-white/20 to-transparent
            animate-[shimmer_2s_infinite]
          " />
        )}
      </div>

      {/* Reset timer */}
      <div className="flex justify-between items-center mt-2 text-xs text-digital-white/40 font-mono">
        <span>Resets in:</span>
        <span className="font-bold">{formatDuration(resetTime)}</span>
      </div>

      {/* Warning */}
      {isNearLimit && (
        <div className="mt-2 p-2 border-2 border-neon-orange bg-neon-orange/10 text-xs font-mono">
          ⚠️ Approaching limit. Consider upgrading your plan.
        </div>
      )}
    </div>
  );
};
```

### 3. Code Execution (Future Feature)

```tsx
const CodeExecutionBlock = ({ code, language }) => {
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const runCode = async () => {
    setIsRunning(true);

    try {
      const result = await executeCode(code, language);
      setOutput(result);
    } catch (error) {
      setOutput({ error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="my-4">
      {/* Code block */}
      <CodeBlock language={language} value={code} />

      {/* Run button */}
      <button
        onClick={runCode}
        disabled={isRunning}
        className="
          mt-2
          px-4 py-2
          border-2 border-matrix-green
          text-matrix-green
          font-mono
          font-bold
          uppercase
          text-sm
          hover:bg-matrix-green hover:text-digital-black
          transition-all
          disabled:opacity-50
        "
      >
        {isRunning ? '⏳ Running...' : '▶ Run Code'}
      </button>

      {/* Output */}
      {output && (
        <div className={`
          mt-2
          p-4
          border-2
          font-mono
          text-sm
          ${output.error
            ? 'border-neon-orange bg-neon-orange/5 text-neon-orange'
            : 'border-matrix-green bg-matrix-green/5 text-matrix-green'
          }
        `}>
          <div className="font-bold mb-2">
            {output.error ? '❌ Error:' : '✓ Output:'}
          </div>
          <pre className="whitespace-pre-wrap">
            {output.error || output.stdout}
          </pre>
        </div>
      )}
    </div>
  );
};
```

### 4. Multi-turn Conversation Branching

```tsx
const ConversationBranch = ({ message, branches }) => {
  const [selectedBranch, setSelectedBranch] = useState(0);

  if (branches.length <= 1) {
    return <ChatMessage message={message} />;
  }

  return (
    <div className="relative">
      {/* Branch selector */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setSelectedBranch(Math.max(0, selectedBranch - 1))}
          disabled={selectedBranch === 0}
          className="w-8 h-8 border-2 border-digital-white disabled:opacity-30"
        >
          ←
        </button>

        <span className="text-xs font-mono text-digital-white/60">
          {selectedBranch + 1} / {branches.length} variations
        </span>

        <button
          onClick={() => setSelectedBranch(Math.min(branches.length - 1, selectedBranch + 1))}
          disabled={selectedBranch === branches.length - 1}
          className="w-8 h-8 border-2 border-digital-white disabled:opacity-30"
        >
          →
        </button>

        <button
          onClick={generateNewBranch}
          className="ml-auto px-3 py-1 border-2 border-electric-purple text-electric-purple text-xs uppercase font-bold"
        >
          + New
        </button>
      </div>

      {/* Selected branch */}
      <ChatMessage message={branches[selectedBranch]} />
    </div>
  );
};
```

---

## 📊 STATE MANAGEMENT

```typescript
interface ChatState {
  // Chats
  chats: Chat[];
  activeChat Chat | null;

  // Messages
  messages: Message[];
  isGenerating: boolean;
  streamingContent: string;

  // Settings
  selectedModel: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  topP: number;

  // Token tracking
  tokensUsed: number;
  tokensLimit: number;
  resetTime: Date;

  // UI
  showSystemPrompt: boolean;
  editingMessage: Message | null;
  isSidebarOpen: boolean;

  // Actions
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  regenerateResponse: (message: Message) => Promise<void>;
  editMessage: (message: Message, newContent: string) => Promise<void>;
  deleteMessage: (message: Message) => Promise<void>;
  switchModel: (modelId: string) => void;
  exportChat: (format: string) => void;
}

const useChatStore = create<ChatState>((set, get) => ({
  // ... initial state

  sendMessage: async (content, attachments) => {
    const { activeChat, selectedModel, systemPrompt } = get();

    // Add user message optimistically
    const userMessage = {
      id: uuid(),
      role: 'user',
      content,
      attachments,
      createdAt: new Date(),
    };

    set(state => ({
      messages: [...state.messages, userMessage],
      isGenerating: true,
      streamingContent: '',
    }));

    try {
      // Call API with streaming
      const stream = await streamChatCompletion({
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          ...get().messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content },
        ],
      });

      let fullContent = '';

      for await (const chunk of stream) {
        fullContent += chunk;

        set({ streamingContent: fullContent });
      }

      // Add AI message
      const aiMessage = {
        id: uuid(),
        role: 'assistant',
        content: fullContent,
        model: selectedModel,
        tokensUsed: calculateTokens(fullContent),
        createdAt: new Date(),
      };

      set(state => ({
        messages: [...state.messages, aiMessage],
        isGenerating: false,
        streamingContent: '',
        tokensUsed: state.tokensUsed + aiMessage.tokensUsed,
      }));

    } catch (error) {
      set({ isGenerating: false, streamingContent: '' });
      showError(error.message);
    }
  },

  // ... other actions
}));
```

---

## 🔔 NOTIFICATIONS & FEEDBACK

### Success Toast
```tsx
const SuccessToast = ({ message }) => (
  <div className="
    fixed bottom-6 right-6
    bg-matrix-green
    border-3 border-digital-black
    shadow-neo
    px-6 py-4
    font-mono
    font-bold
    uppercase
    text-digital-black
    animate-slideIn
  ">
    ✓ {message}
  </div>
);
```

### Error Toast
```tsx
const ErrorToast = ({ message }) => (
  <div className="
    fixed bottom-6 right-6
    bg-neon-orange
    border-3 border-digital-black
    shadow-neo-orange
    px-6 py-4
    font-mono
    font-bold
    uppercase
    text-digital-black
  ">
    ⚠️ {message}
  </div>
);
```

---

**AI Chat специфікація готова!**

**Версія**: 1.0.0
**Статус**: 🎨 Complete
**Далі**: Backend Implementation

