# 100ms Video Integration Guide

## Overview

The Kintsugi AI platform uses 100ms for video conferencing in group chats. Currently, the backend has mock token generation implemented. This guide explains how to integrate the real 100ms SDK.

## Setup

### 1. Get 100ms Credentials

1. Sign up at [100ms Dashboard](https://dashboard.100ms.live/)
2. Create a new app/project
3. Get your credentials:
   - App Access Key
   - App Secret
   - Template ID (for room configuration)

### 2. Install 100ms Go SDK

```bash
cd backend
go get github.com/100mslive/server-sdks/go/v2
```

### 3. Add Environment Variables

Add to your `.env` file:

```env
HMS_APP_ACCESS_KEY=your_app_access_key_here
HMS_APP_SECRET=your_app_secret_here
HMS_TEMPLATE_ID=your_template_id_here
```

## Implementation

### 1. Create 100ms Service

Create `backend/internal/modules/messenger/hms_service.go`:

```go
package messenger

import (
	"fmt"
	"os"
	"time"

	"github.com/100mslive/server-sdks/go/v2/management_token"
	"github.com/google/uuid"
)

type HMSService struct {
	appAccessKey string
	appSecret    string
	templateID   string
}

func NewHMSService() *HMSService {
	return &HMSService{
		appAccessKey: os.Getenv("HMS_APP_ACCESS_KEY"),
		appSecret:    os.Getenv("HMS_APP_SECRET"),
		templateID:   os.Getenv("HMS_TEMPLATE_ID"),
	}
}

// GenerateRoomToken generates a token for a user to join a room
func (s *HMSService) GenerateRoomToken(roomID string, userID uuid.UUID, username string, role string) (string, error) {
	// Create token generator
	tokenGenerator := management_token.NewManagementTokenGenerator(
		s.appAccessKey,
		s.appSecret,
	)

	// Token options
	options := management_token.TokenOptions{
		RoomID:   roomID,
		UserID:   userID.String(),
		Role:     role, // "host" or "guest"
		Type:     "app",
		NotBefore: time.Now(),
		Duration:  24 * time.Hour, // 24 hours
	}

	// Generate token
	token, err := tokenGenerator.GenerateToken(options)
	if err != nil {
		return "", fmt.Errorf("failed to generate token: %w", err)
	}

	return token, nil
}

// GenerateGuestToken generates a token for a guest user
func (s *HMSService) GenerateGuestToken(roomID string, guestName string) (string, error) {
	tokenGenerator := management_token.NewManagementTokenGenerator(
		s.appAccessKey,
		s.appSecret,
	)

	options := management_token.TokenOptions{
		RoomID:   roomID,
		UserID:   fmt.Sprintf("guest-%d", time.Now().Unix()),
		Role:     "guest",
		Type:     "app",
		NotBefore: time.Now(),
		Duration:  2 * time.Hour, // 2 hours for guests
	}

	token, err := tokenGenerator.GenerateToken(options)
	if err != nil {
		return "", fmt.Errorf("failed to generate guest token: %w", err)
	}

	return token, nil
}

// CreateRoom creates a new room for a group
func (s *HMSService) CreateRoom(roomName string, roomID string) error {
	// Note: Room creation typically happens via 100ms REST API
	// You may need to use HTTP client to call:
	// POST https://api.100ms.live/v2/rooms
	// with proper authentication and room configuration

	// For now, rooms can be created dynamically when first token is requested
	// or you can pre-create rooms via dashboard

	return nil
}
```

### 2. Update Handler to Use Real Service

Modify `backend/internal/modules/messenger/group_handler.go`:

```go
// Add HMSService to Handler struct
type Handler struct {
	repo       *Repository
	hmsService *HMSService
}

// Update NewHandler
func NewHandler(repo *Repository) *Handler {
	return &Handler{
		repo:       repo,
		hmsService: NewHMSService(),
	}
}

// Update Generate100msToken
func (h *Handler) Generate100msToken(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	groupID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid group ID",
		})
	}

	// Check if user is participant
	if !h.repo.IsParticipant(groupID, userID) {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Not a member of this group",
		})
	}

	// Get group details
	group, err := h.repo.GetConversationByID(groupID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Group not found",
		})
	}

	// Check if video is enabled
	if !group.EnableVideo {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Video is not enabled for this group",
		})
	}

	// Get participant to determine role
	participant, err := h.repo.GetParticipant(groupID, userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get participant info",
		})
	}

	// Map role to 100ms role
	hmsRole := "guest"
	if participant.Role == "admin" {
		hmsRole = "host"
	}

	// Get user info for username
	// TODO: Add method to get user by ID from auth module
	username := userID.String() // Use UUID as fallback

	// Generate token using real 100ms SDK
	token, err := h.hmsService.GenerateRoomToken(
		groupID.String(),
		userID,
		username,
		hmsRole,
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate video token",
		})
	}

	return c.JSON(fiber.Map{
		"token":   token,
		"room_id": groupID.String(),
		"role":    hmsRole,
	})
}

// Update Generate100msGuestToken
func (h *Handler) Generate100msGuestToken(c *fiber.Ctx) error {
	groupID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid group ID",
		})
	}

	var req VideoTokenRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.GuestName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Guest name is required",
		})
	}

	// Check if group exists and video is enabled
	group, err := h.repo.GetConversationByID(groupID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Group not found",
		})
	}

	if !group.EnableVideo {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Video is not enabled for this group",
		})
	}

	// Generate guest token using real 100ms SDK
	token, err := h.hmsService.GenerateGuestToken(groupID.String(), req.GuestName)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate guest token",
		})
	}

	return c.JSON(fiber.Map{
		"token":   token,
		"room_id": groupID.String(),
		"role":    "guest",
	})
}
```

## Frontend Integration

### 1. Install 100ms React SDK

```bash
cd public
npm install @100mslive/react-sdk @100mslive/hms-video-react
```

### 2. Create Video Component

Create `public/js/video-call.jsx`:

```jsx
import { HMSRoomProvider, useHMSActions, useHMSStore, selectPeers } from '@100mslive/react-sdk';
import { VideoTile } from '@100mslive/hms-video-react';

function VideoCall({ roomId, token }) {
  const hmsActions = useHMSActions();
  const peers = useHMSStore(selectPeers);

  useEffect(() => {
    const joinRoom = async () => {
      await hmsActions.join({
        authToken: token,
        userName: 'User',
      });
    };
    joinRoom();

    return () => {
      hmsActions.leave();
    };
  }, [hmsActions, token]);

  return (
    <div className="video-grid">
      {peers.map(peer => (
        <VideoTile key={peer.id} peer={peer} />
      ))}
    </div>
  );
}

export default function VideoCallWrapper({ groupId }) {
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Fetch token from backend
    fetch(`${API_URL}/messenger/groups/${groupId}/video/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
    .then(res => res.json())
    .then(data => setToken(data.token));
  }, [groupId]);

  if (!token) return <div>Loading...</div>;

  return (
    <HMSRoomProvider>
      <VideoCall roomId={groupId} token={token} />
    </HMSRoomProvider>
  );
}
```

## Room Configuration

### Template Setup in 100ms Dashboard

1. Go to Templates in 100ms Dashboard
2. Create a new template or use existing one
3. Configure roles:
   - **host**: Can publish audio/video, screen share, mute others, remove participants
   - **guest**: Can publish audio/video, limited controls

4. Enable features:
   - Audio/Video publishing
   - Screen sharing
   - Chat
   - Recording (optional)
   - RTMP streaming (optional)

5. Get the Template ID and add to `.env`

## Testing

### Test Token Generation

```bash
# Get token for member
curl -X POST http://localhost:8080/api/messenger/groups/{group-id}/video/token \
  -H "Authorization: Bearer <token>"

