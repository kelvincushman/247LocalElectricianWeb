import { ChannelBadge } from './ChannelBadge';

interface ChaseEntry {
  id: string;
  reminder_number: number;
  channel_used: string;
  message_sent: string;
  sent_at: string;
  response_received: boolean;
  payment_received: boolean;
}

export function InvoiceChaseTimeline({ entries }: { entries: ChaseEntry[] }) {
  if (!entries || entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No reminders sent yet</p>;
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-start gap-3 relative pl-6">
          <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 ${
            entry.payment_received ? 'bg-green-500 border-green-600' :
            entry.response_received ? 'bg-yellow-500 border-yellow-600' :
            'bg-gray-300 border-gray-400'
          }`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Reminder #{entry.reminder_number}</span>
              <ChannelBadge channel={entry.channel_used} />
              {entry.payment_received && <span className="text-green-600 text-xs font-medium">Paid</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.message_sent}</p>
            <p className="text-xs text-muted-foreground">{new Date(entry.sent_at).toLocaleString('en-GB')}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
