import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';
import ChatHeader from './chat/ChatHeader';
import ChatMessages, { ChatMessage } from './chat/ChatMessages';
import ChatInput from './chat/ChatInput';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const CHAT_SESSION_KEY = '247electrician_chat_session';
const CHAT_STATE_KEY = '247electrician_chat_state';

interface ChatState {
  isOpen: boolean;
  isMinimized: boolean;
}

export default function ChatWidget() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [greeting, setGreeting] = useState(
    "Hello! I'm Sparky, your 247Electrician assistant. How can I help you today? I can answer questions about our services, pricing, and help you book an appointment."
  );
  const [hasUnread, setHasUnread] = useState(false);
  const [showPulse, setShowPulse] = useState(true);

  // Hide chat widget on portal/admin pages
  const isPortalOrAdmin =
    location.pathname.startsWith('/portal') || location.pathname.startsWith('/admin');

  // Generate or retrieve session ID
  useEffect(() => {
    let storedSession = localStorage.getItem(CHAT_SESSION_KEY);
    if (!storedSession) {
      storedSession = crypto.randomUUID();
      localStorage.setItem(CHAT_SESSION_KEY, storedSession);
    }
    setSessionId(storedSession);

    // Restore chat state
    const savedState = localStorage.getItem(CHAT_STATE_KEY);
    if (savedState) {
      try {
        const state: ChatState = JSON.parse(savedState);
        setIsOpen(state.isOpen);
        setIsMinimized(state.isMinimized);
      } catch {
        // Ignore invalid state
      }
    }
  }, []);

  // Save chat state
  useEffect(() => {
    const state: ChatState = { isOpen, isMinimized };
    localStorage.setItem(CHAT_STATE_KEY, JSON.stringify(state));
  }, [isOpen, isMinimized]);

  // Check if chatbot is enabled and load greeting
  useEffect(() => {
    const checkChatbotStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/public/chatbot/status`);
        if (response.ok) {
          const data = await response.json();
          setIsEnabled(data.enabled);
          if (data.greeting) {
            setGreeting(data.greeting);
          }
        }
      } catch {
        // If API fails, keep chatbot disabled
        setIsEnabled(false);
      }
    };
    checkChatbotStatus();
  }, []);

  // Load conversation history when session is available
  useEffect(() => {
    if (sessionId && isOpen && messages.length === 0) {
      loadConversationHistory();
    }
  }, [sessionId, isOpen]);

  const loadConversationHistory = async () => {
    if (!sessionId) return;

    try {
      // First try to get existing conversation
      const response = await fetch(`${API_URL}/public/chatbot/conversation/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
          return;
        }
      }

      // If no existing conversation, start a new one
      const startResponse = await fetch(`${API_URL}/public/chatbot/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (startResponse.ok) {
        const data = await startResponse.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        }
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
  };

  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId || !content.trim()) return;

      // Add user message immediately
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: content.trim(),
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      try {
        const response = await fetch(`${API_URL}/public/chatbot/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: sessionId,
            message: content.trim(),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const data = await response.json();

        // Add assistant response
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.response,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Show unread indicator if chat is minimized
        if (isMinimized) {
          setHasUnread(true);
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        // Add error message
        const errorMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content:
            "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or call us directly at **01902 943 929** for immediate assistance.",
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    },
    [sessionId, isMinimized]
  );

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setHasUnread(false);
    setShowPulse(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleRestore = () => {
    setIsMinimized(false);
    setHasUnread(false);
  };

  // Don't render on portal/admin pages or if disabled
  if (isPortalOrAdmin || !isEnabled) {
    return null;
  }

  return (
    <>
      {/* Chat Panel */}
      {isOpen && !isMinimized && (
        <div className="fixed bottom-20 right-4 md:right-6 z-50 w-[calc(100vw-2rem)] md:w-[400px] max-h-[70vh] md:max-h-[600px] bg-white rounded-lg shadow-2xl border border-slate-200 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          <ChatHeader onClose={handleClose} onMinimize={handleMinimize} />
          <ChatMessages messages={messages} isTyping={isTyping} greeting={greeting} />
          <ChatInput onSendMessage={sendMessage} disabled={isTyping} />
        </div>
      )}

      {/* Minimized Bar */}
      {isOpen && isMinimized && (
        <div
          onClick={handleRestore}
          className="fixed bottom-20 right-4 md:right-6 z-50 bg-primary text-white px-4 py-3 rounded-lg shadow-lg cursor-pointer hover:bg-primary/90 transition-colors flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-200"
        >
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-lg">⚡</span>
          </div>
          <div className="flex-1">
            <span className="font-medium text-sm">Chat with Sparky</span>
            {hasUnread && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                New
              </span>
            )}
          </div>
          <X className="h-4 w-4 hover:text-white/80" onClick={(e) => { e.stopPropagation(); handleClose(); }} />
        </div>
      )}

      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className={`fixed bottom-4 right-4 md:right-6 z-50 w-14 h-14 md:w-16 md:h-16 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 ${
            showPulse ? 'animate-pulse' : ''
          }`}
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6 md:h-7 md:w-7" />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold">!</span>
            </span>
          )}
        </button>
      )}

      {/* Chat Tooltip (shown briefly on first visit) */}
      {!isOpen && showPulse && (
        <div className="fixed bottom-20 md:bottom-24 right-4 md:right-6 z-40 bg-white px-4 py-2 rounded-lg shadow-lg border border-slate-200 max-w-[200px] animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="text-sm text-slate-700">
            <span className="font-semibold">Need help?</span> Chat with Sparky!
          </p>
          <div className="absolute bottom-0 right-6 translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b border-slate-200"></div>
        </div>
      )}
    </>
  );
}
