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
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  FileText,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import MaterialSearch from '@/components/portal/MaterialSearch';

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

interface Job {
  id: string;
  job_number: string;
  title: string;
}

interface QuoteItem {
  id?: string;
  description: string;
  quantity: string;
  unit: string;
  unit_price: string;
}

interface QuoteFormData {
  job_id: string;
  customer_id: string;
  company_id: string;
  property_id: string;
  valid_until: string;
  discount_percentage: string;
  vat_rate: string;
  terms: string;
  notes: string;
  internal_notes: string;
}

const initialFormData: QuoteFormData = {
  job_id: '',
  customer_id: '',
  company_id: '',
  property_id: '',
  valid_until: '',
  discount_percentage: '0',
  vat_rate: '20',
  terms: '',
  notes: '',
  internal_notes: '',
};

const emptyItem: QuoteItem = {
  description: '',
  quantity: '1',
  unit: '',
  unit_price: '',
};

export default function QuoteForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isStaff } = usePortalAuth();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<QuoteFormData>(initialFormData);
  const [items, setItems] = useState<QuoteItem[]>([{ ...emptyItem }]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showMaterialSearch, setShowMaterialSearch] = useState(false);

  useEffect(() => {
    fetchDropdownData();
    fetchDefaultTerms();

    // Pre-fill from URL params
    const jobId = searchParams.get('job_id');
    const customerId = searchParams.get('customer_id');
    const companyId = searchParams.get('company_id');
    if (jobId || customerId || companyId) {
      setFormData((prev) => ({
        ...prev,
        job_id: jobId || '',
        customer_id: customerId || '',
        company_id: companyId || '',
      }));
    }

    // Set default valid_until to 30 days from now
    if (!isEditing) {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);
      setFormData((prev) => ({
        ...prev,
        valid_until: validUntil.toISOString().split('T')[0],
      }));
    }

    if (isEditing) {
      fetchQuote();
    }
  }, [id, searchParams]);

  useEffect(() => {
    if (formData.customer_id || formData.company_id) {
      fetchProperties();
    }
  }, [formData.customer_id, formData.company_id]);

  const fetchDropdownData = async () => {
    try {
      const [customersRes, companiesRes, jobsRes] = await Promise.all([
        fetch('/api/portal/customers?limit=1000', { credentials: 'include' }),
        fetch('/api/portal/companies?limit=1000', { credentials: 'include' }),
        fetch('/api/portal/jobs?limit=1000', { credentials: 'include' }),
      ]);

      if (customersRes.ok) {
        const data = await customersRes.json();
        setCustomers(data.customers || []);
      }
      if (companiesRes.ok) {
        const data = await companiesRes.json();
        setCompanies(data.companies || []);
      }
      if (jobsRes.ok) {
        const data = await jobsRes.json();
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error('Failed to fetch dropdown data:', err);
    }
  };

  const fetchDefaultTerms = async () => {
    if (isEditing) return; // Don't override if editing
    try {
      const response = await fetch('/api/portal/settings', { credentials: 'include' });
      if (response.ok) {
        const settings = await response.json();
        if (settings.quote_terms_conditions) {
          setFormData((prev) => ({ ...prev, terms: settings.quote_terms_conditions }));
        }
        if (settings.default_vat_rate) {
          setFormData((prev) => ({ ...prev, vat_rate: settings.default_vat_rate }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
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

  const fetchQuote = async () => {
    try {
      const response = await fetch(`/api/portal/quotes/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Quote not found');
      }

      const data = await response.json();
      const quote = data.quote || data;

      setFormData({
        job_id: quote.job_id || '',
        customer_id: quote.customer_id || '',
        company_id: quote.company_id || '',
        property_id: quote.property_id || '',
        valid_until: quote.valid_until ? quote.valid_until.split('T')[0] : '',
        discount_percentage: quote.discount_percentage || '0',
        vat_rate: quote.vat_rate || '20',
        terms: quote.terms || '',
        notes: quote.notes || '',
        internal_notes: quote.internal_notes || '',
      });

      if (data.items && data.items.length > 0) {
        setItems(data.items.map((item: QuoteItem) => ({
          id: item.id,
          description: item.description || '',
          quantity: item.quantity || '1',
          unit: item.unit || '',
          unit_price: item.unit_price || '',
        })));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quote');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      return sum + qty * price;
    }, 0);

    const discountPercent = parseFloat(formData.discount_percentage) || 0;
    const discountAmount = subtotal * (discountPercent / 100);
    const afterDiscount = subtotal - discountAmount;

    const vatRate = parseFloat(formData.vat_rate) || 0;
    const vatAmount = afterDiscount * (vatRate / 100);

    const total = afterDiscount + vatAmount;

    return { subtotal, discountAmount, vatAmount, total };
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.customer_id && !formData.company_id) {
      errors.customer_id = 'Please select either a customer or company';
    }

    if (items.length === 0 || items.every((item) => !item.description.trim())) {
      errors.items = 'Please add at least one item';
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
      const { subtotal, discountAmount, vatAmount, total } = calculateTotals();

      const url = isEditing ? `/api/portal/quotes/${id}` : '/api/portal/quotes';
      const method = isEditing ? 'PUT' : 'POST';

      const body = {
        ...formData,
        job_id: formData.job_id || null,
        customer_id: formData.customer_id || null,
        company_id: formData.company_id || null,
        property_id: formData.property_id || null,
        valid_until: formData.valid_until || null,
        subtotal: subtotal.toFixed(2),
        discount_percentage: formData.discount_percentage,
        discount_amount: discountAmount.toFixed(2),
        vat_rate: formData.vat_rate,
        vat_amount: vatAmount.toFixed(2),
        total: total.toFixed(2),
        items: items.filter((item) => item.description.trim()).map((item) => ({
          ...item,
          total_price: (parseFloat(item.quantity) * parseFloat(item.unit_price || '0')).toFixed(2),
        })),
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
        throw new Error(data.error || 'Failed to save quote');
      }

      const data = await response.json();
      navigate(`/portal/quotes/${data.quote?.id || data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save quote');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof QuoteFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleItemChange = (index: number, field: keyof QuoteItem, value: string) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, { ...emptyItem }]);
  };

  const handleAddMaterialItems = (newItems: QuoteItem[]) => {
    // Remove empty placeholder items and add new material items
    setItems((prev) => {
      const nonEmpty = prev.filter(item => item.description.trim());
      return [...nonEmpty, ...newItems];
    });
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const totals = calculateTotals();

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
        <Link to={isEditing ? `/portal/quotes/${id}` : '/portal/quotes'}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditing ? 'Edit Quote' : 'New Quote'}
          </h1>
          <p className="text-slate-500">
            {isEditing ? 'Update quotation details' : 'Create a new quotation'}
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
          {/* Customer & Job */}
          <Card>
            <CardHeader>
              <CardTitle>Customer & Job</CardTitle>
              <CardDescription>Link this quote to a customer and optionally a job</CardDescription>
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

              <div className="grid gap-4 sm:grid-cols-2">
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

                <div className="space-y-2">
                  <Label htmlFor="job_id">Linked Job</Label>
                  <Select
                    value={formData.job_id || 'none'}
                    onValueChange={(value) => handleChange('job_id', value === 'none' ? '' : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a job" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No linked job</SelectItem>
                      {jobs.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.job_number} - {job.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quote Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Quote Items</span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMaterialSearch(true)}
                    className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI Search
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>Add line items to the quote or use AI to search material prices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
                  <div className="flex-1 grid gap-4 sm:grid-cols-12">
                    <div className="sm:col-span-5">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Unit</Label>
                      <Input
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        placeholder="each"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <Label>Unit Price (£)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="mt-6"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}

              {validationErrors.items && (
                <p className="text-sm text-red-500">{validationErrors.items}</p>
              )}

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex items-center gap-4 justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">Discount</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.discount_percentage}
                      onChange={(e) => handleChange('discount_percentage', e.target.value)}
                      className="w-20"
                    />
                    <span className="text-slate-600">%</span>
                  </div>
                  <span className="text-green-600">-{formatCurrency(totals.discountAmount)}</span>
                </div>
                <div className="flex items-center gap-4 justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">VAT</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.vat_rate}
                      onChange={(e) => handleChange('vat_rate', e.target.value)}
                      className="w-20"
                    />
                    <span className="text-slate-600">%</span>
                  </div>
                  <span>{formatCurrency(totals.vatAmount)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validity */}
          <Card>
            <CardHeader>
              <CardTitle>Quote Validity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-w-xs">
                <Label htmlFor="valid_until">Valid Until</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => handleChange('valid_until', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Terms & Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Terms & Conditions
              </CardTitle>
              <CardDescription>
                Default terms loaded from settings. You can edit them for this quote.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.terms}
                onChange={(e) => handleChange('terms', e.target.value)}
                placeholder="Enter terms and conditions..."
                rows={10}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Customer Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Notes visible to customer..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="internal_notes">Internal Notes</Label>
                <Textarea
                  id="internal_notes"
                  value={formData.internal_notes}
                  onChange={(e) => handleChange('internal_notes', e.target.value)}
                  placeholder="Staff-only notes..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link to={isEditing ? `/portal/quotes/${id}` : '/portal/quotes'}>
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
                  {isEditing ? 'Update Quote' : 'Create Quote'}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* AI Material Search Dialog */}
      <MaterialSearch
        isOpen={showMaterialSearch}
        onClose={() => setShowMaterialSearch(false)}
        onAddItems={handleAddMaterialItems}
      />
    </div>
  );
}
