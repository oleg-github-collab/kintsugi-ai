'use client';

import React, { useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { formatTime, truncate } from '@/lib/utils';
import api from '@/lib/api';

export const ChatSidebar: React.FC = () => {
  const { chats, currentChat, setChats, setCurrentChat, addChat } = useChatStore();
  const { accessToken } = useAuthStore();

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    if (!accessToken) return;

    try {
      const data: any = await api.chat.list(accessToken);
      setChats(data);
    } catch (error) {
      console.error('Load chats error:', error);
    }
  };

  const handleCreateChat = async () => {
    if (!accessToken) return;

    try {
      const newChat: any = await api.chat.create(
        { title: 'New Chat', model: 'gpt-4o' },
        accessToken
      );
      addChat(newChat);
      setCurrentChat(newChat);
    } catch (error) {
      console.error('Create chat error:', error);
    }
  };

  const handleSelectChat = async (chatId: string) => {
    if (!accessToken) return;

    try {
      const chat: any = await api.chat.get(chatId, accessToken);
      setCurrentChat(chat);
    } catch (error) {
      console.error('Select chat error:', error);
    }
  };

  return (
    <div className="flex flex-col h-full border-r-3 border-kintsugi-gold bg-digital-black/50">
      {/* Header */}
      <div className="p-4 border-b-3 border-kintsugi-gold">
        <Button onClick={handleCreateChat} className="w-full">
          ➕ New Chat
        </Button>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {chats.length === 0 ? (
          <p className="text-center text-digital-white/40 font-mono text-sm mt-8">
            No chats yet. Create one to start!
          </p>
        ) : (
          chats.map((chat) => (
            <Card
              key={chat.id}
              variant={currentChat?.id === chat.id ? 'pink' : 'default'}
              className="cursor-pointer p-4"
              onClick={() => handleSelectChat(chat.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-mono font-bold text-digital-white truncate">
                    {chat.title}
                  </h3>
                  <p className="text-xs font-mono text-digital-white/60 mt-1">
                    {chat.model}
                  </p>
                  {chat.messages && chat.messages.length > 0 && (
                    <p className="text-sm font-mono text-digital-white/40 mt-2 line-clamp-2">
                      {truncate(
                        chat.messages[chat.messages.length - 1].content,
                        60
                      )}
                    </p>
                  )}
                </div>
                <span className="text-xs font-mono text-digital-white/40 ml-2">
                  {formatTime(chat.updated_at)}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
