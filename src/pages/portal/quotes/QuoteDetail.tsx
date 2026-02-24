import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePortalAuth } from '@/contexts/PortalAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  FileText,
  ArrowLeft,
  Edit,
  Trash2,
  Send,
  Receipt,
  Loader2,
  AlertCircle,
  User,
  Building2,
  Home,
  Calendar,
  Wrench,
} from 'lucide-react';

interface Quote {
  id: string;
  quote_number: string;
  job_id: string | null;
  job_number: string | null;
  customer_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  company_id: string | null;
  company_name: string | null;
  property_id: string | null;
  property_address: string | null;
  property_address2: string | null;
  property_city: string | null;
  property_postcode: string | null;
  full_property_address: string | null;
  status: string;
  valid_until: string | null;
  subtotal: string;
  discount_percentage: string;
  discount_amount: string;
  vat_rate: string;
  vat_amount: string;
  total: string;
  terms: string | null;
  notes: string | null;
  internal_notes: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  responded_at: string | null;
  created_at: string;
}

interface QuoteItem {
  id: string;
  description: string;
  quantity: string;
  unit: string | null;
  unit_price: string;
  total_price: string;
}

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
];

const statusColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  sent: 'bg-blue-100 text-blue-800',
  viewed: 'bg-purple-100 text-purple-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-orange-100 text-orange-800',
};

export default function QuoteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isStaff } = usePortalAuth();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchQuote();
  }, [id]);

  const fetchQuote = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/portal/quotes/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Quote not found');
        }
        throw new Error('Failed to fetch quote');
      }

      const data = await response.json();
      setQuote(data.quote || data);
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!quote) return;
    setIsUpdatingStatus(true);

    try {
      const response = await fetch(`/api/portal/quotes/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setQuote({ ...quote, status: newStatus });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/portal/quotes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete quote');
      }

      navigate('/portal/quotes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete quote');
      setIsDeleting(false);
    }
  };

  const handleCreateInvoice = () => {
    // Navigate to invoice form with quote_id pre-filled
    navigate(`/portal/invoices/new?quote_id=${id}`);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: string | null) => {
    if (!amount) return '£0.00';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(parseFloat(amount));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-slate-600 mb-4">{error || 'Quote not found'}</p>
        <Link to="/portal/quotes">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quotes
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Link to="/portal/quotes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{quote.quote_number}</h1>
              <Badge className={statusColors[quote.status] || 'bg-slate-100'}>
                {quote.status}
              </Badge>
            </div>
            {quote.job_number && (
              <p className="text-slate-500">
                Linked to{' '}
                <Link to={`/portal/jobs/${quote.job_id}`} className="text-primary hover:underline">
                  {quote.job_number}
                </Link>
              </p>
            )}
          </div>
        </div>

        {isStaff && (
          <div className="flex items-center gap-2">
            <Select
              value={quote.status}
              onValueChange={handleStatusChange}
              disabled={isUpdatingStatus}
            >
              <SelectTrigger className="w-32">
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

            {quote.status === 'accepted' && (
              <Button onClick={handleCreateInvoice} variant="default">
                <Receipt className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            )}

            <Link to={`/portal/quotes/${id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Quote?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {quote.quote_number}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quote Items */}
          <Card>
            <CardHeader>
              <CardTitle>Quote Items</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No items in this quote</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity} {item.unit || ''}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.total_price)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Totals */}
              <div className="mt-4 border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span>{formatCurrency(quote.subtotal)}</span>
                </div>
                {parseFloat(quote.discount_amount) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({quote.discount_percentage}%)</span>
                    <span>-{formatCurrency(quote.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">VAT ({quote.vat_rate}%)</span>
                  <span>{formatCurrency(quote.vat_amount)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(quote.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms & Conditions */}
          {quote.terms && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Terms & Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-slate-600 whitespace-pre-wrap">
                  {quote.terms}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {(quote.notes || quote.internal_notes) && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quote.notes && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Customer Notes</p>
                    <p className="text-slate-600">{quote.notes}</p>
                  </div>
                )}
                {quote.internal_notes && isStaff && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-slate-700 mb-1">Internal Notes</p>
                    <p className="text-slate-600">{quote.internal_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer & Property */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer & Property
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quote.customer_name && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Customer</p>
                    <Link
                      to={`/portal/customers/${quote.customer_id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {quote.customer_name}
                    </Link>
                    {quote.customer_email && (
                      <p className="text-sm text-slate-500">{quote.customer_email}</p>
                    )}
                    {quote.customer_phone && (
                      <p className="text-sm text-slate-500">{quote.customer_phone}</p>
                    )}
                  </div>
                </div>
              )}
              {quote.company_name && (
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Company</p>
                    <Link
                      to={`/portal/companies/${quote.company_id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {quote.company_name}
                    </Link>
                  </div>
                </div>
              )}
              {(quote.property_address || quote.full_property_address) && (
                <div className="flex items-start gap-3">
                  <Home className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Property</p>
                    <Link
                      to={`/portal/properties/${quote.property_id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {quote.full_property_address || [
                        quote.property_address,
                        quote.property_address2,
                        quote.property_city,
                        quote.property_postcode
                      ].filter(Boolean).join(', ')}
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-slate-500">Created</p>
                <p className="font-medium">{formatDate(quote.created_at)}</p>
              </div>
              {quote.valid_until && (
                <div>
                  <p className="text-sm text-slate-500">Valid Until</p>
                  <p className="font-medium">{formatDate(quote.valid_until)}</p>
                </div>
              )}
              {quote.sent_at && (
                <div>
                  <p className="text-sm text-slate-500">Sent</p>
                  <p className="font-medium">{formatDate(quote.sent_at)}</p>
                </div>
              )}
              {quote.viewed_at && (
                <div>
                  <p className="text-sm text-slate-500">Viewed</p>
                  <p className="font-medium">{formatDate(quote.viewed_at)}</p>
                </div>
              )}
              {quote.responded_at && (
                <div>
                  <p className="text-sm text-slate-500">Responded</p>
                  <p className="font-medium">{formatDate(quote.responded_at)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Linked Job */}
          {quote.job_id && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Linked Job
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link to={`/portal/jobs/${quote.job_id}`}>
                  <Button variant="outline" className="w-full">
                    <Wrench className="mr-2 h-4 w-4" />
                    View {quote.job_number}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
