import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGatewayLeads, useUpdateLead } from '@/hooks/useGatewayData';
import { ChannelBadge } from '@/components/gateway/ChannelBadge';

const statusColors: Record<string, string> = {
  new: 'bg-blue-500',
  contacted: 'bg-yellow-500',
  qualified: 'bg-green-500',
  converted: 'bg-emerald-600',
  lost: 'bg-gray-400',
};

export default function GatewayLeads() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGatewayLeads({ status: statusFilter || undefined, page });
  const updateMutation = useUpdateLead();

  if (isLoading) return <div className="p-6">Loading leads...</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gateway Leads</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {data?.leads?.length === 0 && <p className="text-center text-muted-foreground py-8">No leads found</p>}

      <div className="space-y-2">
        {data?.leads?.map((lead: Record<string, unknown>) => (
          <Card key={lead.id as string}>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{lead.name as string}</span>
                    <Badge className={statusColors[lead.status as string] || 'bg-gray-400'}>{lead.status as string}</Badge>
                    {lead.channel_type && <ChannelBadge channel={lead.channel_type as string} />}
                    {lead.urgency === 'emergency' && <Badge variant="destructive">Emergency</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground flex gap-4">
                    {lead.phone && <span>{lead.phone as string}</span>}
                    {lead.email && <span>{lead.email as string}</span>}
                    {lead.postcode && <span>{lead.postcode as string}</span>}
                  </div>
                  {lead.service_type && <p className="text-sm">{lead.service_type as string}</p>}
                  {lead.description && <p className="text-sm text-muted-foreground truncate">{lead.description as string}</p>}
                </div>
                <div className="flex gap-1 shrink-0 ml-4">
                  {(lead.status as string) === 'new' && (
                    <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: lead.id as string, status: 'contacted' })}>
                      Mark Contacted
                    </Button>
                  )}
                  {(lead.status as string) === 'contacted' && (
                    <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: lead.id as string, status: 'qualified' })}>
                      Qualify
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(lead.created_at as string).toLocaleString('en-GB')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {(data?.total || 0) > 20 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm self-center">Page {page}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
