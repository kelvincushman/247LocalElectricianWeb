import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCertificates } from '@/services/certificateService';
import { CERTIFICATE_TYPES, CERTIFICATE_STATUSES } from '@/types/certificate';
import type { CertificateStatus, CertificateType } from '@/types/certificate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  FileCheck,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CertificateList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ['certificates', search, statusFilter, typeFilter, page],
    queryFn: () =>
      getCertificates({
        search: search || undefined,
        status: statusFilter || undefined,
        certificate_type: typeFilter || undefined,
        page,
        limit,
      }),
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: CertificateStatus) => {
    const statusInfo = CERTIFICATE_STATUSES[status];
    if (!statusInfo) {
      return <Badge variant="outline">{status}</Badge>;
    }
    return (
      <Badge className={cn(statusInfo.bgColor, statusInfo.textColor, 'border-0')}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: CertificateType) => {
    const typeInfo = CERTIFICATE_TYPES[type];
    if (!typeInfo) {
      return <Badge variant="outline">{type?.toUpperCase() || 'Unknown'}</Badge>;
    }
    return (
      <Badge variant="outline" className="font-semibold">
        {typeInfo.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="h-7 w-7 text-primary" />
            Certificates
          </h1>
          <p className="text-slate-500 mt-1">
            Manage EICR, EIC, and Minor Works certificates
          </p>
        </div>
        <Button onClick={() => navigate('/portal/certificates/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          New Certificate
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by certificate no, client, or address..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value === 'all' ? '' : value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(CERTIFICATE_STATUSES).map(([key, status]) => (
                  <SelectItem key={key} value={key}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={typeFilter}
              onValueChange={(value) => {
                setTypeFilter(value === 'all' ? '' : value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(CERTIFICATE_TYPES).map(([key, type]) => (
                  <SelectItem key={key} value={key}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">
            {data?.pagination.total || 0} Certificate{data?.pagination.total !== 1 ? 's' : ''}
          </CardTitle>
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
                No certificates found
              </h3>
              <p className="text-slate-500 mb-4">
                {search || statusFilter || typeFilter
                  ? 'Try adjusting your filters'
                  : 'Create your first certificate to get started'}
              </p>
              {!search && !statusFilter && !typeFilter && (
                <Button onClick={() => navigate('/portal/certificates/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Certificate
                </Button>
              )}
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
                      <TableHead>Client</TableHead>
                      <TableHead>Inspection Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.certificates.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-medium">
                          <Link
                            to={`/portal/certificates/${cert.id}`}
                            className="hover:text-primary hover:underline"
                          >
                            {cert.certificate_no}
                          </Link>
                        </TableCell>
                        <TableCell>{getTypeBadge(cert.certificate_type)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{cert.installation_address || cert.property_address}</div>
                            <div className="text-slate-500">{cert.installation_postcode || cert.property_postcode}</div>
                          </div>
                        </TableCell>
                        <TableCell>{cert.client_name || cert.customer_name || '-'}</TableCell>
                        <TableCell>{formatDate(cert.inspection_date)}</TableCell>
                        <TableCell>{getStatusBadge(cert.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/portal/certificates/${cert.id}`)}
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {['draft', 'revision_requested'].includes(cert.status) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/portal/certificates/${cert.id}/edit`)}
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
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
