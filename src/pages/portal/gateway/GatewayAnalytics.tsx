import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGatewayAnalytics } from '@/hooks/useGatewayData';

export default function GatewayAnalytics() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useGatewayAnalytics(days);

  if (isLoading) return <div className="p-6">Loading analytics...</div>;

  const liveStats = data?.live_stats || {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gateway Analytics</h1>
        <Select value={String(days)} onValueChange={(v) => setDays(parseInt(v))}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Sessions</p>
            <p className="text-3xl font-bold">{liveStats.total_sessions || 0}</p>
            <p className="text-xs text-muted-foreground">Last {days} days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Messages</p>
            <p className="text-3xl font-bold">{liveStats.total_messages || 0}</p>
            <p className="text-xs text-muted-foreground">Last {days} days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Leads Captured</p>
            <p className="text-3xl font-bold">{liveStats.total_leads || 0}</p>
            <p className="text-xs text-muted-foreground">Last {days} days</p>
          </CardContent>
        </Card>
      </div>

      {data?.analytics?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4">Date</th>
                    <th className="text-left py-2 pr-4">Channel</th>
                    <th className="text-right py-2 pr-4">Conversations</th>
                    <th className="text-right py-2 pr-4">Messages</th>
                    <th className="text-right py-2 pr-4">Leads</th>
                    <th className="text-right py-2 pr-4">Invoices Chased</th>
                    <th className="text-right py-2">Payments</th>
                  </tr>
                </thead>
                <tbody>
                  {data.analytics.map((row: Record<string, unknown>, i: number) => (
                    <tr key={i} className="border-b">
                      <td className="py-2 pr-4">{new Date(row.date as string).toLocaleDateString('en-GB')}</td>
                      <td className="py-2 pr-4">{row.channel_type as string}</td>
                      <td className="text-right py-2 pr-4">{row.conversations_started as number}</td>
                      <td className="text-right py-2 pr-4">{(row.messages_received as number) + (row.messages_sent as number)}</td>
                      <td className="text-right py-2 pr-4">{row.leads_captured as number}</td>
                      <td className="text-right py-2 pr-4">{row.invoices_chased as number}</td>
                      <td className="text-right py-2">£{parseFloat(row.payments_collected_amount as string || '0').toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {(!data?.analytics || data.analytics.length === 0) && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Analytics data will appear once the gateway starts processing conversations
          </CardContent>
        </Card>
      )}
    </div>
  );
}
