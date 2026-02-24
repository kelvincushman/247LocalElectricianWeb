import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCertificate,
  approveCertificate,
  rejectCertificate,
  requestRevision,
} from '@/services/certificateService';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  FileCheck,
  Building2,
  User,
  Calendar,
  Zap,
  AlertTriangle,
  ClipboardList,
  History,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function QSReviewCertificate() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showRevisionDialog, setShowRevisionDialog] = useState(false);
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['certificate', id],
    queryFn: () => getCertificate(id!),
    enabled: !!id,
  });

  const approveMutation = useMutation({
    mutationFn: (comments?: string) => approveCertificate(id!, comments),
    onSuccess: () => {
      toast({
        title: 'Certificate Approved',
        description: 'The certificate has been approved and is now visible to customers.',
      });
      queryClient.invalidateQueries({ queryKey: ['certificate', id] });
      queryClient.invalidateQueries({ queryKey: ['qs-pending'] });
      navigate('/portal/qs');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve certificate',
        variant: 'destructive',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ reason, comments }: { reason: string; comments?: string }) =>
      rejectCertificate(id!, reason, comments),
    onSuccess: () => {
      toast({
        title: 'Certificate Rejected',
        description: 'The certificate has been rejected.',
      });
      queryClient.invalidateQueries({ queryKey: ['certificate', id] });
      queryClient.invalidateQueries({ queryKey: ['qs-pending'] });
      navigate('/portal/qs');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject certificate',
        variant: 'destructive',
      });
    },
  });

  const revisionMutation = useMutation({
    mutationFn: (comments: string) => requestRevision(id!, comments),
    onSuccess: () => {
      toast({
        title: 'Revision Requested',
        description: 'The engineer has been notified to make changes.',
      });
      queryClient.invalidateQueries({ queryKey: ['certificate', id] });
      queryClient.invalidateQueries({ queryKey: ['qs-pending'] });
      navigate('/portal/qs');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to request revision',
        variant: 'destructive',
      });
    },
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
        <Button onClick={() => navigate('/portal/qs')}>
          Back to Queue
        </Button>
      </div>
    );
  }

  const { certificate, boards, observations, reviews } = data;
  const typeInfo = CERTIFICATE_TYPES[certificate.certificate_type];
  const statusInfo = CERTIFICATE_STATUSES[certificate.status];

  // Count observations by code
  const observationCounts = observations.reduce((acc, obs) => {
    acc[obs.code] = (acc[obs.code] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const hasC1 = observationCounts['C1'] > 0;
  const hasC2 = observationCounts['C2'] > 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/portal/qs')}>
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
              Review certificate for approval
            </p>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      {(hasC1 || hasC2) && (
        <div className={cn(
          'p-4 rounded-lg border flex items-start gap-3',
          hasC1 ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
        )}>
          <AlertTriangle className={cn(
            'h-5 w-5 mt-0.5',
            hasC1 ? 'text-red-600' : 'text-orange-600'
          )} />
          <div>
            <div className={cn(
              'font-medium',
              hasC1 ? 'text-red-800' : 'text-orange-800'
            )}>
              {hasC1 ? 'Danger Present - C1 Observations' : 'Potentially Dangerous - C2 Observations'}
            </div>
            <div className={cn(
              'text-sm mt-1',
              hasC1 ? 'text-red-700' : 'text-orange-700'
            )}>
              {hasC1
                ? `This certificate has ${observationCounts['C1']} C1 code(s) indicating danger present requiring immediate attention.`
                : `This certificate has ${observationCounts['C2']} C2 code(s) indicating potentially dangerous conditions.`}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons - Fixed at top */}
      {certificate.status === 'submitted' && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-900">Review Decision</h3>
                <p className="text-sm text-slate-500">
                  Carefully review all sections before making a decision
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowRevisionDialog(true)}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Request Revision
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectDialog(true)}
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
                <Button
                  onClick={() => setShowApproveDialog(true)}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for different sections */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
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
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-500 text-xs">Phone</Label>
                    <div className="font-medium">{certificate.client_phone || '-'}</div>
                  </div>
                  <div>
                    <Label className="text-slate-500 text-xs">Email</Label>
                    <div className="font-medium">{certificate.client_email || '-'}</div>
                  </div>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-500 text-xs">Inspection Date</Label>
                    <div className="font-medium">{formatDate(certificate.inspection_date)}</div>
                  </div>
                  <div>
                    <Label className="text-slate-500 text-xs">Next Inspection</Label>
                    <div className="font-medium">{formatDate(certificate.next_inspection_date)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inspector Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Inspector Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-slate-500 text-xs">Inspector Name</Label>
                  <div className="font-medium">{certificate.inspector_name || '-'}</div>
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">Registration Number</Label>
                  <div className="font-medium">{certificate.inspector_registration || '-'}</div>
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">Submitted</Label>
                  <div className="font-medium">{formatDateTime(certificate.submitted_at)}</div>
                </div>
              </CardContent>
            </Card>

            {/* Overall Assessment (EICR only) */}
            {certificate.certificate_type === 'eicr' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileCheck className="h-5 w-5" />
                    Overall Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    'p-4 rounded-lg text-center',
                    certificate.overall_assessment === 'satisfactory'
                      ? 'bg-green-100 text-green-800'
                      : certificate.overall_assessment === 'unsatisfactory'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-slate-100 text-slate-800'
                  )}>
                    <div className="text-2xl font-bold uppercase">
                      {certificate.overall_assessment || 'Not Set'}
                    </div>
                    <div className="text-sm mt-1">
                      {certificate.overall_assessment === 'satisfactory'
                        ? 'Installation is in a satisfactory condition'
                        : certificate.overall_assessment === 'unsatisfactory'
                        ? 'Remedial action required'
                        : 'Assessment not completed'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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
                  <Label className="text-slate-500 text-xs">PFC/PSCC - Ipf (kA)</Label>
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
                      <Label className="text-slate-500 text-xs">Designation</Label>
                      <div className="font-medium">{board.designation || '-'}</div>
                    </div>
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
                              <TableHead>Type</TableHead>
                              <TableHead>Zs (Ω)</TableHead>
                              <TableHead>Max Zs (Ω)</TableHead>
                              <TableHead>Polarity</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {board.circuits.map((circuit: CertificateCircuit) => (
                              <TableRow key={circuit.id}>
                                <TableCell className="font-medium">{circuit.position}</TableCell>
                                <TableCell>{circuit.designation}</TableCell>
                                <TableCell>{circuit.rating_amps || '-'}</TableCell>
                                <TableCell>{circuit.breaker_type || '-'}</TableCell>
                                <TableCell>{circuit.zs || '-'}</TableCell>
                                <TableCell>{circuit.max_zs || '-'}</TableCell>
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
          {/* Observation Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Observation Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {Object.entries(OBSERVATION_CODES).map(([code, info]) => {
                  const count = observationCounts[code] || 0;
                  return (
                    <div
                      key={code}
                      className={cn(
                        'px-4 py-2 rounded-lg border',
                        count > 0 ? info.bgColor : 'bg-slate-50'
                      )}
                    >
                      <div className={cn(
                        'font-bold text-xl',
                        count > 0 ? info.textColor : 'text-slate-400'
                      )}>
                        {count}
                      </div>
                      <div className={cn(
                        'text-sm',
                        count > 0 ? info.textColor : 'text-slate-400'
                      )}>
                        {code}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Observations List */}
          <Card>
            <CardHeader>
              <CardTitle>Observations & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              {observations.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No observations recorded
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Code</TableHead>
                        <TableHead className="w-20">Item</TableHead>
                        <TableHead>Observation</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Recommendation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {observations.map((obs: CertificateObservation) => {
                        const codeInfo = OBSERVATION_CODES[obs.code];
                        return (
                          <TableRow key={obs.id}>
                            <TableCell>
                              <Badge className={cn(codeInfo?.bgColor, codeInfo?.textColor, 'font-bold')}>
                                {obs.code}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{obs.item_number}</TableCell>
                            <TableCell>{obs.observation}</TableCell>
                            <TableCell>{obs.location || '-'}</TableCell>
                            <TableCell>{obs.recommendation || '-'}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Review History</CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No review history available
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg"
                    >
                      <div className={cn(
                        'p-2 rounded-full',
                        review.action === 'approved' ? 'bg-green-100' :
                        review.action === 'rejected' ? 'bg-red-100' :
                        review.action === 'revision_requested' ? 'bg-orange-100' :
                        'bg-blue-100'
                      )}>
                        {review.action === 'approved' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : review.action === 'rejected' ? (
                          <XCircle className="h-5 w-5 text-red-600" />
                        ) : review.action === 'revision_requested' ? (
                          <RotateCcw className="h-5 w-5 text-orange-600" />
                        ) : (
                          <MessageSquare className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium capitalize">
                            {review.action?.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-slate-500">
                            {formatDateTime(review.created_at)}
                          </div>
                        </div>
                        <div className="text-sm text-slate-600 mt-1">
                          By {review.reviewer_name || 'Unknown'}
                        </div>
                        {review.comments && (
                          <div className="mt-2 p-3 bg-white rounded border text-sm">
                            {review.comments}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Approve Certificate
            </DialogTitle>
            <DialogDescription>
              This will approve the certificate and make it visible to customers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Comments (Optional)</Label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add any comments for the engineer..."
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => approveMutation.mutate(comments || undefined)}
              disabled={approveMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Approve Certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject Certificate
            </DialogTitle>
            <DialogDescription>
              Provide a reason for rejection. The engineer will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rejection Reason *</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                className="mt-2"
                required
              />
            </div>
            <div>
              <Label>Additional Comments (Optional)</Label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add any additional comments..."
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectMutation.mutate({ reason: rejectionReason, comments: comments || undefined })}
              disabled={!rejectionReason.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Reject Certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revision Dialog */}
      <Dialog open={showRevisionDialog} onOpenChange={setShowRevisionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-orange-600" />
              Request Revision
            </DialogTitle>
            <DialogDescription>
              Describe what changes are needed. The engineer will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Revision Comments *</Label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Describe what changes are required..."
                className="mt-2"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRevisionDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => revisionMutation.mutate(comments)}
              disabled={!comments.trim() || revisionMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {revisionMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Request Revision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
