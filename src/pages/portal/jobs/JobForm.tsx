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
import { ArrowLeft, Save, Loader2, AlertCircle, Wrench } from 'lucide-react';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
}

interface Company {
  id: string;
  name: string;
}

interface Property {
  id: string;
  address_line1: string;
  city: string | null;
  postcode: string;
}

interface JobFormData {
  title: string;
  description: string;
  job_type: string;
  status: string;
  priority: string;
  assigned_to: string;
  customer_id: string;
  company_id: string;
  property_id: string;
  scheduled_date: string;
  scheduled_time_start: string;
  scheduled_time_end: string;
  estimated_duration: string;
  estimated_cost: string;
  notes: string;
  internal_notes: string;
}

const initialFormData: JobFormData = {
  title: '',
  description: '',
  job_type: '',
  status: 'quoted',
  priority: 'normal',
  assigned_to: '',
  customer_id: '',
  company_id: '',
  property_id: '',
  scheduled_date: '',
  scheduled_time_start: '',
  scheduled_time_end: '',
  estimated_duration: '',
  estimated_cost: '',
  notes: '',
  internal_notes: '',
};

const jobTypes = [
  { value: 'emergency', label: 'Emergency Callout' },
  { value: 'fault_finding', label: 'Fault Finding' },
  { value: 'fuse_board', label: 'Fuse Board Upgrade' },
  { value: 'rewiring', label: 'Rewiring' },
  { value: 'lighting', label: 'Lighting Installation' },
  { value: 'sockets', label: 'Socket Installation' },
  { value: 'ev_charger', label: 'EV Charger Installation' },
  { value: 'eicr', label: 'EICR Certificate' },
  { value: 'solar', label: 'Solar Installation' },
  { value: 'heat_source', label: 'Heat Source Installation' },
  { value: 'other', label: 'Other' },
];

