import { useEffect, useRef } from 'react';
import { Loader2, Phone, AlertTriangle } from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  isTyping: boolean;
  greeting: string;
}

export default function ChatMessages({ messages, isTyping, greeting }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Check if message contains emergency keywords
  const isEmergencyMessage = (content: string) => {
    const emergencyKeywords = [
      'emergency',
      'urgent',
      'fire',
      'smoke',
      'sparks',
      'burning',
      'shock',
      'dangerous',
      'water leak',
      'flood',
      'power out',
      'no power',
    ];
    const lowerContent = content.toLowerCase();
    return emergencyKeywords.some((keyword) => lowerContent.includes(keyword));
  };

  const formatMessage = (content: string) => {
    // Convert markdown-style formatting
    let formatted = content;

    // Bold text: **text** or __text__
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Line breaks
    formatted = formatted.replace(/\n/g, '<br />');

    // Phone numbers - make them clickable
    formatted = formatted.replace(
      /(\d{5}\s?\d{3}\s?\d{3})/g,
      '<a href="tel:$1" class="text-primary font-bold hover:underline">$1</a>'
    );

    return formatted;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
      {/* Welcome message */}
      <div className="flex gap-3">
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm">⚡</span>
        </div>
        <div className="flex-1">
          <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm border border-slate-100">
            <p className="text-sm text-slate-700">{greeting}</p>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Sparky</span>
        </div>
      </div>

      {/* Message history */}
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
        >
          {message.role === 'assistant' && (
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm">⚡</span>
            </div>
          )}
          <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
            <div
              className={`rounded-lg p-3 shadow-sm max-w-[85%] ${
                message.role === 'user'
                  ? 'bg-primary text-white rounded-tr-none'
                  : 'bg-white border border-slate-100 rounded-tl-none'
              }`}
            >
              {message.role === 'assistant' ? (
                <p
                  className="text-sm text-slate-700"
                  dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                />
              ) : (
                <p className="text-sm">{message.content}</p>
              )}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              {message.role === 'user' ? 'You' : 'Sparky'}
            </span>
          </div>
        </div>
      ))}

      {/* Emergency banner when detected */}
      {messages.length > 0 &&
        isEmergencyMessage(messages[messages.length - 1]?.content || '') && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-semibold text-sm">Electrical Emergency?</span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              For immediate assistance, please call our 24/7 emergency line:
            </p>
            <a
              href="tel:01902943929"
              className="inline-flex items-center gap-2 mt-2 bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition-colors"
            >
              <Phone className="h-4 w-4" />
              01902 943 929
            </a>
          </div>
        )}

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm">⚡</span>
          </div>
          <div className="flex-1">
            <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm border border-slate-100 inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-slate-500">Sparky is typing...</span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