# Response should contain real 100ms JWT token
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "room_id": "group-uuid",
  "role": "host"
}
```

### Verify Token

Decode the JWT token at [jwt.io](https://jwt.io) and verify:
- `room_id` matches your group ID
- `user_id` is correct
- `role` is correct (host/guest)
- `exp` (expiration) is set correctly

## Security Considerations

1. **Token Expiration**: Set appropriate expiration times
   - Members: 24 hours
   - Guests: 2 hours

2. **Role Permissions**: Map group roles correctly
   - Admin → host (full controls)
   - Member → guest (limited controls)

3. **Room Access**: Validate group membership before generating tokens

4. **Environment Variables**: Never commit `.env` file with real credentials

5. **HTTPS**: Always use HTTPS in production for WebRTC

## Troubleshooting

### Token Generation Fails

```
Error: failed to generate token
```

**Solution**: Check that HMS_APP_ACCESS_KEY and HMS_APP_SECRET are correct

### User Can't Join Room

**Solution**: Verify that:
- Token is not expired
- Room ID exists
- Template ID is correct
- Network allows WebRTC traffic

### Video Not Working

**Solution**:
- Check browser permissions for camera/microphone
- Verify HTTPS is used (WebRTC requires secure context)
- Check firewall/network settings

## Resources

- [100ms Documentation](https://www.100ms.live/docs)
- [100ms Go SDK](https://github.com/100mslive/server-sdks/tree/main/go)
- [100ms React SDK](https://www.100ms.live/docs/javascript/v2/guides/react-quickstart)
- [100ms Dashboard](https://dashboard.100ms.live/)

## Current Implementation Status

✅ Database schema with `enable_video` flag
✅ Backend endpoints for token generation
✅ Mock token generation (temporary)
⏳ Real 100ms SDK integration (follow this guide)
⏳ Frontend video UI components
⏳ Room management via 100ms API

## Next Steps

1. Sign up for 100ms account
2. Get credentials and add to `.env`
3. Install Go SDK: `go get github.com/100mslive/server-sdks/go/v2`
4. Create `hms_service.go` as shown above
5. Update handlers to use real service
6. Test token generation
7. Implement frontend video UI
8. Test end-to-end video calling
