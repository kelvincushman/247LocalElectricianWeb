import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CertificateExpiry {
  id: string;
  cert_type: string;
  cert_number?: string;
  installation_address?: string;
  installation_postcode?: string;
  next_inspection_date: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
}

export function CertificateExpiryCard({ cert }: { cert: CertificateExpiry }) {
  const daysUntil = Math.ceil((new Date(cert.next_inspection_date).getTime() - Date.now()) / 86400000);
  const isOverdue = daysUntil < 0;

  return (
    <Card className={isOverdue ? 'border-red-300 bg-red-50' : daysUntil < 30 ? 'border-yellow-300 bg-yellow-50' : ''}>
      <CardContent className="py-3 px-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant={isOverdue ? 'destructive' : 'secondary'}>{cert.cert_type}</Badge>
            {cert.cert_number && <span className="text-xs text-muted-foreground">{cert.cert_number}</span>}
          </div>
          <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : daysUntil < 30 ? 'text-yellow-600' : 'text-gray-600'}`}>
            {isOverdue ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days`}
          </span>
        </div>
        {cert.installation_address && (
          <p className="text-sm">{cert.installation_address}, {cert.installation_postcode}</p>
        )}
        {cert.first_name && (
          <p className="text-sm text-muted-foreground">{cert.first_name} {cert.last_name} {cert.phone && `- ${cert.phone}`}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Due: {new Date(cert.next_inspection_date).toLocaleDateString('en-GB')}
        </p>
      </CardContent>
    </Card>
  );
}
