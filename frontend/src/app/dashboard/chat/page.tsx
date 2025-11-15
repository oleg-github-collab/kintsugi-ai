'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { PageWrapper } from '@/components/layout/PageWrapper';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Response from ${selectedModel}: This is a simulated response. Connect to real backend API for actual AI responses.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  if (!user) return null;

  return (
    <PageWrapper currentPage="chat">
      <div className="container mx-auto px-4 md:px-6 py-6 h-[calc(100vh-80px)]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Sidebar */}
          <div className="lg:col-span-1 border-3 border-kintsugi-gold bg-digital-black shadow-neo p-6 scanlines overflow-y-auto">
            <h2 className="text-2xl font-bold uppercase text-kintsugi-gold text-neon mb-4">
              [ AI_MODELS ]
            </h2>
            <div className="loading-bar mb-6"></div>

            <div className="space-y-3">
              <button
                onClick={() => setSelectedModel('gpt-4o')}
                className={`w-full text-left p-4 border-3 font-mono font-bold uppercase transition-all ${
                  selectedModel === 'gpt-4o'
                    ? 'border-cyber-cyan bg-cyber-cyan/20 text-cyber-cyan shadow-neo-cyan'
                    : 'border-neutral-700 text-digital-white hover:border-cyber-cyan'
                }`}
              >
                <div className="text-lg">⚡ GPT-4o</div>
                <div className="text-xs text-neutral-500 normal-case">OpenAI flagship</div>
              </button>

              <button
                onClick={() => setSelectedModel('claude-3')}
                className={`w-full text-left p-4 border-3 font-mono font-bold uppercase transition-all ${
                  selectedModel === 'claude-3'
                    ? 'border-cyber-pink bg-cyber-pink/20 text-cyber-pink shadow-neo-pink'
                    : 'border-neutral-700 text-digital-white hover:border-cyber-pink'
                }`}
              >
                <div className="text-lg">🤖 CLAUDE-3</div>
                <div className="text-xs text-neutral-500 normal-case">Anthropic best</div>
              </button>

              <button
                onClick={() => setSelectedModel('o1-preview')}
                className={`w-full text-left p-4 border-3 font-mono font-bold uppercase transition-all ${
                  selectedModel === 'o1-preview'
                    ? 'border-kintsugi-gold bg-kintsugi-gold/20 text-kintsugi-gold shadow-neo'
                    : 'border-neutral-700 text-digital-white hover:border-kintsugi-gold'
                }`}
              >
                <div className="text-lg">🧠 o1-PREVIEW</div>
                <div className="text-xs text-neutral-500 normal-case">Deep reasoning</div>
              </button>
            </div>

            <div className="mt-6 p-4 border-3 border-neutral-700 bg-neutral-900/50">
              <div className="text-sm font-mono text-neutral-500 mb-2">TOKEN USAGE</div>
              <div className="text-lg font-bold text-kintsugi-gold">
                {user.tokensUsed?.toLocaleString() || 0} / {user.tokensLimit?.toLocaleString() || 100000}
              </div>
              <div className="mt-2 w-full h-2 bg-neutral-800 border-2 border-neutral-700">
                <div
                  className="h-full bg-gradient-to-r from-kintsugi-gold to-cyber-pink transition-all"
                  style={{ width: `${((user.tokensUsed || 0) / (user.tokensLimit || 100000)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3 border-3 border-cyber-cyan bg-digital-black shadow-neo-cyan flex flex-col scanlines">
            {/* Header */}
            <div className="border-b-3 border-cyber-cyan p-6">
              <h1 className="text-3xl font-bold uppercase text-cyber-cyan text-neon">
                [ CHAT_INTERFACE // {selectedModel.toUpperCase()} ]
              </h1>
              <div className="loading-bar mt-4"></div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-6xl mb-4 animate-pulse-slow">🤖</div>
                    <h2 className="text-2xl font-bold text-kintsugi-gold uppercase mb-2">READY TO CHAT</h2>
                    <p className="text-neutral-500 font-mono">Send a message to start</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 border-3 font-mono ${
                          msg.role === 'user'
                            ? 'border-kintsugi-gold bg-kintsugi-gold/10 text-digital-white'
                            : 'border-cyber-cyan bg-cyber-cyan/10 text-digital-white'
                        }`}
                      >
                        <div className="text-xs text-neutral-500 mb-2 uppercase">
                          {msg.role === 'user' ? '👤 YOU' : `🤖 ${selectedModel.toUpperCase()}`}
                        </div>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                        <div className="text-xs text-neutral-600 mt-2">
                          {msg.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] p-4 border-3 border-cyber-cyan bg-cyber-cyan/10">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="border-t-3 border-cyber-cyan p-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 font-mono bg-digital-black border-3 border-cyber-cyan focus:border-cyber-cyan focus:shadow-neo-cyan text-digital-white placeholder:text-digital-white/40 outline-none transition-all disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="px-8 py-3 font-mono font-bold uppercase border-3 border-cyber-cyan bg-cyber-cyan text-digital-black shadow-neo-cyan transition-all duration-200 hover:shadow-none hover:translate-x-2 hover:translate-y-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  {isLoading ? '⏳' : '▶ SEND'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
