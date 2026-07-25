import React, { useState, useRef, useEffect } from 'react';

export const AiChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hi there! I am your AI assistant. How can I help with your projects or MakerMart today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now(), 
          sender: 'bot', 
          text: "I am currently in demo mode. Once hooked up to the Gemini API on the backend, I will be able to answer your question!" 
        }
      ]);
    }, 1500);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-4 md:bottom-24 md:right-8 z-[60] bg-[var(--color-primary)] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform ${isOpen ? 'scale-0' : 'scale-100'}`}
        aria-label="Open AI Assistant"
      >
        <span className="material-symbols-outlined text-3xl">smart_toy</span>
      </button>

      {/* Backdrop overlay (visible on mobile when open) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-[90] md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-in Chat Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-[90vw] md:w-[400px] bg-[var(--color-background)] border-l border-[var(--color-border)] shadow-2xl z-[100] flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-card)]">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--color-primary)]/10 p-2 rounded-lg">
              <span className="material-symbols-outlined text-[var(--color-primary)]">smart_toy</span>
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-text-primary)]">Maker AI</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">Powered by Gemini</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-[var(--color-border)] rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.sender === 'user' 
                    ? 'bg-[var(--color-primary)] text-white rounded-tr-sm' 
                    : 'bg-[var(--color-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-tl-sm'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[var(--color-card)] border border-[var(--color-border)] p-4 rounded-2xl rounded-tl-sm flex gap-1">
                <div className="w-2 h-2 bg-[var(--color-text-secondary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[var(--color-text-secondary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[var(--color-text-secondary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-background)]">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="w-full bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-full py-3 pl-4 pr-12 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 p-2 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-[var(--color-text-secondary)]">
              AI can make mistakes. Verify important information.
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
