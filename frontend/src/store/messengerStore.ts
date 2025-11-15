import { create } from 'zustand';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  media_url?: string;
  reply_to_id?: string;
  is_edited: boolean;
  is_forwarded: boolean;
  created_at: string;
  updated_at: string;
  reactions?: Array<{
    id: string;
    user_id: string;
    emoji: string;
  }>;
}

interface Conversation {
  id: string;
  type: string;
  name?: string;
  avatar?: string;
  is_ai_agent: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  participants?: Array<{
    id: string;
    user_id: string;
    role: string;
    is_pinned: boolean;
    is_muted: boolean;
  }>;
  messages: Message[];
}

interface MessengerState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  ws: WebSocket | null;
  isConnected: boolean;
  isLoading: boolean;

  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  addConversation: (conversation: Conversation) => void;
  addMessage: (message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  addReaction: (conversationId: string, messageId: string, reaction: any) => void;
  connectWebSocket: (url: string, token: string) => void;
  disconnectWebSocket: () => void;
}

export const useMessengerStore = create<MessengerState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  ws: null,
  isConnected: false,
  isLoading: false,

  setConversations: (conversations) => set({ conversations }),

  setCurrentConversation: (conversation) => set({ currentConversation: conversation }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),

  addMessage: (message) =>
    set((state) => {
      const updatedConversations = state.conversations.map((conv) => {
        if (conv.id === message.conversation_id) {
          return {
            ...conv,
            messages: [...conv.messages, message],
          };
        }
        return conv;
      });

      return {
        conversations: updatedConversations,
        currentConversation:
          state.currentConversation?.id === message.conversation_id
            ? {
                ...state.currentConversation,
                messages: [...state.currentConversation.messages, message],
              }
            : state.currentConversation,
      };
    }),

  updateMessage: (conversationId, messageId, updates) =>
    set((state) => {
      const updatedConversations = state.conversations.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: conv.messages.map((msg) =>
              msg.id === messageId ? { ...msg, ...updates } : msg
            ),
          };
        }
        return conv;
      });

      return {
        conversations: updatedConversations,
        currentConversation:
          state.currentConversation?.id === conversationId
            ? {
                ...state.currentConversation,
                messages: state.currentConversation.messages.map((msg) =>
                  msg.id === messageId ? { ...msg, ...updates } : msg
                ),
              }
            : state.currentConversation,
      };
    }),

  deleteMessage: (conversationId, messageId) =>
    set((state) => {
      const updatedConversations = state.conversations.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: conv.messages.filter((msg) => msg.id !== messageId),
          };
        }
        return conv;
      });

      return {
        conversations: updatedConversations,
        currentConversation:
          state.currentConversation?.id === conversationId
            ? {
                ...state.currentConversation,
                messages: state.currentConversation.messages.filter(
                  (msg) => msg.id !== messageId
                ),
              }
            : state.currentConversation,
      };
    }),

  addReaction: (conversationId, messageId, reaction) =>
    set((state) => {
      const updatedConversations = state.conversations.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: conv.messages.map((msg) => {
              if (msg.id === messageId) {
                return {
                  ...msg,
                  reactions: [...(msg.reactions || []), reaction],
                };
              }
              return msg;
            }),
          };
        }
        return conv;
      });

      return {
        conversations: updatedConversations,
        currentConversation:
          state.currentConversation?.id === conversationId
            ? {
                ...state.currentConversation,
                messages: state.currentConversation.messages.map((msg) => {
                  if (msg.id === messageId) {
                    return {
                      ...msg,
                      reactions: [...(msg.reactions || []), reaction],
                    };
                  }
                  return msg;
                }),
              }
            : state.currentConversation,
      };
    }),

  connectWebSocket: (url, token) => {
    const ws = new WebSocket(`${url}?user_id=${token}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      set({ isConnected: true, ws });
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'new_message':
          get().addMessage(data.payload);
          break;
        case 'message_updated':
          get().updateMessage(
            data.payload.conversation_id,
            data.payload.id,
            data.payload
          );
          break;
        case 'message_deleted':
          get().deleteMessage(
            data.payload.conversation_id,
            data.payload.message_id
          );
          break;
        case 'reaction_added':
          get().addReaction(
            data.payload.conversation_id,
            data.payload.message_id,
            data.payload
          );
          break;
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      set({ isConnected: false, ws: null });
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  },

  disconnectWebSocket: () => {
    const { ws } = get();
    if (ws) {
      ws.close();
      set({ ws: null, isConnected: false });
    }
  },
}));
