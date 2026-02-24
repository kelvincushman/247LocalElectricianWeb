import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { createCertificate } from '@/services/certificateService';
import { CERTIFICATE_TYPES } from '@/types/certificate';
import type { CertificateType } from '@/types/certificate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  FileCheck,
  ArrowLeft,
  Search,
  Building2,
  ClipboardCheck,
  FileText,
  FileEdit,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Property {
  id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  postcode: string;
  customer_name?: string;
  company_name?: string;
  company_id?: string;
  customer_id?: string;
}

export default function CertificateCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const preselectedPropertyId = searchParams.get('property_id');
  const preselectedJobId = searchParams.get('job_id');

  const [step, setStep] = useState(preselectedPropertyId ? 2 : 1);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedType, setSelectedType] = useState<CertificateType | null>(null);
  const [propertySearch, setPropertySearch] = useState('');

  // Fetch properties for selection
  const { data: propertiesData, isLoading: propertiesLoading } = useQuery({
    queryKey: ['properties', propertySearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (propertySearch) params.set('search', propertySearch);
      params.set('limit', '50');
      const response = await fetch(`/api/portal/properties?${params.toString()}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    },
  });

  // Fetch preselected property if provided
  const { data: preselectedPropertyData } = useQuery({
    queryKey: ['property', preselectedPropertyId],
    queryFn: async () => {
      const response = await fetch(`/api/portal/properties/${preselectedPropertyId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch property');
      return response.json();
    },
    enabled: !!preselectedPropertyId && !selectedProperty,
    onSuccess: (data) => {
      if (data?.property && !selectedProperty) {
        setSelectedProperty(data.property);
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: createCertificate,
    onSuccess: (data) => {
      toast({
        title: 'Certificate Created',
        description: `Certificate ${data.certificate.certificate_no} has been created.`,
      });
      navigate(`/portal/certificates/${data.certificate.id}/edit`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create certificate',
        variant: 'destructive',
      });
    },
  });

  const handleCreateCertificate = () => {
    if (!selectedProperty || !selectedType) return;

    createMutation.mutate({
      certificate_type: selectedType,
      property_id: selectedProperty.id,
      job_id: preselectedJobId || undefined,
      company_id: selectedProperty.company_id || undefined,
      customer_id: selectedProperty.customer_id || undefined,
    });
  };

  const certificateTypeCards = [
    {
      type: 'eicr' as CertificateType,
      icon: ClipboardCheck,
      color: 'text-blue-600 bg-blue-100',
      borderColor: 'border-blue-500',
    },
    {
      type: 'eic' as CertificateType,
      icon: FileCheck,
      color: 'text-green-600 bg-green-100',
      borderColor: 'border-green-500',
    },
    {
      type: 'mw' as CertificateType,
      icon: FileEdit,
      color: 'text-orange-600 bg-orange-100',
      borderColor: 'border-orange-500',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/portal/certificates')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="h-7 w-7 text-primary" />
            New Certificate
          </h1>
          <p className="text-slate-500 mt-1">
            Create a new electrical certificate
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg",
          step >= 1 ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
        )}>
          <span className="font-semibold">1</span>
          <span className="hidden sm:inline">Select Property</span>
        </div>
        <div className="h-0.5 w-8 bg-slate-200" />
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg",
          step >= 2 ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
        )}>
          <span className="font-semibold">2</span>
          <span className="hidden sm:inline">Certificate Type</span>
        </div>
        <div className="h-0.5 w-8 bg-slate-200" />
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg",
          step >= 3 ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
        )}>
          <span className="font-semibold">3</span>
          <span className="hidden sm:inline">Confirm</span>
        </div>
      </div>

      {/* Step 1: Select Property */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Property</CardTitle>
            <CardDescription>
              Choose the property for this certificate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search properties by address or postcode..."
                value={propertySearch}
                onChange={(e) => setPropertySearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {propertiesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : propertiesData?.properties?.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No properties found. Try a different search.
              </div>
            ) : (
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {propertiesData?.properties?.map((property: Property) => (
                  <button
                    key={property.id}
                    onClick={() => {
                      setSelectedProperty(property);
                      setStep(2);
                    }}
                    className={cn(
                      "w-full p-4 rounded-lg border-2 text-left transition-all hover:border-primary hover:bg-slate-50",
                      selectedProperty?.id === property.id
                        ? "border-primary bg-primary/5"
                        : "border-slate-200"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Building2 className="h-5 w-5 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900">
                          {property.address_line1}
                        </div>
                        {property.address_line2 && (
                          <div className="text-sm text-slate-500">{property.address_line2}</div>
                        )}
                        <div className="text-sm text-slate-500">
                          {property.city}, {property.postcode}
                        </div>
                        {(property.company_name || property.customer_name) && (
                          <div className="text-sm text-primary mt-1">
                            {property.company_name || property.customer_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select Certificate Type */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Certificate Type</CardTitle>
            <CardDescription>
              Choose the type of certificate to create
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selected Property Summary */}
            {selectedProperty && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-500">Selected Property</div>
                    <div className="font-medium">{selectedProperty.address_line1}</div>
                    <div className="text-sm text-slate-500">
                      {selectedProperty.city}, {selectedProperty.postcode}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                    Change
                  </Button>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-4">
              {certificateTypeCards.map(({ type, icon: Icon, color, borderColor }) => {
                const typeInfo = CERTIFICATE_TYPES[type];
                return (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedType(type);
                      setStep(3);
                    }}
                    className={cn(
                      "p-6 rounded-lg border-2 text-left transition-all hover:shadow-lg",
                      selectedType === type
                        ? `${borderColor} border-2`
                        : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4", color)}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="font-bold text-lg mb-1">{typeInfo.label}</div>
                    <div className="text-sm text-slate-600 mb-2">{typeInfo.fullName}</div>
                    <div className="text-xs text-slate-400">{typeInfo.standard}</div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Confirm and Create */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Confirm Certificate Details</CardTitle>
            <CardDescription>
              Review the details before creating the certificate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Property Details */}
              <div className="space-y-3">
                <Label className="text-slate-500">Property</Label>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Building2 className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="font-medium">{selectedProperty?.address_line1}</div>
                      <div className="text-sm text-slate-500">
                        {selectedProperty?.city}, {selectedProperty?.postcode}
                      </div>
                      {selectedProperty?.company_name && (
                        <div className="text-sm text-primary mt-1">
                          {selectedProperty.company_name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                  Change Property
                </Button>
              </div>

              {/* Certificate Type */}
              <div className="space-y-3">
                <Label className="text-slate-500">Certificate Type</Label>
                {selectedType && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        certificateTypeCards.find(c => c.type === selectedType)?.color
                      )}>
                        <FileCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">{CERTIFICATE_TYPES[selectedType].label}</div>
                        <div className="text-sm text-slate-500">
                          {CERTIFICATE_TYPES[selectedType].fullName}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {CERTIFICATE_TYPES[selectedType].standard}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                  Change Type
                </Button>
              </div>
            </div>

            <div className="border-t pt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => navigate('/portal/certificates')}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateCertificate}
                disabled={createMutation.isPending}
                className="gap-2"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FileCheck className="h-4 w-4" />
                    Create Certificate
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
