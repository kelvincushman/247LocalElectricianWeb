import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useGatewaySession, useSessionReply, useSessionClose } from '@/hooks/useGatewayData';
import { useGatewayWebSocket } from '@/hooks/useGatewayWebSocket';
import { MessageBubble } from '@/components/gateway/MessageBubble';
import { ConversationSidebar } from '@/components/gateway/ConversationSidebar';
import { QuickReply } from '@/components/gateway/QuickReply';
import { ToolCallCard } from '@/components/gateway/ToolCallCard';

export default function ConversationThread() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, refetch } = useGatewaySession(id || '');
  const replyMutation = useSessionReply();
  const closeMutation = useSessionClose();
  const { lastMessage } = useGatewayWebSocket();

  useEffect(() => {
    if (lastMessage?.type === 'new_message' && (lastMessage as Record<string, unknown>).session_id === id) {
      refetch();
    }
  }, [lastMessage, id, refetch]);

  if (isLoading) return <div className="p-6">Loading conversation...</div>;
  if (!data?.session) return <div className="p-6">Conversation not found</div>;

  const { session, messages } = data;

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <Link to="/portal/gateway/inbox">
          <Button variant="outline" size="sm">Back to Inbox</Button>
        </Link>
        <h1 className="text-xl font-bold flex-1">
          {session.sender_name || `${session.first_name || ''} ${session.last_name || ''}`.trim() || session.sender_id}
        </h1>
        {session.status !== 'closed' && (
          <Button variant="outline" size="sm" onClick={() => closeMutation.mutate(id!)}>Close Conversation</Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-4">
          {/* Messages */}
          <div className="border rounded-lg p-4 max-h-[600px] overflow-y-auto space-y-4 bg-white">
            {messages?.length === 0 && <p className="text-center text-muted-foreground py-8">No messages yet</p>}
            {messages?.map((msg: Record<string, unknown>) => (
              <div key={msg.id as string}>
                {msg.tool_calls && <ToolCallCard toolCalls={msg.tool_calls as Record<string, unknown>[]} />}
                <MessageBubble
                  content={msg.content as string || ''}
                  senderType={msg.sender_type as 'user' | 'agent' | 'staff' | 'system'}
                  direction={msg.direction as 'inbound' | 'outbound'}
                  timestamp={msg.created_at as string}
                  toolCalls={msg.tool_calls as unknown[] | undefined}
                />
              </div>
            ))}
          </div>

          {/* Reply */}
          {session.status !== 'closed' && (
            <QuickReply
              onSend={(content) => replyMutation.mutate({ id: id!, content })}
              sending={replyMutation.isPending}
            />
          )}
        </div>

        <ConversationSidebar session={session} />
      </div>
    </div>
  );
}
