import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { usePortalAuth } from '@/contexts/PortalAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, Loader2, AlertCircle, Home } from 'lucide-react';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
}

interface Company {
  id: string;
  name: string;
}

interface PropertyFormData {
  address_line1: string;
  address_line2: string;
  city: string;
  postcode: string;
  property_type: string;
  customer_id: string;
  company_id: string;
  access_notes: string;
  notes: string;
}

const initialFormData: PropertyFormData = {
  address_line1: '',
  address_line2: '',
  city: '',
  postcode: '',
  property_type: 'house',
  customer_id: '',
  company_id: '',
  access_notes: '',
  notes: '',
};

const propertyTypes = [
  { value: 'house', label: 'House' },
  { value: 'flat', label: 'Flat' },
  { value: 'bungalow', label: 'Bungalow' },
  { value: 'maisonette', label: 'Maisonette' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'hmo', label: 'HMO' },
  { value: 'other', label: 'Other' },
];

export default function PropertyForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isStaff } = usePortalAuth();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchDropdownData();

    // Pre-fill from URL params
    const customerId = searchParams.get('customer_id');
    const companyId = searchParams.get('company_id');
    if (customerId || companyId) {
      setFormData(prev => ({
        ...prev,
        customer_id: customerId || '',
        company_id: companyId || '',
      }));
    }

    if (isEditing) {
      fetchProperty();
    }
  }, [id, searchParams]);

  const fetchDropdownData = async () => {
    try {
      const [customersRes, companiesRes] = await Promise.all([
        fetch('/api/portal/customers?limit=1000', { credentials: 'include' }),
        fetch('/api/portal/companies?limit=1000', { credentials: 'include' }),
      ]);

      if (customersRes.ok) {
        const data = await customersRes.json();
        setCustomers(data.customers || []);
      }
      if (companiesRes.ok) {
        const data = await companiesRes.json();
        setCompanies(data.companies || []);
      }
    } catch (err) {
      console.error('Failed to fetch dropdown data:', err);
    }
  };

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/portal/properties/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Property not found');
      }

      const data = await response.json();
      const property = data.property;

      setFormData({
        address_line1: property.address_line1 || '',
        address_line2: property.address_line2 || '',
        city: property.city || '',
        postcode: property.postcode || '',
        property_type: property.property_type || 'house',
        customer_id: property.customer_id || '',
        company_id: property.company_id || '',
        access_notes: property.access_notes || '',
        notes: property.notes || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load property');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.address_line1.trim()) {
      errors.address_line1 = 'Address is required';
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }

    if (!formData.postcode.trim()) {
      errors.postcode = 'Postcode is required';
    } else if (!/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(formData.postcode)) {
      errors.postcode = 'Invalid UK postcode format';
    }

    if (!formData.customer_id && !formData.company_id) {
      errors.customer_id = 'Please select either a customer or company';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const url = isEditing ? `/api/portal/properties/${id}` : '/api/portal/properties';
      const method = isEditing ? 'PUT' : 'POST';

      const body = {
        ...formData,
        customer_id: formData.customer_id || null,
        company_id: formData.company_id || null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save property');
      }

      const data = await response.json();
      navigate(`/portal/properties/${data.property.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save property');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof PropertyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  if (!isStaff) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">You don't have permission to view this page.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={isEditing ? `/portal/properties/${id}` : '/portal/properties'}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditing ? 'Edit Property' : 'New Property'}
          </h1>
          <p className="text-slate-500">
            {isEditing ? 'Update property information' : 'Add a new property'}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Property Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Property Address
              </CardTitle>
              <CardDescription>The address of the property</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address_line1">
                  Address Line 1 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address_line1"
                  value={formData.address_line1}
                  onChange={(e) => handleChange('address_line1', e.target.value)}
                  placeholder="123 High Street"
                  className={validationErrors.address_line1 ? 'border-red-500' : ''}
                />
                {validationErrors.address_line1 && (
                  <p className="text-sm text-red-500">{validationErrors.address_line1}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_line2">Address Line 2</Label>
                <Input
                  id="address_line2"
                  value={formData.address_line2}
                  onChange={(e) => handleChange('address_line2', e.target.value)}
                  placeholder="Flat 4B"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Wolverhampton"
                    className={validationErrors.city ? 'border-red-500' : ''}
                  />
                  {validationErrors.city && (
                    <p className="text-sm text-red-500">{validationErrors.city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postcode">
                    Postcode <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="postcode"
                    value={formData.postcode}
                    onChange={(e) => handleChange('postcode', e.target.value.toUpperCase())}
                    placeholder="WV1 1AA"
                    className={validationErrors.postcode ? 'border-red-500' : ''}
                  />
                  {validationErrors.postcode && (
                    <p className="text-sm text-red-500">{validationErrors.postcode}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="property_type">Property Type</Label>
                <Select
                  value={formData.property_type}
                  onValueChange={(value) => handleChange('property_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Ownership */}
          <Card>
            <CardHeader>
              <CardTitle>Ownership</CardTitle>
              <CardDescription>Link this property to a customer or company</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customer_id">Customer</Label>
                  <Select
                    value={formData.customer_id}
                    onValueChange={(value) => handleChange('customer_id', value === 'none' ? '' : value)}
                  >
                    <SelectTrigger className={validationErrors.customer_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No customer</SelectItem>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.first_name} {customer.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_id">Company</Label>
                  <Select
                    value={formData.company_id}
                    onValueChange={(value) => handleChange('company_id', value === 'none' ? '' : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No company</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {validationErrors.customer_id && (
                <p className="text-sm text-red-500">{validationErrors.customer_id}</p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Access instructions and additional information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="access_notes">Access Notes</Label>
                <Textarea
                  id="access_notes"
                  value={formData.access_notes}
                  onChange={(e) => handleChange('access_notes', e.target.value)}
                  placeholder="Key code, tenant contact, parking instructions..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">General Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Any other relevant information about this property..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link to={isEditing ? `/portal/properties/${id}` : '/portal/properties'}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? 'Update Property' : 'Create Property'}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
