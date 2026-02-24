import { useState, useEffect } from 'react';
import { usePortalAuth } from '@/contexts/PortalAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Settings as SettingsIcon,
  Save,
  Loader2,
  AlertCircle,
  FileText,
  Building2,
  CheckCircle,
  Calendar,
  Link,
  Unlink,
  RefreshCw,
  PoundSterling,
  Users,
  Percent,
  CreditCard,
  MessageSquare,
  Bell,
  Banknote,
  Bot,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface SettingsData {
  quote_terms_conditions: string;
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  company_registration: string;
  vat_number: string;
  default_vat_rate: string;
  default_payment_terms: string;
  // Labour costs
  electrician_hourly_rate: string;
  electrician_callout_rate: string;
  electrician_mate_hourly_rate: string;
  electrician_mate_callout_rate: string;
  material_markup_percentage: string;
  // Payment settings
  stripe_public_key: string;
  bank_name: string;
  bank_account_name: string;
  bank_sort_code: string;
  bank_account_number: string;
  payment_terms_text: string;
  twilio_from_phone: string;
  twilio_whatsapp_from: string;
  payment_reminder_enabled: string;
  reminder_days_after_due: string;
  // Chatbot settings
  chatbot_enabled: string;
  chatbot_greeting: string;
  chatbot_model: string;
  chatbot_max_tokens: string;
  chatbot_system_prompt: string;
}

const defaultSettings: SettingsData = {
  quote_terms_conditions: '',
  company_name: 'ANP Electrical Ltd',
  company_address: '',
  company_phone: '',
  company_email: '',
  company_registration: '',
  vat_number: '',
  default_vat_rate: '20',
  default_payment_terms: '14',
  // Labour costs
  electrician_hourly_rate: '45.00',
  electrician_callout_rate: '75.00',
  electrician_mate_hourly_rate: '25.00',
  electrician_mate_callout_rate: '45.00',
  material_markup_percentage: '20',
  // Payment settings
  stripe_public_key: '',
  bank_name: '',
  bank_account_name: 'ANP Electrical Ltd',
  bank_sort_code: '',
  bank_account_number: '',
  payment_terms_text: 'Payment is due within 14 days of invoice date. We accept card payments, bank transfer, and cash.',
  twilio_from_phone: '',
  twilio_whatsapp_from: '',
  payment_reminder_enabled: 'true',
  reminder_days_after_due: '7,14,30',
  // Chatbot settings
  chatbot_enabled: 'true',
  chatbot_greeting: "Hello! I'm Sparky, your 247Electrician assistant. How can I help you today? I can answer questions about our services, pricing, and help you book an appointment.",
  chatbot_model: 'claude-sonnet-4-20250514',
  chatbot_max_tokens: '1024',
  chatbot_system_prompt: `You are Sparky, a friendly and professional AI assistant for 247Electrician, a local electrical services company serving the Black Country, Birmingham, and surrounding areas in the UK.

Your role is to:
1. Answer questions about electrical services, pricing, and availability
2. Help visitors book appointments or request quotes
3. Provide basic electrical safety advice
4. Capture lead information (name, phone, email, postcode, service needed)

Important details:
- Company: 247Electrician (operated by ANP Electrical Ltd)
- Phone: 01902 943 929 (24/7 emergency line)
- NAPIT Approved electricians
- Over 65 years combined experience
- Service areas: Black Country, Birmingham, Walsall, Wolverhampton, Dudley, West Bromwich, Cannock, and surrounding areas

Guidelines:
- Be friendly, professional, and helpful
- For emergencies, always recommend calling the emergency line immediately
- Never provide advice that could be dangerous - recommend calling a professional
- Collect contact details politely when users show interest in booking
- Be concise but informative`,
};

