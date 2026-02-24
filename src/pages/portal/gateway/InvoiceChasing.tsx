import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOverdueInvoices, useChaseInvoice } from '@/hooks/useGatewayData';

export default function InvoiceChasing() {
  const { data, isLoading } = useOverdueInvoices();
  const chaseMutation = useChaseInvoice();

  if (isLoading) return <div className="p-6">Loading overdue invoices...</div>;

  const totalOutstanding = data?.invoices?.reduce((sum: number, inv: Record<string, unknown>) =>
    sum + (parseFloat(inv.total as string || '0') - parseFloat(inv.amount_paid as string || '0')), 0
  ) || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoice Chasing</h1>
          <p className="text-muted-foreground">{data?.count || 0} overdue invoices totalling £{totalOutstanding.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Overdue Invoices</p>
            <p className="text-3xl font-bold text-red-600">{data?.count || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Outstanding</p>
            <p className="text-3xl font-bold">£{totalOutstanding.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Chase Escalation</p>
            <p className="text-xs text-muted-foreground mt-1">3d → 7d → 14d → 30d</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        {data?.invoices?.length === 0 && <p className="text-center text-muted-foreground py-8">No overdue invoices</p>}
        {data?.invoices?.map((inv: Record<string, unknown>) => {
          const outstanding = parseFloat(inv.total as string || '0') - parseFloat(inv.amount_paid as string || '0');
          const daysOverdue = inv.due_date ? Math.ceil((Date.now() - new Date(inv.due_date as string).getTime()) / 86400000) : 0;
          return (
            <Card key={inv.id as string} className={daysOverdue > 14 ? 'border-red-300' : daysOverdue > 7 ? 'border-orange-300' : ''}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{inv.invoice_number as string}</span>
                      <Badge variant={daysOverdue > 14 ? 'destructive' : 'secondary'}>{daysOverdue} days overdue</Badge>
                      {(inv.reminder_count as number) > 0 && (
                        <span className="text-xs text-muted-foreground">{inv.reminder_count as number} reminders sent</span>
                      )}
                    </div>
                    <p className="text-sm">
                      {inv.first_name as string} {inv.last_name as string}
                      {inv.phone && ` - ${inv.phone}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {inv.service_type as string} {inv.job_number && `(${inv.job_number})`}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4 space-y-2">
                    <p className="text-lg font-bold text-red-600">£{outstanding.toFixed(2)}</p>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => chaseMutation.mutate({ id: inv.id as string, channel: 'email' })}
                        disabled={chaseMutation.isPending}
                      >
                        Chase
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
