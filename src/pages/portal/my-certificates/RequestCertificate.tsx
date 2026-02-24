import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { createCertificateRequest, getCertificateRequests } from '@/services/certificateService';
import { CERTIFICATE_TYPES } from '@/types/certificate';
import type { CertificateType } from '@/types/certificate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  FileCheck,
  Building2,
  Calendar,
  Clock,
  ClipboardCheck,
  FileEdit,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Property {
  id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  postcode: string;
}

const certificateTypeCards = [
  {
    type: 'eicr' as CertificateType,
    icon: ClipboardCheck,
    color: 'text-blue-600 bg-blue-100',
    borderColor: 'border-blue-500',
    description: 'Comprehensive inspection of your electrical installation',
    typical_use: 'Required every 5 years for rented properties',
  },
  {
    type: 'eic' as CertificateType,
    icon: FileCheck,
    color: 'text-green-600 bg-green-100',
    borderColor: 'border-green-500',
    description: 'Certificate for new electrical installations',
    typical_use: 'Required for new builds and major alterations',
  },
  {
    type: 'mw' as CertificateType,
    icon: FileEdit,
    color: 'text-orange-600 bg-orange-100',
    borderColor: 'border-orange-500',
    description: 'Certificate for small electrical works',
    typical_use: 'Additions or modifications to existing circuits',
  },
];

export default function RequestCertificate() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [selectedType, setSelectedType] = useState<CertificateType | null>(null);
  const [preferredDate, setPreferredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Fetch customer's properties
  const { data: propertiesData, isLoading: propertiesLoading } = useQuery({
    queryKey: ['my-properties'],
    queryFn: async () => {
      const response = await fetch('/api/portal/my/properties', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    },
  });

  // Fetch existing requests
  const { data: requestsData } = useQuery({
    queryKey: ['my-certificate-requests'],
    queryFn: () => getCertificateRequests({ status: 'pending' }),
  });

  const createMutation = useMutation({
    mutationFn: createCertificateRequest,
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: 'Request Submitted',
        description: 'Your certificate request has been submitted. We will contact you shortly.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit request',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedProperty || !selectedType) return;

    createMutation.mutate({
      property_id: selectedProperty,
      certificate_type: selectedType,
      preferred_date: preferredDate || undefined,
      notes: notes || undefined,
    });
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Request Submitted
              </h2>
              <p className="text-slate-600 mb-6">
                Thank you for your request. Our team will review it and contact you within 24 hours to schedule the inspection.
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => navigate('/portal/my-certificates')}>
                  View My Certificates
                </Button>
                <Button onClick={() => {
                  setSubmitted(false);
                  setSelectedProperty('');
                  setSelectedType(null);
                  setPreferredDate('');
                  setNotes('');
                }}>
                  Make Another Request
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/portal/my-certificates')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="h-7 w-7 text-primary" />
            Request Certificate
          </h1>
          <p className="text-slate-500 mt-1">
            Request an electrical certificate for your property
          </p>
        </div>
      </div>

      {/* Pending Requests */}
      {requestsData?.requests && requestsData.requests.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-800 flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 text-sm mb-3">
              You have {requestsData.requests.length} pending request(s):
            </p>
            <div className="space-y-2">
              {requestsData.requests.map((request: any) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-2 bg-white rounded border border-blue-200"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-medium text-sm">
                        {CERTIFICATE_TYPES[request.certificate_type as CertificateType]?.label} - {request.property_address}
                      </div>
                      <div className="text-xs text-slate-500">
                        Requested: {new Date(request.created_at).toLocaleDateString('en-GB')}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{request.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request Form */}
      <Card>
        <CardHeader>
          <CardTitle>Select Property</CardTitle>
          <CardDescription>
            Choose the property that needs the certificate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {propertiesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : propertiesData?.properties?.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Building2 className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <p>No properties found. Please contact support to add your properties.</p>
            </div>
          ) : (
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger>
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {propertiesData?.properties?.map((property: Property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.address_line1}, {property.city} {property.postcode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select Certificate Type</CardTitle>
          <CardDescription>
            Choose the type of certificate you need
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {certificateTypeCards.map(({ type, icon: Icon, color, borderColor, description, typical_use }) => {
              const typeInfo = CERTIFICATE_TYPES[type];
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    'p-6 rounded-lg border-2 text-left transition-all hover:shadow-lg',
                    selectedType === type
                      ? `${borderColor} border-2 shadow-md`
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center mb-4', color)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="font-bold text-lg mb-1">{typeInfo.label}</div>
                  <div className="text-sm text-slate-600 mb-2">{description}</div>
                  <div className="text-xs text-slate-400">{typical_use}</div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Details</CardTitle>
          <CardDescription>
            Provide any additional information that may help us
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="preferred_date">Preferred Date (Optional)</Label>
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="h-5 w-5 text-slate-400" />
              <Input
                id="preferred_date"
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              We'll do our best to accommodate your preferred date
            </p>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions or access requirements..."
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Ready to submit?</h3>
              <p className="text-sm text-slate-500">
                We'll contact you within 24 hours to confirm the appointment
              </p>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!selectedProperty || !selectedType || createMutation.isPending}
              size="lg"
              className="gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
