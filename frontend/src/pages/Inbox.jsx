import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import apiClient from '../api/client';
import { realtimeService } from '../services/realtimeService';
import { BottomNav } from '../components/BottomNav';
import { getPremiumImageUrl } from '../utils/imageUtils';
import { getRandomEmptyMessage } from '../utils/emptyStates';
import { isProfileComplete } from '../utils/profileUtils';
import EmojiPicker from 'emoji-picker-react';

export const Inbox = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  
  // Sidebar state
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [readReceipts, setReadReceipts] = useState({});

  // Active chat state
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [chatInfo, setChatInfo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [userChatIds, setUserChatIds] = useState([]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatThreadRef = useRef(null);

  // Helper for user avatar background coloring
  const getAvatarBg = (name) => {
    const colors = [
      'from-teal-500 to-emerald-600',
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-violet-600',
      'from-pink-500 to-rose-600',
      'from-amber-500 to-orange-600',
      'from-cyan-500 to-blue-600',
      'from-indigo-500 to-purple-600',
      'from-emerald-500 to-teal-600'
    ];
    const code = (name || 'U').charCodeAt(0);
    return colors[code % colors.length];
  };

  // Helper for formatting times in message bubbles
  const formatMsgTime = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  // Helper for formatting dates in headers/chat list
  const formatChatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      
      const isToday = date.toDateString() === now.toDateString();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const isYesterday = date.toDateString() === yesterday.toDateString();
      
      if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (isYesterday) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
      }
    } catch (e) {
      return '';
    }
  };

  const getDayLabel = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const isYesterday = date.toDateString() === yesterday.toDateString();

      if (isToday) return 'Today';
      if (isYesterday) return 'Yesterday';
      return date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  // Autoscroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch all chats for the user (Sidebar list)
  useEffect(() => {
    const fetchChats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setCurrentUserId(user.id);

      try {
        const res = await apiClient.get('/chats');
        const data = res.data.map(chat => ({
          ...chat,
          created_at: chat.createdAt || chat.created_at,
          components: chat.component ? {
            title: chat.component.title,
            price: chat.component.price,
            images: chat.component.image_url ? [chat.component.image_url] : []
          } : null,
          messages: (chat.messages || []).map(m => ({ ...m, created_at: m.createdAt || m.created_at }))
        }));

        // Group chats by the other user's ID to keep a single thread per contact
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
          let allMessages = [];
          userChats.forEach(c => {
            if (c.messages) allMessages.push(...c.messages);
          });
          
          // Sort messages descending to get latest message at index 0
          allMessages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          
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
      } catch (err) {
        console.error('Error fetching chats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [refreshTrigger]);

  // Fetch active chat details and messages when chatId parameter changes
  useEffect(() => {
    const fetchChatDetails = async () => {
      if (!chatId || !currentUserId) return;
      setMessagesLoading(true);
      setShowEmojiPicker(false);
      setShowMenu(false);
      
      try {
        const res = await apiClient.get(`/chats/${chatId}`);
        if (res.data) {
          const chatData = {
            ...res.data,
            components: res.data.component ? { 
              id: res.data.component.id,
              title: res.data.component.title, 
              price: res.data.component.price,
              image_url: res.data.component.image_url
            } : null
          };
          setChatInfo(chatData);
          
          const otherUserId = chatData.buyer_id === currentUserId ? chatData.seller_id : chatData.buyer_id;
          
          // Find related chats for this user pair
          let chatIds = [chatId];
          const chatsRes = await apiClient.get('/chats');
          const relatedChats = chatsRes.data.filter(c => 
            (c.buyer_id === currentUserId && c.seller_id === otherUserId) || 
            (c.buyer_id === otherUserId && c.seller_id === currentUserId)
          );
          if (relatedChats.length > 0) {
            chatIds = relatedChats.map(c => c.id);
          }
          setUserChatIds(chatIds);

          // Fetch messages across all these related chats
          const msgsRes = await apiClient.get(`/messages/chat/${chatIds.join(',')}`);
          if (msgsRes.data) {
            setMessages(msgsRes.data.map(m => ({ ...m, created_at: m.createdAt || m.created_at })));
          }
        }
      } catch (err) {
        console.error("Error loading chat detail messages:", err);
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchChatDetails();
  }, [chatId, currentUserId]);

  // Real-time socket events for chat list updates and active chat message streams
  useEffect(() => {
    if (!currentUserId) return;

    // Refresh chats list on new insertion of chats
    const chatChannel = realtimeService.subscribeToChatsInbox(payload => {
      if (payload.new.buyer_id === currentUserId || payload.new.seller_id === currentUserId) {
        setRefreshTrigger(prev => prev + 1);
      }
    });
      
    // Append message in real-time if it belongs to current active conversation
    const msgChannel = realtimeService.subscribeToMessagesInbox(payload => {
      setRefreshTrigger(prev => prev + 1);
      
      if (chatId && userChatIds.includes(payload.new.chat_id)) {
        setMessages(prev => {
          if (prev.some(m => m.id === payload.new.id)) return prev;
          return [...prev, { ...payload.new, created_at: payload.new.createdAt || payload.new.created_at }];
        });
        
        // Update read receipt locally
        const receipts = JSON.parse(localStorage.getItem('chatReadReceipts') || '{}');
        receipts[chatId] = Date.now();
        localStorage.setItem('chatReadReceipts', JSON.stringify(receipts));
        window.dispatchEvent(new Event('chatReadUpdate'));
      }
    });
      
    return () => {
      realtimeService.unsubscribe(chatChannel);
      realtimeService.unsubscribe(msgChannel);
    };
  }, [currentUserId, chatId, userChatIds]);

  // Update read receipt whenever we see/read new messages in this chat
  useEffect(() => {
    if (chatId && messages.length > 0) {
      const receipts = JSON.parse(localStorage.getItem('chatReadReceipts') || '{}');
      receipts[chatId] = Date.now();
      localStorage.setItem('chatReadReceipts', JSON.stringify(receipts));
      window.dispatchEvent(new Event('chatReadUpdate'));
    }
  }, [messages, chatId]);

  // Send text message action
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || !chatInfo) return;
    
    // Check if user profile details are complete before letting them message
    let profile = null;
    try {
      const profileRes = await apiClient.get(`/users/${currentUserId}`);
      profile = profileRes.data;
    } catch (err) {}
    if (!isProfileComplete(profile)) {
      alert('Please complete your profile details (Name, Register No, Department, Year, Mobile Number) before sending a message.');
      navigate('/profile');
      return;
    }

    try {
      const receiverId = chatInfo.buyer_id === currentUserId ? chatInfo.seller_id : chatInfo.buyer_id;
      const res = await apiClient.post('/messages', {
        chat_id: chatId,
        receiver_id: receiverId,
        content: newMessage
      });
      
      const sentMsg = { ...res.data, created_at: res.data.createdAt || res.data.created_at };
      setNewMessage('');
      setMessages(prev => {
        if (prev.some(m => m.id === sentMsg.id)) return prev;
        return [...prev, sentMsg];
      });
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Failed to send message:", err);
      alert('Error sending message. Please try again.');
    }
  };

  // Upload image attachment to Cloudflare R2 bucket and send message
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !chatInfo) return;
    
    setUploadingImage(true);
    try {
      // 1. Fetch presigned S3/R2 upload URL
      const presignRes = await apiClient.post('/upload/presigned-url', { prefix: 'chat' });
      const { uploadUrl, publicUrl } = presignRes.data;

      // 2. Perform direct PUT upload to R2
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'image/webp'
        }
      });
      
      // 3. Create message reference in chat
      const receiverId = chatInfo.buyer_id === currentUserId ? chatInfo.seller_id : chatInfo.buyer_id;
      const res = await apiClient.post('/messages', {
        chat_id: chatId,
        receiver_id: receiverId,
        content: publicUrl
      });

      const sentMsg = { ...res.data, created_at: res.data.createdAt || res.data.created_at };
      setMessages(prev => {
        if (prev.some(m => m.id === sentMsg.id)) return prev;
        return [...prev, sentMsg];
      });
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Image upload failed:", err);
      alert('Failed to send image attachment.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Add emoji to message input box
  const onEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  // Download entire conversation history to file
  const handleDownloadChat = () => {
    if (!chatInfo || messages.length === 0) return;
    let chatContent = `MakerMart Chat History - ${chatInfo?.components?.title || 'Unknown Item'}\n`;
    chatContent += `Generated on: ${new Date().toLocaleString()}\n\n`;
    
    const isBuyer = chatInfo?.buyer_id === currentUserId;
    const otherUserEmail = isBuyer ? chatInfo?.seller?.email : chatInfo?.buyer?.email;
    const otherUserName = isBuyer ? chatInfo?.seller?.name : chatInfo?.buyer?.name;
    const otherUserFallback = otherUserEmail ? otherUserEmail.split('@')[0] : 'Unknown User';
    const otherName = otherUserName || otherUserFallback;

    messages.forEach(msg => {
      const isMe = msg.sender_id === currentUserId;
      const senderName = isMe ? "You" : otherName;
      const timeStr = new Date(msg.created_at).toLocaleString();
      chatContent += `[${timeStr}] ${senderName}: ${msg.content}\n`;
    });

    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `makermart_chat_${chatId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setShowMenu(false);
  };

  // Filter chats matching active categorization tab and search queries
  const filteredChats = chats.filter(chat => {
    const isBuyer = chat.buyer_id === currentUserId;
    
    // Categorization filter
    if (filter === 'unread') {
      const lastRead = readReceipts[chat.id] || 0;
      const isUnread = chat.messages && chat.messages.some(msg => msg.sender_id !== currentUserId && new Date(msg.created_at).getTime() > lastRead);
      if (!isUnread) return false;
    } else if (filter === 'buying') {
      if (!isBuyer) return false;
    } else if (filter === 'selling') {
      if (isBuyer) return false;
    }
    
    // Search query matching
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const otherUserEmail = isBuyer ? chat.seller?.email : chat.buyer?.email;
      const otherUserName = isBuyer ? chat.seller?.name : chat.buyer?.name;
      const otherUserFallback = otherUserEmail ? otherUserEmail.split('@')[0] : '';
      const nameMatch = (otherUserName || '').toLowerCase().includes(query) || otherUserFallback.toLowerCase().includes(query);
      const productMatch = (chat.components?.title || '').toLowerCase().includes(query);
      
      return nameMatch || productMatch;
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex flex-col font-sans">
        <div className="flex-grow flex flex-col items-center justify-center text-[var(--color-text-secondary)] gap-3">
          <span className="material-symbols-outlined animate-spin text-[32px] text-[var(--color-primary)]">progress_activity</span>
          <span>Loading MakerMarT Chats...</span>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex flex-col font-sans">
        <header className="bg-[var(--color-surface)] sticky top-0 z-50 flex justify-between items-center px-4 md:px-8 w-full h-16 border-b border-[var(--color-border)] shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} aria-label="Go back" className="btn-icon">
              <span className="material-symbols-outlined text-[var(--color-primary)]">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold text-[var(--color-primary)] tracking-tight">Inbox</h1>
          </div>
        </header>
        <div className="flex-grow flex flex-col items-center justify-center text-[var(--color-text-secondary)] py-12 px-4 text-center">
          <span className="material-symbols-outlined text-[64px] mb-4 opacity-40">lock</span>
          <p className="font-semibold text-lg mb-2">Access Denied</p>
          <p className="max-w-xs text-sm mb-6">Please log in with your account to view your messages and chat history.</p>
          <button onClick={() => navigate('/login')} className="bg-[var(--color-primary)] text-white hover:opacity-90 transition-all font-bold px-6 py-2.5 rounded-full shadow-sm">Log In</button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className={`bg-[#f0f2f5] text-[var(--color-text-primary)] font-sans overflow-hidden flex flex-col relative ${chatId ? 'h-screen md:h-[calc(100vh-64px)]' : 'h-[calc(100vh-64px)]'}`}>
      
      {/* WhatsApp Split Layout Wrapper */}
      <div className="flex flex-grow w-full h-full overflow-hidden shadow-2xl relative">
        
        {/* Left Column: Chats List panel */}
        <aside className={`flex flex-col h-full bg-white border-r border-[#e9edef] ${chatId ? 'hidden md:flex md:w-[350px] lg:w-[410px] flex-shrink-0' : 'w-full md:w-[350px] lg:w-[410px] flex-shrink-0'}`}>
          
          {/* List panel Header */}
          <div className="bg-[#f0f2f5] px-4 py-3 flex justify-between items-center h-[60px] border-b border-[#e9edef]">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/')} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-[var(--color-primary)] transition-all">
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <h2 className="font-bold text-lg text-[var(--color-text-primary)] tracking-tight">Chats</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/')} title="Browse Listings" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 text-[#54656f]">
                <span className="material-symbols-outlined text-[22px]">chat_add_on</span>
              </button>
              <button onClick={() => setRefreshTrigger(p => p+1)} title="Refresh Chats" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 text-[#54656f]">
                <span className="material-symbols-outlined text-[22px]">sync</span>
              </button>
            </div>
          </div>

          {/* Search bar Container */}
          <div className="bg-white p-2.5 border-b border-[#f0f2f5] flex items-center gap-2">
            <div className="flex-grow bg-[#f0f2f5] rounded-lg px-3 py-1.5 flex items-center gap-3">
              <span className="material-symbols-outlined text-[18px] text-[#667781] select-none">search</span>
              <input
                type="text"
                placeholder="Search by name or item title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-sm outline-none w-full text-[var(--color-text-primary)] placeholder-[#667781] p-0 focus:ring-0"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-[#667781] hover:text-black">
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* WhatsApp filters */}
          <div className="px-3 py-2 border-b border-[#f0f2f5] flex gap-1.5 overflow-x-auto select-none no-scrollbar">
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'buying', label: 'Buying' },
              { id: 'selling', label: 'Selling' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                  filter === tab.id
                    ? 'bg-[#e7f8f2] text-[var(--color-primary)] border-[var(--color-primary)]'
                    : 'bg-[#f0f2f5] text-[#54656f] border-[#f0f2f5] hover:bg-[#e9edef]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Scrollable list items */}
          <div className="flex-1 overflow-y-auto bg-white scroll-smooth">
            {filteredChats.length === 0 ? (
              <div className="py-12 px-6 text-center text-[var(--color-text-secondary)]">
                <span className="material-symbols-outlined text-[48px] opacity-35 mb-2">chat_bubble</span>
                <p className="text-sm font-medium">{getRandomEmptyMessage('messages')}</p>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isBuyer = chat.buyer_id === currentUserId;
                const otherUserEmail = isBuyer ? chat.seller?.email : chat.buyer?.email;
                const otherUserName = isBuyer ? chat.seller?.name : chat.buyer?.name;
                const otherUserFallback = otherUserEmail ? otherUserEmail.split('@')[0] : 'Unknown User';
                const otherName = otherUserName || otherUserFallback;
                
                const productTitle = chat.components?.title || 'Unknown Item';
                const latestMessage = chat.messages?.[0] || null;
                const snippet = latestMessage
                  ? latestMessage.content.startsWith('http') ? '📷 Photo' : latestMessage.content
                  : 'Click to start chatting.';
                
                const timestamp = latestMessage ? formatChatDate(latestMessage.created_at) : formatChatDate(chat.created_at);
                
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
                const isMe = latestMessage && latestMessage.sender_id === currentUserId;
                
                // Heuristic: if the latest message was sent by me and it's older than 2 minutes, or we have a read receipt, mark it read
                const isRead = latestMessage && isMe && (new Date(latestMessage.created_at).getTime() < lastRead || Date.now() - new Date(latestMessage.created_at).getTime() > 120000);
                
                const isActiveChat = chat.id === chatId;

                return (
                  <div
                    key={chat.id}
                    onClick={() => navigate(`/chat/${chat.id}`)}
                    className={`flex items-center gap-3.5 px-4 py-3.5 border-b border-[#f0f2f5] cursor-pointer transition-all select-none relative hover:bg-[#f0f2f5] ${isActiveChat ? 'bg-[#eae6df]/45 hover:bg-[#eae6df]/60' : ''}`}
                  >
                    {/* User initial avatar circle */}
                    <div className={`w-12 h-12 rounded-full flex-shrink-0 bg-gradient-to-br ${getAvatarBg(otherName)} text-white font-extrabold text-lg flex items-center justify-center shadow-inner border border-black/5`}>
                      {otherName[0].toUpperCase()}
                    </div>
                    
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-bold text-sm text-[var(--color-text-primary)] truncate">{otherName}</span>
                        <span className={`text-[10px] font-bold ${isUnread ? 'text-[var(--color-primary)] font-black' : 'text-[#667781]'}`}>{timestamp}</span>
                      </div>
                      
                      {/* Product details indicator context */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="px-1.5 py-0.5 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[9px] font-black uppercase tracking-wider scale-95 origin-left">
                          {isBuyer ? 'Buying' : 'Selling'}
                        </span>
                        <span className="text-[11px] font-semibold text-[#667781] truncate">{productTitle}</span>
                      </div>
                      
                      {/* Snippet text */}
                      <p className={`text-xs truncate flex items-center ${isUnread ? 'text-[var(--color-text-primary)] font-black' : 'text-[#667781] font-medium'}`}>
                        {isMe && (
                          <span className={`material-symbols-outlined text-[15px] mr-1 select-none flex-shrink-0 ${isRead ? 'text-[#53bdeb]' : 'text-gray-400'}`}>
                            done_all
                          </span>
                        )}
                        <span className="truncate">{snippet}</span>
                      </p>
                    </div>

                    {/* Unread badge / right chevron */}
                    {isUnread && (
                      <div className="absolute right-4 bottom-3 w-5 h-5 flex items-center justify-center bg-[var(--color-primary)] text-white rounded-full text-[10px] font-bold shadow-sm scale-95">
                        {unreadCount}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Column: Chat Window or Placeholder Empty State */}
        <main className={`flex flex-col h-full bg-[#efeae2] relative ${chatId ? 'flex-grow min-w-0' : 'hidden md:flex md:flex-grow md:items-center md:justify-center'}`}>
          
          {chatId ? (
            // ACTIVE CONVERSATION CONTAINER
            <div className="flex flex-col h-full w-full relative">
              
              {/* Active Chat Header */}
              <header className="bg-[#f0f2f5] px-4 py-2 border-b border-[#e9edef] h-[60px] flex justify-between items-center z-30 shadow-sm">
                
                {/* Contact information */}
                <div className="flex items-center gap-3 min-w-0">
                  <button onClick={() => navigate('/inbox')} className="md:hidden w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-[#54656f]">
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  
                  {chatInfo && (
                    <Link to={`/user/${chatInfo.buyer_id === currentUserId ? chatInfo.seller_id : chatInfo.buyer_id}`} className="flex items-center gap-3 min-w-0 hover:opacity-85 transition-opacity">
                      <div className={`w-10 h-10 rounded-full flex-shrink-0 bg-gradient-to-br ${getAvatarBg(chatInfo.buyer_id === currentUserId ? chatInfo.seller?.name : chatInfo.buyer?.name)} text-white font-extrabold text-base flex items-center justify-center border border-black/5 shadow-inner`}>
                        {(chatInfo.buyer_id === currentUserId ? (chatInfo.seller?.name || chatInfo.seller?.email) : (chatInfo.buyer?.name || chatInfo.buyer?.email))[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm text-[var(--color-text-primary)] truncate">
                          {chatInfo.buyer_id === currentUserId ? (chatInfo.seller?.name || chatInfo.seller?.email.split('@')[0]) : (chatInfo.buyer?.name || chatInfo.buyer?.email.split('@')[0])}
                        </span>
                        <span className="text-[10px] font-bold text-[var(--color-success)] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse"></span> Active now
                        </span>
                      </div>
                    </Link>
                  )}
                </div>

                {/* Listing preview & More actions dropdown */}
                <div className="flex items-center gap-3">
                  {chatInfo?.components && (
                    <div className="hidden lg:flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-[#e9edef] shadow-inner select-none hover:bg-gray-50 transition-colors">
                      <span className="material-symbols-outlined text-[16px] text-[var(--color-primary)]">shopping_bag</span>
                      <span className="text-[11px] font-black text-[#54656f] truncate max-w-[120px]">{chatInfo.components.title}</span>
                      <span className="text-[11px] font-black text-[var(--color-primary)]">₹{chatInfo.components.price}</span>
                      <Link to={`/product/${chatInfo.component_id}`} className="text-[10px] font-black text-white bg-[var(--color-primary)] px-2 py-0.5 rounded-full hover:opacity-90 ml-1">
                        View
                      </Link>
                    </div>
                  )}
                  
                  {/* Option Dropdown Trigger */}
                  <div className="relative">
                    <button onClick={() => setShowMenu(!showMenu)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 text-[#54656f]">
                      <span className="material-symbols-outlined text-[22px]">more_vert</span>
                    </button>
                    {showMenu && (
                      <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-lg shadow-xl border border-[#e9edef] z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                        {chatInfo?.component_id && (
                          <Link to={`/product/${chatInfo.component_id}`} className="lg:hidden w-full text-left px-4 py-2.5 text-xs font-bold text-[var(--color-text-primary)] hover:bg-[#f0f2f5] transition-colors flex items-center gap-2 border-b border-[#e9edef]">
                            <span className="material-symbols-outlined text-[16px] text-[#54656f]">shopping_bag</span> View Listing Details
                          </Link>
                        )}
                        <button onClick={handleDownloadChat} className="w-full text-left px-4 py-2.5 text-xs font-bold text-[var(--color-text-primary)] hover:bg-[#f0f2f5] transition-colors flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-[#54656f]">download</span> Download Chat History
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </header>

              {/* Sticky Info Alert */}
              <div className="bg-[#e7f8f2] text-[var(--color-primary)] py-1.5 px-4 flex items-center justify-center gap-2 text-[10px] font-black tracking-wider uppercase border-b border-[#e9edef] shadow-inner select-none">
                <span className="material-symbols-outlined text-sm">security</span>
                <span>Security Notice: Meet in safe campus zones. Chats expire in 15 days.</span>
              </div>

              {/* Chat messages list wrapper */}
              <div 
                ref={chatThreadRef}
                className="flex-1 w-full overflow-y-auto px-4 md:px-8 py-4 space-y-3 bg-[#efeae2] relative"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%239C92AC' fill-opacity='0.04'%3E%3Cpath fill-rule='evenodd' d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm1-61c3.148 0 5.7-2.552 5.7-5.7 0-3.148-2.552-5.7-5.7-5.7-3.148 0-5.7 2.552-5.7 5.7 0 3.148 2.552 5.7 5.7 5.7zm10 50c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm-20-8c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z'/%3E%3C/g%3E%3C/svg%3E")`
                }}
              >
                {messagesLoading ? (
                  <div className="h-full w-full flex flex-col justify-center items-center text-[#667781] gap-2">
                    <span className="material-symbols-outlined animate-spin text-[24px] text-[var(--color-primary)]">progress_activity</span>
                    <span className="text-xs font-semibold">Retrieving message log...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full w-full flex flex-col justify-center items-center text-[#667781] select-none text-center p-8 py-24">
                    <div className="w-[260px] md:w-[320px] flex flex-col items-center">
                      <span className="material-symbols-outlined text-[48px] opacity-25 mb-3">chat</span>
                      <p className="font-semibold text-sm mb-1">No messages yet</p>
                      <p className="text-xs leading-relaxed opacity-75">
                        Send a message to introduce yourself and start discussing this listing details!
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.sender_id === currentUserId;
                    const timeStr = formatMsgTime(msg.created_at);
                    
                    // Group messages by day headers
                    const currentMsgDate = getDayLabel(msg.created_at);
                    const prevMsgDate = index > 0 ? getDayLabel(messages[index - 1].created_at) : null;
                    const showDateSeparator = currentMsgDate !== prevMsgDate;

                    const lastRead = readReceipts[chatId] || 0;
                    // Heuristic: if the message was sent by me and it's older than 2 minutes, or we have a read receipt, mark it read
                    const isRead = isMe && (new Date(msg.created_at).getTime() < lastRead || Date.now() - new Date(msg.created_at).getTime() > 120000);

                    return (
                      <React.Fragment key={msg.id}>
                        {showDateSeparator && (
                          <div className="flex justify-center my-4 select-none">
                            <span className="bg-white/90 text-[#54656f] text-[10px] font-black px-3.5 py-1 rounded-lg border border-[#e9edef] shadow-sm uppercase tracking-wider">
                              {currentMsgDate}
                            </span>
                          </div>
                        )}
                        
                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}>
                          <div className="max-w-[85%] md:max-w-[70%] relative group">
                            
                            {/* Speech bubble */}
                            <div 
                              className={`p-3 rounded-xl shadow-[0_1px_0.5px_rgba(11,20,26,.13)] text-[14px] leading-relaxed relative ${
                                isMe 
                                  ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none' 
                                  : 'bg-white text-[#111b21] rounded-tl-none border border-[#e9edef]'
                              }`}
                              style={{ 
                                wordBreak: 'break-word',
                                paddingBottom: '22px', 
                                paddingRight: '48px' 
                              }}
                            >
                              {/* Content check if image url */}
                              {msg.content.startsWith('http') && (msg.content.includes('r2.dev') || msg.content.includes('r2.cloudflarestorage.com') || msg.content.includes('cloudinary')) ? (
                                <div className="rounded-lg overflow-hidden border border-black/5 bg-black/5 mb-1 max-w-full">
                                  <img 
                                    src={getPremiumImageUrl(msg.content)} 
                                    alt="Chat attachment" 
                                    className="max-w-full max-h-[300px] object-contain hover:scale-[1.01] transition-transform duration-200 cursor-zoom-in"
                                    onClick={() => window.open(msg.content, '_blank')}
                                  />
                                </div>
                              ) : (
                                <p className="font-medium whitespace-pre-wrap">{msg.content}</p>
                              )}
                              
                              {/* Bubble metadata bottom right */}
                              <div className="absolute bottom-1 right-2.5 flex items-center gap-1 select-none">
                                <span className="text-[9px] text-[#667781] font-semibold">{timeStr}</span>
                                {isMe && (
                                  <span className={`material-symbols-outlined text-[15px] leading-none ${isRead ? 'text-[#53bdeb]' : 'text-gray-400'}`}>
                                    done_all
                                  </span>
                                )}
                              </div>

                            </div>

                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* WhatsApp bottom message input footer */}
              <footer className="bg-[#f0f2f5] border-t border-[#e9edef] px-4 pt-3 pb-3 md:pb-7 flex items-center gap-3 relative z-20">
                {/* Emoji toggle & file attachments */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                    className={`w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors ${showEmojiPicker ? 'text-[var(--color-primary)]' : 'text-[#54656f]'}`}
                    title="Emojis"
                  >
                    <span className="material-symbols-outlined text-[24px]">sentiment_satisfied</span>
                  </button>
                  <button 
                    onClick={() => fileInputRef.current.click()} 
                    disabled={uploadingImage} 
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 text-[#54656f] disabled:opacity-50 transition-colors"
                    title="Attach Image"
                  >
                    <span className="material-symbols-outlined text-[24px]">{uploadingImage ? 'hourglass_empty' : 'add'}</span>
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageSelect} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
                
                {/* Input Text Area Container */}
                <div className="flex-grow relative">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                    className="w-full bg-white border border-none rounded-full px-5 py-2 text-sm outline-none text-[var(--color-text-primary)] placeholder-[#667781] focus:ring-0 shadow-[0_1px_1px_rgba(0,0,0,0.04)]"
                  />
                  {showEmojiPicker && (
                    <div className="absolute bottom-[calc(100%+14px)] left-0 shadow-2xl rounded-xl overflow-hidden border border-[#e9edef] z-50">
                      <EmojiPicker onEmojiClick={onEmojiClick} />
                    </div>
                  )}
                </div>

                {/* Send Button or Mic button */}
                <div className="flex-shrink-0">
                  {newMessage.trim() ? (
                    <button 
                      onClick={handleSendMessage} 
                      className="w-9 h-9 rounded-full bg-[var(--color-primary)] text-white hover:opacity-90 flex items-center justify-center shadow-md active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">send</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => alert('Voice notes coming soon!')}
                      className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 text-[#54656f]"
                      title="Voice Message"
                    >
                      <span className="material-symbols-outlined text-[22px]">mic</span>
                    </button>
                  )}
                </div>

              </footer>

            </div>
          ) : (
            // DEFAULT EMPTY/UNSELECTED STATE LAYOUT
            <div className="h-full w-full bg-[#f8f9fa] flex flex-col justify-center items-center text-center p-8 select-none border-l border-[#e9edef]">
              <div className="w-[280px] md:w-[320px] max-w-full flex flex-col items-center justify-center">
                {/* Decorative icon wrapper */}
                <div className="w-24 h-24 rounded-full bg-[#e7f8f2] text-[var(--color-primary)] flex items-center justify-center mb-6 shadow-sm border border-emerald-100">
                  <span className="material-symbols-outlined text-[48px] animate-pulse">forum</span>
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2.5">MakerMarT Inbox</h3>
                <p className="text-xs text-[#667781] leading-relaxed mb-6 font-medium">
                  Select a chat conversation from the list to start messaging. Discuss component listings, align prices, and negotiate secure on-campus deliveries instantly.
                </p>
                <div className="flex items-center gap-1.5 justify-center py-1 bg-[#efeae2]/50 px-4 rounded-full border border-gray-100">
                  <span className="material-symbols-outlined text-[14px] text-[#667781]">lock</span>
                  <span className="text-[10px] text-[#667781] font-bold uppercase tracking-wider">Secure On-Campus Messaging</span>
                </div>
              </div>
            </div>
          )}
          
        </main>
        
      </div>
      
      {/* Hide Bottom Nav on mobile inside active chat view */}
      {(!chatId || window.innerWidth >= 768) && <BottomNav />}
      
    </div>
  );
};
