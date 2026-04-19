'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import Avatar from '@/components/ui/Avatar';
import { SendIcon, BookOpenIcon } from 'lucide-react';
import { timeAgo } from '@/lib/utils';

const DUAS = ['آمين', 'سبحان الله', 'ما شاء الله', 'جزاك الله خيرا', 'بارك الله فيك'];

function Message({ msg, isOwn, currentUser }) {
  const name = msg.profiles?.display_name || 'Friend';

  return (
    <div className={`flex gap-2 mb-4 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {!isOwn && <Avatar name={name} size="xs" className="mt-1 flex-shrink-0" />}
      <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isOwn && (
          <span className="text-xs text-ink-400 mb-1 ml-1">{name}</span>
        )}

        {/* Verse share card */}
        {msg.verse_key && (
          <div className={`rounded-2xl p-3 mb-1 border
            ${isOwn ? 'bg-primary-50 border-primary-200' : 'bg-white border-ink-100'}`}>
            <div className="flex items-center gap-1.5 text-xs text-primary-600 mb-1">
              <BookOpenIcon size={11} />
              <span className="font-medium">{msg.verse_key}</span>
            </div>
            {msg.body && <p className="text-sm text-ink-700">{msg.body}</p>}
          </div>
        )}

        {/* Regular message */}
        {msg.body && !msg.verse_key && (
          <div className={`rounded-2xl px-4 py-2.5
            ${isOwn
              ? 'bg-primary-400 text-white rounded-tr-sm'
              : 'bg-white text-ink-800 rounded-tl-sm border border-ink-100'
            }`}>
            <p className="text-sm leading-relaxed">{msg.body}</p>
          </div>
        )}

        <span className="text-xs text-ink-400 mt-1 mx-1">
          {timeAgo(msg.created_at)}
        </span>
      </div>
    </div>
  );
}

export default function CircleChat({ circleId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const supabase = createClient();

  useEffect(() => {
    if (!circleId) return;

    // Load existing messages
    supabase
      .from('circle_messages')
      .select('*, profiles(display_name, avatar_seed)')
      .eq('circle_id', circleId)
      .order('created_at', { ascending: true })
      .limit(50)
      .then(({ data }) => {
        setMessages(data || []);
        setLoading(false);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      });

    // Realtime subscription
    const channel = supabase
      .channel(`chat-${circleId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'circle_messages',
        filter: `circle_id=eq.${circleId}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [circleId]);

  const sendMessage = async (body, verseKey = null) => {
    if (!body.trim() && !verseKey) return;
    setSending(true);

    const { error } = await supabase
      .from('circle_messages')
      .insert({
        circle_id: circleId,
        user_id: currentUser?.id,
        body: body.trim() || null,
        verse_key: verseKey,
      });

    if (!error) setInput('');
    setSending(false);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 rounded-full border-2 border-primary-400 border-t-transparent animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <p className="text-3xl">💬</p>
            <p className="text-sm text-ink-400 text-center">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map(msg => (
            <Message
              key={msg.id}
              msg={msg}
              isOwn={msg.user_id === currentUser?.id}
              currentUser={currentUser}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Du'a quick-replies */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
        {DUAS.map(dua => (
          <button
            key={dua}
            onClick={() => sendMessage(dua)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-primary-50 text-primary-600
                       border border-primary-100 hover:bg-primary-100 transition-colors font-arabic"
          >
            {dua}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 flex gap-2">
        <input
          type="text"
          className="input flex-1 text-sm"
          placeholder="Say something to your circle…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={500}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || sending}
          className="w-10 h-10 rounded-xl bg-primary-400 text-white flex items-center justify-center
                     hover:bg-primary-600 disabled:opacity-40 transition-all active:scale-95"
        >
          <SendIcon size={16} />
        </button>
      </div>
    </div>
  );
}
