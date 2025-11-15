'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { formatTime } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', icon: '🧠' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', icon: '⚡' },
  { id: 'o1', name: 'o1', icon: '🎯' },
  { id: 'o3-mini', name: 'o3-mini', icon: '🚀' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', icon: '🎭' },
];

export const ChatInterface: React.FC = () => {
  const { currentChat, streamingMessage, isStreaming, addMessage, setIsStreaming, setStreamingMessage, clearStreamingMessage } = useChatStore();
  const { accessToken, user } = useAuthStore();
  const [input, setInput] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages, streamingMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !currentChat || !accessToken) return;

    const userMessage = input;
    setInput('');
    setIsStreaming(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_URL}/api/chats/${currentChat.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          content: userMessage,
          system_prompt: systemPrompt || undefined,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (!reader) throw new Error('No response body');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.delta) {
              fullResponse += data.delta;
              setStreamingMessage(fullResponse);
            }
            if (data.done) {
              clearStreamingMessage();
              setIsStreaming(false);
              // Refresh chat to get the complete messages
              // In production, you'd fetch the updated chat here
            }
          }
        }
      }
    } catch (error) {
      console.error('Send message error:', error);
      setIsStreaming(false);
      clearStreamingMessage();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!currentChat) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-3xl font-mono font-bold text-kintsugi-gold mb-4">
            Welcome to Kintsugi AI
          </h2>
          <p className="text-digital-white/60 font-mono">
            Select a chat or create a new one to start
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-3 border-kintsugi-gold bg-kintsugi-gold/5">
        <div>
          <h2 className="text-xl font-mono font-bold text-kintsugi-gold">
            {currentChat.title}
          </h2>
          <p className="text-sm font-mono text-digital-white/60">
            Model: {currentChat.model}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowSystemPrompt(!showSystemPrompt)}
          >
            {showSystemPrompt ? '✕' : '⚙️'} System
          </Button>
        </div>
      </div>

      {/* System Prompt Editor */}
      {showSystemPrompt && (
        <div className="p-4 border-b-3 border-cyber-pink bg-cyber-pink/5">
          <Textarea
            label="System Prompt"
            placeholder="You are a helpful assistant..."
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="min-h-[80px]"
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentChat.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Streaming Message */}
        {isStreaming && streamingMessage && (
          <div className="border-3 border-kintsugi-gold bg-kintsugi-gold/5 p-5 shadow-neo">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{MODELS.find(m => m.id === currentChat.model)?.icon || '🤖'}</span>
              <span className="text-kintsugi-gold font-bold font-mono">
                {currentChat.model}
              </span>
            </div>
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={tomorrow}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-cyber-pink/20 px-1 rounded" {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {streamingMessage}
              </ReactMarkdown>
            </div>
            <span className="animate-blink text-kintsugi-gold">▐</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t-3 border-kintsugi-gold bg-digital-black/50">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 min-h-[56px]"
            disabled={isStreaming}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isStreaming}
            className="self-end"
          >
            {isStreaming ? '⏸️' : '📤'} Send
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs font-mono text-digital-white/40">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {user && (
            <span>
              Tokens: {user.tokens_used.toLocaleString()} / {user.tokens_limit === -1 ? '∞' : user.tokens_limit.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

interface MessageBubbleProps {
  message: {
    id: string;
    role: string;
    content: string;
    tokens: number;
    model?: string;
    created_at: string;
  };
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`border-3 p-5 shadow-neo ${
        isUser
          ? 'border-cyber-pink bg-cyber-pink/5 ml-auto max-w-[80%]'
          : 'border-kintsugi-gold bg-kintsugi-gold/5 mr-auto max-w-[90%]'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{isUser ? '👤' : '🤖'}</span>
        <span
          className={`font-bold font-mono ${
            isUser ? 'text-cyber-pink' : 'text-kintsugi-gold'
          }`}
        >
          {isUser ? 'You' : message.model || 'Assistant'}
        </span>
        <span className="text-xs text-digital-white/40 ml-auto">
          {formatTime(message.created_at)}
        </span>
      </div>

      {isUser ? (
        <div className="text-digital-white font-mono whitespace-pre-wrap">
          {message.content}
        </div>
      ) : (
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={tomorrow}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className="bg-cyber-pink/20 px-1 rounded" {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      )}

      {!isUser && (
        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="ghost">
            📋 Copy
          </Button>
          <Button size="sm" variant="ghost">
            🔄 Regenerate
          </Button>
        </div>
      )}
    </div>
  );
};
