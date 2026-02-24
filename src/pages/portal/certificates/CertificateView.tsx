import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCertificate, downloadCertificatePdf } from '@/services/certificateService';
import {
  CERTIFICATE_TYPES,
  CERTIFICATE_STATUSES,
  OBSERVATION_CODES,
} from '@/types/certificate';
import type { ObservationCode } from '@/types/certificate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileCheck,
  ArrowLeft,
  Download,
  Printer,
  Edit,
  Loader2,
  AlertTriangle,
  User,
  Building2,
  Zap,
  CircuitBoard,
  ClipboardCheck,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePortalAuth } from '@/contexts/PortalAuthContext';

export default function CertificateView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isStaff } = usePortalAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['certificate', id],
    queryFn: () => getCertificate(id!),
    enabled: !!id,
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data?.certificate) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Certificate Not Found</h2>
        <Button onClick={() => navigate('/portal/certificates')}>
          Back to Certificates
        </Button>
      </div>
    );
  }

  const certificate = data.certificate;
  const boards = data.boards || [];
  const observations = data.observations || [];
  const reviews = data.reviews || [];

  const isEditable = ['draft', 'revision_requested'].includes(certificate.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/portal/certificates')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">
                {certificate.certificate_no}
              </h1>
              <Badge className={cn(
                CERTIFICATE_STATUSES[certificate.status].bgColor,
                CERTIFICATE_STATUSES[certificate.status].textColor,
                'border-0'
              )}>
                {CERTIFICATE_STATUSES[certificate.status].label}
              </Badge>
              <Badge variant="outline" className="font-semibold">
                {CERTIFICATE_TYPES[certificate.certificate_type].label}
              </Badge>
            </div>
            <p className="text-slate-500 mt-1">
              {CERTIFICATE_TYPES[certificate.certificate_type].fullName}
            </p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => downloadCertificatePdf(id!, certificate.certificate_no)}
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          {isStaff && isEditable && (
            <Button onClick={() => navigate(`/portal/certificates/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Certificate
            </Button>
          )}
        </div>
      </div>

      {/* Overall Assessment Banner */}
      {certificate.overall_assessment && (
        <div className={cn(
          "p-6 rounded-lg border-2",
          certificate.overall_assessment === 'satisfactory'
            ? "bg-green-50 border-green-500"
            : "bg-red-50 border-red-500"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {certificate.overall_assessment === 'satisfactory' ? (
                <CheckCircle className="h-12 w-12 text-green-600" />
              ) : (
                <XCircle className="h-12 w-12 text-red-600" />
              )}
              <div>
                <h2 className={cn(
                  "text-2xl font-bold",
                  certificate.overall_assessment === 'satisfactory'
                    ? "text-green-700"
                    : "text-red-700"
                )}>
                  {certificate.overall_assessment.toUpperCase()}
                </h2>
                <p className="text-slate-600">
                  {certificate.overall_assessment === 'satisfactory'
                    ? 'This installation is suitable for continued use'
                    : 'Dangerous or potentially dangerous conditions have been identified'}
                </p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-sm text-slate-500">Next Inspection</div>
              <div className="text-lg font-semibold">{formatDate(certificate.next_inspection_date)}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client & Installation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Client Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-slate-500">Client Name</div>
                <div className="font-medium">{certificate.client_name || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Email</div>
                <div className="font-medium">{certificate.client_email || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Phone</div>
                <div className="font-medium">{certificate.client_phone || '-'}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-slate-500">Address</div>
                <div className="font-medium">{certificate.client_address || '-'}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Installation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <div className="text-sm text-slate-500">Installation Address</div>
                <div className="font-medium">
                  {certificate.installation_address}, {certificate.installation_postcode}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Premises Type</div>
                <div className="font-medium capitalize">{certificate.premises_type || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Installation Age</div>
                <div className="font-medium">
                  {certificate.installation_age_years ? `${certificate.installation_age_years} years` : '-'}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Evidence of Alterations</div>
                <div className="font-medium capitalize">
                  {certificate.evidence_of_alterations?.replace('_', ' ') || '-'}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Reason for Report</div>
                <div className="font-medium">{certificate.reason_for_report || '-'}</div>
              </div>
              {certificate.extent_of_installation && (
                <div className="md:col-span-2">
                  <div className="text-sm text-slate-500">Extent of Installation</div>
                  <div className="font-medium">{certificate.extent_of_installation}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Supply Characteristics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Supply Characteristics
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-slate-500">Earthing Arrangement</div>
                <div className="font-medium">{certificate.earthing_arrangement || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Phase Configuration</div>
                <div className="font-medium">{certificate.phase_configuration || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Nominal Voltage</div>
                <div className="font-medium">{certificate.nominal_voltage ? `${certificate.nominal_voltage}V` : '-'}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Frequency</div>
                <div className="font-medium">{certificate.nominal_frequency ? `${certificate.nominal_frequency}Hz` : '-'}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">PFC/PSCC (Ipf)</div>
                <div className="font-medium">{certificate.pfc_pscc ? `${certificate.pfc_pscc}kA` : '-'}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Earth Loop (Ze)</div>
                <div className="font-medium">{certificate.external_loop_impedance ? `${certificate.external_loop_impedance}Ω` : '-'}</div>
              </div>
            </CardContent>
          </Card>

          {/* Observations */}
          {observations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Observations & Recommendations
                </CardTitle>
                <CardDescription>
                  {observations.length} observation(s) recorded
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Summary */}
                <div className="flex gap-4 mb-4 flex-wrap">
                  {Object.entries(OBSERVATION_CODES).slice(0, 4).map(([code, info]) => {
                    const count = observations.filter(o => o.code === code).length;
                    if (count === 0) return null;
                    return (
                      <div key={code} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50">
                        <Badge className={cn(info.bgColor, 'text-white')}>{info.label}</Badge>
                        <span className="font-semibold">{count}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Item</TableHead>
                        <TableHead className="min-w-[300px]">Observation</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="w-16">Code</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {observations.map((obs) => (
                        <TableRow key={obs.id}>
                          <TableCell>{obs.item_number}</TableCell>
                          <TableCell>
                            <div>{obs.observation}</div>
                            {obs.recommendation && (
                              <div className="text-sm text-slate-500 mt-1">{obs.recommendation}</div>
                            )}
                          </TableCell>
                          <TableCell>{obs.location}</TableCell>
                          <TableCell>
                            <Badge className={cn(
                              OBSERVATION_CODES[obs.code as ObservationCode]?.bgColor || 'bg-gray-500',
                              'text-white'
                            )}>
                              {obs.code}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Boards & Circuits */}
          {boards.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CircuitBoard className="h-5 w-5" />
                  Distribution Boards & Circuits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {boards.map((board) => (
                  <div key={board.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold">{board.db_name}</h4>
                        <p className="text-sm text-slate-500">
                          {board.location} | {board.no_of_ways || 0} ways | Supplied from: {board.supplied_from}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <div>Zdb: {board.zdb || '-'}Ω</div>
                        <div>Ipf: {board.ipf || '-'}kA</div>
                      </div>
                    </div>
                    {board.circuits && board.circuits.length > 0 && (
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">Cct</TableHead>
                              <TableHead>Designation</TableHead>
                              <TableHead>Rating</TableHead>
                              <TableHead>Max Zs</TableHead>
                              <TableHead>Meas Zs</TableHead>
                              <TableHead>Polarity</TableHead>
                              <TableHead>Result</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {board.circuits.map((circuit) => (
                              <TableRow key={circuit.id}>
                                <TableCell>{circuit.circuit_number}</TableCell>
                                <TableCell className="font-medium">{circuit.designation}</TableCell>
                                <TableCell>{circuit.rating_amps}A</TableCell>
                                <TableCell>{circuit.max_zs || '-'}</TableCell>
                                <TableCell>{circuit.zs || '-'}</TableCell>
                                <TableCell>
                                  {circuit.polarity && (
                                    <Badge variant={circuit.polarity === 'OK' ? 'default' : 'destructive'}>
                                      {circuit.polarity}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={circuit.circuit_result === 'pass' ? 'default' : 'destructive'}>
                                    {circuit.circuit_result?.toUpperCase()}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Key Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Key Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-slate-500">Inspection Date</div>
                <div className="font-medium">{formatDate(certificate.inspection_date)}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Next Inspection</div>
                <div className="font-medium">{formatDate(certificate.next_inspection_date)}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Created</div>
                <div className="font-medium">{formatDate(certificate.created_at)}</div>
              </div>
              {certificate.approved_at && (
                <div>
                  <div className="text-sm text-slate-500">Approved</div>
                  <div className="font-medium">{formatDate(certificate.approved_at)}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inspector Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inspector</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-slate-500">Inspected By</div>
                <div className="font-medium">{certificate.inspector_name || certificate.created_by_name}</div>
              </div>
              {certificate.inspector_registration && (
                <div>
                  <div className="text-sm text-slate-500">NAPIT Registration</div>
                  <div className="font-medium">{certificate.inspector_registration}</div>
                </div>
              )}
              {certificate.approved_by_name && (
                <div>
                  <div className="text-sm text-slate-500">Approved By</div>
                  <div className="font-medium">{certificate.approved_by_name}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review History */}
          {reviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-l-2 border-slate-200 pl-4 pb-4 last:pb-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {review.action.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        by {review.reviewer_name}
                      </div>
                      {review.comments && (
                        <div className="text-sm mt-1">{review.comments}</div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
