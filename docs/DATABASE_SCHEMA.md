# 🗄️ Kintsugi AI - Database Schema

## Entity Relationship Diagram

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ id (PK)         │
│ username        │
│ email           │
│ password_hash   │
│ subscription_tier│
│ tokens_used     │
│ tokens_limit    │
│ reset_at        │
│ stripe_customer_id│
└─────────────────┘
        │
        │ 1:N
        ├──────────────────────────────────────────────┐
        │                                              │
        ▼                                              ▼
┌─────────────────┐                          ┌─────────────────┐
│ REFRESH_TOKENS  │                          │  SUBSCRIPTIONS  │
├─────────────────┤                          ├─────────────────┤
│ id (PK)         │                          │ id (PK)         │
│ user_id (FK)    │                          │ user_id (FK)    │
│ token           │                          │ stripe_sub_id   │
│ expires_at      │                          │ tier            │
└─────────────────┘                          │ status          │
                                             └─────────────────┘
        │
        │ 1:N
        ├──────────────────┬──────────────────┬──────────────────┐
        │                  │                  │                  │
        ▼                  ▼                  ▼                  ▼
┌─────────────┐    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   CHATS     │    │ PARTICIPANTS │  │ TRANSLATIONS │  │   PAYMENTS   │
├─────────────┤    ├──────────────┤  ├──────────────┤  ├──────────────┤
│ id (PK)     │    │ id (PK)      │  │ id (PK)      │  │ id (PK)      │
│ user_id (FK)│    │ conv_id (FK) │  │ user_id (FK) │  │ user_id (FK) │
│ title       │    │ user_id (FK) │  │ source_lang  │  │ amount       │
│ model       │    │ role         │  │ target_lang  │  │ status       │
└─────────────┘    │ is_pinned    │  │ service      │  └──────────────┘
        │          └──────────────┘  │ plan         │
        │ 1:N              │         │ cost         │
        ▼                  │         └──────────────┘
┌─────────────┐            │
│  MESSAGES   │            │
├─────────────┤            │
│ id (PK)     │            │
│ chat_id (FK)│            │
│ role        │            │
│ content     │            │
│ tokens      │            │
└─────────────┘            │
                           │
                           │ N:1
                           ▼
                  ┌─────────────────┐
                  │ CONVERSATIONS   │
                  ├─────────────────┤
                  │ id (PK)         │
                  │ type            │
                  │ name            │
                  │ is_ai_agent     │
                  └─────────────────┘
                           │
                           │ 1:N
                           ▼
                  ┌─────────────────────┐
                  │ CONVERSATION_MSGS   │
                  ├─────────────────────┤
                  │ id (PK)             │
                  │ conversation_id (FK)│
                  │ sender_id (FK)      │
                  │ content             │
                  │ message_type        │
                  │ reply_to_id (FK)    │
                  └─────────────────────┘
                           │
                           ├─── 1:N ───► ┌──────────────┐
                           │             │  REACTIONS   │
                           │             ├──────────────┤
                           │             │ id (PK)      │
                           │             │ message_id(FK)│
                           │             │ user_id (FK) │
                           │             │ emoji        │
                           │             └──────────────┘
                           │
                           └─── 1:N ───► ┌──────────────┐
                                         │READ_RECEIPTS │
                                         ├──────────────┤
                                         │ id (PK)      │
                                         │ message_id(FK)│
                                         │ user_id (FK) │
                                         │ read_at      │
                                         └──────────────┘

        ┌─────────────┐
        │   STORIES   │
        ├─────────────┤
        │ id (PK)     │
        │ user_id (FK)│
        │ media_url   │
        │ expires_at  │
        └─────────────┘
                │
                │ 1:N
                ▼
        ┌─────────────┐
        │ STORY_VIEWS │
        ├─────────────┤
        │ id (PK)     │
        │ story_id(FK)│
        │ user_id (FK)│
        │ viewed_at   │
        └─────────────┘
