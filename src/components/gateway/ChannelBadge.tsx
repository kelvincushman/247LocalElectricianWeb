import { Badge } from '@/components/ui/badge';

const channelConfig: Record<string, { label: string; className: string }> = {
  whatsapp: { label: 'WhatsApp', className: 'bg-green-600 text-white hover:bg-green-700' },
  sms: { label: 'SMS', className: 'bg-blue-600 text-white hover:bg-blue-700' },
  email: { label: 'Email', className: 'bg-purple-600 text-white hover:bg-purple-700' },
  webchat: { label: 'WebChat', className: 'bg-orange-500 text-white hover:bg-orange-600' },
};

export function ChannelBadge({ channel }: { channel: string }) {
  const config = channelConfig[channel] || { label: channel, className: 'bg-gray-500 text-white' };
  return <Badge className={config.className}>{config.label}</Badge>;
}
