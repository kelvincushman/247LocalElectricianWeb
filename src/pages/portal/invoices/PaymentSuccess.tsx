import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  Loader2,
  AlertCircle,
  Download,
  ArrowLeft,
  Receipt,
} from 'lucide-react';

interface PaymentDetails {
  invoice_id: string;
  invoice_number: string;
  amount: number;
  customer_name: string;
  payment_date: string;
  payment_method: string;
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    } else {
      setIsLoading(false);
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      const response = await fetch(`/api/portal/payments/verify?session_id=${sessionId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }

      const data = await response.json();
      setPaymentDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!paymentDetails?.invoice_id) return;

    try {
      const response = await fetch(`/api/portal/invoices/${paymentDetails.invoice_id}/pdf`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to generate receipt');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${paymentDetails.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download receipt:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-600">Verifying payment...</p>
        </div>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Invalid payment session. No session ID provided.</AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <Link to="/portal/invoices">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Invoices
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <Link to="/portal/invoices">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Invoices
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-8">
      <Card>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-700">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-slate-600">
            Thank you for your payment. Your transaction has been completed successfully.
          </p>

          {paymentDetails && (
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice</span>
                <span className="font-medium">{paymentDetails.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(paymentDetails.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer</span>
                <span className="font-medium">{paymentDetails.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span className="font-medium">{formatDate(paymentDetails.payment_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-medium capitalize">
                  {paymentDetails.payment_method?.replace('_', ' ')}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {paymentDetails && (
              <Button onClick={handleDownloadReceipt} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Receipt
              </Button>
            )}
            <Link to={paymentDetails ? `/portal/invoices/${paymentDetails.invoice_id}` : '/portal/invoices'}>
              <Button variant="outline" className="w-full">
                <Receipt className="mr-2 h-4 w-4" />
                View Invoice
              </Button>
            </Link>
            <Link to="/portal/invoices">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Invoices
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
