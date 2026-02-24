import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPendingCertificates } from '@/services/certificateService';
import { CERTIFICATE_TYPES } from '@/types/certificate';
import type { CertificateType } from '@/types/certificate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  ClipboardCheck,
  Eye,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  Building2,
  User,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function QSPendingList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ['qs-pending', page],
    queryFn: () => getPendingCertificates({ page, limit }),
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeBadge = (type: CertificateType) => {
    const typeInfo = CERTIFICATE_TYPES[type];
    const colorMap: Record<CertificateType, string> = {
      eicr: 'bg-blue-100 text-blue-700 border-blue-200',
      eic: 'bg-green-100 text-green-700 border-green-200',
      mw: 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return (
      <Badge className={cn('border font-semibold', colorMap[type])}>
        {typeInfo.label}
      </Badge>
    );
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    const submitted = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - submitted.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="h-7 w-7 text-primary" />
            QS Approval Queue
          </h1>
          <p className="text-slate-500 mt-1">
            Review and approve submitted certificates
          </p>
        </div>
        {data && data.pagination.total > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <span className="font-medium text-amber-700">
              {data.pagination.total} certificate{data.pagination.total !== 1 ? 's' : ''} awaiting review
            </span>
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ClipboardCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {data?.pagination.total || 0}
                </div>
                <div className="text-sm text-slate-500">Pending Review</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {data?.certificates.filter(c => c.certificate_type === 'eicr').length || 0}
                </div>
                <div className="text-sm text-slate-500">EICR Reports</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {data?.certificates[0] ? getTimeAgo(data.certificates[0].submitted_at) : '-'}
                </div>
                <div className="text-sm text-slate-500">Oldest Submission</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">
            Submitted Certificates
          </CardTitle>
          <CardDescription>
            Certificates awaiting quality supervisor approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              Error loading pending certificates. Please try again.
            </div>
          ) : data?.certificates.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardCheck className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                All caught up!
              </h3>
              <p className="text-slate-500">
                No certificates are waiting for approval
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certificate</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Submitted By</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.certificates.map((cert) => (
                      <TableRow key={cert.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium">
                          <Link
                            to={`/portal/qs/review/${cert.id}`}
                            className="hover:text-primary hover:underline"
                          >
                            {cert.certificate_no}
                          </Link>
                        </TableCell>
                        <TableCell>{getTypeBadge(cert.certificate_type)}</TableCell>
                        <TableCell>
                          <div className="flex items-start gap-2">
                            <Building2 className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                            <div className="text-sm">
                              <div className="font-medium">{cert.installation_address || cert.property_address}</div>
                              <div className="text-slate-500">{cert.installation_postcode || cert.property_postcode}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-400" />
                            <span className="text-sm">{cert.created_by_name || 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatDateTime(cert.submitted_at)}</div>
                            <div className="text-slate-500 text-xs">{getTimeAgo(cert.submitted_at)}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={() => navigate(`/portal/qs/review/${cert.id}`)}
                            size="sm"
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-slate-500">
                    Showing {(page - 1) * limit + 1} to{' '}
                    {Math.min(page * limit, data.pagination.total)} of{' '}
                    {data.pagination.total}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(data.pagination.totalPages, p + 1))
                      }
                      disabled={page === data.pagination.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
