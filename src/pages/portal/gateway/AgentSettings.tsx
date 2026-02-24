import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGatewayAgent } from '@/hooks/useGatewayData';
import { ChannelStatusIndicator } from '@/components/gateway/ChannelStatusIndicator';

const toolCategories = [
  { name: 'Booking & Calendar', tools: ['check_availability', 'schedule_appointment', 'reschedule_appointment', 'cancel_appointment'] },
  { name: 'Customer & Jobs', tools: ['lookup_customer', 'lookup_job', 'get_job_status', 'create_draft_quote'] },
  { name: 'Certificates', tools: ['check_certificate_status', 'list_customer_certificates', 'get_certificate_due_dates', 'request_certificate'] },
  { name: 'Invoicing & Payment', tools: ['check_invoice_status', 'list_outstanding_invoices', 'send_payment_reminder', 'send_payment_link', 'get_invoice_summary'] },
  { name: 'Email', tools: ['send_email', 'check_inbox', 'reply_to_email', 'route_email'] },
  { name: 'Routing & Leads', tools: ['capture_lead', 'route_enquiry', 'escalate_to_human'] },
  { name: 'Info & Advice', tools: ['get_services_info', 'get_pricing', 'check_service_area', 'get_business_info', 'get_electrical_advice'] },
];

export default function AgentSettings() {
  const { data, isLoading } = useGatewayAgent();

  if (isLoading) return <div className="p-6">Loading agent config...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">AI Agent Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Agent Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4">
            <ChannelStatusIndicator status={data?.connected ? 'connected' : 'disconnected'} />
            <Badge>{data?.model || 'claude-sonnet-4'}</Badge>
            <span className="text-sm text-muted-foreground">{data?.tools_count || 28} tools available</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Tools ({toolCategories.reduce((sum, c) => sum + c.tools.length, 0)})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {toolCategories.map((cat) => (
              <div key={cat.name} className="border rounded-lg p-3">
                <h3 className="font-medium text-sm mb-2">{cat.name}</h3>
                <div className="flex flex-wrap gap-1">
                  {cat.tools.map((tool) => (
                    <Badge key={tool} variant="secondary" className="text-xs font-mono">{tool}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
