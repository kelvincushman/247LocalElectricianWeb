import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOutboundMessages } from '@/hooks/useGatewayData';
import { ChannelBadge } from '@/components/gateway/ChannelBadge';

export default function OutboundMessages() {
  const { data, isLoading } = useOutboundMessages();

  if (isLoading) return <div className="p-6">Loading outbound messages...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Outbound Message Queue</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pending Messages ({data?.messages?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.messages?.length === 0 && <p className="text-muted-foreground">No pending outbound messages</p>}
          <div className="space-y-2">
            {data?.messages?.map((msg: Record<string, unknown>) => (
              <div key={msg.id as string} className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <ChannelBadge channel={msg.channel_type as string} />
                  <Badge variant="secondary">{msg.message_type as string}</Badge>
                  <Badge variant={msg.status === 'pending' ? 'outline' : 'default'}>{msg.status as string}</Badge>
                </div>
                <p className="text-sm truncate">{msg.content as string}</p>
                <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                  <span>To: {msg.recipient_id as string}</span>
                  <span>Scheduled: {new Date(msg.scheduled_for as string).toLocaleString('en-GB')}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
