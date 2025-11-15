'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMessengerStore } from '@/store/messengerStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatTime } from '@/lib/utils';
import api from '@/lib/api';

const REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🔥', '🎉'];

export const MessengerInterface: React.FC = () => {
  const { currentConversation, addMessage } = useMessengerStore();
  const { accessToken, user } = useAuthStore();
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !currentConversation || !accessToken) return;

    const messageContent = input;
    setInput('');

    try {
      const message: any = await api.messenger.sendMessage(
        currentConversation.id,
        {
          content: messageContent,
          reply_to_id: replyingTo || undefined,
        },
        accessToken
      );
      setReplyingTo(null);
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!accessToken) return;

    try {
      await api.messenger.addReaction(messageId, emoji, accessToken);
    } catch (error) {
      console.error('Add reaction error:', error);
    }
  };

  if (!currentConversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-3xl font-mono font-bold text-cyber-pink mb-4">
            💬 Kintsugi Messenger
          </h2>
          <p className="text-digital-white/60 font-mono">
            Select a conversation or create a new one
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-3 border-cyber-pink bg-cyber-pink/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-3 border-cyber-pink bg-cyber-pink/20 flex items-center justify-center text-2xl">
            {currentConversation.is_ai_agent ? '🤖' : '👥'}
          </div>
          <div>
            <h2 className="text-xl font-mono font-bold text-cyber-pink">
              {currentConversation.name || 'Conversation'}
            </h2>
            <p className="text-sm font-mono text-digital-white/60">
              {currentConversation.participants?.length || 0} participants
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost">
            📞 Call
          </Button>
          <Button size="sm" variant="ghost">
            📹 Video
          </Button>
          <Button size="sm" variant="ghost">
            ⚙️
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentConversation.messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.sender_id === user?.id}
            onReact={(emoji) => handleReaction(message.id, emoji)}
            onReply={() => setReplyingTo(message.id)}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      {replyingTo && (
        <div className="px-4 py-2 border-t-3 border-cyber-cyan bg-cyber-cyan/5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono text-cyber-cyan">
              Replying to message
            </span>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-digital-white/60 hover:text-digital-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t-3 border-cyber-pink bg-digital-black/50">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsRecording(!isRecording)}
            className="self-end"
          >
            {isRecording ? '⏹️' : '🎤'}
          </Button>
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim()}
            className="self-end"
          >
            📤
          </Button>
        </div>
      </div>
    </div>
  );
};

interface MessageBubbleProps {
  message: {
    id: string;
    sender_id: string;
    content: string;
    message_type: string;
    media_url?: string;
    is_edited: boolean;
    created_at: string;
    reactions?: Array<{
      id: string;
      user_id: string;
      emoji: string;
    }>;
  };
  isOwn: boolean;
  onReact: (emoji: string) => void;
  onReply: () => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  onReact,
  onReply,
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const groupedReactions = message.reactions?.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction.user_id);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div
      className={`relative ${isOwn ? 'ml-auto' : 'mr-auto'} max-w-[80%] md:max-w-[70%]`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div
        className={`border-3 p-4 shadow-neo ${
          isOwn
            ? 'border-cyber-pink bg-cyber-pink/5'
            : 'border-cyber-cyan bg-cyber-cyan/5'
        }`}
      >
        {/* Message Content */}
        {message.message_type === 'text' && (
          <div className="text-digital-white font-mono whitespace-pre-wrap">
            {message.content}
          </div>
        )}

        {message.message_type === 'image' && message.media_url && (
          <img
            src={message.media_url}
            alt="Sent image"
            className="max-w-full rounded border-2 border-digital-white/20"
          />
        )}

        {/* Message Info */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-digital-white/40 font-mono">
            {formatTime(message.created_at)}
          </span>
          {message.is_edited && (
            <span className="text-xs text-digital-white/40 font-mono">
              (edited)
            </span>
          )}
        </div>

        {/* Reactions */}
        {groupedReactions && Object.keys(groupedReactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(groupedReactions).map(([emoji, userIds]) => (
              <button
                key={emoji}
                className="px-2 py-1 bg-digital-black/50 border border-kintsugi-gold rounded-full text-xs font-mono hover:bg-kintsugi-gold/20"
                onClick={() => onReact(emoji)}
              >
                {emoji} {userIds.length}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="absolute top-0 right-0 -translate-y-full mb-2 flex gap-1">
          <button
            className="px-2 py-1 bg-digital-black border-2 border-kintsugi-gold text-xs hover:bg-kintsugi-gold/20"
            onClick={() => setShowReactions(!showReactions)}
          >
            😊
          </button>
          <button
            className="px-2 py-1 bg-digital-black border-2 border-cyber-cyan text-xs hover:bg-cyber-cyan/20"
            onClick={onReply}
          >
            ↩️
          </button>
        </div>
      )}

      {/* Reaction Picker */}
      {showReactions && (
        <div className="absolute bottom-full mb-2 left-0 flex gap-1 p-2 bg-digital-black border-3 border-kintsugi-gold shadow-neo">
          {REACTIONS.map((emoji) => (
            <button
              key={emoji}
              className="text-2xl hover:scale-125 transition-transform"
              onClick={() => {
                onReact(emoji);
                setShowReactions(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
