'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import api from '@/lib/api';

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  caption?: string;
  expires_at: string;
  created_at: string;
  views?: Array<{ user_id: string }>;
}

export const Stories: React.FC = () => {
  const { accessToken, user } = useAuthStore();
  const [stories, setStories] = useState<Story[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number | null>(null);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    if (!accessToken || !user) return;

    try {
      const data: any = await api.messenger.getMessages(user.id, accessToken);
      setStories(data);
    } catch (error) {
      console.error('Load stories error:', error);
    }
  };

  const handleViewStory = (index: number) => {
    setCurrentStoryIndex(index);
  };

  const handleNext = () => {
    if (currentStoryIndex !== null && currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      setCurrentStoryIndex(null);
    }
  };

  const handlePrevious = () => {
    if (currentStoryIndex !== null && currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  return (
    <div className="p-4 border-b-3 border-cyber-pink bg-cyber-pink/5">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {/* Add Story */}
        <div
          className="flex-shrink-0 cursor-pointer"
          onClick={() => {
            /* Open story creator */
          }}
        >
          <div className="w-16 h-16 rounded-full border-3 border-dashed border-kintsugi-gold bg-kintsugi-gold/10 flex items-center justify-center text-2xl hover:bg-kintsugi-gold/20 transition-colors">
            ➕
          </div>
          <p className="text-xs font-mono text-center mt-1 text-digital-white/60">
            Add Story
          </p>
        </div>

        {/* User Stories */}
        {stories.map((story, index) => (
          <div
            key={story.id}
            className="flex-shrink-0 cursor-pointer"
            onClick={() => handleViewStory(index)}
          >
            <div className="w-16 h-16 rounded-full border-3 border-cyber-pink bg-cyber-pink/20 flex items-center justify-center overflow-hidden hover:border-kintsugi-gold transition-colors">
              {story.media_type === 'image' ? (
                <img
                  src={story.media_url}
                  alt="Story"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl">📹</span>
              )}
            </div>
            <p className="text-xs font-mono text-center mt-1 text-digital-white/60 truncate w-16">
              User {story.user_id.slice(0, 4)}
            </p>
          </div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {currentStoryIndex !== null && (
        <Modal
          isOpen={true}
          onClose={() => setCurrentStoryIndex(null)}
          size="full"
        >
          <div className="relative h-[80vh]">
            {/* Progress Bars */}
            <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
              {stories.map((_, index) => (
                <div
                  key={index}
                  className="h-1 flex-1 bg-digital-white/20 rounded"
                >
                  <div
                    className={`h-full rounded transition-all ${
                      index === currentStoryIndex
                        ? 'bg-kintsugi-gold w-full'
                        : index < currentStoryIndex
                        ? 'bg-digital-white w-full'
                        : 'bg-transparent w-0'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Story Content */}
            <div className="h-full flex items-center justify-center bg-digital-black">
              {stories[currentStoryIndex].media_type === 'image' ? (
                <img
                  src={stories[currentStoryIndex].media_url}
                  alt="Story"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <video
                  src={stories[currentStoryIndex].media_url}
                  className="max-w-full max-h-full"
                  autoPlay
                  controls
                />
              )}

              {/* Caption */}
              {stories[currentStoryIndex].caption && (
                <div className="absolute bottom-20 left-0 right-0 p-4">
                  <p className="text-center font-mono text-digital-white bg-digital-black/70 p-4 rounded">
                    {stories[currentStoryIndex].caption}
                  </p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStoryIndex === 0}
                className="pointer-events-auto"
              >
                ←
              </Button>
              <Button
                variant="ghost"
                onClick={handleNext}
                className="pointer-events-auto"
              >
                →
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
