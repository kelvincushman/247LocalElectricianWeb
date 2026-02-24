import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGatewaySessions } from '@/hooks/useGatewayData';
import { useGatewayWebSocket } from '@/hooks/useGatewayWebSocket';
import { ChannelBadge } from '@/components/gateway/ChannelBadge';
import { Badge } from '@/components/ui/badge';

export default function ConversationInbox() {
  const [statusFilter, setStatusFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useGatewaySessions({ status: statusFilter || undefined, channel: channelFilter || undefined, page });
  const { lastMessage } = useGatewayWebSocket();

  useEffect(() => {
    if (lastMessage?.type === 'new_message' || lastMessage?.type === 'session_update') {
      refetch();
    }
  }, [lastMessage, refetch]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Conversation Inbox</h1>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Channels" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="webchat">WebChat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <p>Loading conversations...</p>
      ) : (
        <>
          <div className="space-y-2">
            {data?.sessions?.length === 0 && <p className="text-muted-foreground py-8 text-center">No conversations found</p>}
            {data?.sessions?.map((session: Record<string, unknown>) => (
              <Link key={session.id as string} to={`/portal/gateway/inbox/${session.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <ChannelBadge channel={session.channel_type as string} />
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {session.sender_name || session.first_name
                              ? `${session.first_name || ''} ${session.last_name || ''}`.trim() || session.sender_name
                              : session.sender_id}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">{session.last_message as string || 'No messages'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>{session.status as string}</Badge>
                        {session.message_count && <span className="text-xs text-muted-foreground">{session.message_count as number} msgs</span>}
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(session.last_message_at as string).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {data?.total > 20 && (
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="text-sm self-center">Page {page} of {Math.ceil((data?.total || 0) / 20)}</span>
              <Button variant="outline" size="sm" disabled={page >= Math.ceil((data?.total || 0) / 20)} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
