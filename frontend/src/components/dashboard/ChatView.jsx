import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Users, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { fetchChatMessages, sendChatMessage } from '../../api/chat';

export default function ChatView({ trip, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const loadMessages = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const data = await fetchChatMessages(trip.id);
      setMessages(data);
    } catch (err) {
      if (!silent) setError(err.message || 'Failed to load chat messages');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (trip?.id) {
      loadMessages();
      // Auto-poll messages every 5 seconds for live collaboration
      const interval = setInterval(() => loadMessages(true), 5000);
      return () => clearInterval(interval);
    }
  }, [trip?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    setError('');
    const textToSend = newMessage.trim();
    setNewMessage('');

    try {
      await sendChatMessage(trip.id, textToSend);
      await loadMessages(true);
    } catch (err) {
      setError(err.message || 'Failed to send message');
      setNewMessage(textToSend); // Restore text on failure
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? ''
      : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-700 to-purple-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-purple-200 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Collaboration Room</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {trip.title} Group Chat
          </h2>
          <p className="text-purple-100 text-xs">
            Discuss plans, share recommendations, and align on expenses in real-time.
          </p>
        </div>

        <button
          onClick={() => loadMessages(false)}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-md transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Chat Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Feed */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[520px]">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-sm">Trip Discussion</h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              {messages.length} Message{messages.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-slate-50/40">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-14 bg-slate-100 rounded-2xl max-w-sm"></div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">No messages yet</h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Start the conversation with your trip group below!
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = currentUser && (msg.sender_id === currentUser.id || msg.sender?.email === currentUser.email);
                const senderName = msg.sender?.full_name || `User #${msg.sender_id}`;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-400 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0 mt-1">
                        {senderName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end text-right' : 'items-start'}`}>
                      <div className="flex items-center space-x-2 px-1">
                        <span className="text-[10px] font-bold text-slate-500">{senderName}</span>
                        <span className="text-[9px] text-slate-400">{formatTime(msg.created_at)}</span>
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed font-medium shadow-xs ${
                          isMe
                            ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-tr-xs'
                            : 'bg-white text-slate-800 border border-slate-100 rounded-tl-xs'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>

                    {isMe && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0 mt-1">
                        {senderName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-white flex items-center space-x-2">
            <input
              type="text"
              placeholder="Type a message to your trip group..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white placeholder-slate-400 font-medium"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{sending ? '...' : 'Send'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Sidebar: Group Members */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 h-fit">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Users className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Group Members</h3>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {trip.members && trip.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-400 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                    {member.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{member.full_name}</p>
                    <p className="text-[9px] text-slate-400">{member.email}</p>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" title="Active"></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
