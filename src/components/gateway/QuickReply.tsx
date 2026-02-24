import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const templates = [
  { label: 'Acknowledge', text: 'Thank you for your message. Let me look into this for you.' },
  { label: 'Call back', text: 'Thanks for getting in touch. One of our electricians will call you back shortly.' },
  { label: 'Emergency', text: 'For emergencies, please call us directly on 01902 943 929. We\'re available 24/7.' },
  { label: 'Quote sent', text: 'Your quote has been sent. Please review and let us know if you have any questions.' },
];

interface QuickReplyProps {
  onSend: (content: string) => void;
  sending?: boolean;
}

export function QuickReply({ onSend, sending }: QuickReplyProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message.trim());
    setMessage('');
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {templates.map((t) => (
          <Button key={t.label} variant="outline" size="sm" onClick={() => setMessage(t.text)} className="text-xs">
            {t.label}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a reply..."
          className="min-h-[60px] resize-none"
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        />
        <Button onClick={handleSend} disabled={!message.trim() || sending} className="self-end">
          {sending ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
}
