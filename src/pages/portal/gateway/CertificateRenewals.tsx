import { Card, CardContent } from '@/components/ui/card';
import { useExpiringCertificates } from '@/hooks/useGatewayData';
import { CertificateExpiryCard } from '@/components/gateway/CertificateExpiryCard';

export default function CertificateRenewals() {
  const { data, isLoading } = useExpiringCertificates(3);

  if (isLoading) return <div className="p-6">Loading expiring certificates...</div>;

  const overdue = data?.certificates?.filter((c: Record<string, unknown>) =>
    new Date(c.next_inspection_date as string) < new Date()
  ) || [];
  const upcoming = data?.certificates?.filter((c: Record<string, unknown>) =>
    new Date(c.next_inspection_date as string) >= new Date()
  ) || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Certificate Renewals</h1>
        <p className="text-muted-foreground">{data?.count || 0} certificates expiring within 3 months</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Overdue</p>
            <p className="text-3xl font-bold text-red-600">{overdue.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Expiring Soon</p>
            <p className="text-3xl font-bold text-yellow-600">{upcoming.length}</p>
          </CardContent>
        </Card>
      </div>

      {overdue.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-red-600">Overdue</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {overdue.map((cert: Record<string, unknown>) => (
              <CertificateExpiryCard key={cert.id as string} cert={cert as never} />
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Expiring Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcoming.map((cert: Record<string, unknown>) => (
              <CertificateExpiryCard key={cert.id as string} cert={cert as never} />
            ))}
          </div>
        </div>
      )}

      {data?.count === 0 && <p className="text-center text-muted-foreground py-8">No certificates expiring in the next 3 months</p>}
    </div>
  );
}
