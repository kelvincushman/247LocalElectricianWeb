import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Receipt,
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  FileText,
  CheckCircle,
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}

interface Company {
  id: string;
  name: string;
}

interface Job {
  id: string;
  job_number: string;
  title: string;
}

interface Quote {
  id: string;
  quote_number: string;
  customer_id: string | null;
  company_id: string | null;
  job_id: string | null;
  subtotal: string;
  discount_amount: string;
  vat_amount: string;
  total: string;
  items: QuoteItem[];
}

interface QuoteItem {
  description: string;
  quantity: string;
  unit_price: string;
  vat_rate: string;
  total: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: string;
  unit_price: string;
  vat_rate: string;
}

interface FormData {
  customer_id: string;
  company_id: string;
  job_id: string;
  quote_id: string;
  issue_date: string;
  due_date: string;
  payment_terms: string;
  notes: string;
  discount_type: string;
  discount_value: string;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export default function InvoiceForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditing = Boolean(id);
  const quoteIdFromUrl = searchParams.get('quote_id');

  const [formData, setFormData] = useState<FormData>({
    customer_id: '',
    company_id: '',
    job_id: '',
    quote_id: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    payment_terms: '',
    notes: '',
    discount_type: 'none',
    discount_value: '0',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: generateId(), description: '', quantity: '1', unit_price: '0', vat_rate: '20' },
  ]);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedFromQuote, setImportedFromQuote] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id, quoteIdFromUrl]);

  const loadData = async () => {
    try {
      // Load customers, companies, and jobs in parallel
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

      // Load existing invoice if editing
      if (isEditing) {
        const invoiceRes = await fetch(`/api/portal/invoices/${id}`, { credentials: 'include' });
        if (invoiceRes.ok) {
          const data = await invoiceRes.json();
          const invoice = data.invoice;
          setFormData({
            customer_id: invoice.customer_id || '',
            company_id: invoice.company_id || '',
            job_id: invoice.job_id || '',
            quote_id: invoice.quote_id || '',
            issue_date: invoice.issue_date ? invoice.issue_date.split('T')[0] : '',
            due_date: invoice.due_date ? invoice.due_date.split('T')[0] : '',
            payment_terms: invoice.payment_terms || '',
            notes: invoice.notes || '',
            discount_type: parseFloat(invoice.discount_amount || '0') > 0 ? 'fixed' : 'none',
            discount_value: invoice.discount_amount || '0',
          });
          if (data.items && data.items.length > 0) {
            setItems(data.items.map((item: any) => ({
              id: item.id || generateId(),
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              vat_rate: item.vat_rate,
            })));
          }
        }
      } else if (quoteIdFromUrl) {
        // Import from quote
        await importFromQuote(quoteIdFromUrl);
      } else {
        // Load default settings for new invoice
        await loadDefaultSettings();
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDefaultSettings = async () => {
    try {
      const response = await fetch('/api/portal/settings', { credentials: 'include' });
      if (response.ok) {
        const settings = await response.json();
        const paymentDays = parseInt(settings.default_payment_terms || '14', 10);
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + paymentDays);
        setFormData((prev) => ({
          ...prev,
          due_date: dueDate.toISOString().split('T')[0],
          payment_terms: `Payment due within ${paymentDays} days`,
        }));
        // Set default VAT rate on items
        setItems((prev) =>
          prev.map((item) => ({
            ...item,
            vat_rate: settings.default_vat_rate || '20',
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load default settings:', err);
    }
  };

  const importFromQuote = async (quoteId: string) => {
    try {
      const response = await fetch(`/api/portal/quotes/${quoteId}`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to load quote');
      }

      const data = await response.json();
      const quote = data.quote;
      const quoteItems = data.items || [];

      // Set form data from quote
      const paymentDays = 14; // Default payment terms
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + paymentDays);

      setFormData((prev) => ({
        ...prev,
        customer_id: quote.customer_id || '',
        company_id: quote.company_id || '',
        job_id: quote.job_id || '',
        quote_id: quoteId,
        due_date: dueDate.toISOString().split('T')[0],
        payment_terms: `Payment due within ${paymentDays} days`,
        discount_type: parseFloat(quote.discount_amount || '0') > 0 ? 'fixed' : 'none',
        discount_value: quote.discount_amount || '0',
      }));

      // Import quote items
      if (quoteItems.length > 0) {
        setItems(
          quoteItems.map((item: QuoteItem) => ({
            id: generateId(),
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            vat_rate: item.vat_rate,
          }))
        );
      }

      setImportedFromQuote(quote.quote_number);
    } catch (err) {
      setError('Failed to import quote data');
      console.error('Failed to import from quote:', err);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (itemId: string, field: keyof InvoiceItem, value: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  const addItem = () => {
    const defaultVatRate = items.length > 0 ? items[0].vat_rate : '20';
    setItems((prev) => [
      ...prev,
      { id: generateId(), description: '', quantity: '1', unit_price: '0', vat_rate: defaultVatRate },
    ]);
  };

  const removeItem = (itemId: string) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    }
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unit_price) || 0;
    return quantity * unitPrice;
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);

    let discount = 0;
    if (formData.discount_type === 'fixed') {
      discount = parseFloat(formData.discount_value) || 0;
    } else if (formData.discount_type === 'percentage') {
      discount = subtotal * ((parseFloat(formData.discount_value) || 0) / 100);
    }

    const discountedSubtotal = subtotal - discount;

    const vatAmount = items.reduce((sum, item) => {
      const itemTotal = calculateItemTotal(item);
      const itemShare = subtotal > 0 ? itemTotal / subtotal : 0;
      const itemDiscountedTotal = discountedSubtotal * itemShare;
      const vatRate = parseFloat(item.vat_rate) || 0;
      return sum + itemDiscountedTotal * (vatRate / 100);
    }, 0);

    const total = discountedSubtotal + vatAmount;

    return { subtotal, discount, vatAmount, total };
  };

  const { subtotal, discount, vatAmount, total } = calculateTotals();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    // Validate
    if (!formData.customer_id && !formData.company_id) {
      setError('Please select a customer or company');
      setIsSaving(false);
      return;
    }

    const validItems = items.filter((item) => item.description.trim() !== '');
    if (validItems.length === 0) {
      setError('Please add at least one item');
      setIsSaving(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        customer_id: formData.customer_id || null,
        company_id: formData.company_id || null,
        job_id: formData.job_id || null,
        quote_id: formData.quote_id || null,
        subtotal: subtotal.toFixed(2),
        discount_amount: discount.toFixed(2),
        vat_amount: vatAmount.toFixed(2),
        total: total.toFixed(2),
        items: validItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          vat_rate: item.vat_rate,
          total_price: calculateItemTotal(item).toFixed(2),
        })),
      };

      const url = isEditing ? `/api/portal/invoices/${id}` : '/api/portal/invoices';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save invoice');
      }

      const data = await response.json();
      navigate(`/portal/invoices/${data.invoice.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save invoice');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button type="button" variant="ghost" size="sm" onClick={() => navigate('/portal/invoices')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEditing ? 'Edit Invoice' : 'New Invoice'}
            </h1>
            {importedFromQuote && (
              <p className="text-slate-500 flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Imported from quote {importedFromQuote}
              </p>
            )}
          </div>
        </div>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Invoice
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer/Company Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customer_id">Customer</Label>
                  <Select
                    value={formData.customer_id || 'none'}
                    onValueChange={(value) => handleChange('customer_id', value === 'none' ? '' : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No customer</SelectItem>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
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
                      <SelectValue placeholder="Select company" />
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="job_id">Related Job (optional)</Label>
                  <Select
                    value={formData.job_id || 'none'}
                    onValueChange={(value) => handleChange('job_id', value === 'none' ? '' : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No job</SelectItem>
                      {jobs.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.job_number} - {job.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.quote_id && (
                  <div className="space-y-2">
                    <Label>From Quote</Label>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border">
                      <FileText className="h-4 w-4 text-slate-500" />
                      <span>{importedFromQuote || 'Linked quote'}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="issue_date">Issue Date</Label>
                  <Input
                    id="issue_date"
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => handleChange('issue_date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => handleChange('due_date', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_terms">Payment Terms</Label>
                <Input
                  id="payment_terms"
                  value={formData.payment_terms}
                  onChange={(e) => handleChange('payment_terms', e.target.value)}
                  placeholder="e.g., Payment due within 14 days"
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Line Items</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Description</TableHead>
                      <TableHead className="w-20">Qty</TableHead>
                      <TableHead className="w-28">Unit Price</TableHead>
                      <TableHead className="w-20">VAT %</TableHead>
                      <TableHead className="w-28 text-right">Total</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Input
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            placeholder="Item description"
                            className="min-w-[180px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(item.id, 'unit_price', e.target.value)}
                            className="w-28"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={item.vat_rate}
                            onChange={(e) => handleItemChange(item.id, 'vat_rate', e.target.value)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(calculateItemTotal(item))}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            disabled={items.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Additional notes for the invoice (visible to customer)"
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Totals */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Discount */}
              <div className="space-y-2">
                <Label>Discount</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value) => handleChange('discount_type', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="fixed">Fixed (£)</SelectItem>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.discount_type !== 'none' && (
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.discount_value}
                      onChange={(e) => handleChange('discount_value', e.target.value)}
                      className="flex-1"
                    />
                  )}
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">VAT</span>
                  <span>{formatCurrency(vatAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
