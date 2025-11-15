'use client';

import React, { useEffect, useState } from 'react';
import { useMessengerStore } from '@/store/messengerStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { formatTime, truncate } from '@/lib/utils';
import api from '@/lib/api';

export const ConversationSidebar: React.FC = () => {
  const { conversations, currentConversation, setConversations, setCurrentConversation, addConversation } = useMessengerStore();
  const { accessToken } = useAuthStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newConvName, setNewConvName] = useState('');
  const [newConvType, setNewConvType] = useState<'direct' | 'group'>('direct');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    if (!accessToken) return;

    try {
      const data: any = await api.messenger.listConversations(accessToken);
      setConversations(data);
    } catch (error) {
      console.error('Load conversations error:', error);
    }
  };

  const handleCreateConversation = async () => {
    if (!accessToken) return;

    try {
      const newConv: any = await api.messenger.createConversation(
        {
          type: newConvType,
          name: newConvName || undefined,
          participant_ids: [], // In production, add user selection
        },
        accessToken
      );
      addConversation(newConv);
      setCurrentConversation(newConv);
      setIsCreateModalOpen(false);
      setNewConvName('');
    } catch (error) {
      console.error('Create conversation error:', error);
    }
  };

  const handleSelectConversation = async (convId: string) => {
    if (!accessToken) return;

    try {
      const conv: any = await api.messenger.getConversation(convId, accessToken);
      setCurrentConversation(conv);
    } catch (error) {
      console.error('Select conversation error:', error);
    }
  };

  return (
    <div className="flex flex-col h-full border-r-3 border-cyber-pink bg-digital-black/50">
      {/* Header */}
      <div className="p-4 border-b-3 border-cyber-pink">
        <h2 className="text-2xl font-mono font-bold text-cyber-pink mb-3">
          💬 Messages
        </h2>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full"
          variant="secondary"
        >
          ➕ New Conversation
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {conversations.length === 0 ? (
          <p className="text-center text-digital-white/40 font-mono text-sm mt-8">
            No conversations yet
          </p>
        ) : (
          conversations.map((conv) => (
            <Card
              key={conv.id}
              variant={currentConversation?.id === conv.id ? 'pink' : 'default'}
              className="cursor-pointer p-4"
              onClick={() => handleSelectConversation(conv.id)}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full border-3 border-cyber-pink bg-cyber-pink/20 flex items-center justify-center text-2xl flex-shrink-0">
                  {conv.is_ai_agent ? '🤖' : conv.type === 'group' ? '👥' : '👤'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono font-bold text-digital-white truncate">
                      {conv.name || 'Conversation'}
                    </h3>
                    <span className="text-xs font-mono text-digital-white/40 ml-2">
                      {formatTime(conv.updated_at)}
                    </span>
                  </div>
                  {conv.messages && conv.messages.length > 0 && (
                    <p className="text-sm font-mono text-digital-white/60 mt-1 line-clamp-2">
                      {truncate(
                        conv.messages[conv.messages.length - 1].content,
                        50
                      )}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Conversation Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Conversation"
      >
        <div className="space-y-4">
          <div>
            <label className="block font-mono font-bold text-kintsugi-gold mb-2">
              Type
            </label>
            <div className="flex gap-2">
              <Button
                variant={newConvType === 'direct' ? 'primary' : 'ghost'}
                onClick={() => setNewConvType('direct')}
                className="flex-1"
              >
                👤 Direct
              </Button>
              <Button
                variant={newConvType === 'group' ? 'primary' : 'ghost'}
                onClick={() => setNewConvType('group')}
                className="flex-1"
              >
                👥 Group
              </Button>
            </div>
          </div>

          {newConvType === 'group' && (
            <Input
              label="Group Name"
              placeholder="Enter group name..."
              value={newConvName}
              onChange={(e) => setNewConvName(e.target.value)}
            />
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="ghost"
              onClick={() => setIsCreateModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleCreateConversation} className="flex-1">
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
