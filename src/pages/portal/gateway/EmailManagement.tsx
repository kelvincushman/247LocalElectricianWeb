import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGatewayEmails } from '@/hooks/useGatewayData';

const classColors: Record<string, string> = {
  invoice_query: 'bg-blue-500',
  certificate_request: 'bg-green-500',
  quote_request: 'bg-purple-500',
  emergency: 'bg-red-500',
  complaint: 'bg-red-400',
  booking_request: 'bg-yellow-500',
  general_enquiry: 'bg-gray-500',
};

export default function EmailManagement() {
  const { data, isLoading } = useGatewayEmails();

  if (isLoading) return <div className="p-6">Loading emails...</div>;

  const inbound = data?.emails?.filter((e: Record<string, string>) => e.direction === 'inbound') || [];
  const outbound = data?.emails?.filter((e: Record<string, string>) => e.direction === 'outbound') || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Email Management</h1>
        <p className="text-muted-foreground">info@247electrician.uk - {data?.emails?.length || 0} recent emails</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Inbound</p>
            <p className="text-3xl font-bold">{inbound.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Outbound</p>
            <p className="text-3xl font-bold">{outbound.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Email Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.emails?.length === 0 && <p className="text-muted-foreground">No email activity yet</p>}
          <div className="space-y-2">
            {data?.emails?.map((email: Record<string, unknown>) => (
              <div key={email.id as string} className="border rounded-lg p-3 hover:bg-gray-50">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={(email.direction as string) === 'inbound' ? 'secondary' : 'outline'}>
                    {(email.direction as string) === 'inbound' ? 'IN' : 'OUT'}
                  </Badge>
                  {email.classification && (
                    <Badge className={classColors[email.classification as string] || 'bg-gray-400'}>
                      {(email.classification as string).replace('_', ' ')}
                    </Badge>
                  )}
                  <span className="text-sm font-medium truncate flex-1">{email.subject as string}</span>
                </div>
                <div className="text-xs text-muted-foreground flex gap-4">
                  <span>{(email.direction as string) === 'inbound' ? `From: ${email.from_address}` : `To: ${email.to_address}`}</span>
                  <span>{new Date(email.created_at as string).toLocaleString('en-GB')}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