const statusOptions = [
  { value: 'quoted', label: 'Quoted' },
  { value: 'booked', label: 'Booked' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'invoiced', label: 'Invoiced' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const assigneeOptions = [
  { value: 'none', label: 'Unassigned' },
  { value: 'Kelvin', label: 'Kelvin' },
  { value: 'Andy', label: 'Andy' },
  { value: 'Both', label: 'Both' },
];

export default function JobForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isStaff } = usePortalAuth();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<JobFormData>(initialFormData);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchDropdownData();

    // Pre-fill from URL params
    const customerId = searchParams.get('customer_id');
    const companyId = searchParams.get('company_id');
    const propertyId = searchParams.get('property_id');
    if (customerId || companyId || propertyId) {
      setFormData(prev => ({
        ...prev,
        customer_id: customerId || '',
        company_id: companyId || '',
        property_id: propertyId || '',
      }));
    }

    if (isEditing) {
      fetchJob();
    }
  }, [id, searchParams]);

  // Fetch properties when customer or company changes
  useEffect(() => {
    if (formData.customer_id || formData.company_id) {
      fetchProperties();
    }
  }, [formData.customer_id, formData.company_id]);

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

  const fetchProperties = async () => {
    try {
      const params = new URLSearchParams();
      if (formData.customer_id) params.append('customer_id', formData.customer_id);
      if (formData.company_id) params.append('company_id', formData.company_id);
      params.append('limit', '1000');

      const response = await fetch(`/api/portal/properties?${params}`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties || []);
      }
    } catch (err) {
      console.error('Failed to fetch properties:', err);
    }
  };

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/portal/jobs/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Job not found');
      }

      const data = await response.json();
      const job = data.job;

      setFormData({
        title: job.title || '',
        description: job.description || '',
        job_type: job.job_type || '',
        status: job.status || 'quoted',
        priority: job.priority || 'normal',
        assigned_to: job.assigned_to || '',
        customer_id: job.customer_id || '',
        company_id: job.company_id || '',
        property_id: job.property_id || '',
        scheduled_date: job.scheduled_date ? job.scheduled_date.split('T')[0] : '',
        scheduled_time_start: job.scheduled_time_start || '',
        scheduled_time_end: job.scheduled_time_end || '',
        estimated_duration: job.estimated_duration?.toString() || '',
        estimated_cost: job.estimated_cost || '',
        notes: job.notes || '',
        internal_notes: job.internal_notes || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load job');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Job title is required';
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
      const url = isEditing ? `/api/portal/jobs/${id}` : '/api/portal/jobs';
      const method = isEditing ? 'PUT' : 'POST';

      const body = {
        ...formData,
        customer_id: formData.customer_id || null,
        company_id: formData.company_id || null,
        property_id: formData.property_id || null,
        estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : null,
        estimated_cost: formData.estimated_cost || null,
        scheduled_date: formData.scheduled_date || null,
        scheduled_time_start: formData.scheduled_time_start || null,
        scheduled_time_end: formData.scheduled_time_end || null,
        assigned_to: formData.assigned_to || null,
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
        throw new Error(data.error || 'Failed to save job');
      }

      const data = await response.json();
      navigate(`/portal/jobs/${data.job.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save job');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof JobFormData, value: string) => {
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={isEditing ? `/portal/jobs/${id}` : '/portal/jobs'}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditing ? 'Edit Job' : 'New Job'}
          </h1>
          <p className="text-slate-500">
            {isEditing ? 'Update job information' : 'Create a new job'}
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
          {/* Job Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Job Information
              </CardTitle>
              <CardDescription>Basic job details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Job Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., Fuse board upgrade - 10 way"
                  className={validationErrors.title ? 'border-red-500' : ''}
                />
                {validationErrors.title && (
                  <p className="text-sm text-red-500">{validationErrors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Detailed description of the work required..."
                  rows={3}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="job_type">Job Type</Label>
                  <Select
                    value={formData.job_type}
                    onValueChange={(value) => handleChange('job_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer & Property */}
          <Card>
            <CardHeader>
              <CardTitle>Customer & Property</CardTitle>
              <CardDescription>Link this job to a customer and property</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customer_id">Customer</Label>
                  <Select
                    value={formData.customer_id || 'none'}
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
                    value={formData.company_id || 'none'}
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

              <div className="space-y-2">
                <Label htmlFor="property_id">Property</Label>
                <Select
                  value={formData.property_id || 'none'}
                  onValueChange={(value) => handleChange('property_id', value === 'none' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No property</SelectItem>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.address_line1}, {property.city || ''} {property.postcode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>When is this job scheduled?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="assigned_to">Assigned To</Label>
                  <Select
                    value={formData.assigned_to || 'none'}
                    onValueChange={(value) => handleChange('assigned_to', value === 'none' ? '' : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {assigneeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduled_date">Scheduled Date</Label>
                  <Input
                    id="scheduled_date"
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => handleChange('scheduled_date', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="scheduled_time_start">Start Time</Label>
                  <Input
                    id="scheduled_time_start"
                    type="time"
                    value={formData.scheduled_time_start}
                    onChange={(e) => handleChange('scheduled_time_start', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduled_time_end">End Time</Label>
                  <Input
                    id="scheduled_time_end"
                    type="time"
                    value={formData.scheduled_time_end}
                    onChange={(e) => handleChange('scheduled_time_end', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimated_duration">Est. Duration (hours)</Label>
                  <Input
                    id="estimated_duration"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.estimated_duration}
                    onChange={(e) => handleChange('estimated_duration', e.target.value)}
                    placeholder="2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Costs */}
          <Card>
            <CardHeader>
              <CardTitle>Estimate</CardTitle>
              <CardDescription>Initial cost estimate for the job</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-w-xs">
                <Label htmlFor="estimated_cost">Estimated Cost (GBP)</Label>
                <Input
                  id="estimated_cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.estimated_cost}
                  onChange={(e) => handleChange('estimated_cost', e.target.value)}
                  placeholder="250.00"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Additional information about this job</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">General Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Notes visible to customers..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="internal_notes">Internal Notes</Label>
                <Textarea
                  id="internal_notes"
                  value={formData.internal_notes}
                  onChange={(e) => handleChange('internal_notes', e.target.value)}
                  placeholder="Staff-only notes (not visible to customers)..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link to={isEditing ? `/portal/jobs/${id}` : '/portal/jobs'}>
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
                  {isEditing ? 'Update Job' : 'Create Job'}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
