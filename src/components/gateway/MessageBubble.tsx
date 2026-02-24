import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  content: string;
  senderType: 'user' | 'agent' | 'staff' | 'system';
  direction: 'inbound' | 'outbound';
  timestamp: string;
  toolCalls?: unknown[];
}

const senderStyles: Record<string, string> = {
  user: 'bg-gray-100 text-gray-900',
  agent: 'bg-blue-50 text-blue-900 border border-blue-200',
  staff: 'bg-green-50 text-green-900 border border-green-200',
  system: 'bg-yellow-50 text-yellow-800 border border-yellow-200 italic text-sm',
};

const senderLabels: Record<string, string> = {
  user: 'Customer',
  agent: 'AI Agent',
  staff: 'Staff',
  system: 'System',
};

export function MessageBubble({ content, senderType, direction, timestamp, toolCalls }: MessageBubbleProps) {
  const isOutbound = direction === 'outbound';
  return (
    <div className={cn('flex flex-col gap-1 max-w-[80%]', isOutbound ? 'ml-auto items-end' : 'items-start')}>
      <span className="text-xs text-muted-foreground">{senderLabels[senderType] || senderType}</span>
      <div className={cn('rounded-lg px-4 py-2 whitespace-pre-wrap', senderStyles[senderType] || 'bg-gray-100')}>
        {content}
      </div>
      {toolCalls && Array.isArray(toolCalls) && toolCalls.length > 0 && (
        <div className="text-xs text-muted-foreground bg-gray-50 rounded px-2 py-1 border">
          Used {toolCalls.length} tool{toolCalls.length > 1 ? 's' : ''}
        </div>
      )}
      <span className="text-xs text-muted-foreground">
        {new Date(timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
}
