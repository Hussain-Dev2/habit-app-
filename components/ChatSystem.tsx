'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Send, User as UserIcon } from 'lucide-react';

interface ChatUser {
  id: string;
  name: string | null;
  image: string | null;
  points: number;
  isAdmin: boolean;
}

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  user: ChatUser;
}

export default function ChatSystem() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/chat');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });

      if (res.ok) {
        setNewMessage('');
        fetchMessages(); // Refresh immediately
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
        <UserIcon className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Sign in to Chat</h2>
        <p className="text-gray-400">Join the global community conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Global Community Chat
        </h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Be the first to say hello!
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.user.id === (session.user as any)?.id;
            const isAdmin = msg.user.isAdmin;

            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    isAdmin
                      ? isOwn
                        ? 'bg-yellow-600 text-white border border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.4)] rounded-br-none'
                        : 'bg-yellow-900/50 text-yellow-100 border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)] rounded-bl-none'
                      : isOwn
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-800 text-gray-200 rounded-bl-none'
                  }`}
                >
                  {(isAdmin || !isOwn) && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold ${isAdmin ? (isOwn ? 'text-yellow-100' : 'text-yellow-400') : 'text-blue-400'}`}>
                        {msg.user.name || 'Anonymous'}
                      </span>
                      {isAdmin && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${isOwn ? 'bg-white text-yellow-700' : 'bg-yellow-500 text-black'}`}>
                          Admin
                        </span>
                      )}
                      {!isAdmin && (
                        <span className="text-[10px] text-gray-500 bg-gray-900 px-1 rounded">
                          {msg.user.points} pts
                        </span>
                      )}
                    </div>
                  )}
                  <p className="break-words">{msg.content}</p>
                  <div className={`text-[10px] mt-1 ${isAdmin ? (isOwn ? 'text-yellow-100/80' : 'text-yellow-500/70') : isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
