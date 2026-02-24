import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePortalAuth } from '@/contexts/PortalAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Receipt,
  ArrowLeft,
  Edit,
  Trash2,
  Send,
  Download,
  Loader2,
  AlertCircle,
  User,
  Building2,
  Calendar,
  FileText,
  CheckCircle,
  CreditCard,
  Banknote,
  Smartphone,
  MessageSquare,
  Link as LinkIcon,
  Copy,
  ChevronDown,
  Phone,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: string;
  unit_price: string;
  vat_rate: string;
  total: string;
}

interface Payment {
  id: string;
  amount: string;
  payment_method: string;
  payment_reference: string | null;
  payment_date: string;
  notes: string | null;
  created_at: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  quote_id: string | null;
  quote_number: string | null;
  job_id: string | null;
  job_number: string | null;
  customer_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  company_id: string | null;
  company_name: string | null;
  status: string;
  issue_date: string | null;
  due_date: string | null;
  subtotal: string;
  discount_amount: string;
  vat_amount: string;
  total: string;
  amount_paid: string;
  notes: string | null;
  payment_terms: string | null;
  created_at: string;
  updated_at: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  sent: 'bg-blue-100 text-blue-800',
  viewed: 'bg-purple-100 text-purple-800',
  partial: 'bg-amber-100 text-amber-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-slate-100 text-slate-500',
};

