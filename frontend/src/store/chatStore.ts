import { create } from 'zustand';

interface Message {
  id: string;
  chat_id: string;
  role: string;
  content: string;
  tokens: number;
  model?: string;
  created_at: string;
}

interface Chat {
  id: string;
  user_id: string;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  streamingMessage: string;
  isStreaming: boolean;
  isLoading: boolean;
  error: string | null;

  setChats: (chats: Chat[]) => void;
  setCurrentChat: (chat: Chat | null) => void;
  addChat: (chat: Chat) => void;
  updateChat: (id: string, updates: Partial<Chat>) => void;
  deleteChat: (id: string) => void;
  addMessage: (chatId: string, message: Message) => void;
  updateMessage: (chatId: string, messageId: string, content: string) => void;
  setStreamingMessage: (content: string) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  clearStreamingMessage: () => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  currentChat: null,
  streamingMessage: '',
  isStreaming: false,
  isLoading: false,
  error: null,

  setChats: (chats) => set({ chats }),

  setCurrentChat: (chat) => set({ currentChat: chat }),

  addChat: (chat) =>
    set((state) => ({
      chats: [chat, ...state.chats],
    })),

  updateChat: (id, updates) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === id ? { ...chat, ...updates } : chat
      ),
      currentChat:
        state.currentChat?.id === id
          ? { ...state.currentChat, ...updates }
          : state.currentChat,
    })),

  deleteChat: (id) =>
    set((state) => ({
      chats: state.chats.filter((chat) => chat.id !== id),
      currentChat: state.currentChat?.id === id ? null : state.currentChat,
    })),

  addMessage: (chatId, message) =>
    set((state) => {
      const updatedChats = state.chats.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, message],
          };
        }
        return chat;
      });

      return {
        chats: updatedChats,
        currentChat:
          state.currentChat?.id === chatId
            ? {
                ...state.currentChat,
                messages: [...state.currentChat.messages, message],
              }
            : state.currentChat,
      };
    }),

  updateMessage: (chatId, messageId, content) =>
    set((state) => {
      const updatedChats = state.chats.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: chat.messages.map((msg) =>
              msg.id === messageId ? { ...msg, content } : msg
            ),
          };
        }
        return chat;
      });

      return {
        chats: updatedChats,
        currentChat:
          state.currentChat?.id === chatId
            ? {
                ...state.currentChat,
                messages: state.currentChat.messages.map((msg) =>
                  msg.id === messageId ? { ...msg, content } : msg
                ),
              }
            : state.currentChat,
      };
    }),

  setStreamingMessage: (content) => set({ streamingMessage: content }),

  setIsStreaming: (isStreaming) => set({ isStreaming }),

  clearStreamingMessage: () => set({ streamingMessage: '' }),

  setError: (error) => set({ error }),
}));