```

---

## 📊 Tables Overview

### 🔐 AUTH Module

#### **users**
Основна таблиця користувачів з автентифікацією та підпискою
- `tokens_limit`: Ліміт токенів (оновлюється кожні 6 годин)
- `reset_at`: Час наступного скидання токенів
- `subscription_tier`: basic | premium_starter | premium_pro | premium_ultra | unlimited

#### **refresh_tokens**
Refresh tokens для JWT автентифікації (TTL 7 днів)

---

### 💬 CHAT Module

#### **chats**
AI чат конверсації з різними моделями
- `model`: gpt-4o, o1, o3-mini, claude-3-opus

#### **messages**
Повідомлення в AI чаті
- `role`: user | assistant | system
- `tokens`: Кількість токенів використаних

---

### 📱 MESSENGER Module

#### **conversations**
Месенджер конверсації (direct/group)
- `type`: direct | group
- `is_ai_agent`: Чи є це AI агент

#### **participants**
Учасники конверсацій
- `role`: admin | member
- `is_pinned/is_muted/is_archived`: Налаштування користувача

#### **conversation_messages**
Повідомлення в месенджері
- `message_type`: text | image | video | audio | file
- `reply_to_id`: Для реплаїв
- `is_edited/is_forwarded`: Статус повідомлення

#### **reactions**
Реакції на повідомлення (емодзі)

#### **read_receipts**
Відмітки про прочитання

#### **stories**
24-годинні Stories
- `expires_at`: Автоматичне видалення після 24h

#### **story_views**
Перегляди Stories

---

### 🌐 TRANSLATION Module

#### **translations**
Історія перекладів з ціноутворенням
- `service`: deepl | otranslator
- `plan`: Kintsugi Basic | Kintsugi Epic
- `cost`: Вартість за 1800 символів × chunk_count
- `status`: pending | processing | completed | failed

---

### 💳 SUBSCRIPTION Module

#### **subscriptions**
Stripe підписки користувачів
- `tier`: basic | premium_starter | premium_pro | premium_ultra | unlimited
- `status`: active | canceled | past_due | unpaid

#### **payments**
Історія платежів
- `amount`: В центах (USD)

---

## 🔑 Key Indexes

### Performance Critical:
```sql
-- Auth
users(email)           -- Login lookup
users(subscription_tier) -- Token limit checks

-- Chat
chats(user_id)         -- User's chats list
messages(chat_id)      -- Chat messages

-- Messenger
conversation_messages(conversation_id, created_at) -- Message history
participants(user_id)  -- User's conversations

-- Stories
stories(expires_at)    -- Auto-cleanup cron job
```

---

## 🔄 Auto-Update Triggers

Tables з `updated_at` мають тригери для автоматичного оновлення:
- `users`
- `chats`
- `conversations`
- `conversation_messages`
- `subscriptions`

---

## 📈 Subscription Tiers & Token Limits

| Tier | Tokens per 6h | Price |
|------|---------------|-------|
| **basic** | 100,000 | FREE |
| **premium_starter** | 500,000 | $9.99 |
| **premium_pro** | 2,000,000 | $29.99 |
| **premium_ultra** | 5,000,000 | $99.99 |
| **unlimited** | -1 (∞) | $299.99 |

---

## 🌐 Translation Pricing

| Service | Plan | Price per 1800 chars |
|---------|------|---------------------|
| **deepl** | Kintsugi Basic | $0.05 (env configurable) |
| **otranslator** | Kintsugi Epic | $0.10 (env configurable) |

**Cost Calculation:**
```
chunks = ceil(char_count / 1800)
total_cost = chunks × price_per_1800
```

---

## 🚀 Migrations

GORM AutoMigrate створює всі таблиці автоматично при старті (`main.go:147-173`).

Для manual SQL schema:
```bash
psql $DATABASE_URL < backend/database/schema.sql
```

---

## 🔍 Useful Queries

### Active users count:
```sql
SELECT COUNT(*) FROM users WHERE deleted_at IS NULL;
```

### Token usage statistics:
```sql
SELECT
    subscription_tier,
    COUNT(*) as users,
    AVG(tokens_used) as avg_tokens,
    SUM(tokens_used) as total_tokens
FROM users
WHERE deleted_at IS NULL
GROUP BY subscription_tier;
```

### Translation revenue:
```sql
SELECT
    plan,
    COUNT(*) as translations,
    SUM(cost) as total_revenue
FROM translations
WHERE status = 'completed'
GROUP BY plan;
```

### Active conversations:
```sql
SELECT
    c.id,
    c.type,
    COUNT(DISTINCT p.user_id) as participants,
    COUNT(DISTINCT cm.id) as messages
FROM conversations c
LEFT JOIN participants p ON p.conversation_id = c.id
LEFT JOIN conversation_messages cm ON cm.conversation_id = c.id
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.type;
```

---

**Auto-generated from GORM models**
**Last updated**: 2025-01-15
