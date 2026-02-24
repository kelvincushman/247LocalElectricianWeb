import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChannelBadge } from './ChannelBadge';

interface SessionData {
  id: string;
  channel_type: string;
  sender_id: string;
  sender_name?: string;
  status: string;
  assigned_to?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  customer_id?: string;
  created_at: string;
}

export function ConversationSidebar({ session }: { session: SessionData }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Conversation Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <ChannelBadge channel={session.channel_type} />
            <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>{session.status}</Badge>
          </div>
          <div className="text-sm space-y-1">
            <p><span className="text-muted-foreground">Sender:</span> {session.sender_name || session.sender_id}</p>
            {session.assigned_to && <p><span className="text-muted-foreground">Assigned:</span> {session.assigned_to}</p>}
            <p><span className="text-muted-foreground">Started:</span> {new Date(session.created_at).toLocaleString('en-GB')}</p>
          </div>
        </CardContent>
      </Card>

      {(session.first_name || session.customer_id) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Customer</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            {session.first_name && <p className="font-medium">{session.first_name} {session.last_name}</p>}
            {session.phone && <p><span className="text-muted-foreground">Phone:</span> {session.phone}</p>}
            {session.email && <p><span className="text-muted-foreground">Email:</span> {session.email}</p>}
            {session.customer_id && (
              <a href={`/portal/customers/${session.customer_id}`} className="text-blue-600 hover:underline text-xs">
                View Customer Profile
              </a>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