const paymentMethods = [
  { value: 'bank_transfer', label: 'Bank Transfer', icon: Banknote },
  { value: 'stripe_card', label: 'Card (Stripe)', icon: CreditCard },
  { value: 'stripe_bank', label: 'Open Banking', icon: Building2 },
  { value: 'apple_pay', label: 'Apple Pay', icon: Smartphone },
  { value: 'google_pay', label: 'Google Pay', icon: Smartphone },
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'other', label: 'Other', icon: Smartphone },
];

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isStaff } = usePortalAuth();
  const { toast } = useToast();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  // Payment link state
  const [isSendingPaymentLink, setIsSendingPaymentLink] = useState(false);
  const [showSendLinkDialog, setShowSendLinkDialog] = useState(false);
  const [sendLinkChannel, setSendLinkChannel] = useState<'sms' | 'whatsapp'>('sms');
  const [sendLinkPhone, setSendLinkPhone] = useState('');

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'bank_transfer',
    payment_reference: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/portal/invoices/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch invoice');
      }

      const data = await response.json();
      setInvoice(data.invoice);
      setItems(data.items || []);
      setPayments(data.payments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/portal/invoices/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }

      navigate('/portal/invoices');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete invoice');
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleSend = async () => {
    if (!invoice?.customer_email) {
      setError('Customer email is required to send invoice');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(`/api/portal/invoices/${id}/send`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to send invoice');
      }

      await fetchInvoice();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invoice');
    } finally {
      setIsSending(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    setIsRecordingPayment(true);
    try {
      const response = await fetch(`/api/portal/invoices/${id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(paymentForm),
      });

      if (!response.ok) {
        throw new Error('Failed to record payment');
      }

      setShowPaymentDialog(false);
      setPaymentForm({
        amount: '',
        payment_method: 'bank_transfer',
        payment_reference: '',
        payment_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      await fetchInvoice();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setIsRecordingPayment(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/portal/invoices/${id}/pdf`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice?.invoice_number || 'invoice'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download PDF');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: string | number | null) => {
    if (amount === null || amount === undefined) return '£0.00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(numAmount);
  };

  const getBalance = () => {
    if (!invoice) return 0;
    const total = parseFloat(invoice.total || '0');
    const paid = parseFloat(invoice.amount_paid || '0');
    return total - paid;
  };

  const openPaymentDialog = () => {
    setPaymentForm((prev) => ({
      ...prev,
      amount: getBalance().toFixed(2),
    }));
    setShowPaymentDialog(true);
  };

  // Payment Link Functions
  const handleCopyPaymentLink = async () => {
    setIsSendingPaymentLink(true);
    try {
      const response = await fetch(`/api/portal/invoices/${id}/payment-link`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create payment link');
      }

      const data = await response.json();
      await navigator.clipboard.writeText(data.paymentLink);
      toast({
        title: 'Payment link copied!',
        description: 'The payment link has been copied to your clipboard.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create payment link',
        variant: 'destructive',
      });
    } finally {
      setIsSendingPaymentLink(false);
    }
  };

  const openSendLinkDialog = (channel: 'sms' | 'whatsapp') => {
    setSendLinkChannel(channel);
    setSendLinkPhone(invoice?.customer_phone || '');
    setShowSendLinkDialog(true);
  };

  const handleSendPaymentLink = async () => {
    if (!sendLinkPhone) {
      toast({
        title: 'Phone number required',
        description: 'Please enter a phone number to send the payment link.',
        variant: 'destructive',
      });
      return;
    }

    setIsSendingPaymentLink(true);
    try {
      const response = await fetch(`/api/portal/invoices/${id}/send-payment-link`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: sendLinkChannel,
          phone: sendLinkPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send payment link');
      }

      if (data.manualSend) {
        // Twilio not configured - offer to copy
        await navigator.clipboard.writeText(data.paymentLink);
        toast({
          title: 'Payment link copied!',
          description: 'Twilio not configured. Link copied to clipboard - send it manually.',
        });
      } else {
        toast({
          title: 'Payment link sent!',
          description: `Payment link sent via ${sendLinkChannel.toUpperCase()} to ${sendLinkPhone}`,
        });
      }

      setShowSendLinkDialog(false);
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to send payment link',
        variant: 'destructive',
      });
    } finally {
      setIsSendingPaymentLink(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/portal/invoices')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/portal/invoices')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{invoice.invoice_number}</h1>
              <Badge className={statusColors[invoice.status] || 'bg-slate-100'}>
                {invoice.status}
              </Badge>
            </div>
            <p className="text-slate-500">Created {formatDate(invoice.created_at)}</p>
          </div>
        </div>
        {isStaff && (
          <div className="flex flex-wrap gap-2">
            {invoice.status === 'draft' && (
              <Link to={`/portal/invoices/${id}/edit`}>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
            )}
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            {(invoice.status === 'draft' || invoice.status === 'viewed') && (
              <Button onClick={handleSend} disabled={isSending}>
                {isSending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send Invoice
              </Button>
            )}
            {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
              <>
                <Button onClick={openPaymentDialog}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Record Payment
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={isSendingPaymentLink}>
                      {isSendingPaymentLink ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <LinkIcon className="mr-2 h-4 w-4" />
                      )}
                      Payment Link
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openSendLinkDialog('sms')}>
                      <Phone className="mr-2 h-4 w-4" />
                      Send via SMS
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openSendLinkDialog('whatsapp')}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send via WhatsApp
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleCopyPaymentLink}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Link
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            {invoice.status === 'draft' && (
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        )}
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
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Issue Date</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(invoice.issue_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Due Date</p>
                  <p className={`font-medium flex items-center gap-1 ${
                    invoice.due_date && new Date(invoice.due_date) < new Date() && invoice.status !== 'paid'
                      ? 'text-red-600'
                      : ''
                  }`}>
                    <Calendar className="h-4 w-4" />
                    {formatDate(invoice.due_date)}
                  </p>
                </div>
                {invoice.quote_number && (
                  <div>
                    <p className="text-sm text-slate-500">From Quote</p>
                    <Link
                      to={`/portal/quotes/${invoice.quote_id}`}
                      className="font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      <FileText className="h-4 w-4" />
                      {invoice.quote_number}
                    </Link>
                  </div>
                )}
                {invoice.job_number && (
                  <div>
                    <p className="text-sm text-slate-500">Related Job</p>
                    <Link
                      to={`/portal/jobs/${invoice.job_id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {invoice.job_number}
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">VAT</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                          No items
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                          <TableCell className="text-right">{item.vat_rate}%</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="mt-4 space-y-2 text-right">
                <div className="flex justify-end gap-8">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="w-28">{formatCurrency(invoice.subtotal)}</span>
                </div>
                {parseFloat(invoice.discount_amount || '0') > 0 && (
                  <div className="flex justify-end gap-8 text-green-600">
                    <span>Discount</span>
                    <span className="w-28">-{formatCurrency(invoice.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-end gap-8">
                  <span className="text-slate-500">VAT</span>
                  <span className="w-28">{formatCurrency(invoice.vat_amount)}</span>
                </div>
                <div className="flex justify-end gap-8 text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span className="w-28">{formatCurrency(invoice.total)}</span>
                </div>
                <div className="flex justify-end gap-8">
                  <span className="text-slate-500">Amount Paid</span>
                  <span className="w-28 text-green-600">{formatCurrency(invoice.amount_paid)}</span>
                </div>
                <div className="flex justify-end gap-8 text-lg font-bold">
                  <span>Balance Due</span>
                  <span className={`w-28 ${getBalance() > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(getBalance())}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          {payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{formatDate(payment.payment_date)}</TableCell>
                          <TableCell className="capitalize">{payment.payment_method.replace('_', ' ')}</TableCell>
                          <TableCell>{payment.payment_reference || '-'}</TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 whitespace-pre-wrap">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoice.customer_name && (
                <div>
                  <p className="text-sm text-slate-500">Name</p>
                  <Link
                    to={`/portal/customers/${invoice.customer_id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {invoice.customer_name}
                  </Link>
                </div>
              )}
              {invoice.company_name && (
                <div>
                  <p className="text-sm text-slate-500">Company</p>
                  <Link
                    to={`/portal/companies/${invoice.company_id}`}
                    className="font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    <Building2 className="h-4 w-4" />
                    {invoice.company_name}
                  </Link>
                </div>
              )}
              {invoice.customer_email && (
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <a href={`mailto:${invoice.customer_email}`} className="text-primary hover:underline">
                    {invoice.customer_email}
                  </a>
                </div>
              )}
              {invoice.customer_phone && (
                <div>
                  <p className="text-sm text-slate-500">Phone</p>
                  <a href={`tel:${invoice.customer_phone}`} className="text-primary hover:underline">
                    {invoice.customer_phone}
                  </a>
                </div>
              )}
              {invoice.customer_address && (
                <div>
                  <p className="text-sm text-slate-500">Address</p>
                  <p className="whitespace-pre-wrap">{invoice.customer_address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Terms */}
          {invoice.payment_terms && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{invoice.payment_terms}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete invoice {invoice.invoice_number}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for invoice {invoice.invoice_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment_amount">Amount</Label>
              <Input
                id="payment_amount"
                type="number"
                step="0.01"
                min="0"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select
                value={paymentForm.payment_method}
                onValueChange={(value) => setPaymentForm((prev) => ({ ...prev, payment_method: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_date">Payment Date</Label>
              <Input
                id="payment_date"
                type="date"
                value={paymentForm.payment_date}
                onChange={(e) => setPaymentForm((prev) => ({ ...prev, payment_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_reference">Reference (optional)</Label>
              <Input
                id="payment_reference"
                value={paymentForm.payment_reference}
                onChange={(e) => setPaymentForm((prev) => ({ ...prev, payment_reference: e.target.value }))}
                placeholder="Transaction ID, cheque number, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_notes">Notes (optional)</Label>
              <Input
                id="payment_notes"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordPayment} disabled={isRecordingPayment}>
              {isRecordingPayment ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Payment Link Dialog */}
      <Dialog open={showSendLinkDialog} onOpenChange={setShowSendLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Send Payment Link via {sendLinkChannel === 'sms' ? 'SMS' : 'WhatsApp'}
            </DialogTitle>
            <DialogDescription>
              Send a payment link for {formatCurrency(getBalance())} to the customer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="send_link_phone">Phone Number</Label>
              <Input
                id="send_link_phone"
                type="tel"
                value={sendLinkPhone}
                onChange={(e) => setSendLinkPhone(e.target.value)}
                placeholder="+44 7XXX XXXXXX"
              />
              <p className="text-sm text-slate-500">
                Enter the phone number including country code (e.g., +44 for UK)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendLinkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendPaymentLink} disabled={isSendingPaymentLink}>
              {isSendingPaymentLink ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : sendLinkChannel === 'sms' ? (
                <Phone className="mr-2 h-4 w-4" />
              ) : (
                <MessageSquare className="mr-2 h-4 w-4" />
              )}
              Send {sendLinkChannel === 'sms' ? 'SMS' : 'WhatsApp'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
