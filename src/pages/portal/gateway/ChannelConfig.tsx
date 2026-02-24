import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGatewayChannels, useReconnectChannel } from '@/hooks/useGatewayData';
import { ChannelBadge } from '@/components/gateway/ChannelBadge';
import { ChannelStatusIndicator } from '@/components/gateway/ChannelStatusIndicator';

export default function ChannelConfig() {
  const { data, isLoading, refetch } = useGatewayChannels();
  const reconnectMutation = useReconnectChannel();

  if (isLoading) return <div className="p-6">Loading channels...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Channel Configuration</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.channels?.map((channel: Record<string, string>) => (
          <Card key={channel.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ChannelBadge channel={channel.type} />
                  {channel.name}
                </CardTitle>
                <ChannelStatusIndicator status={channel.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {channel.type === 'whatsapp' && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Connected via Baileys (WhatsApp Web)</p>
                    <p className="text-xs text-muted-foreground mt-1">Scan QR code via OpenClaw CLI to link</p>
                  </div>
                )}
                {channel.type === 'sms' && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Powered by Twilio</p>
                    <p className="text-xs text-muted-foreground mt-1">Webhook configured for inbound SMS</p>
                  </div>
                )}
                {channel.type === 'email' && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">IMAP/SMTP - info@247electrician.uk</p>
                    <p className="text-xs text-muted-foreground mt-1">Inbox polled every 5 minutes</p>
                  </div>
                )}
                {channel.type === 'webchat' && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Built-in website chat widget</p>
                    <p className="text-xs text-muted-foreground mt-1">Always active via ChatWidget</p>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { reconnectMutation.mutate(channel.id); setTimeout(() => refetch(), 2000); }}
                  disabled={reconnectMutation.isPending}
                >
                  Reconnect
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
