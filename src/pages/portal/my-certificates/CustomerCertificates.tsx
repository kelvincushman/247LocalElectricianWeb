import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMyCertificates } from '@/services/certificateService';
import { CERTIFICATE_TYPES, CERTIFICATE_STATUSES } from '@/types/certificate';
import type { CertificateType, CertificateStatus } from '@/types/certificate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Award,
  FileText,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  Building2,
  Calendar,
  PlusCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CustomerCertificates() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-certificates', page],
    queryFn: () => getMyCertificates({ page, limit }),
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
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

  const getStatusBadge = (status: CertificateStatus) => {
    const statusInfo = CERTIFICATE_STATUSES[status];
    return (
      <Badge className={cn(statusInfo.bgColor, statusInfo.textColor, 'border-0')}>
        {statusInfo.label}
      </Badge>
    );
  };

  // Calculate next inspection alerts
  const upcomingInspections = data?.certificates.filter(cert => {
    if (!cert.next_inspection_date) return false;
    const nextDate = new Date(cert.next_inspection_date);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return nextDate <= threeMonthsFromNow;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="h-7 w-7 text-primary" />
            My Certificates
          </h1>
          <p className="text-slate-500 mt-1">
            View your electrical certificates and reports
          </p>
        </div>
        <Button onClick={() => navigate('/portal/my-certificates/request')} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Request Certificate
        </Button>
      </div>

      {/* Upcoming Inspections Alert */}
      {upcomingInspections.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-orange-800 flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Upcoming Inspections Due
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 text-sm mb-3">
              The following properties have inspections due within the next 3 months:
            </p>
            <div className="space-y-2">
              {upcomingInspections.slice(0, 3).map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-2 bg-white rounded border border-orange-200"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-orange-600" />
                    <div>
                      <div className="font-medium text-sm">
                        {cert.installation_address || cert.property_address}
                      </div>
                      <div className="text-xs text-slate-500">
                        Due: {formatDate(cert.next_inspection_date)}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/portal/my-certificates/request')}
                  >
                    Book Now
                  </Button>
                </div>
              ))}
            </div>
            {upcomingInspections.length > 3 && (
              <p className="text-xs text-orange-600 mt-2">
                +{upcomingInspections.length - 3} more properties need inspection
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Certificates List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">
            {data?.pagination.total || 0} Certificate{data?.pagination.total !== 1 ? 's' : ''}
          </CardTitle>
          <CardDescription>
            Your approved electrical certificates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              Error loading certificates. Please try again.
            </div>
          ) : data?.certificates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No certificates yet
              </h3>
              <p className="text-slate-500 mb-4">
                Request your first electrical inspection certificate
              </p>
              <Button onClick={() => navigate('/portal/my-certificates/request')}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Request Certificate
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certificate No</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Inspection Date</TableHead>
                      <TableHead>Next Due</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.certificates.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-medium">
                          <Link
                            to={`/portal/my-certificates/${cert.id}`}
                            className="hover:text-primary hover:underline"
                          >
                            {cert.certificate_no}
                          </Link>
                        </TableCell>
                        <TableCell>{getTypeBadge(cert.certificate_type)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {cert.installation_address || cert.property_address}
                            </div>
                            <div className="text-slate-500">
                              {cert.installation_postcode || cert.property_postcode}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(cert.inspection_date)}</TableCell>
                        <TableCell>
                          {cert.next_inspection_date ? (
                            <span
                              className={cn(
                                new Date(cert.next_inspection_date) <= new Date()
                                  ? 'text-red-600 font-medium'
                                  : new Date(cert.next_inspection_date) <=
                                    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                                  ? 'text-orange-600'
                                  : ''
                              )}
                            >
                              {formatDate(cert.next_inspection_date)}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(cert.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/portal/my-certificates/${cert.id}`)}
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {cert.pdf_url && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => window.open(cert.pdf_url, '_blank')}
                                title="Download PDF"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
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
