const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  auth: {
    register: (data: { username: string; email: string; password: string }) =>
      request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (data: { email: string; password: string }) =>
      request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    refresh: (refreshToken: string) =>
      request('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      }),

    logout: (refreshToken: string, token: string) =>
      request('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
        token,
      }),

    me: (token: string) => request('/api/auth/me', { token }),
  },

  // Chat
  chat: {
    create: (data: { title?: string; model: string }, token: string) =>
      request('/api/chats', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      }),

    list: (token: string, params?: { limit?: number; offset?: number }) => {
      const query = new URLSearchParams(params as any).toString();
      return request(`/api/chats?${query}`, { token });
    },

    get: (id: string, token: string) =>
      request(`/api/chats/${id}`, { token }),

    update: (id: string, data: { title?: string; model?: string }, token: string) =>
      request(`/api/chats/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        token,
      }),

    delete: (id: string, token: string) =>
      request(`/api/chats/${id}`, {
        method: 'DELETE',
        token,
      }),

    sendMessage: (
      chatId: string,
      data: { content: string; system_prompt?: string },
      token: string
    ) => {
      // Returns EventSource URL for streaming
      return `${API_URL}/api/chats/${chatId}/messages`;
    },

    getTokenUsage: (token: string) =>
      request('/api/chats/tokens', { token }),
  },

  // Messenger
  messenger: {
    createConversation: (
      data: { type: string; name?: string; participant_ids: string[] },
      token: string
    ) =>
      request('/api/messenger/conversations', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      }),

    listConversations: (token: string) =>
      request('/api/messenger/conversations', { token }),

    getConversation: (id: string, token: string) =>
      request(`/api/messenger/conversations/${id}`, { token }),

    sendMessage: (
      conversationId: string,
      data: {
        content: string;
        message_type?: string;
        media_url?: string;
        reply_to_id?: string;
      },
      token: string
    ) =>
      request(`/api/messenger/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      }),

    getMessages: (
      conversationId: string,
      token: string,
      params?: { limit?: number; offset?: number }
    ) => {
      const query = new URLSearchParams(params as any).toString();
      return request(`/api/messenger/conversations/${conversationId}/messages?${query}`, {
        token,
      });
    },

    addReaction: (messageId: string, emoji: string, token: string) =>
      request(`/api/messenger/messages/${messageId}/reactions`, {
        method: 'POST',
        body: JSON.stringify({ emoji }),
        token,
      }),

    createStory: (
      data: { media_url: string; media_type: string; caption?: string },
      token: string
    ) =>
      request('/api/messenger/stories', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      }),
  },

  // Translation
  translation: {
    getPricing: (service: string, charCount: number, token: string) => {
      const query = new URLSearchParams({ service, char_count: charCount.toString() });
      return request(`/api/translation/pricing?${query}`, { token });
    },

    translate: (
      data: {
        source_language: string;
        target_language: string;
        text: string;
        service: string;
      },
      token: string
    ) =>
      request('/api/translation', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      }),

    list: (token: string, params?: { limit?: number; offset?: number }) => {
      const query = new URLSearchParams(params as any).toString();
      return request(`/api/translation?${query}`, { token });
    },

    get: (id: string, token: string) =>
      request(`/api/translation/${id}`, { token }),
  },

  // Subscription
  subscription: {
    getPlans: () => request('/api/subscription/plans'),

    getUserSubscription: (token: string) =>
      request('/api/subscription', { token }),

    createCheckout: (
      data: { price_id: string; success_url: string; cancel_url: string },
      token: string
    ) =>
      request('/api/subscription/checkout', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      }),

    createPortal: (data: { return_url: string }, token: string) =>
      request('/api/subscription/portal', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      }),

    getPayments: (token: string, params?: { limit?: number; offset?: number }) => {
      const query = new URLSearchParams(params as any).toString();
      return request(`/api/subscription/payments?${query}`, { token });
    },
  },
};

export default api;
