'use client';
import { useState, useEffect } from 'react';
import CircleChat from '@/components/chat/CircleChat';
import { useUserCircle } from '@/hooks/useUserCircle';
import { createClient } from '@/lib/supabase/client';

export default function ChatPage() {
  const { circleId } = useUserCircle();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function getCurrentUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setCurrentUser({
          id: user.id,
          display_name: user.user_metadata?.display_name || 'You'
        });
      }
    }
    
    getCurrentUser();
  }, []);

  if (!circleId || !currentUser) {
    return (
      <div className="flex flex-col h-screen bg-ink-50">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-ink-500">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter flex flex-col h-screen">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 border-b border-ink-100 bg-ink-50 flex-shrink-0">
        <p className="text-xs font-medium text-ink-400 uppercase tracking-widest">Circle chat</p>
        <h1 className="text-xl font-display font-semibold text-ink-900 mt-0.5">
          Al-Noor Family
        </h1>
      </div>

      {/* Chat fills remaining space */}
      <div className="flex-1 overflow-hidden">
        <CircleChat
          circleId={circleId}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}
