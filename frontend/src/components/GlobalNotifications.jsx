import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import apiClient from '../api/client';
import { realtimeService } from '../services/realtimeService';
import { useNavigate, useLocation } from 'react-router-dom';

export const GlobalNotifications = () => {
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let chatIds = [];
    let currentUserId = null;
    let chatsData = [];
    let channel = null;

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      currentUserId = user.id;

      try {
        const res = await apiClient.get('/chats');
        const data = res.data;
        if (data) {
          chatsData = data;
          chatIds = data.map(c => c.id);
        }
      } catch (err) {
        console.error("Error fetching chats for notifications", err);
      }
      
      channel = realtimeService.subscribeToGlobalNotifications(payload => {
          const msg = payload.new;
          if (msg.sender_id !== currentUserId && chatIds.includes(msg.chat_id)) {
            // Check if we are currently in this chat
            if (location.pathname !== `/chat/${msg.chat_id}`) {
              // Find the chat to get the sender's name
              const chat = chatsData.find(c => c.id === msg.chat_id);
              let senderName = 'Someone';
              if (chat) {
                const isBuyer = chat.buyer_id === msg.sender_id;
                const email = isBuyer ? chat.buyer?.email : chat.seller?.email;
                if (email) senderName = email.split('@')[0];
              }
              
              setToast({
                chatId: msg.chat_id,
                message: msg.content,
                sender: senderName
              });
              
              setTimeout(() => {
                setToast(null);
              }, 5000);
            }
          }
      });
    };

    setup();
    
    return () => {
      if (channel) {
        realtimeService.unsubscribe(channel);
      }
    };
  }, [location.pathname]);

  if (!toast) return null;

  return (
    <div className="fixed top-20 right-4 z-[9999] bg-surface border border-outline-variant rounded-xl shadow-lg p-4 max-w-sm">
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
            {toast.sender[0].toUpperCase()}
          </div>
          <div>
            <h4 className="text-sm font-bold text-on-surface">New message from {toast.sender}</h4>
            <p className="text-xs text-on-surface-variant line-clamp-2">{toast.message}</p>
          </div>
        </div>
        <button onClick={() => setToast(null)} className="text-outline-variant hover:text-on-surface">
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
      <button 
        onClick={() => {
          setToast(null);
          navigate(`/chat/${toast.chatId}`);
        }}
        className="mt-3 w-full bg-primary text-on-primary py-1.5 rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors"
      >
        View Message
      </button>
    </div>
  );
};
