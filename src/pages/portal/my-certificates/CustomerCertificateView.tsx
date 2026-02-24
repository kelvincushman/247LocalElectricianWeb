import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCertificate } from '@/services/certificateService';
import {
  CERTIFICATE_TYPES,
  CERTIFICATE_STATUSES,
  OBSERVATION_CODES,
  EARTHING_ARRANGEMENTS,
  PHASE_CONFIGURATIONS,
} from '@/types/certificate';
import type { CertificateObservation, CertificateBoard, CertificateCircuit } from '@/types/certificate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  FileCheck,
  Building2,
  User,
  Calendar,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  ClipboardList,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CustomerCertificateView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data?.certificate) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Certificate not found
        </h3>
        <p className="text-slate-500 mb-4">
          The certificate you're looking for doesn't exist or you don't have access.
        </p>
        <Button onClick={() => navigate('/portal/my-certificates')}>
          Back to Certificates
        </Button>
      </div>
    );
  }

  const { certificate, boards, observations } = data;
  const typeInfo = CERTIFICATE_TYPES[certificate.certificate_type];
  const statusInfo = CERTIFICATE_STATUSES[certificate.status];

  // Count observations by code
  const observationCounts = observations.reduce((acc, obs) => {
    acc[obs.code] = (acc[obs.code] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/portal/my-certificates')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {certificate.certificate_no}
              </h1>
              <Badge className="font-semibold">{typeInfo.label}</Badge>
              <Badge className={cn(statusInfo.bgColor, statusInfo.textColor, 'border-0')}>
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-slate-500 mt-1">
              {typeInfo.fullName}
            </p>
          </div>
        </div>
        {certificate.pdf_url && (
          <Button onClick={() => window.open(certificate.pdf_url, '_blank')} className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        )}
      </div>

      {/* Overall Assessment (EICR only) */}
      {certificate.certificate_type === 'eicr' && certificate.overall_assessment && (
        <Card className={cn(
          'border-2',
          certificate.overall_assessment === 'satisfactory'
            ? 'border-green-500 bg-green-50'
            : 'border-red-500 bg-red-50'
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              {certificate.overall_assessment === 'satisfactory' ? (
                <CheckCircle className="h-12 w-12 text-green-600" />
              ) : (
                <XCircle className="h-12 w-12 text-red-600" />
              )}
              <div>
                <h2 className={cn(
                  'text-2xl font-bold uppercase',
                  certificate.overall_assessment === 'satisfactory'
                    ? 'text-green-800'
                    : 'text-red-800'
                )}>
                  {certificate.overall_assessment}
                </h2>
                <p className={cn(
                  certificate.overall_assessment === 'satisfactory'
                    ? 'text-green-700'
                    : 'text-red-700'
                )}>
                  {certificate.overall_assessment === 'satisfactory'
                    ? 'The electrical installation is in a satisfactory condition for continued use.'
                    : 'Remedial action is required. Please see the observations below.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="details" className="gap-2">
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Details</span>
          </TabsTrigger>
          <TabsTrigger value="supply" className="gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Supply</span>
          </TabsTrigger>
          <TabsTrigger value="boards" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Boards</span>
          </TabsTrigger>
          <TabsTrigger value="observations" className="gap-2 relative">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Observations</span>
            {observations.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {observations.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Client Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Client Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-slate-500 text-xs">Client Name</Label>
                  <div className="font-medium">{certificate.client_name || '-'}</div>
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">Address</Label>
                  <div className="font-medium">{certificate.client_address || '-'}</div>
                </div>
              </CardContent>
            </Card>

            {/* Installation Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Installation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-slate-500 text-xs">Installation Address</Label>
                  <div className="font-medium">{certificate.installation_address || '-'}</div>
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">Postcode</Label>
                  <div className="font-medium">{certificate.installation_postcode || '-'}</div>
                </div>
              </CardContent>
            </Card>

            {/* Inspection Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Inspection Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-500 text-xs">Inspection Date</Label>
                    <div className="font-medium">{formatDate(certificate.inspection_date)}</div>
                  </div>
                  <div>
                    <Label className="text-slate-500 text-xs">Next Inspection Due</Label>
                    <div className="font-medium">{formatDate(certificate.next_inspection_date)}</div>
                  </div>
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">Inspector</Label>
                  <div className="font-medium">{certificate.inspector_name || '-'}</div>
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">Registration</Label>
                  <div className="font-medium">{certificate.inspector_registration || '-'}</div>
                </div>
              </CardContent>
            </Card>

            {/* Certificate Standard */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Certificate Standard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-slate-500 text-xs">Standard</Label>
                  <div className="font-medium">{typeInfo.standard}</div>
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">Certificate Type</Label>
                  <div className="font-medium">{typeInfo.fullName}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Supply Tab */}
        <TabsContent value="supply" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supply Characteristics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <Label className="text-slate-500 text-xs">Earthing Arrangement</Label>
                  <div className="font-medium">
                    {certificate.section_data?.supply?.earthing_arrangement
                      ? EARTHING_ARRANGEMENTS[certificate.section_data.supply.earthing_arrangement]
                      : '-'}
                  </div>
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">Phase Configuration</Label>
                  <div className="font-medium">
                    {certificate.section_data?.supply?.phase_configuration
                      ? PHASE_CONFIGURATIONS[certificate.section_data.supply.phase_configuration]
                      : '-'}
                  </div>
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">Nominal Voltage (V)</Label>
                  <div className="font-medium">
                    {certificate.section_data?.supply?.nominal_voltage || '-'}
                  </div>
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">Nominal Frequency (Hz)</Label>
                  <div className="font-medium">
                    {certificate.section_data?.supply?.nominal_frequency || '-'}
                  </div>
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">PFC/PSCC (kA)</Label>
                  <div className="font-medium">
                    {certificate.section_data?.supply?.pfc_pscc || '-'}
                  </div>
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">Ze (Ω)</Label>
                  <div className="font-medium">
                    {certificate.section_data?.supply?.ze || '-'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Boards Tab */}
        <TabsContent value="boards" className="space-y-4">
          {boards.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                No distribution boards recorded
              </CardContent>
            </Card>
          ) : (
            boards.map((board: CertificateBoard) => (
              <Card key={board.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{board.db_name}</CardTitle>
                  <CardDescription>
                    {board.location} • {board.no_of_ways || 0} ways
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <Label className="text-slate-500 text-xs">Supply Polarity</Label>
                      <div className="font-medium">{board.supply_polarity || '-'}</div>
                    </div>
                    <div>
                      <Label className="text-slate-500 text-xs">Zdb (Ω)</Label>
                      <div className="font-medium">{board.zdb || '-'}</div>
                    </div>
                    <div>
                      <Label className="text-slate-500 text-xs">Ipf (kA)</Label>
                      <div className="font-medium">{board.ipf || '-'}</div>
                    </div>
                    <div>
                      <Label className="text-slate-500 text-xs">SPD Fitted</Label>
                      <div className="font-medium">{board.spd_fitted ? 'Yes' : 'No'}</div>
                    </div>
                  </div>

                  {/* Circuits */}
                  {board.circuits && board.circuits.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Circuits</h4>
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-16">Cct</TableHead>
                              <TableHead>Designation</TableHead>
                              <TableHead>Rating (A)</TableHead>
                              <TableHead>Zs (Ω)</TableHead>
                              <TableHead>Polarity</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {board.circuits.map((circuit: CertificateCircuit) => (
                              <TableRow key={circuit.id}>
                                <TableCell className="font-medium">{circuit.position}</TableCell>
                                <TableCell>{circuit.designation}</TableCell>
                                <TableCell>{circuit.rating_amps || '-'}</TableCell>
                                <TableCell>{circuit.zs || '-'}</TableCell>
                                <TableCell>
                                  <Badge variant={circuit.polarity === 'OK' ? 'default' : 'destructive'}>
                                    {circuit.polarity || '-'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Observations Tab */}
        <TabsContent value="observations" className="space-y-4">
          {/* Code Legend */}
          <Card>
            <CardHeader>
              <CardTitle>Observation Codes</CardTitle>
              <CardDescription>
                Understanding the observation classifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(OBSERVATION_CODES).slice(0, 4).map(([code, info]) => (
                  <div
                    key={code}
                    className={cn(
                      'p-3 rounded-lg border',
                      info.bgColor
                    )}
                  >
                    <div className={cn('font-bold text-lg', info.textColor)}>
                      {code}
                    </div>
                    <div className={cn('text-xs', info.textColor)}>
                      {info.description}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Observation Summary */}
          {observations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Observation Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {Object.entries(OBSERVATION_CODES).map(([code, info]) => {
                    const count = observationCounts[code] || 0;
                    if (count === 0) return null;
                    return (
                      <div
                        key={code}
                        className={cn(
                          'px-4 py-2 rounded-lg',
                          info.bgColor
                        )}
                      >
                        <div className={cn('font-bold text-xl', info.textColor)}>
                          {count}
                        </div>
                        <div className={cn('text-sm', info.textColor)}>
                          {code}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observations List */}
          <Card>
            <CardHeader>
              <CardTitle>Observations & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              {observations.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900">
                    No observations recorded
                  </h3>
                  <p className="text-slate-500">
                    The inspection found no issues to report
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {observations.map((obs: CertificateObservation) => {
                    const codeInfo = OBSERVATION_CODES[obs.code];
                    return (
                      <div
                        key={obs.id}
                        className={cn(
                          'p-4 rounded-lg border-l-4',
                          codeInfo?.bgColor,
                          obs.code === 'C1' ? 'border-l-red-600' :
                          obs.code === 'C2' ? 'border-l-orange-500' :
                          obs.code === 'C3' ? 'border-l-green-500' :
                          'border-l-blue-500'
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={cn(codeInfo?.bgColor, codeInfo?.textColor, 'font-bold')}>
                                {obs.code}
                              </Badge>
                              <span className="text-sm text-slate-500">
                                Item {obs.item_number}
                              </span>
                              {obs.location && (
                                <span className="text-sm text-slate-500">
                                  • {obs.location}
                                </span>
                              )}
                            </div>
                            <p className="font-medium text-slate-900">
                              {obs.observation}
                            </p>
                            {obs.recommendation && (
                              <p className="text-sm text-slate-600 mt-2">
                                <strong>Recommendation:</strong> {obs.recommendation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
