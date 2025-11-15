'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function ChatPage() {
  return (
    <DashboardLayout>
      <div className="flex h-full">
        <div className="w-80 flex-shrink-0 hidden md:block">
          <ChatSidebar />
        </div>
        <div className="flex-1">
          <ChatInterface />
        </div>
      </div>
    </DashboardLayout>
  );
}