export default function Settings() {
  const { isAdmin } = usePortalAuth();
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Google Calendar state
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleCalendarId, setGoogleCalendarId] = useState<string | null>(null);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchGoogleCalendarStatus();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/portal/settings', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSettings({ ...defaultSettings, ...data });
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/portal/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof SettingsData, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const fetchGoogleCalendarStatus = async () => {
    try {
      const response = await fetch('/api/portal/calendar/google/status', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setGoogleConnected(data.connected);
        setGoogleCalendarId(data.calendar_id);
      }
    } catch (err) {
      console.error('Failed to fetch Google Calendar status:', err);
    }
  };

  const handleConnectGoogle = () => {
    setIsConnectingGoogle(true);
    window.location.href = '/api/portal/calendar/google/auth';
  };

  const handleDisconnectGoogle = async () => {
    if (!confirm('Are you sure you want to disconnect Google Calendar?')) return;

    setIsConnectingGoogle(true);
    try {
      const response = await fetch('/api/portal/calendar/google/disconnect', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setGoogleConnected(false);
        setGoogleCalendarId(null);
        setSuccess('Google Calendar disconnected');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Failed to disconnect Google Calendar');
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  if (!isAdmin) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500">Configure portal settings and defaults</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
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

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="terms" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="terms" className="gap-2">
            <FileText className="h-4 w-4" />
            Terms & Conditions
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" />
            Company Details
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-2">
            <PoundSterling className="h-4 w-4" />
            Pricing & Labour
          </TabsTrigger>
          <TabsTrigger value="defaults" className="gap-2">
            <SettingsIcon className="h-4 w-4" />
            Defaults
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Calendar className="h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="chatbot" className="gap-2">
            <Bot className="h-4 w-4" />
            Chatbot
          </TabsTrigger>
        </TabsList>

        {/* Terms & Conditions Tab */}
        <TabsContent value="terms">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Quote Terms & Conditions
              </CardTitle>
              <CardDescription>
                Default terms and conditions that appear on all quotations. Supports Markdown formatting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quote_terms_conditions">Terms & Conditions</Label>
                  <Textarea
                    id="quote_terms_conditions"
                    value={settings.quote_terms_conditions}
                    onChange={(e) => handleChange('quote_terms_conditions', e.target.value)}
                    placeholder="Enter your terms and conditions here..."
                    rows={20}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-slate-500">
                    These terms will be automatically added to new quotations. You can edit them per-quote if needed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Details Tab */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                Company details that appear on quotes and invoices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={settings.company_name}
                    onChange={(e) => handleChange('company_name', e.target.value)}
                    placeholder="ANP Electrical Ltd"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_registration">Company Registration</Label>
                  <Input
                    id="company_registration"
                    value={settings.company_registration}
                    onChange={(e) => handleChange('company_registration', e.target.value)}
                    placeholder="12345678"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_address">Company Address</Label>
                <Textarea
                  id="company_address"
                  value={settings.company_address}
                  onChange={(e) => handleChange('company_address', e.target.value)}
                  placeholder="Enter full company address..."
                  rows={3}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company_phone">Phone Number</Label>
                  <Input
                    id="company_phone"
                    value={settings.company_phone}
                    onChange={(e) => handleChange('company_phone', e.target.value)}
                    placeholder="0800 XXX XXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_email">Email Address</Label>
                  <Input
                    id="company_email"
                    type="email"
                    value={settings.company_email}
                    onChange={(e) => handleChange('company_email', e.target.value)}
                    placeholder="info@247electrician.uk"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vat_number">VAT Number</Label>
                <Input
                  id="vat_number"
                  value={settings.vat_number}
                  onChange={(e) => handleChange('vat_number', e.target.value)}
                  placeholder="GB 123 4567 89"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing & Labour Tab */}
        <TabsContent value="pricing">
          <div className="space-y-6">
            {/* Material Markup */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Material Markup
                </CardTitle>
                <CardDescription>
                  Percentage markup on material costs for customer-facing quotes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="material_markup_percentage">Material Markup (%)</Label>
                    <Input
                      id="material_markup_percentage"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={settings.material_markup_percentage}
                      onChange={(e) => handleChange('material_markup_percentage', e.target.value)}
                    />
                    <p className="text-xs text-slate-500">
                      Materials searched from Screwfix/Toolstation will have this markup applied for customer pricing
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Example</h4>
                    <p className="text-sm text-slate-600">
                      Material cost: £50.00<br />
                      Markup ({settings.material_markup_percentage}%): £{((50 * parseFloat(settings.material_markup_percentage || '0')) / 100).toFixed(2)}<br />
                      <span className="font-medium">Customer price: £{(50 * (1 + parseFloat(settings.material_markup_percentage || '0') / 100)).toFixed(2)}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Electrician Rates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Electrician Labour Rates
                </CardTitle>
                <CardDescription>
                  Standard rates for electrician labour - used in quotations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="electrician_hourly_rate">Hourly Rate (£)</Label>
                    <Input
                      id="electrician_hourly_rate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={settings.electrician_hourly_rate}
                      onChange={(e) => handleChange('electrician_hourly_rate', e.target.value)}
                    />
                    <p className="text-xs text-slate-500">Per hour charge for electrician labour</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="electrician_callout_rate">Day/Callout Rate (£)</Label>
                    <Input
                      id="electrician_callout_rate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={settings.electrician_callout_rate}
                      onChange={(e) => handleChange('electrician_callout_rate', e.target.value)}
                    />
                    <p className="text-xs text-slate-500">Fixed day rate or callout charge</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Electrician Mate Rates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Electrician Mate Rates
                </CardTitle>
                <CardDescription>
                  Rates for electrician mate/assistant when additional help is needed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="electrician_mate_hourly_rate">Hourly Rate (£)</Label>
                    <Input
                      id="electrician_mate_hourly_rate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={settings.electrician_mate_hourly_rate}
                      onChange={(e) => handleChange('electrician_mate_hourly_rate', e.target.value)}
                    />
                    <p className="text-xs text-slate-500">Per hour charge for mate labour</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="electrician_mate_callout_rate">Day/Callout Rate (£)</Label>
                    <Input
                      id="electrician_mate_callout_rate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={settings.electrician_mate_callout_rate}
                      onChange={(e) => handleChange('electrician_mate_callout_rate', e.target.value)}
                    />
                    <p className="text-xs text-slate-500">Fixed day rate for mate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Box */}
            <Alert className="border-blue-200 bg-blue-50">
              <PoundSterling className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>How pricing works in quotes:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Materials:</strong> Search prices from Screwfix/Toolstation are shown as cost price (staff view). Customer quotes show the marked-up price.</li>
                  <li><strong>Labour:</strong> Add hourly rates, callout rates, or custom per-job amounts to quotes. The system tracks both cost and customer price.</li>
                  <li><strong>Profit tracking:</strong> Job profit is calculated from the difference between customer price and actual costs.</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>

        {/* Defaults Tab */}
        <TabsContent value="defaults">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Default Values
              </CardTitle>
              <CardDescription>
                Default values for new quotes and invoices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="default_vat_rate">Default VAT Rate (%)</Label>
                  <Input
                    id="default_vat_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.default_vat_rate}
                    onChange={(e) => handleChange('default_vat_rate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default_payment_terms">Default Payment Terms (days)</Label>
                  <Input
                    id="default_payment_terms"
                    type="number"
                    min="0"
                    value={settings.default_payment_terms}
                    onChange={(e) => handleChange('default_payment_terms', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Google Calendar Integration
              </CardTitle>
              <CardDescription>
                Connect your Google Calendar to sync appointments and schedules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Google Calendar</h4>
                    {googleConnected ? (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Connected
                        {googleCalendarId && googleCalendarId !== 'primary' && (
                          <span className="text-slate-500 ml-1">({googleCalendarId})</span>
                        )}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-500">Not connected</p>
                    )}
                  </div>
                </div>
                <div>
                  {googleConnected ? (
                    <Button
                      variant="outline"
                      onClick={handleDisconnectGoogle}
                      disabled={isConnectingGoogle}
                    >
                      {isConnectingGoogle ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Unlink className="mr-2 h-4 w-4" />
                      )}
                      Disconnect
                    </Button>
                  ) : (
                    <Button onClick={handleConnectGoogle} disabled={isConnectingGoogle}>
                      {isConnectingGoogle ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Link className="mr-2 h-4 w-4" />
                      )}
                      Connect
                    </Button>
                  )}
                </div>
              </div>

              {googleConnected && (
                <Alert className="border-blue-200 bg-blue-50">
                  <RefreshCw className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Calendar events will sync bidirectionally. Use the "Sync Google" button on the
                    Calendar page to manually trigger a sync, or events will sync automatically when
                    created/modified.
                  </AlertDescription>
                </Alert>
              )}

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">How it works:</h4>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                  <li>Click "Connect" to authorize access to your Google Calendar</li>
                  <li>New schedule entries created in the portal will sync to Google</li>
                  <li>Events from Google Calendar will be imported to the portal</li>
                  <li>Changes in either system will be synchronized</li>
                  <li>Deleted events will be removed from both systems</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <div className="space-y-6">
            {/* Stripe Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Stripe Integration
                </CardTitle>
                <CardDescription>
                  Configure Stripe for accepting online payments via card and bank transfer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <CreditCard className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Stripe Payments</h4>
                      {settings.stripe_public_key ? (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Configured
                        </p>
                      ) : (
                        <p className="text-sm text-slate-500">Not configured</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stripe_public_key">Stripe Publishable Key</Label>
                  <Input
                    id="stripe_public_key"
                    value={settings.stripe_public_key}
                    onChange={(e) => handleChange('stripe_public_key', e.target.value)}
                    placeholder="pk_live_..."
                  />
                  <p className="text-xs text-slate-500">
                    Your publishable key from the Stripe Dashboard. The secret key should be set as an environment variable.
                  </p>
                </div>

                <Alert className="border-blue-200 bg-blue-50">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Accepted payment methods:</strong> Card (Visa, Mastercard, Amex), Apple Pay, Google Pay, and UK Bank Transfer (Open Banking).
                    <br />
                    <strong>Note:</strong> Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET as environment variables on the server.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Bank Transfer Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  Bank Transfer Details
                </CardTitle>
                <CardDescription>
                  Bank details shown on invoices for manual payments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="bank_name">Bank Name</Label>
                    <Input
                      id="bank_name"
                      value={settings.bank_name}
                      onChange={(e) => handleChange('bank_name', e.target.value)}
                      placeholder="e.g., Barclays"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank_account_name">Account Name</Label>
                    <Input
                      id="bank_account_name"
                      value={settings.bank_account_name}
                      onChange={(e) => handleChange('bank_account_name', e.target.value)}
                      placeholder="e.g., ANP Electrical Ltd"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank_sort_code">Sort Code</Label>
                    <Input
                      id="bank_sort_code"
                      value={settings.bank_sort_code}
                      onChange={(e) => handleChange('bank_sort_code', e.target.value)}
                      placeholder="e.g., 20-00-00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank_account_number">Account Number</Label>
                    <Input
                      id="bank_account_number"
                      value={settings.bank_account_number}
                      onChange={(e) => handleChange('bank_account_number', e.target.value)}
                      placeholder="e.g., 12345678"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Payment Terms
                </CardTitle>
                <CardDescription>
                  Default payment terms displayed on invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="payment_terms_text">Payment Terms Text</Label>
                  <Textarea
                    id="payment_terms_text"
                    value={settings.payment_terms_text}
                    onChange={(e) => handleChange('payment_terms_text', e.target.value)}
                    placeholder="Enter payment terms..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* SMS/WhatsApp Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  SMS & WhatsApp (Twilio)
                </CardTitle>
                <CardDescription>
                  Configure Twilio for sending payment links via SMS and WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <MessageSquare className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Twilio Messaging</h4>
                      {settings.twilio_from_phone ? (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Configured
                        </p>
                      ) : (
                        <p className="text-sm text-slate-500">Not configured</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="twilio_from_phone">SMS From Number</Label>
                    <Input
                      id="twilio_from_phone"
                      value={settings.twilio_from_phone}
                      onChange={(e) => handleChange('twilio_from_phone', e.target.value)}
                      placeholder="+44..."
                    />
                    <p className="text-xs text-slate-500">Your Twilio phone number for SMS</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twilio_whatsapp_from">WhatsApp From Number</Label>
                    <Input
                      id="twilio_whatsapp_from"
                      value={settings.twilio_whatsapp_from}
                      onChange={(e) => handleChange('twilio_whatsapp_from', e.target.value)}
                      placeholder="+44..."
                    />
                    <p className="text-xs text-slate-500">Your Twilio WhatsApp number</p>
                  </div>
                </div>

                <Alert className="border-amber-200 bg-amber-50">
                  <MessageSquare className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN as environment variables on the server.
                    If not configured, you can still generate payment links and copy them manually.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Automatic Reminders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Automatic Payment Reminders
                </CardTitle>
                <CardDescription>
                  Send automatic SMS reminders for overdue invoices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Automatic Reminders</Label>
                    <p className="text-sm text-slate-500">
                      Automatically send payment reminders to customers with overdue invoices
                    </p>
                  </div>
                  <Switch
                    checked={settings.payment_reminder_enabled === 'true'}
                    onCheckedChange={(checked) => handleChange('payment_reminder_enabled', checked ? 'true' : 'false')}
                  />
                </div>

                {settings.payment_reminder_enabled === 'true' && (
                  <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="reminder_days_after_due">Reminder Schedule (days after due date)</Label>
                    <Input
                      id="reminder_days_after_due"
                      value={settings.reminder_days_after_due}
                      onChange={(e) => handleChange('reminder_days_after_due', e.target.value)}
                      placeholder="7,14,30"
                    />
                    <p className="text-xs text-slate-500">
                      Comma-separated days after due date to send reminders (e.g., 7,14,30 = reminders at 7, 14, and 30 days overdue)
                    </p>
                  </div>
                )}

                <Alert className="border-blue-200 bg-blue-50">
                  <Bell className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Reminders are sent daily at 9am UK time for invoices matching the configured days overdue.
                    Each invoice will receive at most one reminder per day.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Chatbot Tab */}
        <TabsContent value="chatbot">
          <div className="space-y-6">
            {/* Enable/Disable */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Chatbot
                </CardTitle>
                <CardDescription>
                  Configure the AI chatbot widget that appears on the public website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Bot className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Chatbot Widget</h4>
                      {settings.chatbot_enabled === 'true' ? (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Enabled
                        </p>
                      ) : (
                        <p className="text-sm text-slate-500">Disabled</p>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={settings.chatbot_enabled === 'true'}
                    onCheckedChange={(checked) => handleChange('chatbot_enabled', checked ? 'true' : 'false')}
                  />
                </div>

                <Alert className="border-blue-200 bg-blue-50">
                  <Bot className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    The chatbot appears as a floating button on all public pages. Visitors can ask questions about services,
                    pricing, and book appointments. All conversations and captured leads are viewable in the portal.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Greeting Message */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Greeting Message
                </CardTitle>
                <CardDescription>
                  The initial message shown when visitors open the chat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="chatbot_greeting">Greeting</Label>
                  <Textarea
                    id="chatbot_greeting"
                    value={settings.chatbot_greeting}
                    onChange={(e) => handleChange('chatbot_greeting', e.target.value)}
                    placeholder="Hello! How can I help you today?"
                    rows={3}
                  />
                  <p className="text-xs text-slate-500">
                    This message is displayed when the chat window opens
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Model Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  AI Configuration
                </CardTitle>
                <CardDescription>
                  Configure the AI model and response settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="chatbot_model">AI Model</Label>
                    <Input
                      id="chatbot_model"
                      value={settings.chatbot_model}
                      onChange={(e) => handleChange('chatbot_model', e.target.value)}
                      placeholder="claude-sonnet-4-20250514"
                    />
                    <p className="text-xs text-slate-500">
                      Claude model to use (claude-sonnet-4-20250514 recommended)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chatbot_max_tokens">Max Response Tokens</Label>
                    <Input
                      id="chatbot_max_tokens"
                      type="number"
                      min="256"
                      max="4096"
                      value={settings.chatbot_max_tokens}
                      onChange={(e) => handleChange('chatbot_max_tokens', e.target.value)}
                    />
                    <p className="text-xs text-slate-500">
                      Maximum tokens per response (256-4096)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Prompt */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  System Prompt
                </CardTitle>
                <CardDescription>
                  Instructions that define the chatbot's personality and behavior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="chatbot_system_prompt">System Prompt</Label>
                  <Textarea
                    id="chatbot_system_prompt"
                    value={settings.chatbot_system_prompt}
                    onChange={(e) => handleChange('chatbot_system_prompt', e.target.value)}
                    placeholder="You are a helpful assistant..."
                    rows={15}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500">
                    This prompt defines how the AI responds. Include company info, services offered, and behavioral guidelines.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Manage Conversations</CardTitle>
                <CardDescription>
                  View and manage chatbot conversations and leads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <a href="/portal/chatbot/conversations">
                    <Button variant="outline">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      View Conversations
                    </Button>
                  </a>
                  <a href="/portal/chatbot/leads">
                    <Button variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      View Leads
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
