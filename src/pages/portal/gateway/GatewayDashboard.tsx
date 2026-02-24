import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGatewayStats } from '@/hooks/useGatewayData';
import { useGatewayWebSocket } from '@/hooks/useGatewayWebSocket';
import { ChannelStatusIndicator } from '@/components/gateway/ChannelStatusIndicator';

export default function GatewayDashboard() {
  const { data: stats, isLoading } = useGatewayStats();
  const { gatewayConnected } = useGatewayWebSocket();

  if (isLoading) return <div className="p-6">Loading gateway dashboard...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Gateway</h1>
          <p className="text-muted-foreground">Multi-channel messaging powered by OpenClaw</p>
        </div>
        <div className="flex items-center gap-2">
          <ChannelStatusIndicator status={gatewayConnected ? 'connected' : 'disconnected'} />
          <Badge variant={gatewayConnected ? 'default' : 'destructive'}>
            {gatewayConnected ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Sessions" value={stats?.sessions?.active || 0} subtitle={`${stats?.sessions?.today || 0} today`} link="/portal/gateway/inbox" />
        <StatCard title="Messages Today" value={stats?.messages?.today || 0} subtitle={`${stats?.messages?.total || 0} total`} link="/portal/gateway/inbox" />
        <StatCard title="New Leads" value={stats?.leads?.new_leads || 0} subtitle={`${stats?.leads?.total || 0} total`} link="/portal/gateway/leads" />
        <StatCard title="Overdue Invoices" value={stats?.overdue_invoices?.count || 0}
          subtitle={`${stats?.overdue_invoices?.amount ? `£${stats.overdue_invoices.amount}` : '£0'} outstanding`}
          link="/portal/gateway/invoices" variant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <QuickLink to="/portal/gateway/inbox" label="View Inbox" desc="Conversations" />
            <QuickLink to="/portal/gateway/channels" label="Channels" desc="Configure" />
            <QuickLink to="/portal/gateway/invoices" label="Chase Invoices" desc="Overdue payments" />
            <QuickLink to="/portal/gateway/certificates" label="Cert Renewals" desc="Expiring soon" />
            <QuickLink to="/portal/gateway/emails" label="Email" desc="Inbox & routing" />
            <QuickLink to="/portal/gateway/analytics" label="Analytics" desc="Reports" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expiring Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.expiring_certificates || 0}</p>
            <p className="text-sm text-muted-foreground">certificates expiring within 3 months</p>
            <Link to="/portal/gateway/certificates" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
              View all
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, link, variant }: { title: string; value: number; subtitle: string; link: string; variant?: string }) {
  return (
    <Link to={link}>
      <Card className={`hover:shadow-md transition-shadow ${variant === 'warning' && value > 0 ? 'border-orange-300 bg-orange-50' : ''}`}>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function QuickLink({ to, label, desc }: { to: string; label: string; desc: string }) {
  return (
    <Link to={to} className="p-3 rounded-lg border hover:bg-gray-50 transition-colors">
      <p className="font-medium text-sm">{label}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </Link>
  );
}
