# Kintsugi AI - API Testing Guide

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

Get token by logging in:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

## Profile API Endpoints

### 1. Update Profile
**PUT** `/api/auth/update-profile`

```bash
curl -X PUT http://localhost:8080/api/auth/update-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "username": "newusername",
    "bio": "This is my bio"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "username": "newusername",
    "email": "user@example.com",
    "bio": "This is my bio",
    "avatar_url": "",
    "subscription_tier": "basic",
    "tokens_used": 0,
    "tokens_limit": 100000,
    "reset_at": "2025-11-16T12:00:00Z",
    "created_at": "2025-11-16T10:00:00Z"
  }
}
```

### 2. Update Avatar
**POST** `/api/auth/update-avatar`

```bash
curl -X POST http://localhost:8080/api/auth/update-avatar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "avatar_url": "https://res.cloudinary.com/demo/image/upload/avatar.jpg"
  }'
```

### 3. Change Password
**POST** `/api/auth/change-password`

```bash
curl -X POST http://localhost:8080/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "new_password": "newpassword123"
  }'
```

### 4. Get Preferences
**GET** `/api/auth/preferences`

```bash
curl -X GET http://localhost:8080/api/auth/preferences \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "preferences": {
    "theme": "dark",
    "language": "en",
    "notifications": true
  }
}
```

### 5. Update Preferences
**PUT** `/api/auth/preferences`

```bash
curl -X PUT http://localhost:8080/api/auth/preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "preferences": {
      "theme": "dark",
      "language": "en",
      "notifications": true,
      "auto_translate": false
    }
  }'
```

### 6. Get Usage Stats
**GET** `/api/auth/usage-stats`

```bash
curl -X GET http://localhost:8080/api/auth/usage-stats \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "stats": {
    "total_messages": 0,
    "total_translations": 0,
    "total_ai_chats": 0,
    "total_groups": 0,
    "tokens_used": 0,
    "tokens_limit": 100000
  }
}
```

---

## Group Chat API Endpoints

### 1. Get All Users (for group creation)
**GET** `/api/messenger/users`

```bash
curl -X GET http://localhost:8080/api/messenger/users \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "users": [
    {
      "id": "uuid1",
      "username": "user1",
      "email": "user1@example.com",
      "avatar_url": "https://..."
    },
    {
      "id": "uuid2",
      "username": "user2",
      "email": "user2@example.com"
    }
  ]
}
```

### 2. Create Group
**POST** `/api/messenger/groups`

```bash
curl -X POST http://localhost:8080/api/messenger/groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "My Group Chat",
    "description": "Group for discussing projects",
    "participant_ids": ["uuid1", "uuid2", "uuid3"],
    "enable_video": true
  }'
```

**Response:**
```json
{
  "group": {
    "id": "group-uuid",
    "type": "group",
    "name": "My Group Chat",
    "description": "Group for discussing projects",
    "enable_video": true,
    "created_by": "creator-uuid",
    "created_at": "2025-11-16T12:00:00Z"
  }
}
```

### 3. Get Group Details
**GET** `/api/messenger/groups/:id`

```bash
curl -X GET http://localhost:8080/api/messenger/groups/{group-id} \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "group": {
    "id": "group-uuid",
    "type": "group",
    "name": "My Group Chat",
    "description": "Group for discussing projects",
    "enable_video": true,
    "created_by": "creator-uuid",
    "participants": [
      {
        "user_id": "uuid1",
        "role": "admin"
      },
      {
        "user_id": "uuid2",
        "role": "member"
      }
    ]
  }
}
```

### 4. Update Group
**PUT** `/api/messenger/groups/:id`

```bash
curl -X PUT http://localhost:8080/api/messenger/groups/{group-id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Updated Group Name",
    "description": "Updated description",
    "enable_video": false
  }'
```

### 5. Delete Group
**DELETE** `/api/messenger/groups/:id`

```bash
curl -X DELETE http://localhost:8080/api/messenger/groups/{group-id} \
  -H "Authorization: Bearer <token>"
```

### 6. Get Group Members
**GET** `/api/messenger/groups/:id/members`

```bash
curl -X GET http://localhost:8080/api/messenger/groups/{group-id}/members \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "members": [
    {
      "id": "participant-uuid",
      "user_id": "user-uuid",
      "role": "admin",
      "joined_at": "2025-11-16T12:00:00Z"
    }
  ]
}
```

### 7. Add Group Members
**POST** `/api/messenger/groups/:id/members`

```bash
curl -X POST http://localhost:8080/api/messenger/groups/{group-id}/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "user_ids": ["uuid1", "uuid2"]
  }'
```

### 8. Remove Group Member
**DELETE** `/api/messenger/groups/:id/members/:userId`

```bash
curl -X DELETE http://localhost:8080/api/messenger/groups/{group-id}/members/{user-id} \
  -H "Authorization: Bearer <token>"
```

### 9. Generate Group Invite
**POST** `/api/messenger/groups/:id/invite`

```bash
curl -X POST http://localhost:8080/api/messenger/groups/{group-id}/invite \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "invite_code": "AbCdEfGh12345678",
  "invite_link": "/join-group?code=AbCdEfGh12345678"
}
```

### 10. Leave Group
**POST** `/api/messenger/groups/:id/leave`

```bash
curl -X POST http://localhost:8080/api/messenger/groups/{group-id}/leave \
  -H "Authorization: Bearer <token>"
```

---

## 100ms Video Integration

### 1. Generate Token for Member
**POST** `/api/messenger/groups/:id/video/token`

```bash
curl -X POST http://localhost:8080/api/messenger/groups/{group-id}/video/token \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "token": "100ms-jwt-token-here",
  "room_id": "group-uuid"
}
```

### 2. Generate Guest Token
**POST** `/api/messenger/groups/:id/video/guest-token`

```bash
curl -X POST http://localhost:8080/api/messenger/groups/{group-id}/video/guest-token \
  -H "Content-Type: application/json" \
  -d '{
    "guest_name": "John Doe"
  }'
```

**Response:**
```json
{
  "token": "100ms-guest-token-here",
  "room_id": "group-uuid"
}
```

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "error": "Error message description"
}
```

**Common Status Codes:**
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Testing Workflow

### 1. Register and Login
```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "password123"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

Save the `access_token` from login response.

### 2. Test Profile Updates
```bash
# Update profile
curl -X PUT http://localhost:8080/api/auth/update-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"username": "testuser", "bio": "Testing the API"}'

# Update preferences
curl -X PUT http://localhost:8080/api/auth/preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"preferences": {"theme": "dark", "language": "en"}}'
```

### 3. Test Group Creation
```bash
# Get users
curl -X GET http://localhost:8080/api/messenger/users \
  -H "Authorization: Bearer <token>"

# Create group
curl -X POST http://localhost:8080/api/messenger/groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name": "Test Group", "description": "Testing", "participant_ids": [], "enable_video": true}'
```

### 4. Test Video Tokens
```bash
# Generate token
curl -X POST http://localhost:8080/api/messenger/groups/{group-id}/video/token \
  -H "Authorization: Bearer <token>"
```
