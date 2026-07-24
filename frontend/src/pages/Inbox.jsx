import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import apiClient from '../api/client';
import { realtimeService } from '../services/realtimeService';
import { BottomNav } from '../components/BottomNav';
import { getPremiumImageUrl } from '../utils/imageUtils';
import { getRandomEmptyMessage } from '../utils/emptyStates';

export const Inbox = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [readReceipts, setReadReceipts] = useState({});

  useEffect(() => {
    const fetchChats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setCurrentUserId(user.id);

      let data = null;
      let error = null;
      try {
        const res = await apiClient.get('/chats');
        // Adapt Express response to match expected Supabase format
        data = res.data.map(chat => ({
          ...chat,
          created_at: chat.createdAt || chat.created_at,
          components: chat.component ? {
            title: chat.component.title,
            images: chat.component.image_url ? [chat.component.image_url] : []
          } : null,
          messages: (chat.messages || []).map(m => ({...m, created_at: m.createdAt || m.created_at}))
        }));
      } catch (err) {
        error = err;
      }
      if (data) {
        // Group by otherId
        const groups = {};
        
        data.forEach(chat => {
          const isBuyer = chat.buyer_id === user.id;
          const otherId = isBuyer ? chat.seller_id : chat.buyer_id;
          
          if (!groups[otherId]) {
            groups[otherId] = [];
          }
          groups[otherId].push(chat);
        });
        
        const consolidatedChats = Object.values(groups).map(userChats => {
          // Combine all messages across all chats with this user
          let allMessages = [];
          userChats.forEach(c => {
            if (c.messages) allMessages.push(...c.messages);
          });
          
          // Sort messages descending
          allMessages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          
          // Sort userChats by last activity
          userChats.sort((a, b) => {
             const lastActA = a.messages && a.messages.length > 0 ? new Date(Math.max(...a.messages.map(m => new Date(m.created_at).getTime()))) : new Date(a.created_at).getTime();
             const lastActB = b.messages && b.messages.length > 0 ? new Date(Math.max(...b.messages.map(m => new Date(m.created_at).getTime()))) : new Date(b.created_at).getTime();
             return lastActB - lastActA;
          });
          
          const repChat = { ...userChats[0] };
          repChat.messages = allMessages;
          repChat.lastActivity = allMessages.length > 0 ? new Date(allMessages[0].created_at).getTime() : new Date(repChat.created_at).getTime();
          
          return repChat;
        });
        
        consolidatedChats.sort((a, b) => b.lastActivity - a.lastActivity);
        
        setChats(consolidatedChats);
        setReadReceipts(JSON.parse(localStorage.getItem('chatReadReceipts') || '{}'));
      } else if (error) {
        console.error('Error fetching chats:', error);
      }
      setLoading(false);
    };

    fetchChats();
  }, [refreshTrigger]);

  useEffect(() => {
    if (!currentUserId) return;
    const chatChannel = realtimeService.subscribeToChatsInbox(payload => {
        if (payload.new.buyer_id === currentUserId || payload.new.seller_id === currentUserId) {
          setRefreshTrigger(prev => prev + 1);
        }
    });
      
    const msgChannel = realtimeService.subscribeToMessagesInbox(payload => {
        setRefreshTrigger(prev => prev + 1);
    });
      
    return () => {
      realtimeService.unsubscribe(chatChannel);
      realtimeService.unsubscribe(msgChannel);
    };
  }, [currentUserId]);

  if (loading) return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col font-sans">
      <header className="bg-[var(--color-surface)] sticky top-0 z-50 flex justify-between items-center px-4 md:px-8 w-full h-16 border-b border-[var(--color-border)] shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} aria-label="Go back" className="btn-icon">
            <span className="material-symbols-outlined text-[var(--color-primary)]">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-[var(--color-primary)] tracking-tight">Inbox</h1>
        </div>
      </header>
      <div className="flex-grow flex items-center justify-center text-[var(--color-text-secondary)]">Loading Inbox...</div>
      <BottomNav />
    </div>
  );
  
  if (!currentUserId) return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col font-sans">
      <header className="bg-[var(--color-surface)] sticky top-0 z-50 flex justify-between items-center px-4 md:px-8 w-full h-16 border-b border-[var(--color-border)] shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} aria-label="Go back" className="btn-icon">
            <span className="material-symbols-outlined text-[var(--color-primary)]">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-[var(--color-primary)] tracking-tight">Inbox</h1>
        </div>
      </header>
      <div className="flex-grow flex items-center justify-center text-[var(--color-text-secondary)]">Please log in to view inbox.</div>
      <BottomNav />
    </div>
  );

  return (
    <div className="bg-[var(--color-background)] text-[var(--color-text-primary)] font-sans min-h-screen pb-24">
      
      {/* TopAppBar */}
      <header className="bg-[var(--color-surface)] sticky top-0 z-50 flex justify-between items-center px-4 md:px-8 w-full h-16 border-b border-[var(--color-border)] shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} aria-label="Go back" className="btn-icon">
            <span className="material-symbols-outlined text-[var(--color-primary)]">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-[var(--color-primary)] tracking-tight">Inbox</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/?favorites=true')} className="p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] transition-colors rounded-full">
            <span className="material-symbols-outlined">favorite</span>
          </button>
          <button onClick={() => navigate('/?filter=open')} className="p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] transition-colors rounded-full">
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow pb-20 md:pb-0 max-w-6xl mx-auto w-full px-4 md:px-8 py-8">
        
        {/* Screen Header & Filters */}
        <div className="mb-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-h2">Messages</h2>
            <div className="flex gap-3">
              <button onClick={() => setFilter('all')} className={`px-5 py-2 rounded-full font-bold text-sm transition-all shadow-sm border ${filter === 'all' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-background)]'}`}>All</button>
              <button onClick={() => setFilter('unread')} className={`px-5 py-2 rounded-full font-bold text-sm transition-all shadow-sm border ${filter === 'unread' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-background)]'}`}>Unread</button>
            </div>
          </div>
        </div>

        {/* Chat List Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Chat List (8 cols) */}
          <div className="lg:col-span-8 space-y-3 overflow-y-auto pr-2">
            {chats.filter(chat => {
              if (filter === 'all') return true;
              if (filter === 'unread') {
                const lastRead = readReceipts[chat.id] || 0;
                return chat.messages && chat.messages.some(msg => msg.sender_id !== currentUserId && new Date(msg.created_at).getTime() > lastRead);
              }
              return true;
            }).length === 0 ? (
              <div className="py-12 text-center text-[var(--color-text-secondary)]">
                <p>{getRandomEmptyMessage('messages')}</p>
              </div>
            ) : chats.filter(chat => {
              if (filter === 'all') return true;
              if (filter === 'unread') {
                const lastRead = readReceipts[chat.id] || 0;
                return chat.messages && chat.messages.some(msg => msg.sender_id !== currentUserId && new Date(msg.created_at).getTime() > lastRead);
              }
              return true;
            }).map((chat) => {
              const isBuyer = chat.buyer_id === currentUserId;
              const otherUserEmail = isBuyer ? chat.seller?.email : chat.buyer?.email;
              const otherUserName = otherUserEmail ? otherUserEmail.split('@')[0] : 'Unknown User';
              const productImg = chat.components?.images?.[0] ? getPremiumImageUrl(chat.components.images[0]) : null;
              const productTitle = chat.components?.title || 'Unknown Item';
              
              const latestMessage = chat.messages?.[0] || null;
              const lastMessageContent = latestMessage ? latestMessage.content : 'Click to view conversation.';
              
              const lastRead = readReceipts[chat.id] || 0;
              let unreadCount = 0;
              if (chat.messages) {
                for (let msg of chat.messages) {
                  if (msg.sender_id !== currentUserId && new Date(msg.created_at).getTime() > lastRead) {
                    unreadCount++;
                  } else {
                    break;
                  }
                }
              }
              const isUnread = unreadCount > 0;
              
              const handleOpenChat = () => {
                const receipts = JSON.parse(localStorage.getItem('chatReadReceipts') || '{}');
                receipts[chat.id] = Date.now();
                localStorage.setItem('chatReadReceipts', JSON.stringify(receipts));
                window.dispatchEvent(new Event('chatReadUpdate'));
                navigate(`/chat/${chat.id}`);
              };
              
              return (
                <div key={chat.id} className="flex items-center gap-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-background)] transition-colors cursor-pointer group rounded-2xl shadow-sm" onClick={handleOpenChat}>
                  <div className="relative w-16 h-16 flex-shrink-0 bg-[var(--color-background)] flex items-center justify-center rounded-xl border border-[var(--color-border)] overflow-hidden">
                    {productImg ? (
                      <img alt="Component Thumbnail" className="w-full h-full object-cover" src={productImg} onError={(e) => { e.target.src = 'https://placehold.co/400x400/F8FAFC/46A857?text=Image+Not+Found'; }} />
                    ) : (
                      <span className="material-symbols-outlined text-[24px] text-[var(--color-text-secondary)] opacity-50">image_not_supported</span>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">{otherUserName}</span>
                    </div>
                    <h3 className={`text-base truncate mb-1 ${isUnread ? 'font-bold text-[var(--color-text-primary)]' : 'font-semibold text-[var(--color-text-primary)]'}`}>{productTitle}</h3>
                    <p className={`text-sm truncate ${isUnread ? 'font-bold text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] font-medium'}`}>{lastMessageContent}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {isUnread && (
                      <div className="w-6 h-6 flex items-center justify-center bg-[var(--color-primary)] text-white rounded-full text-xs font-bold shadow-sm">
                        {unreadCount}
                      </div>
                    )}
                    <span className="material-symbols-outlined text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)] transition-colors">chevron_right</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Stats/Help (4 cols) */}
          <div className="hidden lg:flex flex-col gap-6 lg:col-span-4">
            <div className="p-6 bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-[var(--color-success)]">
                <span className="material-symbols-outlined">security</span>
                <h4 className="text-sm font-bold uppercase tracking-wider">Safety Tip</h4>
              </div>
              <p className="text-sm text-[var(--color-text-primary)] font-medium leading-relaxed">Always meet in well-lit campus areas for local trades. For shipping, use the MakerMart payment system for buyer protection.</p>
            </div>
          </div>
          
        </section>
      </main>

      <BottomNav />
    </div>
  );
};
